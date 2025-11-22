# Create Storage Buckets in Supabase

## Follow These Steps:

### 1. Open Supabase Dashboard
- Go to https://supabase.com/dashboard
- Select your project

### 2. Create "bike_photos" Bucket
1. Click **Storage** in the left sidebar
2. Click **"New bucket"** button
3. Fill in:
   - **Name:** `bike_photos`
   - **Public bucket:** Toggle **ON** (so photos are publicly viewable)
   - **File size limit:** 5 MB (optional)
   - **Allowed MIME types:** Leave empty or add: `image/jpeg, image/png, image/webp`
4. Click **"Create bucket"**

### 3. Create "service_documents" Bucket (for future use)
1. Click **"New bucket"** button again
2. Fill in:
   - **Name:** `service_documents`
   - **Public bucket:** Toggle **ON**
   - **File size limit:** 10 MB (optional)
   - **Allowed MIME types:** Leave empty or add: `application/pdf, image/jpeg, image/png`
3. Click **"Create bucket"**

### 4. Verify Buckets Created
- You should see both buckets listed in Storage
- They should show as "Public"

## That's It!

After creating these buckets:
1. Go back to your app
2. Refresh the page (Ctrl+F5)
3. Try uploading photos again
4. It should work now!

## Troubleshooting

If photos still don't upload:
1. Check bucket is PUBLIC
2. Check browser console (F12) for errors
3. Make sure images are under 5MB
