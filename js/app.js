// js/app.js
// Main application file

import {
    fetchAllShops,
    getStats,
    getUniqueCountries,
    getCitiesByCountry,
    getBusinessTypes,
    supabase
} from './supabase.js';

// Import authentication and profile modules
import { initAuth, getBikerProfile } from './auth.js';
import { initProfile } from './profile.js';
import { initBikes } from './bikes.js';

// ============================================
// STATE
// ============================================
let allShops = [];
let filteredShops = [];
let currentSearch = '';
let selectedCountry = '';
let selectedCity = '';
let selectedBusinessType = '';

let allCountries = [];
let allBusinessTypes = [];

// User bike data for personalized filtering
let userBikes = [];
let userBikeBrands = [];

// ============================================
// DOM ELEMENTS
// ============================================
const countrySelect = document.getElementById('countrySelect');
const citySelect = document.getElementById('citySelect');
const businessTypeSelect = document.getElementById('businessTypeSelect');
const storesList = document.getElementById('storesList');
const searchFilter = document.getElementById('searchFilter');

// ============================================
// INITIALIZE APP
// ============================================
window.addEventListener('DOMContentLoaded', async function() {
    console.log('🟡 [INIT] App initializing...');
    try {
        // Initialize authentication module
        initAuth();

        // Initialize profile module
        initProfile();

        // Initialize bikes module
        initBikes();

        // Setup navigation
        setupNavigation();

        // Initialize shop directory
        await initializeApp();
    } catch (error) {
        console.error('❌ [INIT] Fatal error:', error);
        showStatus('❌ FATAL ERROR: ' + error.message, 'error');
    }
});

// ============================================
// CHECK USER BIKES FOR PERSONALIZED FILTERING
// ============================================
async function checkUserBikesForFiltering() {
    try {
        const profile = await getBikerProfile();

        if (!profile) {
            console.log('ℹ️ [Filter] No user logged in - showing all shops');
            userBikes = [];
            userBikeBrands = [];
            return;
        }

        // Fetch user's bikes
        const { data: bikes, error } = await supabase
            .from('bikes')
            .select('brand, model')
            .eq('biker_id', profile.id);

        if (error) {
            console.error('❌ [Filter] Error loading user bikes:', error);
            userBikes = [];
            userBikeBrands = [];
            return;
        }

        userBikes = bikes || [];
        userBikeBrands = [...new Set(bikes.map(b => b.brand.toLowerCase()))];

        if (userBikes.length > 0) {
            console.log(`✅ [Filter] User has ${userBikes.length} bike(s):`, userBikes.map(b => `${b.brand} ${b.model}`));
            console.log(`🔍 [Filter] Will prioritize shops for brands: ${userBikeBrands.join(', ')}`);

            // Show personalized message
            showPersonalizedMessage();
        } else {
            console.log('ℹ️ [Filter] User logged in but no bikes added yet');
        }

    } catch (error) {
        console.error('❌ [Filter] Error checking user bikes:', error);
        userBikes = [];
        userBikeBrands = [];
    }
}

// Show personalized filtering message
function showPersonalizedMessage() {
    const statusMessage = document.getElementById('statusMessage');
    if (statusMessage && userBikes.length > 0) {
        const bikeList = userBikes.map(b => `${b.brand} ${b.model}`).join(', ');
        statusMessage.innerHTML = `
            <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; border-left: 4px solid #2196f3; margin: 15px 0;">
                <strong>🏍️ Personalized for your bikes:</strong> ${bikeList}
                <br><small>Showing shops that can service your motorcycles. <a href="#" onclick="window.showAllShops(); return false;" style="color: #2196f3;">Show all shops</a></small>
            </div>
        `;
    }
}

// Function to show all shops (remove personalization)
window.showAllShops = function() {
    userBikeBrands = [];
    applyAllFilters();
    const statusMessage = document.getElementById('statusMessage');
    if (statusMessage) {
        statusMessage.innerHTML = '';
    }
};

