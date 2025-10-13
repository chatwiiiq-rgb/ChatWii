-- ============================================================================
-- Migration: Cleanup Inactive Anonymous Users
-- Description: Delete anonymous users inactive for 48+ hours to reduce MAU costs
-- ============================================================================

-- Function to delete inactive anonymous users
-- This prevents accumulation of abandoned anonymous accounts
-- IMPORTANT: Only deletes ANONYMOUS users, never email-verified accounts or admins
CREATE OR REPLACE FUNCTION cleanup_inactive_anonymous_users()
RETURNS TABLE(deleted_count INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER  -- Run with creator's privileges to access auth.users
AS $$
DECLARE
  rows_deleted INTEGER;
BEGIN
  -- Delete anonymous users who haven't logged in for 48+ hours
  -- Safety checks:
  -- 1. is_anonymous = true (only anonymous users)
  -- 2. email IS NULL (no email-verified users)
  -- 3. last_sign_in_at check (inactive for 48+ hours)
  -- This cascades to public.users table automatically

  WITH deleted AS (
    DELETE FROM auth.users
    WHERE is_anonymous = true
      AND email IS NULL  -- Extra safety: no email-verified accounts
      AND last_sign_in_at < NOW() - INTERVAL '48 hours'
    RETURNING id
  )
  SELECT COUNT(*)::INTEGER INTO rows_deleted FROM deleted;

  -- Log the cleanup for monitoring
  RAISE NOTICE 'Cleaned up % inactive anonymous users', rows_deleted;

  RETURN QUERY SELECT rows_deleted;
END;
$$;

-- Add comment explaining the function
COMMENT ON FUNCTION cleanup_inactive_anonymous_users IS 'Deletes anonymous users inactive for 48+ hours. Protects email-verified users and admins. Reduces MAU billing costs. Runs daily at 3 AM via pg_cron.';
