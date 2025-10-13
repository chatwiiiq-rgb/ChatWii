-- ============================================
-- SETUP PG_CRON FOR MESSAGE CLEANUP
-- Instructions:
-- 1. Run this in Supabase SQL Editor
-- 2. This will enable pg_cron extension and schedule the cleanup job
-- ============================================

-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Grant necessary permissions to postgres user
GRANT USAGE ON SCHEMA cron TO postgres;

-- Schedule cleanup_old_messages to run every hour
-- This deletes messages older than 8 hours
SELECT cron.schedule(
  'cleanup-old-messages',           -- Job name
  '0 * * * *',                      -- Run every hour at minute 0 (e.g., 1:00, 2:00, 3:00, etc.)
  'SELECT cleanup_old_messages();'  -- SQL command to execute
);

-- Schedule cleanup_stale_presence to run every minute
-- This deletes presence records older than 60 seconds
SELECT cron.schedule(
  'cleanup-stale-presence',
  '* * * * *',                      -- Run every minute
  'SELECT cleanup_stale_presence();'
);

-- Schedule cleanup_offline_users to run every minute
-- This marks users as offline if last_seen > 2 minutes
SELECT cron.schedule(
  'cleanup-offline-users',
  '* * * * *',                      -- Run every minute
  'SELECT cleanup_offline_users();'
);

-- Schedule cleanup_inactive_anonymous_users to run daily at 3 AM
-- This deletes anonymous users inactive for 48+ hours (reduces MAU costs)
SELECT cron.schedule(
  'cleanup-inactive-anonymous',
  '0 3 * * *',                      -- Run daily at 3:00 AM UTC
  'SELECT cleanup_inactive_anonymous_users();'
);

-- Verify the cron jobs were created
SELECT * FROM cron.job;

-- ============================================
-- NOTES:
-- - pg_cron runs in UTC timezone
-- - Messages older than 8 hours will be deleted every hour
-- - Stale presence records will be cleaned up every minute
-- - Offline users (last_seen > 2 minutes) are marked as offline every minute
-- - Inactive anonymous users (48+ hours) are deleted daily at 3 AM
-- - To check job runs: SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
-- ============================================
