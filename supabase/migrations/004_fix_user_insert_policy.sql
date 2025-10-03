-- Fix user insert policy to allow authenticated users to create their own profile
-- Migration: 004_fix_user_insert_policy.sql

-- Drop the old service_role-only insert policy
DROP POLICY IF EXISTS "Service role can insert users" ON public.users;

-- Create new policy that allows authenticated users to insert their own profile
CREATE POLICY "Users can create own profile"
ON public.users FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());
