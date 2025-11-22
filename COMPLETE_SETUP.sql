-- ========================================
-- COMPLETE DATABASE SETUP FOR MOTORCYCLE APP
-- Run this ONCE to set up everything
-- ========================================

-- 1. Create tables (if not already created from database_schema_bikers.sql)
-- Run database_schema_bikers.sql first if you haven't

-- 2. Fix bike_photos table RLS
ALTER TABLE public.bike_photos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_documents DISABLE ROW LEVEL SECURITY;

-- 3. Create storage policies for images bucket
DROP POLICY IF EXISTS "Allow public access to images bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload to images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete images" ON storage.objects;

CREATE POLICY "Allow public access to images bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

CREATE POLICY "Allow authenticated users to upload to images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'images' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete images"
ON storage.objects FOR DELETE
USING (bucket_id = 'images' AND auth.role() = 'authenticated');

-- 4. Create trigger for auto-creating biker profiles
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

-- 5. Verify everything is set up
SELECT 'Tables created' AS status, COUNT(*) AS count
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('bikers', 'bikes', 'bike_photos', 'service_documents');

SELECT 'Storage policies created' AS status, COUNT(*) AS count
FROM pg_policies
WHERE schemaname = 'storage'
AND tablename = 'objects'
AND policyname LIKE '%images%';

-- Done! Your database is ready
