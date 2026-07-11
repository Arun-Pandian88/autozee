-- ============================================================
-- 038_zeenox_super_admin_trigger.sql
--
-- 1. Revokes is_super_admin from everyone except zeenoxofficial@gmail.com
-- 2. Grants is_super_admin to zeenoxofficial@gmail.com if they exist
-- 3. Updates handle_new_user() to auto-grant super admin when
--    zeenoxofficial@gmail.com signs up for the first time
-- ============================================================

-- Step 1: Revoke super admin from all non-Zeenox accounts
UPDATE public.profiles
  SET is_super_admin = false
  WHERE is_super_admin = true
    AND email <> 'zeenoxofficial@gmail.com';

-- Step 2: Grant to Zeenox if already signed up
UPDATE public.profiles
  SET is_super_admin = true
  WHERE email = 'zeenoxofficial@gmail.com';

-- Step 3: Replace handle_new_user to auto-grant super admin on signup
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

  INSERT INTO public.accounts (name, owner_user_id)
  VALUES (COALESCE(NULLIF(v_full_name, ''), NEW.email, 'My account'), NEW.id)
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
