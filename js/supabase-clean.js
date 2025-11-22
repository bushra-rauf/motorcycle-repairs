// ========================================
// SUPABASE CONFIGURATION
// Clean version - Fixed "process is not defined" error
// ========================================

// Fix for browser compatibility - must be BEFORE import
window.process = window.process || { env: {} };

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.3/+esm';

// Your Supabase credentials
const SUPABASE_URL = 'https://jbfqmwjopiehblnvwwlb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpiZnFtd2pvcGllaGJsbnZ3d2xiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNzI2NTYsImV4cCI6MjA3Njc0ODY1Nn0.4r9ttDX1ZTXYZafFck_SqHngOpCENHIFoeA229hDU_Q';

// Create and export Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('✅ Supabase client initialized successfully');

// ========================================
// Fetch all shops with pagination
// ========================================
export async function fetchAllShops() {
    try {
        console.log('📥 [fetchAllShops] Fetching shops from Supabase...');

        let allData = [];
        let offset = 0;
        const pageSize = 1000;
        let hasMore = true;

        while (hasMore) {
            const { data, error } = await supabase
                .from('motorcycle_shops')
                .select('*')
                .range(offset, offset + pageSize - 1);

            if (error) {
                console.error('❌ [fetchAllShops] Supabase error:', error);
                throw new Error(`Supabase error: ${error.message}`);
            }

            if (!data || data.length === 0) {
                hasMore = false;
            } else {
                allData = [...allData, ...data];
                offset += pageSize;
                hasMore = data.length === pageSize;
            }
        }

        console.log(`✅ [fetchAllShops] Loaded ${allData.length} shops`);
        return allData;
    } catch (error) {
        console.error('❌ [fetchAllShops] Error:', error);
        throw error;
    }
}

// ========================================
// Get unique countries
// ========================================
export async function getUniqueCountries(shops) {
    try {
        const countries = [...new Set(
            shops
                .map(shop => shop.country)
                .filter(c => c && c.trim() !== '')
        )].sort();

        console.log(`✅ [getUniqueCountries] Found ${countries.length} countries`);
        return countries;
    } catch (error) {
        console.error('❌ [getUniqueCountries] Error:', error);
        throw error;
    }
}

// ========================================
// Get cities by country
// ========================================
export async function getCitiesByCountry(shops, country) {
    try {
        const cities = [...new Set(
            shops
                .filter(shop => shop.country === country)
                .map(shop => shop.city)
                .filter(c => c && c.trim() !== '')
        )].sort();

        console.log(`✅ [getCitiesByCountry] Found ${cities.length} cities in ${country}`);
        return cities;
    } catch (error) {
        console.error('❌ [getCitiesByCountry] Error:', error);
        throw error;
    }
}

// ========================================
// Get business types
// ========================================
export async function getBusinessTypes(shops) {
    try {
        const types = [...new Set(
            shops
                .map(shop => shop.business_type)
                .filter(t => t && t.trim() !== '')
        )].sort();

        console.log(`✅ [getBusinessTypes] Found ${types.length} business types`);
        return types;
    } catch (error) {
        console.error('❌ [getBusinessTypes] Error:', error);
        throw error;
    }
}

// ========================================
// Get statistics
// ========================================
export async function getStats(shops) {
    try {
        const uniqueCountries = [...new Set(shops.map(s => s.country).filter(Boolean))];
        const uniqueCities = [...new Set(shops.map(s => s.city).filter(Boolean))];

        // Calculate average rating
        const ratedShops = shops.filter(s => {
            const rating = parseFloat(s.rating);
            return !isNaN(rating) && rating > 0;
        });

        let avgRating = '—';
        if (ratedShops.length > 0) {
            const sum = ratedShops.reduce((acc, s) => acc + parseFloat(s.rating), 0);
            avgRating = (sum / ratedShops.length).toFixed(1);
        }

        const stats = {
            totalShops: shops.length,
            totalCountries: uniqueCountries.length,
            totalCities: uniqueCities.length,
            avgRating: avgRating
        };

        console.log('📊 [getStats] Statistics:', stats);
        return stats;
    } catch (error) {
        console.error('❌ [getStats] Error:', error);
        throw error;
    }
}
