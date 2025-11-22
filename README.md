# EU Motorcycle Repair Directory

A web application for finding motorcycle repair shops across Europe with user bike management features.

## Features

- 🏍️ Browse motorcycle repair shops across EU countries
- 🔍 Search and filter by country, city, and business type
- 👤 User authentication (login/signup)
- 📝 Manage your motorcycles (add, edit, delete)
- 📸 Upload bike photos
- 📄 Store service documents
- 🗺️ Interactive maps for shop locations

## Tech Stack

- **Frontend**: Vanilla JavaScript (ES6 modules)
- **Backend**: Supabase (Database, Auth, Storage)
- **Maps**: Leaflet.js
- **Hosting**: Vercel
- **Icons**: Font Awesome

## Project Structure

```
motorcycle_repairs/
├── index.html              # Main entry point
├── js/
│   ├── app.js             # Main application logic
│   ├── supabase-clean.js  # Supabase configuration & queries
│   ├── auth.js            # Authentication logic
│   ├── profile.js         # User profile management
│   └── bikes.js           # Bike management
├── styles/
│   └── style.css          # Application styles
└── vercel.json            # Vercel deployment config
```

## Local Development

1. Clone the repository
2. Open `index.html` in a modern web browser
3. No build step required - pure vanilla JavaScript!

## Deployment to Vercel

### Prerequisites
- GitHub account
- Vercel account (free)

### Steps

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy on Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Click "Deploy"

That's it! Your app will be live at `https://your-project.vercel.app`

## Environment Setup

### Supabase Configuration

The app uses Supabase for backend services. Your Supabase credentials are in `js/supabase-clean.js`.

**Required Supabase Tables:**
- `motorcycle_shops` - Shop directory data
- `bikers` - User profiles
- `bikes` - User motorcycles
- `bike_photos` - Bike photo references
- `service_documents` - Service document references

**Required Storage Buckets:**
- `images` - For bike photos and documents

## Browser Compatibility

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

MIT

## Author

Built with ❤️ for motorcycle enthusiasts
