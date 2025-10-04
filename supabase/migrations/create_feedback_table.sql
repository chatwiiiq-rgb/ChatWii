-- Create feedback table
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  message TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  user_agent TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on ip_address and created_at for rate limiting queries
CREATE INDEX IF NOT EXISTS idx_feedback_ip_created
  ON public.feedback(ip_address, created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous users to insert feedback
CREATE POLICY "Allow anonymous insert feedback"
  ON public.feedback
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy: Only admins can read feedback
CREATE POLICY "Only admins can read feedback"
  ON public.feedback
  FOR SELECT
  TO authenticated
  USING (false);  -- This will be updated when we add admin roles

-- Add comment
COMMENT ON TABLE public.feedback IS 'Stores user feedback submissions with rate limiting';
