-- ============================================
-- FEEDBACK TABLE MIGRATIONS
-- Run this in Supabase SQL Editor to apply all feedback-related migrations
-- ============================================

-- ============================================
-- MIGRATION 005: Create feedback table
-- ============================================

-- Create feedback table
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  message TEXT NOT NULL CHECK (char_length(message) > 0 AND char_length(message) <= 400),
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT feedback_message_length CHECK (char_length(message) <= 400)
);

-- Create index on created_at for faster queries
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON public.feedback(created_at DESC);

-- Create index on ip_address for rate limiting
CREATE INDEX IF NOT EXISTS idx_feedback_ip_address ON public.feedback(ip_address);

-- Enable RLS
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public feedback submission" ON public.feedback;
DROP POLICY IF EXISTS "Admin can view all feedback" ON public.feedback;

-- Policy: Allow anyone to insert feedback (rate limiting handled in application)
CREATE POLICY "Allow public feedback submission"
  ON public.feedback
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy: Only authenticated users with admin role can view feedback
CREATE POLICY "Admin can view all feedback"
  ON public.feedback
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Add comment
COMMENT ON TABLE public.feedback IS 'Stores user feedback submissions with rate limiting via IP address';

-- ============================================
-- MIGRATION 006: Add rate limit constraint
-- ============================================

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

-- ============================================
-- VERIFICATION
-- ============================================

-- Verify the table was created
SELECT
  'Feedback table created successfully!' as status,
  COUNT(*) as existing_feedback_count
FROM public.feedback;
