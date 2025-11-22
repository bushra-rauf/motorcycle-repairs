-- ========================================
-- BIKER REGISTRATION AND PROFILE SYSTEM
-- Database Schema for Supabase
-- ========================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- 1. BIKERS TABLE
-- Stores biker profile information
-- ========================================
CREATE TABLE IF NOT EXISTS public.bikers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    phone TEXT,
    profile_photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_bikers_user_id ON public.bikers(user_id);
CREATE INDEX IF NOT EXISTS idx_bikers_email ON public.bikers(email);

-- ========================================
-- 2. BIKES TABLE
-- Stores information about bikes owned by bikers
-- ========================================
CREATE TABLE IF NOT EXISTS public.bikes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    biker_id UUID REFERENCES public.bikers(id) ON DELETE CASCADE,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL CHECK (year >= 1900 AND year <= 2100),
    mileage INTEGER DEFAULT 0 CHECK (mileage >= 0),
    color TEXT,
    vin TEXT, -- Vehicle Identification Number
    engine_size TEXT, -- e.g., "1000cc"
    license_plate TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_bikes_biker_id ON public.bikes(biker_id);

-- ========================================
-- 3. BIKE PHOTOS TABLE
-- Stores photos of bikes
-- ========================================
CREATE TABLE IF NOT EXISTS public.bike_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bike_id UUID REFERENCES public.bikes(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    caption TEXT,
    is_primary BOOLEAN DEFAULT FALSE, -- Mark one photo as primary/cover photo
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_bike_photos_bike_id ON public.bike_photos(bike_id);

-- ========================================
-- 4. SERVICE DOCUMENTS TABLE
-- Stores service and repair documentation
-- ========================================
CREATE TABLE IF NOT EXISTS public.service_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bike_id UUID REFERENCES public.bikes(id) ON DELETE CASCADE,
    document_url TEXT NOT NULL,
    document_name TEXT NOT NULL,
    document_type TEXT, -- e.g., "service", "repair", "insurance", "registration"
    service_date DATE,
    service_provider TEXT, -- Shop or mechanic name
    mileage_at_service INTEGER,
    cost DECIMAL(10, 2),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_service_documents_bike_id ON public.service_documents(bike_id);

-- ========================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- Ensure users can only access their own data
-- ========================================

-- Enable RLS on all tables
ALTER TABLE public.bikers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bikes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bike_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_documents ENABLE ROW LEVEL SECURITY;

-- Bikers table policies
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

-- Bikes table policies
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

-- Bike photos table policies
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

-- Service documents table policies
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
-- 6. STORAGE BUCKETS
-- Create storage buckets for photos and documents
-- Run these commands in Supabase SQL Editor or Dashboard
-- ========================================

-- Note: Storage buckets are typically created via Supabase Dashboard
-- or using the Supabase client. The SQL below is for reference.

-- CREATE BUCKET bike_photos:
-- - Public: false
-- - File size limit: 5MB
-- - Allowed MIME types: image/jpeg, image/png, image/webp

-- CREATE BUCKET service_documents:
-- - Public: false
-- - File size limit: 10MB
-- - Allowed MIME types: application/pdf, image/jpeg, image/png

-- ========================================
-- 7. FUNCTIONS AND TRIGGERS
-- Automatically update updated_at timestamps
-- ========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to update updated_at
CREATE TRIGGER update_bikers_updated_at
    BEFORE UPDATE ON public.bikers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bikes_updated_at
    BEFORE UPDATE ON public.bikes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 8. SAMPLE QUERIES (for reference)
-- ========================================

-- Get all bikes for a biker with their photos and documents
-- SELECT
--     b.*,
--     json_agg(DISTINCT p.*) as photos,
--     json_agg(DISTINCT d.*) as documents
-- FROM bikes b
-- LEFT JOIN bike_photos p ON b.id = p.bike_id
-- LEFT JOIN service_documents d ON b.id = d.bike_id
-- WHERE b.biker_id = 'your-biker-id'
-- GROUP BY b.id;
