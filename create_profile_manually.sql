-- ========================================
-- QUICK FIX: Manually Create Your Biker Profile
-- Run this ONCE in Supabase SQL Editor
-- ========================================

-- This will create a biker profile for your existing account
-- Replace 'your-email@example.com' with YOUR actual email

INSERT INTO public.bikers (user_id, email, full_name, phone)
SELECT
    id,
    email,
    COALESCE(raw_user_meta_data->>'full_name', email),
    COALESCE(raw_user_meta_data->>'phone', NULL)
FROM auth.users
WHERE email = 'your-email@example.com'  -- ⚠️ CHANGE THIS TO YOUR EMAIL!
AND NOT EXISTS (
    SELECT 1 FROM public.bikers WHERE user_id = auth.users.id
);

-- Verify it worked
SELECT * FROM public.bikers ORDER BY created_at DESC LIMIT 1;
