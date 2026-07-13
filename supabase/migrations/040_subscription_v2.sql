-- ============================================================
-- 040_subscription_v2.sql
--
-- Aligns the subscription model with the product spec:
--
-- Status machine:
--   trial → active | expired
--   active → past_due → active | expired
--   any → cancelled (owner cancels)
--
-- Plan names: basic | pro | premium  (replaces free/monthly/yearly)
--
-- New columns:
--   trial_ends_at       — when the 7-day trial window closes
--   grace_period_days   — configurable past_due grace (default 3)
--   grace_ends_at       — when past_due flips to expired
--   cancelled_at        — timestamp of cancellation
--   data_retention_until — 30 days after cancel then soft-delete
--
-- New table:
--   admin_access_log    — audit trail for Super Admin actions on tenant data
--
-- New RLS helper:
--   is_super_admin()    — SECURITY DEFINER, returns TRUE for the caller
--                         if their profile has is_super_admin = true.
--                         Used to add "OR is_super_admin()" to account policies
--                         so the admin portal can read all tenants via anon key.
--
-- Updated handle_new_user() trigger to stamp trial_ends_at.
-- Updated expire_subscriptions() to handle trial→expired and
-- past_due→expired transitions.
-- ============================================================

-- ============================================================
-- 1. Migrate legacy status and replace check constraint
-- ============================================================
-- Drop the constraint dynamically first so we can update the status
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'public.accounts'::regclass AND contype = 'c' AND conname LIKE 'accounts_subscription_status_check%'
  ) LOOP
    EXECUTE 'ALTER TABLE public.accounts DROP CONSTRAINT IF EXISTS ' || quote_ident(r.conname);
  END LOOP;
END $$;

-- Now migrate any existing 'inactive' to 'cancelled'
UPDATE public.accounts
  SET subscription_status = 'cancelled'
WHERE subscription_status = 'inactive';

-- Now add the new tightened constraint
ALTER TABLE public.accounts
  ADD CONSTRAINT accounts_subscription_status_check
    CHECK (subscription_status IN (
      'trial', 'active', 'past_due', 'expired', 'cancelled'
    ));

-- ============================================================
-- 2. Alter subscription_plan check to use product tier names
-- ============================================================
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'public.accounts'::regclass AND contype = 'c' AND conname LIKE 'accounts_subscription_plan_check%'
  ) LOOP
    EXECUTE 'ALTER TABLE public.accounts DROP CONSTRAINT IF EXISTS ' || quote_ident(r.conname);
  END LOOP;
END $$;

ALTER TABLE public.accounts
  ADD CONSTRAINT accounts_subscription_plan_check
    CHECK (subscription_plan IN (
      -- product tiers (new canonical names)
      'basic', 'basic_monthly', 'basic_yearly',
      'pro',   'pro_monthly',   'pro_yearly',
      'premium','premium_monthly','premium_yearly',
      -- legacy (removed after step 3 migration below)
      'free', 'monthly', 'yearly'
    ));

-- ============================================================
-- 3. Migrate legacy plan values → canonical tier_cycle strings
-- ============================================================
UPDATE public.accounts
  SET subscription_plan = CASE
    WHEN subscription_plan = 'free'    THEN 'basic'
    WHEN subscription_plan = 'monthly' THEN 'pro_monthly'
    WHEN subscription_plan = 'yearly'  THEN 'pro_yearly'
    ELSE subscription_plan
  END
WHERE subscription_plan IN ('free', 'monthly', 'yearly');

-- Now drop legacy values from constraint
ALTER TABLE public.accounts
  DROP CONSTRAINT IF EXISTS accounts_subscription_plan_check;

ALTER TABLE public.accounts
  ADD CONSTRAINT accounts_subscription_plan_check
    CHECK (subscription_plan IN (
      'basic', 'basic_monthly', 'basic_yearly',
      'pro',   'pro_monthly',   'pro_yearly',
      'premium','premium_monthly','premium_yearly'
    ));

-- ============================================================
-- 4. Add new columns to accounts
-- ============================================================
ALTER TABLE public.accounts
  ADD COLUMN IF NOT EXISTS trial_ends_at        TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS grace_period_days    INTEGER NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS grace_ends_at        TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancelled_at         TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS data_retention_until TIMESTAMPTZ;

-- Backfill trial_ends_at for existing trial accounts that don't have it
UPDATE public.accounts
  SET trial_ends_at = created_at + INTERVAL '7 days'
WHERE subscription_status = 'trial'
  AND trial_ends_at IS NULL;

-- ============================================================
-- 5. is_super_admin() — RLS helper
--
-- SECURITY DEFINER + explicit search_path to prevent search-path
-- injection. Returns TRUE iff the currently authenticated user's
-- profile row has is_super_admin = true.
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid()
      AND p.is_super_admin = true
  );
$$;

ALTER FUNCTION public.is_super_admin() OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated, service_role;

COMMENT ON FUNCTION public.is_super_admin() IS
  'Returns TRUE iff the calling auth.uid() has is_super_admin = true on their profile. '
  'Used in RLS policies so Super Admins can bypass tenant isolation for support/debug.';

-- ============================================================
-- 6. Expand RLS on accounts so Super Admins can read all tenants
--
-- Previously: accounts_select = is_account_member(id)
-- Now:        accounts_select = is_account_member(id) OR is_super_admin()
--
-- Admins still cannot INSERT/DELETE via RLS (service_role handles that).
-- ============================================================
DROP POLICY IF EXISTS accounts_select ON public.accounts;
CREATE POLICY accounts_select ON public.accounts FOR SELECT
  USING (is_account_member(id) OR is_super_admin());

