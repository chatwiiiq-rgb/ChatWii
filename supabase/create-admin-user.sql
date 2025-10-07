-- ============================================
-- CREATE ADMIN USER FOR admin@chatwii.com
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Update the role constraint to allow 'admin'
ALTER TABLE users
DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE users
ADD CONSTRAINT users_role_check
CHECK (role IN ('standard', 'admin'));

-- Step 2: Insert admin user into users table
INSERT INTO users (
  id,
  nickname,
  gender,
  age,
  country,
  role,
  is_online,
  last_seen,
  created_at
) VALUES (
  '305e836c-49e5-4740-b8bb-0aa98528ac84',
  'Admin',
  'male',
  25,
  'US',
  'admin',
  false,
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE
SET
  role = 'admin';

-- Step 3: Verify the user was created/updated
SELECT id, nickname, role, gender, age, country, created_at
FROM users
WHERE id = '305e836c-49e5-4740-b8bb-0aa98528ac84';

-- ============================================
-- NOTE: The auth user (admin@chatwii.com) already exists
-- in Supabase Auth. This SQL creates the profile in users table.
-- ============================================
