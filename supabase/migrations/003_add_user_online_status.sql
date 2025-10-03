-- Add is_online and last_seen columns to users table
-- Migration: 003_add_user_online_status.sql

-- Add columns if they don't exist
DO $$
BEGIN
  -- Add is_online column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'users'
    AND column_name = 'is_online'
  ) THEN
    ALTER TABLE public.users ADD COLUMN is_online BOOLEAN DEFAULT FALSE;
  END IF;

  -- Add last_seen column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'users'
    AND column_name = 'last_seen'
  ) THEN
    ALTER TABLE public.users ADD COLUMN last_seen TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Create index for online users (if it doesn't exist)
CREATE INDEX IF NOT EXISTS idx_users_online
ON public.users(is_online)
WHERE is_online = TRUE;

-- Update existing users to have last_seen set to created_at
UPDATE public.users
SET last_seen = created_at
WHERE last_seen IS NULL;