async function initializeApp() {
    try {
        showStatus('🔄 Loading shops from Supabase...', 'loading');

        // STEP 1: Fetch shops
        console.log('📥 STEP 1: Fetching shops from Supabase...');
        allShops = await fetchAllShops();
        console.log(`✅ STEP 1 COMPLETE: Loaded ${allShops.length} shops`);

        // STEP 1.5: Check if user is logged in and has bikes - for personalized filtering
        await checkUserBikesForFiltering();

        if (allShops.length === 0) {
            showStatus('❌ NO DATA: No shops in database!', 'error');
            throw new Error('No shops found in database');
        }

        // STEP 2: Get unique countries
        console.log('📋 STEP 2: Getting unique countries...');
        allCountries = await getUniqueCountries(allShops);
        console.log(`✅ STEP 2 COMPLETE: Found ${allCountries.length} countries`, allCountries.slice(0, 5));

        if (allCountries.length === 0) {
            showStatus('❌ ERROR: No countries found in data!', 'error');
            throw new Error('No countries in data');
        }

        // STEP 3: Get business types
        console.log('📋 STEP 3: Getting business types...');
        allBusinessTypes = await getBusinessTypes(allShops);
        console.log(`✅ STEP 3 COMPLETE: Found ${allBusinessTypes.length} business types:`, allBusinessTypes);

        // 🔴 NEW: Log sample shop data for debugging
        console.log('📊 Sample shop data:');
        console.log('  Name:', allShops[0].name);
        console.log('  Country:', allShops[0].country);
        console.log('  City:', allShops[0].city);
        console.log('  Business Type:', allShops[0].business_type);

        // STEP 4: Populate dropdowns
        console.log('🔽 STEP 4: Populating dropdowns...');
        populateCountryDropdown();
        populateCityDropdown('');
        populateBusinessTypeDropdown();
        console.log('✅ STEP 4 COMPLETE: Dropdowns populated');

        // STEP 5: Update stats
        console.log('📊 STEP 5: Updating stats...');
        await updateStats();
        console.log('✅ STEP 5 COMPLETE: Stats updated');

        // STEP 6: Display initial data
        console.log('👀 STEP 6: Displaying initial data...');
        filteredShops = [...allShops];
        renderStoresList(filteredShops);
        console.log('✅ STEP 6 COMPLETE: Initial display done');

        // STEP 7: Setup event listeners
        console.log('⚡ STEP 7: Setting up event listeners...');
        setupEventListeners();
        console.log('✅ STEP 7 COMPLETE: Event listeners ready');

        showStatus(`✅ SUCCESS! Loaded ${allShops.length} shops from ${allCountries.length} countries`, 'success');
    } catch (error) {
        console.error('❌ [initializeApp] Error:', error);
        throw error;
    }
}

// ============================================
// UPDATE STATS
// ============================================
async function updateStats() {
    try {
        const stats = await getStats(allShops);
        
        console.log('🎯 [updateStats] Setting stats:', stats);
        
        const totalShopsEl = document.getElementById('totalShops');
        const totalCountriesEl = document.getElementById('totalCountries');
        const totalCitiesEl = document.getElementById('totalCities');
        const avgRatingEl = document.getElementById('avgRating');
        
        if (totalShopsEl) totalShopsEl.textContent = stats.totalShops;
        if (totalCountriesEl) totalCountriesEl.textContent = stats.totalCountries;
        if (totalCitiesEl) totalCitiesEl.textContent = stats.totalCities;
        if (avgRatingEl) avgRatingEl.textContent = stats.avgRating;
        
        console.log('✅ [updateStats] Stats displayed');
    } catch (error) {
        console.error('❌ [updateStats] Error:', error);
    }
}

// ============================================
// DROPDOWN FUNCTIONS
// ============================================

function populateCountryDropdown() {
    try {
        console.log('🔽 [populateCountryDropdown] Populating with countries');

        countrySelect.innerHTML = '<option value="">📍 Select a country...</option>';

        if (!allCountries || allCountries.length === 0) {
            console.error('❌ No countries available');
            countrySelect.disabled = true;
            return;
        }

        allCountries.forEach(country => {
            const count = allShops.filter(shop => shop.country === country).length;
            const option = document.createElement('option');
            option.value = country;
            option.textContent = `${country} (${count})`;
            countrySelect.appendChild(option);
        });

        countrySelect.disabled = false;
        console.log(`✅ [populateCountryDropdown] Added ${allCountries.length} countries`);
    } catch (error) {
        console.error('❌ [populateCountryDropdown] Error:', error);
    }
}

function populateCityDropdown(selectedCountry = '') {
    try {
        console.log(`🔽 [populateCityDropdown] Populating for country: "${selectedCountry}"`);

        citySelect.innerHTML = '<option value="">🏙️  Select a city...</option>';

        if (!selectedCountry || selectedCountry.trim() === '') {
            citySelect.disabled = true;
            console.log('⚠️  [populateCityDropdown] No country selected');
            return;
        }

        const cities = [...new Set(
            allShops
                .filter(shop => shop.country === selectedCountry)
                .map(shop => shop.city)
                .filter(c => c && c.trim() !== '')
        )].sort();

        if (cities.length === 0) {
            console.warn(`⚠️  [populateCityDropdown] No cities found for ${selectedCountry}`);
            citySelect.disabled = true;
            return;
        }

        cities.forEach(city => {
            const count = allShops.filter(shop => shop.country === selectedCountry && shop.city === city).length;
            const option = document.createElement('option');
            option.value = city;
            option.textContent = `${city} (${count})`;
            citySelect.appendChild(option);
        });

        citySelect.disabled = false;
        console.log(`✅ [populateCityDropdown] Added ${cities.length} cities`);
    } catch (error) {
        console.error('❌ [populateCityDropdown] Error:', error);
    }
}

