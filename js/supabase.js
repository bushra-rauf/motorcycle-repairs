
// // import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// // // Your Supabase credentials
// // const SUPABASE_URL = 'https://jbfqmwjopiehblnvwwlb.supabase.co';
// // const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpiZnFtd2pvcGllaGJsbnZ3d2xiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNzI2NTYsImV4cCI6MjA3Njc0ODY1Nn0.4r9ttDX1ZTXYZafFck_SqHngOpCENHIFoeA229hDU_Q';

// // // Create Supabase client
// // export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// // // ========================================
// // // 🔴 CHANGED: Completely rewritten fetchAllShops with simpler logic
// // // ========================================   
// // export async function fetchAllShops() {
// //     try {
// //         console.log('🟡 [fetchAllShops] Starting to fetch all shops...');

// //         // 🔴 CHANGED: Use simpler approach - just fetch with a large range
// //         const { data, error, count } = await supabase
// //             .from('motorcycle_shops')
// //             .select('*', { count: 'exact' });

// //         if (error) {
// //             console.error('❌ [fetchAllShops] Supabase error:', error);
// //             throw new Error(`Supabase error: ${error.message}`);
// //         }

// //         if (!data) {
// //             console.error('❌ [fetchAllShops] No data returned from Supabase');
// //             throw new Error('No data returned from Supabase');
// //         }

// //         console.log(`✅ [fetchAllShops] Successfully fetched ${data.length} shops`);
// //         console.log('🔍 [fetchAllShops] Sample shop:', data[0]); // Log first shop for debugging
        
// //         return data;
// //     } catch (error) {
// //         console.error('❌ [fetchAllShops] Error:', error);
// //         throw error;
// //     }
// // }

// // // ========================================
// // // Function to get unique countries
// // // ========================================
// // export async function getUniqueCountries(shops) {
// //     try {
// //         // 🔴 CHANGED: Get countries from local data instead of querying again
// //         const countries = [...new Set(
// //             shops
// //                 .map(shop => shop.country)
// //                 .filter(c => c && c.trim() !== '') // Filter empty strings
// //         )].sort();

// //         console.log(`✅ [getUniqueCountries] Found ${countries.length} unique countries:`, countries);
// //         return countries;
// //     } catch (error) {
// //         console.error('❌ [getUniqueCountries] Error:', error);
// //         throw error;
// //     }
// // }

// // // ========================================
// // // Function to get cities by country
// // // ========================================
// // export async function getCitiesByCountry(shops, country) {
// //     try {
// //         // 🔴 CHANGED: Get cities from local data instead of querying
// //         const cities = [...new Set(
// //             shops
// //                 .filter(shop => shop.country === country)
// //                 .map(shop => shop.city)
// //                 .filter(c => c && c.trim() !== '') // Filter empty strings
// //         )].sort();

// //         console.log(`✅ [getCitiesByCountry] Found ${cities.length} cities in ${country}:`, cities.slice(0, 5), '...');
// //         return cities;
// //     } catch (error) {
// //         console.error('❌ [getCitiesByCountry] Error:', error);
// //         throw error;
// //     }
// // }

// // // ========================================
// // // Function to get business types
// // // ========================================
// // export async function getBusinessTypes(shops) {
// //     try {
// //         // 🔴 CHANGED: Get types from local data
// //         const types = [...new Set(
// //             shops
// //                 .map(shop => shop.business_type)
// //                 .filter(t => t && t.trim() !== '') // Filter empty strings
// //         )].sort();

// //         console.log(`✅ [getBusinessTypes] Found ${types.length} unique business types:`, types);
// //         return types;
// //     } catch (error) {
// //         console.error('❌ [getBusinessTypes] Error:', error);
// //         throw error;
// //     }
// // }

// // // ========================================
// // // Function to get statistics
// // // ========================================
// // export async function getStats(shops) {
// //     try {
// //         // 🔴 CHANGED: Calculate stats directly from local data
// //         const uniqueCountries = [...new Set(shops.map(s => s.country).filter(Boolean))];
// //         const uniqueCities = [...new Set(shops.map(s => s.city).filter(Boolean))];
// //         const avgRating = calculateAvgRating(shops);

// //         const stats = {
// //             totalShops: shops.length,
// //             totalCountries: uniqueCountries.length,
// //             totalCities: uniqueCities.length,
// //             avgRating: avgRating
// //         };

