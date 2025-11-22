-- ========================================
-- FIX FOR ACCOUNT CREATION ERROR
-- Creates a database trigger to automatically create biker profile
-- ========================================

-- Step 1: Create a function that automatically creates a biker profile
-- This function runs with elevated privileges and bypasses RLS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER -- This makes it run with elevated privileges
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.bikers (user_id, email, full_name, phone)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'phone', NULL)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 2: Create a trigger that fires when a new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Step 3: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- ========================================
-- Step 4: Disable Email Confirmation (Development Only)
-- This allows users to login immediately without confirming email
-- ========================================
-- IMPORTANT: In production, you should keep email confirmation enabled
-- For now, we'll let users login without confirmation

-- To disable email confirmation in Supabase:
-- 1. Go to Dashboard → Authentication → Providers
-- 2. Click on "Email" provider
-- 3. Toggle OFF "Confirm email"
-- 4. Click Save

-- Alternative: Auto-confirm users via trigger
CREATE OR REPLACE FUNCTION public.auto_confirm_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Auto-confirm the user's email
    UPDATE auth.users
    SET email_confirmed_at = NOW()
    WHERE id = NEW.id AND email_confirmed_at IS NULL;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-confirm on signup
DROP TRIGGER IF EXISTS on_auth_user_auto_confirm ON auth.users;
CREATE TRIGGER on_auth_user_auto_confirm
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_confirm_user();

-- ========================================
-- VERIFICATION QUERY
-- Run this after applying the fix to test:
-- ========================================
-- SELECT * FROM public.bikers ORDER BY created_at DESC LIMIT 5;
-- SELECT id, email, email_confirmed_at FROM auth.users ORDER BY created_at DESC LIMIT 5;
