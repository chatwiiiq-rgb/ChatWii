# Feedback Table Setup

The feedback API requires a `feedback` table in Supabase.

## SQL to Run in Supabase

Go to your Supabase Dashboard → SQL Editor → New Query, then run this:

```sql
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

-- Policy: Allow anonymous users to select for rate limiting check
CREATE POLICY "Allow anonymous select for rate limit"
  ON public.feedback
  FOR SELECT
  TO anon
  USING (true);
```

## What This Does

- Creates a `feedback` table to store user submissions
- Adds an index for fast rate-limiting queries
- Enables Row Level Security (RLS)
- Allows anonymous users to:
  - Insert feedback
  - Check their own rate limit status
- Stores IP address and user agent for rate limiting (max 1 submission per 3 hours per IP)

## After Running the SQL

The feedback form at `/feedback` will work correctly!
