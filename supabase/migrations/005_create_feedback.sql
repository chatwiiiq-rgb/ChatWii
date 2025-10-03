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
