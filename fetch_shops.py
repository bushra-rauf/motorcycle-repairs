#!/usr/bin/env python3
"""
Motorcycle Repair Shops EU Scraper
Fetches motorcycle repair shops data from Google Maps via SerpAPI
and exports to CSV file
"""

import requests
import csv
import time
from datetime import datetime

# ============================================
# CONFIGURATION
# ============================================

SERPAPI_KEY = "f6931e820e7871f45d3f96df140142bce7a18f01ed85e42516368181e80af14f"  # Replace with your SerpAPI key
CSV_FILENAME = "eu_motorcycle_repairs.csv"

# EU Countries with coordinates (latitude, longitude) and zoom level
EU_LOCATIONS = {
    "France": {"coords": "48.8566,2.3522", "ll": "@48.8566,2.3522,10z"},
    "Germany": {"coords": "52.5200,13.4050", "ll": "@52.5200,13.4050,10z"},
    "Italy": {"coords": "41.9028,12.4964", "ll": "@41.9028,12.4964,10z"},
    "Spain": {"coords": "40.4168,-3.7038", "ll": "@40.4168,-3.7038,10z"},
    "Netherlands": {"coords": "52.3676,4.9041", "ll": "@52.3676,4.9041,10z"},
    "Belgium": {"coords": "50.8503,4.3517", "ll": "@50.8503,4.3517,10z"},
    "Switzerland": {"coords": "46.9479,7.4474", "ll": "@46.9479,7.4474,10z"},
    "Austria": {"coords": "48.2082,16.3738", "ll": "@48.2082,16.3738,10z"},
    "Poland": {"coords": "52.2297,21.0122", "ll": "@52.2297,21.0122,10z"},
    "Czech Republic": {"coords": "50.0755,14.4378", "ll": "@50.0755,14.4378,10z"},
    "Sweden": {"coords": "59.3293,18.0686", "ll": "@59.3293,18.0686,10z"},
    "Norway": {"coords": "59.9139,10.7522", "ll": "@59.9139,10.7522,10z"},
    "Denmark": {"coords": "55.6761,12.5683", "ll": "@55.6761,12.5683,10z"},
    "Finland": {"coords": "60.1695,24.9354", "ll": "@60.1695,24.9354,10z"},
    "Greece": {"coords": "37.9838,23.7275", "ll": "@37.9838,23.7275,10z"},
    "Portugal": {"coords": "38.7223,-9.1393", "ll": "@38.7223,-9.1393,10z"},
    "Hungary": {"coords": "47.4979,19.0402", "ll": "@47.4979,19.0402,10z"},
    "Romania": {"coords": "44.4268,26.1025", "ll": "@44.4268,26.1025,10z"},
    "Bulgaria": {"coords": "42.6977,23.3219", "ll": "@42.6977,23.3219,10z"},
    "Croatia": {"coords": "45.8150,15.9819", "ll": "@45.8150,15.9819,10z"},
}

# ============================================
# FETCH DATA FROM SERPAPI
# ============================================

def fetch_motorcycle_shops(country, location_ll):
    """
    Fetch motorcycle repair shops for a specific country
    """
    try:
        url = "https://serpapi.com/search.json?engine=google_maps&ll=@40.7455096,-74.0083012,14z&q=motorcycle+rapair+shops+in+EU"
        
        params = {
            "engine": "google_maps",
            "ll": location_ll,
            "q": "motorcycle repair shops",
            "api_key": SERPAPI_KEY,
            "type": "search"
        }
        
        print(f"  Fetching from {country}...", end=" ", flush=True)
        response = requests.get(url, params=params, timeout=10)
        
        if response.status_code != 200:
            print(f"❌ Error: {response.status_code}")
            return []
        
        data = response.json()
        results = data.get("local_results", [])
        
        print(f"✓ Found {len(results)} shops")
        return results
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return []

# ============================================
# PROCESS AND CLEAN DATA
# ============================================

def process_shop_data(shop, country):
    """
    Extract relevant information from shop data
    """
    try:
        return {
            "name": shop.get("title", "N/A"),
            "country": country,
            "city": shop.get("address", "N/A").split(",")[-2].strip() if "," in shop.get("address", "") else "N/A",
            "address": shop.get("address", "N/A"),
            "phone": shop.get("phone", "N/A"),
            "website": shop.get("website", "N/A"),
            "rating": shop.get("rating", "N/A"),
            "reviews_count": shop.get("review_count", 0),
            "latitude": shop.get("latitude", "N/A"),
            "longitude": shop.get("longitude", "N/A"),
            "business_type": "Motorcycle Repair Shop",
            "hours": "N/A",  # Not always available in API response
            "type": shop.get("type", "N/A"),
        }
    except Exception as e:
        print(f"    ⚠️  Error processing shop: {str(e)}")
        return None

# ============================================
# WRITE TO CSV
# ============================================

def write_to_csv(all_shops, filename):
    """
    Write all shops to CSV file
    """
    if not all_shops:
        print("❌ No shops to write!")
        return False
    
    try:
        # Define CSV columns
        fieldnames = [
            "name",
            "country",
            "city",
            "address",
            "phone",
            "website",
            "rating",
            "reviews_count",
            "latitude",
            "longitude",
            "business_type",
            "hours",
            "type"
        ]
        
        # Write to CSV
        with open(filename, "w", newline="", encoding="utf-8") as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(all_shops)
        
        print(f"\n✅ Successfully wrote {len(all_shops)} shops to {filename}")
        return True
        
    except Exception as e:
        print(f"❌ Error writing CSV: {str(e)}")
        return False

# ============================================
# MAIN FUNCTION
# ============================================

def main():
    """
    Main function to orchestrate the scraping
    """
    
    print("=" * 70)
    print("🏍️  MOTORCYCLE REPAIR SHOPS EU SCRAPER")
    print("=" * 70)
    print()
    
    # Check API key
    if SERPAPI_KEY == "YOUR_API_KEY_HERE":
        print("❌ ERROR: Please set your SerpAPI key!")
        print("   Edit the script and replace 'YOUR_API_KEY_HERE' with your key")
        return False
    
    print(f"📍 Searching {len(EU_LOCATIONS)} EU countries...")
    print(f"⏱️  Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    all_shops = []
    total_api_calls = 0
    
    # Fetch data for each country
    for country, location_data in EU_LOCATIONS.items():
        print(f"🇪🇺 {country}:")
        
        shops = fetch_motorcycle_shops(country, location_data["ll"])
        
        # Process shops
        for shop in shops:
            processed_shop = process_shop_data(shop, country)
            if processed_shop:
                all_shops.append(processed_shop)
        
        total_api_calls += 1
        
        # Be nice to the API - add delay between requests
        if country != list(EU_LOCATIONS.keys())[-1]:  # Don't delay after last request
            time.sleep(1)
    
    print()
    print("=" * 70)
    print(f"📊 SUMMARY")
    print("=" * 70)
    print(f"✓ Total Countries Searched: {len(EU_LOCATIONS)}")
    print(f"✓ API Calls Made: {total_api_calls}")
    print(f"✓ Total Shops Found: {len(all_shops)}")
    print()
    
    # Write to CSV
    if write_to_csv(all_shops, CSV_FILENAME):
        print(f"📁 File saved as: {CSV_FILENAME}")
        print(f"💾 File size: Check your directory")
        print()
        print("✅ SUCCESS! You can now:")
        print(f"   1. Upload {CSV_FILENAME} to Supabase")
        print(f"   2. Use it with your motorcycle directory app")
        return True
    else:
        print("❌ Failed to create CSV file")
        return False

# ============================================
# RUN SCRIPT
# ============================================

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
