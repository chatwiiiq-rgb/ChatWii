-- ============================================
-- ADD BAN TRACKING
-- Track who banned users and when
-- ============================================

-- Add fields to track ban information
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS banned_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS banned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS ban_reason TEXT;

-- Add index for banned users
CREATE INDEX IF NOT EXISTS idx_users_banned ON public.users(status) WHERE status = 'banned';

-- Update reports table to track admin actions
ALTER TABLE reports
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

COMMENT ON COLUMN public.users.banned_at IS 'Timestamp when user was banned';
COMMENT ON COLUMN public.users.banned_by IS 'Admin user ID who banned this user';
COMMENT ON COLUMN public.users.ban_reason IS 'Reason for banning the user';
COMMENT ON COLUMN reports.reviewed_at IS 'When admin reviewed this report';
COMMENT ON COLUMN reports.reviewed_by IS 'Admin user ID who reviewed this report';
COMMENT ON COLUMN reports.admin_notes IS 'Internal notes from admin about this report';
