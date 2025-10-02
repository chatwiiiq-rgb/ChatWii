-- ChatWii Row Level Security (RLS) Policies
-- Comprehensive security for all tables

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_rate_limit ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- USERS TABLE POLICIES
-- ============================================================================

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
ON public.users FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Users can read all other users (for user list)
CREATE POLICY "Users can view other users"
ON public.users FOR SELECT
TO authenticated
USING (TRUE);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON public.users FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Only service role can insert users (via trigger after auth.users insert)
CREATE POLICY "Service role can insert users"
ON public.users FOR INSERT
TO service_role
WITH CHECK (TRUE);

-- Users can delete their own account
CREATE POLICY "Users can delete own account"
ON public.users FOR DELETE
TO authenticated
USING (id = auth.uid());

-- ============================================================================
-- MESSAGES TABLE POLICIES
-- ============================================================================

-- Users can read messages they sent or received
CREATE POLICY "Users can view own messages"
ON messages FOR SELECT
TO authenticated
USING (
  sender_id = auth.uid() OR receiver_id = auth.uid()
);

-- Users can send messages (with block check)
CREATE POLICY "Users can send messages"
ON messages FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = auth.uid()
  AND NOT EXISTS (
    SELECT 1 FROM blocks
    WHERE (blocker_id = receiver_id AND blocked_id = sender_id)
       OR (blocker_id = sender_id AND blocked_id = receiver_id)
  )
);

-- Users can update message status (for delivered/read)
CREATE POLICY "Users can update message status"
ON messages FOR UPDATE
TO authenticated
USING (receiver_id = auth.uid())
WITH CHECK (receiver_id = auth.uid());

-- Users can delete their own sent messages
CREATE POLICY "Users can delete own messages"
ON messages FOR DELETE
TO authenticated
USING (sender_id = auth.uid());

-- ============================================================================
-- USER PRESENCE POLICIES
-- ============================================================================

-- Everyone can view presence
CREATE POLICY "Anyone can view presence"
ON user_presence FOR SELECT
TO authenticated
USING (TRUE);

-- Users can only insert/update their own presence
CREATE POLICY "Users manage own presence"
ON user_presence FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- BLOCKS TABLE POLICIES
-- ============================================================================

-- Users can only see their own blocks
CREATE POLICY "Users view own blocks"
ON blocks FOR SELECT
TO authenticated
USING (blocker_id = auth.uid());

-- Users can block others
CREATE POLICY "Users can block"
ON blocks FOR INSERT
TO authenticated
WITH CHECK (blocker_id = auth.uid());

-- Users can unblock
CREATE POLICY "Users can unblock"
ON blocks FOR DELETE
TO authenticated
USING (blocker_id = auth.uid());

-- ============================================================================
-- REPORTS TABLE POLICIES
-- ============================================================================

-- Users can view their own reports
CREATE POLICY "Users view own reports"
ON reports FOR SELECT
TO authenticated
USING (reporter_id = auth.uid());

-- Users can submit reports
CREATE POLICY "Users can report"
ON reports FOR INSERT
TO authenticated
WITH CHECK (reporter_id = auth.uid());

-- Service role can view all reports (for moderation)
CREATE POLICY "Service role views all reports"
ON reports FOR SELECT
TO service_role
USING (TRUE);

-- Service role can update report status
CREATE POLICY "Service role updates reports"
ON reports FOR UPDATE
TO service_role
USING (TRUE);

-- ============================================================================
-- PHOTO TRACKING POLICIES
-- ============================================================================

-- Users can view their own photo tracking
CREATE POLICY "Users view own photo tracking"
ON photo_tracking FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Users can insert their own photo tracking
CREATE POLICY "Users can track own photos"
ON photo_tracking FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- RATE LIMITING POLICIES
-- ============================================================================

-- Users can view their own rate limit data
CREATE POLICY "Users view own rate limit"
ON message_rate_limit FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Users can insert/update their own rate limit data
CREATE POLICY "Users manage own rate limit"
ON message_rate_limit FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- REALTIME CHANNEL SECURITY (for private channels)
-- ============================================================================

-- Note: Realtime authorization handled via channel names and RLS
-- Private channels format: user:{user_id}:messages
-- Only the user with matching ID can subscribe to their channel

COMMENT ON POLICY "Users can view own messages" ON messages IS 'Messages visible only to sender/receiver';
COMMENT ON POLICY "Users can send messages" ON messages IS 'Prevents messaging blocked users';
COMMENT ON POLICY "Users view own blocks" ON blocks IS 'Blocker sees blocks, blocked user does not';
