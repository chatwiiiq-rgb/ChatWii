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

-- Verify the cron jobs were created
SELECT * FROM cron.job;

-- ============================================
-- NOTES:
-- - pg_cron runs in UTC timezone
-- - Messages older than 8 hours will be deleted every hour
-- - Stale presence records will be cleaned up every minute
-- - To check job runs: SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
-- ============================================
