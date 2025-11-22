-- ========================================
-- QUICK FIX: Create Your Profile Manually
-- Copy and run this in Supabase SQL Editor
-- ========================================

-- Step 1: First, find your user_id by running this:
SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 5;

-- Step 2: Copy your user ID from the result above, then run this:
-- Replace 'YOUR_USER_ID_HERE' with the actual ID from Step 1
-- Replace 'your-email@example.com' with your actual email

INSERT INTO public.bikers (user_id, email, full_name, phone)
VALUES (
    'YOUR_USER_ID_HERE'::uuid,  -- Replace with your user ID from Step 1
    'your-email@example.com',    -- Replace with your email
    'Your Name',                  -- Replace with your name
    NULL                          -- Replace with your phone or leave NULL
)
ON CONFLICT (user_id) DO NOTHING;

-- Step 3: Verify it was created:
SELECT * FROM public.bikers ORDER BY created_at DESC LIMIT 1;

-- ========================================
-- PERMANENT FIX (Run this to fix for all future users):
-- ========================================

-- This creates a trigger that automatically creates profiles for new signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.bikers (user_id, email, full_name, phone)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'phone', NULL)
    )
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