// //         console.log('📊 [getStats] Statistics:', stats);
// //         return stats;
// //     } catch (error) {
// //         console.error('❌ [getStats] Error:', error);
// //         throw error;
// //     }
// // }

// // // ========================================
// // // Helper function to calculate average rating
// // // ========================================
// // function calculateAvgRating(shops) {
// //     try {
// //         const ratedShops = shops.filter(s => {
// //             const rating = parseFloat(s.rating);
// //             return !isNaN(rating) && rating > 0;
// //         });

// //         if (ratedShops.length === 0) return '—';

// //         const sum = ratedShops.reduce((acc, s) => {
// //             return acc + parseFloat(s.rating);
// //         }, 0);

// //         const avg = (sum / ratedShops.length).toFixed(1);
// //         console.log(`📊 [calculateAvgRating] Calculated average: ${avg} from ${ratedShops.length} rated shops`);
// //         return avg;
// //     } catch (error) {
// //         console.error('❌ [calculateAvgRating] Error:', error);
// //         return '—';
// //     }
// // }

// import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// // Your Supabase credentials
// const SUPABASE_URL = 'https://jbfqmwjopiehblnvwwlb.supabase.co';
// const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpiZnFtd2pvcGllaGJsbnZ3d2xiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNzI2NTYsImV4cCI6MjA3Njc0ODY1Nn0.4r9ttDX1ZTXYZafFck_SqHngOpCENHIFoeA229hDU_Q';

// // Create Supabase client
// export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// // ========================================
// // 🔴 FIXED: Proper pagination to fetch ALL shops
// // ========================================   
// export async function fetchAllShops() {
//     try {
//         console.log('🔵 [fetchAllShops] Starting pagination fetch...');

//         let allData = [];
//         let offset = 0;
//         const pageSize = 1000; // Supabase default limit
//         let hasMore = true;

//         while (hasMore) {
//             console.log(`📥 [fetchAllShops] Fetching batch: offset=${offset}, size=${pageSize}`);

//             // 🔴 FIXED: Use range() to paginate through results
//             const { data, error, count } = await supabase
//                 .from('motorcycle_shops')
//                 .select('*', { count: 'exact' })
//                 .range(offset, offset + pageSize - 1);

//             if (error) {
//                 console.error('❌ [fetchAllShops] Supabase error:', error);
//                 throw new Error(`Supabase error: ${error.message}`);
//             }

//             if (!data || data.length === 0) {
//                 hasMore = false;
//                 console.log(`✅ [fetchAllShops] Finished! Total: ${allData.length} shops`);
//             } else {
//                 allData = [...allData, ...data];
//                 console.log(`📦 [fetchAllShops] Batch fetched: ${data.length} shops (Total so far: ${allData.length})`);
//                 offset += pageSize;
//                 hasMore = data.length === pageSize; // Only continue if we got a full page
//             }
//         }

//         console.log(`✅ [fetchAllShops] SUCCESS! Fetched ${allData.length} total shops`);
        
//         if (allData.length > 0) {
//             console.log('🔍 [fetchAllShops] Sample shop:', {
//                 name: allData[0].name,
//                 country: allData[0].country,
//                 city: allData[0].city,
//                 rating: allData[0].rating
//             });
//         }
        
//         return allData;
//     } catch (error) {
//         console.error('❌ [fetchAllShops] Error:', error);
//         throw error;
//     }
// }

// // ========================================
// // Function to get unique countries
// // ========================================
// export async function getUniqueCountries(shops) {
//     try {
//         console.log(`🌍 [getUniqueCountries] Processing ${shops.length} shops...`);
        
//         const countries = [...new Set(
//             shops
//                 .map(shop => shop.country)
//                 .filter(c => c && c.trim() !== '') // Filter empty strings
//         )].sort();

//         console.log(`✅ [getUniqueCountries] Found ${countries.length} unique countries:`, countries);
//         return countries;
//     } catch (error) {
//         console.error('❌ [getUniqueCountries] Error:', error);
//         throw error;
//     }
// }

// // ========================================
// // Function to get cities by country
// // ========================================
// export async function getCitiesByCountry(shops, country) {
//     try {
//         console.log(`🏙️  [getCitiesByCountry] Getting cities for: ${country}`);
        
//         const cities = [...new Set(
//             shops
//                 .filter(shop => shop.country === country)
//                 .map(shop => shop.city)
//                 .filter(c => c && c.trim() !== '') // Filter empty strings
//         )].sort();

