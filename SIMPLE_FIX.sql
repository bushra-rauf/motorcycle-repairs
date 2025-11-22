-- ========================================
-- SIMPLE FIX: Disable RLS temporarily to test
-- Run this to make photos work immediately
-- ========================================

-- Option 1: Disable RLS on bike_photos (quick fix for testing)
ALTER TABLE public.bike_photos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_documents DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('bike_photos', 'service_documents');

-- Expected output: rowsecurity should be 'false'
