-- ============================================
-- MAKE USER ADMIN
-- Instructions:
-- 1. First, create a user account on ChatWii with your email
-- 2. Find your user ID by running:
--    SELECT id, email, nickname, role FROM users WHERE email = 'your@email.com';
-- 3. Replace 'USER_ID_HERE' below with your actual user ID
-- 4. Run this script in Supabase SQL Editor
-- ============================================

-- Make user an admin
UPDATE users
SET role = 'admin'
WHERE id = 'USER_ID_HERE';

-- Verify the update
SELECT id, email, nickname, role, created_at
FROM users
WHERE id = 'USER_ID_HERE';

-- ============================================
-- Alternative: Make user admin by email
-- (If you know the email but not the ID)
-- ============================================

-- Uncomment and replace 'your@email.com' with the actual email:
-- UPDATE users
-- SET role = 'admin'
-- WHERE email = 'your@email.com';

-- Verify:
-- SELECT id, email, nickname, role, created_at
-- FROM users
-- WHERE email = 'your@email.com';
