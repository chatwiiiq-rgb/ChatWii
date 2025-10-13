-- ============================================================================
-- Migration: Cleanup Offline Users
-- Description: Automatically mark users as offline when their last_seen is stale
-- ============================================================================

-- Function to mark users as offline if they haven't been seen in 2 minutes
-- This handles cases where users disconnect ungracefully (crash, network loss, etc.)
CREATE OR REPLACE FUNCTION cleanup_offline_users()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Mark users as offline if their last_seen is older than 2 minutes
  -- AND they are currently marked as online
  -- This is conservative - heartbeat runs every 30 seconds, so 2 minutes = 4 missed heartbeats
  UPDATE users
  SET is_online = false
  WHERE is_online = true
    AND last_seen < NOW() - INTERVAL '2 minutes';
END;
$$;

-- Add comment explaining the function
COMMENT ON FUNCTION cleanup_offline_users IS 'Marks users as offline if last_seen > 2 minutes. Handles ungraceful disconnects (crash, network loss). Runs every minute via pg_cron.';