//         console.log(`✅ [getCitiesByCountry] Found ${cities.length} cities in ${country}`);
//         return cities;
//     } catch (error) {
//         console.error('❌ [getCitiesByCountry] Error:', error);
//         throw error;
//     }
// }

// // ========================================
// // Function to get business types
// // ========================================
// export async function getBusinessTypes(shops) {
//     try {
//         console.log(`🔧 [getBusinessTypes] Processing ${shops.length} shops...`);
        
//         const types = [...new Set(
//             shops
//                 .map(shop => shop.business_type)
//                 .filter(t => t && t.trim() !== '') // Filter empty strings
//         )].sort();

//         console.log(`✅ [getBusinessTypes] Found ${types.length} unique business types:`, types);
//         return types;
//     } catch (error) {
//         console.error('❌ [getBusinessTypes] Error:', error);
//         throw error;
//     }
// }

// // ========================================
// // Function to get statistics
// // ========================================
// export async function getStats(shops) {
//     try {
//         console.log(`📊 [getStats] Calculating stats for ${shops.length} shops...`);
        
//         const uniqueCountries = [...new Set(shops.map(s => s.country).filter(Boolean))];
//         const uniqueCities = [...new Set(shops.map(s => s.city).filter(Boolean))];
//         const avgRating = calculateAvgRating(shops);

//         const stats = {
//             totalShops: shops.length,
//             totalCountries: uniqueCountries.length,
//             totalCities: uniqueCities.length,
//             avgRating: avgRating
//         };

//         console.log('📊 [getStats] Statistics:', stats);
//         return stats;
//     } catch (error) {
//         console.error('❌ [getStats] Error:', error);
//         throw error;
//     }
// }

// // ========================================
// // Helper function to calculate average rating
// // ========================================
// function calculateAvgRating(shops) {
//     try {
//         const ratedShops = shops.filter(s => {
//             const rating = parseFloat(s.rating);
//             return !isNaN(rating) && rating > 0;
//         });

//         if (ratedShops.length === 0) return '—';

//         const sum = ratedShops.reduce((acc, s) => {
//             return acc + parseFloat(s.rating);
//         }, 0);

//         const avg = (sum / ratedShops.length).toFixed(1);
//         console.log(`⭐ [calculateAvgRating] Average: ${avg} from ${ratedShops.length} rated shops`);
//         return avg;
//     } catch (error) {
//         console.error('❌ [calculateAvgRating] Error:', error);
//         return '—';
//     }
// }
// import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// // Your Supabase credentials
// const SUPABASE_URL = 'https://jbfqmwjopiehblnvwwlb.supabase.co';
// const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpiZnFtd2pvcGllaGJsbnZ3d2xiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNzI2NTYsImV4cCI6MjA3Njc0ODY1Nn0.4r9ttDX1ZTXYZafFck_SqHngOpCENHIFoeA229hDU_Q';

// // Create Supabase client
// export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// // ========================================
// // ðŸ”´ CHANGED: Completely rewritten fetchAllShops with simpler logic
// // ========================================   
// export async function fetchAllShops() {
//     try {
//         console.log('ðŸŸ¡ [fetchAllShops] Starting to fetch all shops...');

//         // ðŸ”´ CHANGED: Use simpler approach - just fetch with a large range
//         const { data, error, count } = await supabase
//             .from('motorcycle_shops')
//             .select('*', { count: 'exact' });

//         if (error) {
//             console.error('âŒ [fetchAllShops] Supabase error:', error);
//             throw new Error(`Supabase error: ${error.message}`);
//         }

//         if (!data) {
//             console.error('âŒ [fetchAllShops] No data returned from Supabase');
//             throw new Error('No data returned from Supabase');
//         }

//         console.log(`âœ… [fetchAllShops] Successfully fetched ${data.length} shops`);
//         console.log('ðŸ” [fetchAllShops] Sample shop:', data[0]); // Log first shop for debugging
        
//         return data;
//     } catch (error) {
//         console.error('âŒ [fetchAllShops] Error:', error);
//         throw error;
//     }
// }

// // ========================================
// // Function to get unique countries
// // ========================================
// export async function getUniqueCountries(shops) {
//     try {
//         // ðŸ”´ CHANGED: Get countries from local data instead of querying again
//         const countries = [...new Set(
//             shops
//                 .map(shop => shop.country)
//                 .filter(c => c && c.trim() !== '') // Filter empty strings
//         )].sort();

