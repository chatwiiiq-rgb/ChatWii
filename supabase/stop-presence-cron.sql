-- ============================================
-- STOP USER PRESENCE CLEANUP CRON JOB
-- This stops the automatic deletion of presence records
-- ============================================

-- Unschedule the cleanup-stale-presence job
SELECT cron.unschedule('cleanup-stale-presence');

-- Verify it was removed (should not show cleanup-stale-presence)
SELECT * FROM cron.job;

-- ============================================
-- NOTE: This keeps the cleanup-old-messages job running
-- Only the presence cleanup has been stopped
-- ============================================
