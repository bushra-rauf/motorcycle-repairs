# Motorcycle Repair Directory - Setup Guide

## ✅ What's Built

A complete frontend application for bikers to:
- ✅ Register and login
- ✅ Manage their profile (name, email, phone)
- ✅ Add multiple motorcycles with details (brand, model, year, mileage, color, engine size, VIN, license plate, notes)
- ✅ Upload photos for each motorcycle
- ✅ Upload service/repair documents
- ✅ View, edit, and delete their motorcycles

## 🚀 ONE-TIME SETUP (Already Done)

### 1. Supabase Database Setup

Run these SQL files in **Supabase SQL Editor** (in this order):

1. **`database_schema_bikers.sql`** - Creates all tables (bikers, bikes, bike_photos, service_documents)
2. **`COMPLETE_SETUP.sql`** - Sets up RLS policies, storage policies, and triggers

### 2. Storage Setup

In **Supabase Storage**:
1. Create bucket named: `images`
2. Set it to **Public**
3. Policies are auto-created by the SQL above

### 3. Authentication Setup (Optional)

In **Supabase Dashboard → Authentication → Providers**:
- Email provider should be enabled (default)
- For development: You can disable "Confirm email" for faster testing

## 📋 How Users Use the App

### New User Flow:
1. Visit your website
2. Click "Login / Sign Up"
3. Click "Sign Up" tab
4. Fill in: Name, Email, Phone (optional), Password
5. Click "Create Account"
6. Automatically logged in and redirected to homepage

### Add Motorcycle:
1. Click "Add Your Bike" button (or "My Bikes" → "Add Motorcycle")
2. Fill in bike details:
   - Brand * (required)
   - Model * (required)
   - Year * (required)
   - Mileage * (required)
   - Color, Engine Size, VIN, License Plate, Notes (optional)
3. **Upload photos** (optional) - can upload multiple
4. Click "Save Motorcycle"
5. Done! Bike is saved with photos

### View/Edit/Delete:
1. Go to "My Bikes"
2. See all your motorcycles
3. Click:
   - **"View Details"** - See full info, photos, documents
   - **"Edit"** - Modify bike information
   - **"Delete"** - Remove motorcycle

### Upload Photos After Saving:
1. Click "View Details" on a bike
2. In the modal, click "Upload Photo"
3. Select image
4. Photo is uploaded and displayed

### Upload Service Documents:
1. Click "View Details" on a bike
2. Scroll to "Service Documents" section
3. Click "Upload Document"
4. Select PDF or image
5. Enter document name
6. Document is saved

## 🗂️ File Structure

```
motorcycle_repairs/
├── index.html              # Main HTML file
├── js/
│   ├── supabase.js        # Supabase client & data fetching
│   ├── auth.js            # Authentication (signup, login, logout)
│   ├── profile.js         # User profile management
│   ├── bikes.js           # Bike management (add, edit, delete, photos, docs)
│   └── app.js             # Main app logic & navigation
├── styles/
│   └── style.css          # All styling
└── database files/
    ├── database_schema_bikers.sql  # Table creation
    └── COMPLETE_SETUP.sql          # Complete setup with policies

```

## 🔧 Configuration

Update Supabase credentials in **`js/supabase.js`**:

```javascript
const SUPABASE_URL = 'https://YOUR-PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR-ANON-KEY';
```

## ✨ Features Implemented

### User Management:
- ✅ Registration with validation
- ✅ Login/Logout
- ✅ Profile editing (name, phone)
- ✅ Auto-profile creation on signup

### Motorcycle Management:
- ✅ Add motorcycle with all details
- ✅ Edit motorcycle information
- ✅ Delete motorcycle (with confirmation)
- ✅ View all user's motorcycles
- ✅ View detailed motorcycle info

### Photo Management:
- ✅ Upload multiple photos while adding bike
- ✅ Upload additional photos from View Details
- ✅ Set primary/cover photo (first upload)
- ✅ View photos in grid layout
- ✅ Delete photos

### Document Management:
- ✅ Upload service/repair documents (PDF, images)
- ✅ Add document metadata (name, date, provider, description, cost)
- ✅ View documents list
- ✅ Download/view documents
- ✅ Delete documents

### Shop Directory (Bonus):
- ✅ View motorcycle repair shops across Europe
- ✅ Filter by country, city, business type
- ✅ Search functionality
- ✅ Statistics display

## 🎯 Testing Checklist

- [ ] Create new account
- [ ] Login with existing account
- [ ] Add a motorcycle with photos
- [ ] Edit motorcycle details
- [ ] View motorcycle details
- [ ] Upload additional photos from View Details
- [ ] Upload service document
- [ ] Delete a photo
- [ ] Delete a motorcycle
- [ ] Logout and login again
- [ ] Verify data persists

## 🐛 Troubleshooting

### Photos won't upload:
- Check "images" bucket exists and is Public
- Verify storage policies exist (run COMPLETE_SETUP.sql)
- Check browser console for specific errors

### Can't save bike:
- Check you're logged in
- Verify bikers table has your profile (check in Supabase Table Editor)
- Run COMPLETE_SETUP.sql to create trigger

### Login fails:
- Check credentials are correct
- Verify email is confirmed (or disable email confirmation in Supabase Auth settings)

## 📞 Support

All database tables, policies, and triggers are set up through the SQL files provided.

**Your app is ready to use!** 🎉