function populateBusinessTypeDropdown() {
    try {
        console.log('🔽 [populateBusinessTypeDropdown] Populating business types');

        businessTypeSelect.innerHTML = '<option value="">🔧 All Types</option>';

        if (!allBusinessTypes || allBusinessTypes.length === 0) {
            console.warn('⚠️  No business types available');
            return;
        }

        allBusinessTypes.forEach(type => {
            const count = allShops.filter(shop => shop.business_type === type).length;
            const option = document.createElement('option');
            option.value = type;
            option.textContent = `${type} (${count})`;
            businessTypeSelect.appendChild(option);
        });

        console.log(`✅ [populateBusinessTypeDropdown] Added ${allBusinessTypes.length} types`);
    } catch (error) {
        console.error('❌ [populateBusinessTypeDropdown] Error:', error);
    }
}

// ============================================
// 🔴 FIXED: BETTER FILTERING LOGIC
// ============================================

function displayShopsByFilters() {
    try {
        console.log('🔍 [displayShopsByFilters] Applying filters:');
        console.log(`  Country: "${selectedCountry}"`);
        console.log(`  City: "${selectedCity}"`);
        console.log(`  Business Type: "${selectedBusinessType}"`);
        console.log(`  Search: "${currentSearch}"`);
        console.log(`  User Bike Brands: ${userBikeBrands.length > 0 ? userBikeBrands.join(', ') : 'None'}`);

        // 🔴 FIXED: Better filtering with proper conditions
        filteredShops = allShops.filter(shop => {
            // Search filter (case-insensitive)
            const matchesSearch = !currentSearch || (
                (shop.name && shop.name.toLowerCase().includes(currentSearch.toLowerCase())) ||
                (shop.city && shop.city.toLowerCase().includes(currentSearch.toLowerCase())) ||
                (shop.country && shop.country.toLowerCase().includes(currentSearch.toLowerCase())) ||
                (shop.business_type && shop.business_type.toLowerCase().includes(currentSearch.toLowerCase())) ||
                (shop.address && shop.address.toLowerCase().includes(currentSearch.toLowerCase()))
            );
            
            // Country filter (exact match)
            const matchesCountry = !selectedCountry || (shop.country === selectedCountry);
            
            // City filter (exact match, only if country selected)
            const matchesCity = !selectedCity || (shop.city === selectedCity);
            
            // 🔴 FIXED: Business type filter (case-insensitive, better matching)
            const matchesType = !selectedBusinessType || (
                shop.business_type && 
                shop.business_type.toLowerCase().trim() === selectedBusinessType.toLowerCase().trim()
            );
            
            // 🏍️ NEW: Personalized filter - match shops that service user's bike brands
            let matchesBikeBrand = true;
            if (userBikeBrands.length > 0) {
                // Check if shop name, services, or description mentions the user's bike brands
                const shopText = `${shop.name || ''} ${shop.services || ''} ${shop.description || ''} ${shop.specialties || ''}`.toLowerCase();
                matchesBikeBrand = userBikeBrands.some(brand => shopText.includes(brand));
            }

            return matchesSearch && matchesCountry && matchesCity && matchesType && matchesBikeBrand;
        });

        // Sort: prioritize shops that match user's bike brands
        if (userBikeBrands.length > 0) {
            filteredShops.sort((a, b) => {
                const aText = `${a.name || ''} ${a.services || ''} ${a.description || ''}`.toLowerCase();
                const bText = `${b.name || ''} ${b.services || ''} ${b.description || ''}`.toLowerCase();

                const aMatches = userBikeBrands.filter(brand => aText.includes(brand)).length;
                const bMatches = userBikeBrands.filter(brand => bText.includes(brand)).length;

                return bMatches - aMatches; // Higher matches first
            });
        }

        console.log(`✅ [displayShopsByFilters] Filtered to ${filteredShops.length} shops`);
        
        // 🔴 NEW: Show which types matched
        if (selectedBusinessType) {
            const matchingTypes = [...new Set(filteredShops.map(s => s.business_type))];
            console.log(`📊 Matching business types: ${matchingTypes.join(', ')}`);
        }
        
        const resultCountEl = document.getElementById('resultCount');
        if (resultCountEl) {
            resultCountEl.textContent = filteredShops.length;
        }

        renderStoresList(filteredShops);
    } catch (error) {
        console.error('❌ [displayShopsByFilters] Error:', error);
    }
}

