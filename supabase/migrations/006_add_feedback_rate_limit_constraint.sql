-- Add unique constraint for rate limiting (one feedback per IP per 3 hours)
-- This uses a partial unique index to enforce the constraint at database level

-- Drop existing index if it exists
DROP INDEX IF EXISTS idx_feedback_ip_address;

-- Create a partial unique index that prevents duplicate submissions from same IP within 3 hours
-- This will cause INSERT to fail with unique constraint violation if rate limit is exceeded
CREATE UNIQUE INDEX idx_feedback_rate_limit
  ON public.feedback (ip_address)
  WHERE created_at > (NOW() - INTERVAL '3 hours');

COMMENT ON INDEX idx_feedback_rate_limit IS 'Enforces rate limit: one feedback per IP address per 3 hours';