//         console.log(`âœ… [getUniqueCountries] Found ${countries.length} unique countries:`, countries);
//         return countries;
//     } catch (error) {
//         console.error('âŒ [getUniqueCountries] Error:', error);
//         throw error;
//     }
// }

// // ========================================
// // Function to get cities by country
// // ========================================
// export async function getCitiesByCountry(shops, country) {
//     try {
//         // ðŸ”´ CHANGED: Get cities from local data instead of querying
//         const cities = [...new Set(
//             shops
//                 .filter(shop => shop.country === country)
//                 .map(shop => shop.city)
//                 .filter(c => c && c.trim() !== '') // Filter empty strings
//         )].sort();

//         console.log(`âœ… [getCitiesByCountry] Found ${cities.length} cities in ${country}:`, cities.slice(0, 5), '...');
//         return cities;
//     } catch (error) {
//         console.error('âŒ [getCitiesByCountry] Error:', error);
//         throw error;
//     }
// }

// // ========================================
// // Function to get business types
// // ========================================
// export async function getBusinessTypes(shops) {
//     try {
//         // ðŸ”´ CHANGED: Get types from local data
//         const types = [...new Set(
//             shops
//                 .map(shop => shop.business_type)
//                 .filter(t => t && t.trim() !== '') // Filter empty strings
//         )].sort();

//         console.log(`âœ… [getBusinessTypes] Found ${types.length} unique business types:`, types);
//         return types;
//     } catch (error) {
//         console.error('âŒ [getBusinessTypes] Error:', error);
//         throw error;
//     }
// }

// // ========================================
// // Function to get statistics
// // ========================================
// export async function getStats(shops) {
//     try {
//         // ðŸ”´ CHANGED: Calculate stats directly from local data
//         const uniqueCountries = [...new Set(shops.map(s => s.country).filter(Boolean))];
//         const uniqueCities = [...new Set(shops.map(s => s.city).filter(Boolean))];
//         const avgRating = calculateAvgRating(shops);

//         const stats = {
//             totalShops: shops.length,
//             totalCountries: uniqueCountries.length,
//             totalCities: uniqueCities.length,
//             avgRating: avgRating
//         };

//         console.log('ðŸ“Š [getStats] Statistics:', stats);
//         return stats;
//     } catch (error) {
//         console.error('âŒ [getStats] Error:', error);
//         throw error;
//     }
// }

// // ========================================
// // Helper function to calculate average rating
// // ========================================
// function calculateAvgRating(shops) {
//     try {
//         const ratedShops = shops.filter(s => {
//             const rating = parseFloat(s.rating);
//             return !isNaN(rating) && rating > 0;
//         });

//         if (ratedShops.length === 0) return 'â€”';

//         const sum = ratedShops.reduce((acc, s) => {
//             return acc + parseFloat(s.rating);
//         }, 0);

//         const avg = (sum / ratedShops.length).toFixed(1);
//         console.log(`ðŸ“Š [calculateAvgRating] Calculated average: ${avg} from ${ratedShops.length} rated shops`);
//         return avg;
//     } catch (error) {
//         console.error('âŒ [calculateAvgRating] Error:', error);
//         return 'â€”';
//     }
// }

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Your Supabase credentials
const SUPABASE_URL = 'https://jbfqmwjopiehblnvwwlb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpiZnFtd2pvcGllaGJsbnZ3d2xiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNzI2NTYsImV4cCI6MjA3Njc0ODY1Nn0.4r9ttDX1ZTXYZafFck_SqHngOpCENHIFoeA229hDU_Q';

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ========================================
// ðŸ”´ FIXED: Proper pagination to fetch ALL shops
// ========================================   
export async function fetchAllShops() {
    try {
        console.log('ðŸ”µ [fetchAllShops] Starting pagination fetch...');

        let allData = [];
        let offset = 0;
        const pageSize = 1000; // Supabase default limit
        let hasMore = true;

        while (hasMore) {
            console.log(`ðŸ“¥ [fetchAllShops] Fetching batch: offset=${offset}, size=${pageSize}`);

            // ðŸ”´ FIXED: Use range() to paginate through results
            const { data, error, count } = await supabase
                .from('motorcycle_shops')
                .select('*', { count: 'exact' })
                .range(offset, offset + pageSize - 1);

            if (error) {
                console.error('âŒ [fetchAllShops] Supabase error:', error);
                throw new Error(`Supabase error: ${error.message}`);
            }

            if (!data || data.length === 0) {
                hasMore = false;
                console.log(`âœ… [fetchAllShops] Finished! Total: ${allData.length} shops`);
            } else {
                allData = [...allData, ...data];
                console.log(`ðŸ“¦ [fetchAllShops] Batch fetched: ${data.length} shops (Total so far: ${allData.length})`);
                offset += pageSize;
                hasMore = data.length === pageSize; // Only continue if we got a full page
            }
        }

        console.log(`âœ… [fetchAllShops] SUCCESS! Fetched ${allData.length} total shops`);
        
        if (allData.length > 0) {
            console.log('ðŸ” [fetchAllShops] Sample shop:', {
                name: allData[0].name,
                country: allData[0].country,
                city: allData[0].city,
                rating: allData[0].rating
            });
        }
        
        return allData;
    } catch (error) {
        console.error('âŒ [fetchAllShops] Error:', error);
        throw error;
    }
}