// ============================================
// RENDER SHOPS LIST
// ============================================

function renderStoresList(shops) {
    try {
        if (!shops.length) {
            storesList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <p>No shops found matching your filters</p>
                </div>
            `;
            return;
        }

        // Render shops as cards
        storesList.innerHTML = shops.map(shop => `
            <div class="store-card">
                <div class="store-header">
                    <h4>${escapeHtml(shop.name)}</h4>
                    ${shop.rating && shop.rating !== 'N/A' ? `<span class="rating-badge">⭐ ${shop.rating}</span>` : ''}
                </div>
                
                <p class="store-address">
                    <i class="fas fa-map-pin"></i>
                    ${escapeHtml(shop.address || 'N/A')}
                </p>
                
                <p class="store-address">
                    <i class="fas fa-globe"></i>
                    ${escapeHtml(shop.city)}, ${escapeHtml(shop.country)}
                </p>
                
                ${shop.business_type ? `
                    <p class="store-type">
                        <i class="fas fa-wrench"></i>
                        ${escapeHtml(shop.business_type)}
                    </p>
                ` : ''}
                
                <div class="store-contact">
                    ${shop.phone && shop.phone !== 'N/A' ? `
                        <a href="tel:${shop.phone}" class="contact-link">
                            <i class="fas fa-phone"></i>
                            Call
                        </a>
                    ` : ''}
                    
                    ${shop.website && shop.website !== 'N/A' ? `
                        <a href="${shop.website}" target="_blank" class="contact-link">
                            <i class="fas fa-globe"></i>
                            Website
                        </a>
                    ` : ''}
                    
                    ${shop.latitude && shop.longitude ? `
                        <a href="javascript:void(0)" class="map-link" onclick="window.openShopMap({
                            name: '${escapeHtml(shop.name).replace(/'/g, "\\'")}',
                            address: '${escapeHtml(shop.address || '').replace(/'/g, "\\'")}',
                            city: '${escapeHtml(shop.city).replace(/'/g, "\\'")}',
                            country: '${escapeHtml(shop.country).replace(/'/g, "\\'")}',
                            rating: '${shop.rating || 'N/A'}',
                            phone: '${shop.phone || 'N/A'}',
                            website: '${shop.website || 'N/A'}',
                            latitude: ${shop.latitude},
                            longitude: ${shop.longitude}
                        })">
                            <i class="fas fa-map-marked-alt"></i>
                            Map
                        </a>
                    ` : ''}
                </div>
            </div>
        `).join('');

        console.log(`✅ [renderStoresList] Rendered ${shops.length} shops`);
    } catch (error) {
        console.error('❌ [renderStoresList] Error:', error);
    }
}

// Global function for map button
window.openShopMap = function(shop) {
    console.log('🗺️  Opening map for:', shop.name);
    
    const lat = parseFloat(shop.latitude);
    const lng = parseFloat(shop.longitude);
    
    if (isNaN(lat) || isNaN(lng)) {
        console.error('❌ Invalid coordinates');
        return;
    }
    
    const mapHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(shop.name)} - Location Map</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { width: 100%; height: 100%; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        #map { width: 100%; height: 100%; }
        .info-panel { position: absolute; bottom: 20px; left: 20px; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); max-width: 400px; z-index: 1000; }
        .info-panel h2 { color: #667eea; margin-bottom: 10px; font-size: 18px; }
        .info-panel p { color: #666; margin: 8px 0; line-height: 1.5; }
        .info-panel .label { font-weight: 600; color: #333; }
        .close-btn { position: absolute; top: 20px; right: 20px; background: white; border: none; width: 40px; height: 40px; border-radius: 50%; font-size: 24px; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.2); z-index: 1000; }
        .close-btn:hover { background: #f0f0f0; }
    </style>
</head>
<body>
    <button class="close-btn" onclick="window.close()">×</button>
    <div id="map"></div>
    <div class="info-panel">
        <h2>📍 ${escapeHtml(shop.name)}</h2>
        <p><span class="label">Address:</span><br>${escapeHtml(shop.address || 'N/A')}</p>
        <p><span class="label">City:</span> ${escapeHtml(shop.city)}</p>
        <p><span class="label">Country:</span> ${escapeHtml(shop.country)}</p>
        ${shop.rating && shop.rating !== 'N/A' ? `<p><span class="label">⭐ Rating:</span> ${shop.rating}</p>` : ''}
        ${shop.phone && shop.phone !== 'N/A' ? `<p>☎️ <a href="tel:${shop.phone}">${escapeHtml(shop.phone)}</a></p>` : ''}
        ${shop.website && shop.website !== 'N/A' ? `<p>🌐 <a href="${shop.website}" target="_blank">Visit Website</a></p>` : ''}
    </div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"><\/script>
    <script>
        const map = L.map('map').setView([${lat}, ${lng}], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19
        }).addTo(map);
        const marker = L.marker([${lat}, ${lng}]).addTo(map).bindPopup(\`<strong>${escapeHtml(shop.name)}</strong><br>${escapeHtml(shop.address || 'N/A')}\`).openPopup();
        map.setView([${lat}, ${lng}], 15);
    <\/script>
</body>
</html>
    `;
    
    const blob = new Blob([mapHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
};

// ============================================
// ESCAPE HTML UTILITY
// ============================================

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// SHOW STATUS
// ============================================

function showStatus(message, type = 'info') {
    const statusEl = document.getElementById('statusMessage');
    if (!statusEl) {
        console.warn('Status element not found');
        return;
    }
    
    statusEl.textContent = message;
    statusEl.className = `status-message show ${type}`;
    
    if (type !== 'loading') {
        setTimeout(() => statusEl.classList.remove('show'), 5000);
    }
}

// ============================================
// NAVIGATION
// ============================================

function setupNavigation() {
    console.log('🔀 [setupNavigation] Setting up navigation...');

    // Get all navigation links
    const navLinks = document.querySelectorAll('.nav-link[data-view]');

    // Add click listeners
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const viewName = link.getAttribute('data-view');
            navigateToView(viewName);
        });
    });

    console.log('✅ [setupNavigation] Navigation ready');
}

