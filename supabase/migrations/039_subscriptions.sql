-- ============================================================
-- 039_subscriptions.sql
--
-- Adds subscription management to accounts.
-- Status: trial (default) → active → inactive/expired
-- Supports manual admin control AND payment webhook auto-activation.
-- ============================================================

ALTER TABLE public.accounts
  ADD COLUMN IF NOT EXISTS subscription_status TEXT NOT NULL DEFAULT 'trial'
    CHECK (subscription_status IN ('trial', 'active', 'inactive', 'expired')),
  ADD COLUMN IF NOT EXISTS subscription_plan TEXT NOT NULL DEFAULT 'free'
    CHECK (subscription_plan IN ('free', 'monthly', 'yearly')),
  ADD COLUMN IF NOT EXISTS subscription_start_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS subscription_end_at   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS subscription_source   TEXT DEFAULT 'manual'
    CHECK (subscription_source IN ('manual', 'stripe', 'razorpay', 'trial')),
  ADD COLUMN IF NOT EXISTS subscription_notes    TEXT;

-- Index for quick status lookups (admin dashboard)
CREATE INDEX IF NOT EXISTS idx_accounts_subscription_status
  ON public.accounts (subscription_status);

-- Auto-expire subscriptions past their end date
-- This function is meant to be called periodically (e.g., via a cron or webhook)
CREATE OR REPLACE FUNCTION public.expire_subscriptions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  rows_updated INTEGER;
BEGIN
  UPDATE public.accounts
    SET subscription_status = 'expired'
    WHERE subscription_status = 'active'
      AND subscription_end_at IS NOT NULL
      AND subscription_end_at < NOW();
  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  RETURN rows_updated;
END;
$$;

GRANT EXECUTE ON FUNCTION public.expire_subscriptions() TO service_role;

COMMENT ON COLUMN public.accounts.subscription_status IS
  'trial = free limited access, active = paid, inactive = manually deactivated, expired = past end date';
COMMENT ON COLUMN public.accounts.subscription_plan IS
  'Billing cycle: free / monthly / yearly';
COMMENT ON COLUMN public.accounts.subscription_start_at IS
  'UTC timestamp when the current subscription period started';
COMMENT ON COLUMN public.accounts.subscription_end_at IS
  'UTC timestamp when the current subscription period ends (NULL = indefinite)';
COMMENT ON COLUMN public.accounts.subscription_source IS
  'Who activated this: manual (admin), stripe, razorpay, or trial';
