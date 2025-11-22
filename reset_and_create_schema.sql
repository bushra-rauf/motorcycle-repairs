-- ========================================
-- RESET AND CREATE BIKER TABLES
-- Run this to start fresh
-- ========================================

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view their own biker profile" ON public.bikers;
DROP POLICY IF EXISTS "Users can insert their own biker profile" ON public.bikers;
DROP POLICY IF EXISTS "Users can update their own biker profile" ON public.bikers;
DROP POLICY IF EXISTS "Users can delete their own biker profile" ON public.bikers;

DROP POLICY IF EXISTS "Users can view their own bikes" ON public.bikes;
DROP POLICY IF EXISTS "Users can insert their own bikes" ON public.bikes;
DROP POLICY IF EXISTS "Users can update their own bikes" ON public.bikes;
DROP POLICY IF EXISTS "Users can delete their own bikes" ON public.bikes;

DROP POLICY IF EXISTS "Users can view photos of their own bikes" ON public.bike_photos;
DROP POLICY IF EXISTS "Users can insert photos for their own bikes" ON public.bike_photos;
DROP POLICY IF EXISTS "Users can update photos of their own bikes" ON public.bike_photos;
DROP POLICY IF EXISTS "Users can delete photos of their own bikes" ON public.bike_photos;

DROP POLICY IF EXISTS "Users can view service documents of their own bikes" ON public.service_documents;
DROP POLICY IF EXISTS "Users can insert service documents for their own bikes" ON public.service_documents;
DROP POLICY IF EXISTS "Users can update service documents of their own bikes" ON public.service_documents;
DROP POLICY IF EXISTS "Users can delete service documents of their own bikes" ON public.service_documents;

-- Drop tables (CASCADE will drop dependent objects)
DROP TABLE IF EXISTS public.service_documents CASCADE;
DROP TABLE IF EXISTS public.bike_photos CASCADE;
DROP TABLE IF EXISTS public.bikes CASCADE;
DROP TABLE IF EXISTS public.bikers CASCADE;

-- Drop function if exists
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Now create everything fresh
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- 1. BIKERS TABLE
-- ========================================
CREATE TABLE public.bikers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    phone TEXT,
    profile_photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_bikers_user_id ON public.bikers(user_id);
CREATE INDEX idx_bikers_email ON public.bikers(email);

-- ========================================
-- 2. BIKES TABLE
-- ========================================
CREATE TABLE public.bikes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    biker_id UUID REFERENCES public.bikers(id) ON DELETE CASCADE,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL CHECK (year >= 1900 AND year <= 2100),
    mileage INTEGER DEFAULT 0 CHECK (mileage >= 0),
    color TEXT,
    vin TEXT,
    engine_size TEXT,
    license_plate TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_bikes_biker_id ON public.bikes(biker_id);

-- ========================================
-- 3. BIKE PHOTOS TABLE
-- ========================================
CREATE TABLE public.bike_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bike_id UUID REFERENCES public.bikes(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    caption TEXT,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_bike_photos_bike_id ON public.bike_photos(bike_id);

-- ========================================
-- 4. SERVICE DOCUMENTS TABLE
-- ========================================
CREATE TABLE public.service_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bike_id UUID REFERENCES public.bikes(id) ON DELETE CASCADE,
    document_url TEXT NOT NULL,
    document_name TEXT NOT NULL,
    document_type TEXT,
    service_date DATE,
    service_provider TEXT,
    mileage_at_service INTEGER,
    cost DECIMAL(10, 2),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_service_documents_bike_id ON public.service_documents(bike_id);

-- ========================================
-- 5. ENABLE RLS
-- ========================================
ALTER TABLE public.bikers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bikes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bike_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_documents ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 6. RLS POLICIES - BIKERS
-- ========================================
CREATE POLICY "Users can view their own biker profile"
    ON public.bikers FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own biker profile"
    ON public.bikers FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own biker profile"
    ON public.bikers FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own biker profile"
    ON public.bikers FOR DELETE
    USING (auth.uid() = user_id);

-- ========================================
-- 7. RLS POLICIES - BIKES
-- ========================================
CREATE POLICY "Users can view their own bikes"
    ON public.bikes FOR SELECT
    USING (biker_id IN (SELECT id FROM public.bikers WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own bikes"
    ON public.bikes FOR INSERT
    WITH CHECK (biker_id IN (SELECT id FROM public.bikers WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own bikes"
    ON public.bikes FOR UPDATE
    USING (biker_id IN (SELECT id FROM public.bikers WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own bikes"
    ON public.bikes FOR DELETE
    USING (biker_id IN (SELECT id FROM public.bikers WHERE user_id = auth.uid()));

-- ========================================
-- 8. RLS POLICIES - BIKE PHOTOS
-- ========================================
CREATE POLICY "Users can view photos of their own bikes"
    ON public.bike_photos FOR SELECT
    USING (bike_id IN (
        SELECT b.id FROM public.bikes b
        JOIN public.bikers bk ON b.biker_id = bk.id
        WHERE bk.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert photos for their own bikes"
    ON public.bike_photos FOR INSERT
    WITH CHECK (bike_id IN (
        SELECT b.id FROM public.bikes b
        JOIN public.bikers bk ON b.biker_id = bk.id
        WHERE bk.user_id = auth.uid()
    ));

CREATE POLICY "Users can update photos of their own bikes"
    ON public.bike_photos FOR UPDATE
    USING (bike_id IN (
        SELECT b.id FROM public.bikes b
        JOIN public.bikers bk ON b.biker_id = bk.id
        WHERE bk.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete photos of their own bikes"
    ON public.bike_photos FOR DELETE
    USING (bike_id IN (
        SELECT b.id FROM public.bikes b
        JOIN public.bikers bk ON b.biker_id = bk.id
        WHERE bk.user_id = auth.uid()
    ));

-- ========================================
-- 9. RLS POLICIES - SERVICE DOCUMENTS
-- ========================================
CREATE POLICY "Users can view service documents of their own bikes"
    ON public.service_documents FOR SELECT
    USING (bike_id IN (
        SELECT b.id FROM public.bikes b
        JOIN public.bikers bk ON b.biker_id = bk.id
        WHERE bk.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert service documents for their own bikes"
    ON public.service_documents FOR INSERT
    WITH CHECK (bike_id IN (
        SELECT b.id FROM public.bikes b
        JOIN public.bikers bk ON b.biker_id = bk.id
        WHERE bk.user_id = auth.uid()
    ));

CREATE POLICY "Users can update service documents of their own bikes"
    ON public.service_documents FOR UPDATE
    USING (bike_id IN (
        SELECT b.id FROM public.bikes b
        JOIN public.bikers bk ON b.biker_id = bk.id
        WHERE bk.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete service documents of their own bikes"
    ON public.service_documents FOR DELETE
    USING (bike_id IN (
        SELECT b.id FROM public.bikes b
        JOIN public.bikers bk ON b.biker_id = bk.id
        WHERE bk.user_id = auth.uid()
    ));

-- ========================================
-- 10. TRIGGER FUNCTION
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_bikers_updated_at
    BEFORE UPDATE ON public.bikers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bikes_updated_at
    BEFORE UPDATE ON public.bikes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 11. RELOAD SCHEMA CACHE
-- ========================================
NOTIFY pgrst, 'reload schema';

-- Done! Tables created successfully.
SELECT 'SUCCESS: All tables and policies created!' as status;
