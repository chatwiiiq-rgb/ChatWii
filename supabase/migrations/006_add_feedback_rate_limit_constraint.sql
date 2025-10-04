-- Add unique constraint for rate limiting (one feedback per IP per 3 hours)
-- Since we can't use NOW() in index predicate (not immutable), we'll use a different approach:
-- Create a unique constraint on (ip_address, created_at) with a check constraint

-- Drop existing index if it exists
DROP INDEX IF EXISTS idx_feedback_ip_address;

-- Recreate the index for faster lookups (but not unique)
CREATE INDEX IF NOT EXISTS idx_feedback_ip_created
  ON public.feedback (ip_address, created_at DESC);

-- Add a trigger-based rate limiting check
-- This function checks if the IP has submitted feedback in the last 3 hours
CREATE OR REPLACE FUNCTION check_feedback_rate_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.feedback
    WHERE ip_address = NEW.ip_address
    AND created_at > (NOW() - INTERVAL '3 hours')
    AND id != NEW.id
  ) THEN
    RAISE EXCEPTION 'rate_limit_exceeded'
      USING ERRCODE = '23505';  -- Use unique_violation error code
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS feedback_rate_limit_trigger ON public.feedback;

-- Create trigger that runs before insert
CREATE TRIGGER feedback_rate_limit_trigger
  BEFORE INSERT ON public.feedback
  FOR EACH ROW
  EXECUTE FUNCTION check_feedback_rate_limit();

COMMENT ON FUNCTION check_feedback_rate_limit IS 'Enforces rate limit: one feedback per IP address per 3 hours';