// Navigate to a specific view (make it global so auth.js can use it)
window.navigateToView = function(viewName) {
    console.log(`🔀 [navigateToView] Navigating to: ${viewName}`);

    // Forcefully hide ALL views first
    document.querySelectorAll('.view-container').forEach(view => {
        view.classList.remove('active');
        view.style.display = 'none';
    });

    // Remove active class from all nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });

    // Show the selected view
    let viewId;
    switch (viewName) {
        case 'shop-directory':
            viewId = 'shopDirectoryView';
            break;
        case 'login':
            viewId = 'loginView';
            break;
        case 'register':
            viewId = 'registerView';
            break;
        case 'profile':
            viewId = 'profileView';
            break;
        default:
            viewId = 'shopDirectoryView';
    }

    const view = document.getElementById(viewId);
    if (view) {
        view.classList.add('active');
        // Force display based on view type
        if (view.classList.contains('auth-view')) {
            view.style.display = 'flex';
        } else {
            view.style.display = 'block';
        }
    }

    // Update active nav link
    const activeNavLink = document.querySelector(`.nav-link[data-view="${viewName}"]`);
    if (activeNavLink) {
        activeNavLink.classList.add('active');
    }

    console.log(`✅ [navigateToView] Now showing: ${viewId}`);
}

// ============================================
// EVENT LISTENERS
// ============================================

function setupEventListeners() {
    console.log('⚡ [setupEventListeners] Setting up listeners...');

    try {
        if (searchFilter) {
            searchFilter.addEventListener('input', (e) => {
                currentSearch = e.target.value;
                console.log(`🔍 Search: "${currentSearch}"`);
                displayShopsByFilters();
            });
        }

        if (countrySelect) {
            countrySelect.addEventListener('change', (e) => {
                selectedCountry = e.target.value;
                selectedCity = '';
                console.log(`🌍 Country selected: "${selectedCountry}"`);

                populateCityDropdown(selectedCountry);
                businessTypeSelect.value = '';
                selectedBusinessType = '';
                displayShopsByFilters();
            });
        }

        if (citySelect) {
            citySelect.addEventListener('change', (e) => {
                selectedCity = e.target.value;
                console.log(`🏙️  City selected: "${selectedCity}"`);

                businessTypeSelect.value = '';
                selectedBusinessType = '';
                displayShopsByFilters();
            });
        }

        if (businessTypeSelect) {
            businessTypeSelect.addEventListener('change', (e) => {
                selectedBusinessType = e.target.value;
                console.log(`🔧 Business type selected: "${selectedBusinessType}"`);
                displayShopsByFilters();
            });
        }

        console.log('✅ [setupEventListeners] All listeners attached');
    } catch (error) {
        console.error('❌ [setupEventListeners] Error:', error);
    }
}