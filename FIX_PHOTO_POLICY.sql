-- ========================================
-- FIX: Add RLS Policies for bike_photos
-- This allows users to upload and view photos for their bikes
-- ========================================

-- Enable RLS if not already enabled
ALTER TABLE public.bike_photos ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view photos of their own bikes" ON public.bike_photos;
DROP POLICY IF EXISTS "Users can insert photos for their own bikes" ON public.bike_photos;
DROP POLICY IF EXISTS "Users can update photos of their own bikes" ON public.bike_photos;
DROP POLICY IF EXISTS "Users can delete photos of their own bikes" ON public.bike_photos;

-- Create policies for bike_photos
CREATE POLICY "Users can view photos of their own bikes"
    ON public.bike_photos FOR SELECT
    USING (
        bike_id IN (
            SELECT b.id FROM public.bikes b
            JOIN public.bikers bk ON b.biker_id = bk.id
            WHERE bk.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert photos for their own bikes"
    ON public.bike_photos FOR INSERT
    WITH CHECK (
        bike_id IN (
            SELECT b.id FROM public.bikes b
            JOIN public.bikers bk ON b.biker_id = bk.id
            WHERE bk.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update photos of their own bikes"
    ON public.bike_photos FOR UPDATE
    USING (
        bike_id IN (
            SELECT b.id FROM public.bikes b
            JOIN public.bikers bk ON b.biker_id = bk.id
            WHERE bk.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete photos of their own bikes"
    ON public.bike_photos FOR DELETE
    USING (
        bike_id IN (
            SELECT b.id FROM public.bikes b
            JOIN public.bikers bk ON b.biker_id = bk.id
            WHERE bk.user_id = auth.uid()
        )
    );

-- Also fix service_documents table
ALTER TABLE public.service_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view service documents of their own bikes" ON public.service_documents;
DROP POLICY IF EXISTS "Users can insert service documents for their own bikes" ON public.service_documents;
DROP POLICY IF EXISTS "Users can update service documents of their own bikes" ON public.service_documents;
DROP POLICY IF EXISTS "Users can delete service documents of their own bikes" ON public.service_documents;

CREATE POLICY "Users can view service documents of their own bikes"
    ON public.service_documents FOR SELECT
    USING (
        bike_id IN (
            SELECT b.id FROM public.bikes b
            JOIN public.bikers bk ON b.biker_id = bk.id
            WHERE bk.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert service documents for their own bikes"
    ON public.service_documents FOR INSERT
    WITH CHECK (
        bike_id IN (
            SELECT b.id FROM public.bikes b
            JOIN public.bikers bk ON b.biker_id = bk.id
            WHERE bk.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update service documents of their own bikes"
    ON public.service_documents FOR UPDATE
    USING (
        bike_id IN (
            SELECT b.id FROM public.bikes b
            JOIN public.bikers bk ON b.biker_id = bk.id
            WHERE bk.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete service documents of their own bikes"
    ON public.service_documents FOR DELETE
    USING (
        bike_id IN (
            SELECT b.id FROM public.bikes b
            JOIN public.bikers bk ON b.biker_id = bk.id
            WHERE bk.user_id = auth.uid()
        )
    );

-- Verify policies were created
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename IN ('bike_photos', 'service_documents')
ORDER BY tablename, policyname;