// ========================================
// Function to get unique countries
// ========================================
export async function getUniqueCountries(shops) {
    try {
        console.log(`ðŸŒ [getUniqueCountries] Processing ${shops.length} shops...`);
        
        const countries = [...new Set(
            shops
                .map(shop => shop.country)
                .filter(c => c && c.trim() !== '') // Filter empty strings
        )].sort();

        console.log(`âœ… [getUniqueCountries] Found ${countries.length} unique countries:`, countries);
        return countries;
    } catch (error) {
        console.error('âŒ [getUniqueCountries] Error:', error);
        throw error;
    }
}

// ========================================
// Function to get cities by country
// ========================================
export async function getCitiesByCountry(shops, country) {
    try {
        console.log(`ðŸ™ï¸  [getCitiesByCountry] Getting cities for: ${country}`);
        
        const cities = [...new Set(
            shops
                .filter(shop => shop.country === country)
                .map(shop => shop.city)
                .filter(c => c && c.trim() !== '') // Filter empty strings
        )].sort();

        console.log(`âœ… [getCitiesByCountry] Found ${cities.length} cities in ${country}`);
        return cities;
    } catch (error) {
        console.error('âŒ [getCitiesByCountry] Error:', error);
        throw error;
    }
}

// ========================================
// Function to get business types
// ========================================
export async function getBusinessTypes(shops) {
    try {
        console.log(`ðŸ”§ [getBusinessTypes] Processing ${shops.length} shops...`);
        
        const types = [...new Set(
            shops
                .map(shop => shop.business_type)
                .filter(t => t && t.trim() !== '') // Filter empty strings
        )].sort();

        console.log(`âœ… [getBusinessTypes] Found ${types.length} unique business types:`, types);
        return types;
    } catch (error) {
        console.error('âŒ [getBusinessTypes] Error:', error);
        throw error;
    }
}

// ========================================
// Function to get statistics
// ========================================
export async function getStats(shops) {
    try {
        console.log(`ðŸ“Š [getStats] Calculating stats for ${shops.length} shops...`);
        
        const uniqueCountries = [...new Set(shops.map(s => s.country).filter(Boolean))];
        const uniqueCities = [...new Set(shops.map(s => s.city).filter(Boolean))];
        const avgRating = calculateAvgRating(shops);

        const stats = {
            totalShops: shops.length,
            totalCountries: uniqueCountries.length,
            totalCities: uniqueCities.length,
            avgRating: avgRating
        };

        console.log('ðŸ“Š [getStats] Statistics:', stats);
        return stats;
    } catch (error) {
        console.error('âŒ [getStats] Error:', error);
        throw error;
    }
}

// ========================================
// Helper function to calculate average rating
// ========================================
function calculateAvgRating(shops) {
    try {
        const ratedShops = shops.filter(s => {
            const rating = parseFloat(s.rating);
            return !isNaN(rating) && rating > 0;
        });

        if (ratedShops.length === 0) return 'â€”';

        const sum = ratedShops.reduce((acc, s) => {
            return acc + parseFloat(s.rating);
        }, 0);

        const avg = (sum / ratedShops.length).toFixed(1);
        console.log(`â­ [calculateAvgRating] Average: ${avg} from ${ratedShops.length} rated shops`);
        return avg;
    } catch (error) {
        console.error('âŒ [calculateAvgRating] Error:', error);
        return 'â€”';
    }
}