DROP POLICY IF EXISTS accounts_update ON public.accounts;
CREATE POLICY accounts_update ON public.accounts FOR UPDATE
  USING (is_account_member(id, 'admin') OR is_super_admin())
  WITH CHECK (is_account_member(id, 'admin') OR is_super_admin());

-- ============================================================
-- 7. admin_access_log — audit trail for Super Admin access
-- ============================================================
CREATE TABLE IF NOT EXISTS public.admin_access_log (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_user_id   UUID        NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  tenant_id       UUID        REFERENCES public.accounts(id) ON DELETE SET NULL,
  action          TEXT        NOT NULL,
  resource_type   TEXT,
  resource_id     TEXT,
  ip_address      TEXT,
  user_agent      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_access_log_admin
  ON public.admin_access_log(admin_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_access_log_tenant
  ON public.admin_access_log(tenant_id, created_at DESC);

-- Service-role only — no client RLS needed; admin portal uses supabaseAdmin()
-- which uses the service-role key and bypasses RLS entirely.
ALTER TABLE public.admin_access_log ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.admin_access_log IS
  'Immutable audit trail of every Super Admin action that touches tenant data. '
  'Required for accountability per ToS/privacy policy commitments.';

-- ============================================================
-- 8. Update handle_new_user() — stamp trial_ends_at on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_full_name      TEXT;
  v_account_id     UUID;
  v_is_super_admin BOOLEAN;
BEGIN
  v_full_name      := COALESCE(NEW.raw_user_meta_data->>'full_name', '');
  v_is_super_admin := (NEW.email = 'zeenoxofficial@gmail.com');

  INSERT INTO public.accounts (
    name,
    owner_user_id,
    subscription_status,
    subscription_plan,
    trial_ends_at
  )
  VALUES (
    COALESCE(NULLIF(v_full_name, ''), NEW.email, 'My account'),
    NEW.id,
    'trial',
    'basic',
    NOW() + INTERVAL '7 days'
  )
  RETURNING id INTO v_account_id;

  INSERT INTO public.profiles (user_id, full_name, email, account_id, account_role, is_super_admin)
  VALUES (NEW.id, v_full_name, NEW.email, v_account_id, 'owner', v_is_super_admin);

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Failed to bootstrap account/profile for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

-- ============================================================
-- 9. Update expire_subscriptions() — handle all state transitions
-- ============================================================
CREATE OR REPLACE FUNCTION public.expire_subscriptions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rows_updated INTEGER := 0;
  n INTEGER;
BEGIN
  -- trial → expired (trial window closed, no payment)
  UPDATE public.accounts
    SET subscription_status = 'expired'
    WHERE subscription_status = 'trial'
      AND trial_ends_at IS NOT NULL
      AND trial_ends_at < NOW();
  GET DIAGNOSTICS n = ROW_COUNT;
  rows_updated := rows_updated + n;

  -- active → expired (subscription period ended, no renewal)
  UPDATE public.accounts
    SET subscription_status = 'expired'
    WHERE subscription_status = 'active'
      AND subscription_end_at IS NOT NULL
      AND subscription_end_at < NOW();
  GET DIAGNOSTICS n = ROW_COUNT;
  rows_updated := rows_updated + n;

  -- past_due → expired (grace period ended, still unpaid)
  UPDATE public.accounts
    SET subscription_status = 'expired'
    WHERE subscription_status = 'past_due'
      AND grace_ends_at IS NOT NULL
      AND grace_ends_at < NOW();
  GET DIAGNOSTICS n = ROW_COUNT;
  rows_updated := rows_updated + n;

  -- cancelled + data_retention_until passed → soft-delete marker
  -- (We only mark; actual deletion is a separate scheduled job)
  UPDATE public.accounts
    SET subscription_notes = COALESCE(subscription_notes, '') || ' [DATA_RETENTION_EXPIRED]'
    WHERE subscription_status = 'cancelled'
      AND data_retention_until IS NOT NULL
      AND data_retention_until < NOW()
      AND subscription_notes NOT LIKE '%[DATA_RETENTION_EXPIRED]%';
  GET DIAGNOSTICS n = ROW_COUNT;
  rows_updated := rows_updated + n;

  RETURN rows_updated;
END;
$$;

GRANT EXECUTE ON FUNCTION public.expire_subscriptions() TO service_role;

-- ============================================================
-- Comments
-- ============================================================
COMMENT ON COLUMN public.accounts.trial_ends_at IS
  'UTC timestamp when the 7-day free trial expires. NULL on non-trial accounts.';
COMMENT ON COLUMN public.accounts.grace_period_days IS
  'How many days after a failed renewal payment the account stays in past_due '
  'before transitioning to expired. Default 3, configurable per Super Admin.';
COMMENT ON COLUMN public.accounts.grace_ends_at IS
  'UTC timestamp when the past_due grace period ends. '
  'Set by the payment webhook on renewal failure.';
COMMENT ON COLUMN public.accounts.cancelled_at IS
  'UTC timestamp when the owner cancelled the subscription.';
COMMENT ON COLUMN public.accounts.data_retention_until IS
  'UTC timestamp 30 days after cancellation after which data may be soft-deleted.';
