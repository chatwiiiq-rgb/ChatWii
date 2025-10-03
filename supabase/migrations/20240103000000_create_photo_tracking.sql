-- Create photo_tracking table (if not exists)
CREATE TABLE IF NOT EXISTS photo_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  imagekit_file_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add uploaded_at column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'photo_tracking' AND column_name = 'uploaded_at'
  ) THEN
    ALTER TABLE photo_tracking ADD COLUMN uploaded_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Create index for faster queries (if not exists)
CREATE INDEX IF NOT EXISTS idx_photo_tracking_user_id ON photo_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_photo_tracking_uploaded_at ON photo_tracking(uploaded_at);

-- Enable RLS
ALTER TABLE photo_tracking ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert their own photos" ON photo_tracking;
DROP POLICY IF EXISTS "Users can view their own photos" ON photo_tracking;
DROP POLICY IF EXISTS "Users can delete their own photos" ON photo_tracking;

-- RLS Policies
-- Users can insert their own photos
CREATE POLICY "Users can insert their own photos"
  ON photo_tracking
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own photos
CREATE POLICY "Users can view their own photos"
  ON photo_tracking
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can delete their own photos (for cleanup)
CREATE POLICY "Users can delete their own photos"
  ON photo_tracking
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to get daily photo count for a user
CREATE OR REPLACE FUNCTION get_daily_photo_count(p_user_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM photo_tracking
  WHERE user_id = p_user_id
    AND uploaded_at >= NOW() - INTERVAL '24 hours';
$$ LANGUAGE SQL STABLE;
