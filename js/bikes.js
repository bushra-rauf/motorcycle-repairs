// ========================================
// BIKES MODULE
// Handles bike management, photos, and documents
// ========================================

import { supabase } from './supabase-clean.js';
import { getBikerProfile } from './auth.js';

let currentBikes = [];
let currentBikeId = null;

// ========================================
// Initialize Bikes Module
// ========================================
export function initBikes() {
    console.log('🏍️ [Bikes] Initializing bikes module...');

    // Set up event listeners
    setupBikesListeners();

    // Load bikes when profile view is shown
    const profileView = document.getElementById('profileView');
    if (profileView) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    if (profileView.classList.contains('active')) {
                        loadBikes();
                    }
                }
            });
        });

        observer.observe(profileView, { attributes: true });
    }
}

// ========================================
// Setup Bikes Event Listeners
// ========================================
function setupBikesListeners() {
    // Add bike button
    const addBikeBtn = document.getElementById('addBikeBtn');
    if (addBikeBtn) {
        addBikeBtn.addEventListener('click', showAddBikeForm);
    }

    // Cancel bike form button
    const cancelBikeBtn = document.getElementById('cancelBikeBtn');
    if (cancelBikeBtn) {
        cancelBikeBtn.addEventListener('click', hideBikeForm);
    }

    // Bike form submission
    const bikeForm = document.getElementById('bikeForm');
    if (bikeForm) {
        bikeForm.addEventListener('submit', handleBikeSubmit);
    }

    // Modal close
    const modalClose = document.querySelector('.modal-close');
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }

    // Close modal when clicking outside
    const modal = document.getElementById('bikeDetailModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
}

// ========================================
// Load Bikes
// ========================================
async function loadBikes() {
    try {
        console.log('🏍️ [Bikes] Loading bikes...');

        const profile = await getBikerProfile();
        if (!profile) {
            console.log('⚠️ [Bikes] No profile found');
            return;
        }

        // Fetch bikes with photos and documents
        const { data: bikes, error } = await supabase
            .from('bikes')
            .select(`
                *,
                bike_photos (*),
                service_documents (*)
            `)
            .eq('biker_id', profile.id)
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        console.log(`✅ [Bikes] Loaded ${bikes.length} bikes`);
        currentBikes = bikes;

        // Display bikes
        displayBikes(bikes);

    } catch (error) {
        console.error('❌ [Bikes] Error loading bikes:', error);
        showNotification('Failed to load bikes', 'error');
    }
}

// ========================================
// Display Bikes
// ========================================
function displayBikes(bikes) {
    const bikesList = document.getElementById('bikesList');

    if (!bikes || bikes.length === 0) {
        bikesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-motorcycle"></i>
                <p>No motorcycles added yet</p>
                <p class="empty-subtitle">Click "Add Motorcycle" to get started</p>
            </div>
        `;
        return;
    }

    bikesList.innerHTML = bikes.map(bike => {
        const primaryPhoto = bike.bike_photos?.find(p => p.is_primary) || bike.bike_photos?.[0];
        const photoCount = bike.bike_photos?.length || 0;
        const docCount = bike.service_documents?.length || 0;

        return `
            <div class="bike-card" data-bike-id="${bike.id}">
                <div class="bike-card-header">
                    ${primaryPhoto ? `
                        <div class="bike-photo">
                            <img src="${primaryPhoto.photo_url}" alt="${bike.brand} ${bike.model}" />
                        </div>
                    ` : `
                        <div class="bike-photo-placeholder">
                            <i class="fas fa-motorcycle"></i>
                        </div>
                    `}
                    <div class="bike-main-info">
                        <h3>${bike.brand} ${bike.model}</h3>
                        <p class="bike-year">${bike.year}</p>
                    </div>
                </div>

                <div class="bike-card-body">
                    <div class="bike-info-grid">
                        <div class="bike-info-item">
                            <i class="fas fa-tachometer-alt"></i>
                            <span>${bike.mileage.toLocaleString()} km</span>
                        </div>
                        ${bike.color ? `
                            <div class="bike-info-item">
                                <i class="fas fa-palette"></i>
                                <span>${bike.color}</span>
                            </div>
                        ` : ''}
                        ${bike.engine_size ? `
                            <div class="bike-info-item">
                                <i class="fas fa-engine"></i>
                                <span>${bike.engine_size}</span>
                            </div>
                        ` : ''}
                        ${bike.license_plate ? `
                            <div class="bike-info-item">
                                <i class="fas fa-id-card"></i>
                                <span>${bike.license_plate}</span>
                            </div>
                        ` : ''}
                    </div>

                    <div class="bike-stats">
                        <span class="bike-stat">
                            <i class="fas fa-camera"></i> ${photoCount} photo${photoCount !== 1 ? 's' : ''}
                        </span>
                        <span class="bike-stat">
                            <i class="fas fa-file-alt"></i> ${docCount} document${docCount !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>

                <div class="bike-card-actions">
                    <button class="btn btn-sm btn-primary" onclick="window.viewBikeDetails('${bike.id}')">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="window.editBike('${bike.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="window.deleteBike('${bike.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// ========================================
// Show Add Bike Form
// ========================================
function showAddBikeForm() {
    currentBikeId = null;
    document.getElementById('bikeFormTitle').innerHTML = '<i class="fas fa-motorcycle"></i> Add New Motorcycle';
    document.getElementById('bikeForm').reset();
    document.getElementById('bikeId').value = '';
    document.getElementById('bikeFormContainer').style.display = 'block';

    // Minimize personal info section to save space
    const profileSection = document.querySelector('.profile-section:first-of-type');
    if (profileSection) {
        profileSection.style.marginBottom = '10px';
    }

    // Scroll to form
    document.getElementById('bikeFormContainer').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ========================================
// Show Edit Bike Form
// ========================================
window.editBike = async function(bikeId) {
    try {
        console.log('📝 [Bikes] Editing bike ID:', bikeId);
        console.log('📝 [Bikes] Current bikes count:', currentBikes.length);

        currentBikeId = bikeId;

        // Always fetch fresh data from database
        console.log('🔄 [Bikes] Fetching bike data from database...');

        const profile = await getBikerProfile();
        if (!profile) {
            throw new Error('You must be logged in to edit bikes');
        }

        console.log('🔍 [Bikes] Searching for bike ID:', bikeId, 'for biker:', profile.id);

        const { data: bikes, error } = await supabase
            .from('bikes')
            .select('*')
            .eq('id', bikeId)
            .eq('biker_id', profile.id);

        if (error) {
            console.error('❌ [Bikes] Database error:', error);
            throw new Error('Failed to load bike from database: ' + error.message);
        }

        console.log('🔍 [Bikes] Query returned:', bikes);

        if (!bikes || bikes.length === 0) {
            throw new Error('Bike not found in database. It may have been deleted or you may not have permission to edit it.');
        }

        const bike = bikes[0];
        console.log('✅ [Bikes] Loaded bike from database:', bike);

        // Populate form with fetched data
        document.getElementById('bikeFormTitle').innerHTML = '<i class="fas fa-edit"></i> Edit Motorcycle';
        document.getElementById('bikeId').value = bike.id;
        document.getElementById('bikeBrand').value = bike.brand || '';
        document.getElementById('bikeModel').value = bike.model || '';
        document.getElementById('bikeYear').value = bike.year || '';
        document.getElementById('bikeMileage').value = bike.mileage || '';
        document.getElementById('bikeColor').value = bike.color || '';
        document.getElementById('bikeEngineSize').value = bike.engine_size || '';
        document.getElementById('bikeVin').value = bike.vin || '';
        document.getElementById('bikeLicensePlate').value = bike.license_plate || '';
        document.getElementById('bikeNotes').value = bike.notes || '';

        document.getElementById('bikeFormContainer').style.display = 'block';

        console.log('✅ [Bikes] Edit form populated successfully');

        // Scroll to form
        document.getElementById('bikeFormContainer').scrollIntoView({ behavior: 'smooth' });

    } catch (error) {
        console.error('❌ [Bikes] Error in editBike:', error);
        showNotification('Failed to load bike data: ' + error.message, 'error');
    }
};

// ========================================
// Hide Bike Form
// ========================================
function hideBikeForm() {
    currentBikeId = null;
    document.getElementById('bikeFormContainer').style.display = 'none';
    document.getElementById('bikeForm').reset();
}

// ========================================
// Handle Bike Submit (Add/Edit)
// ========================================
async function handleBikeSubmit(e) {
    e.preventDefault();

    try {
        console.log('🏍️ [Bikes] Submitting bike...');

        let profile = await getBikerProfile();

        // If no profile exists, try to create it automatically
        if (!profile) {
            console.log('⚠️ [Bikes] No profile found, attempting to create one...');

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                throw new Error('You must be logged in to add a bike');
            }

            console.log('📝 [Bikes] Creating profile for user:', user.email);

            // Try to create the profile with proper error handling
            const { data: newProfile, error: createError } = await supabase
                .from('bikers')
                .insert([{
                    user_id: user.id,
                    email: user.email,
                    full_name: user.user_metadata?.full_name || user.email.split('@')[0],
                    phone: user.user_metadata?.phone || null
                }])
                .select()
                .single();

            if (createError) {
                console.error('❌ [Bikes] Profile creation failed:', createError);

                // Check if it's an RLS error
                if (createError.code === '42501' || createError.message.includes('policy')) {
                    throw new Error('Database security policy error. Your account needs to be set up properly. Please contact support or apply the SQL fix.');
                }

                throw new Error(`Failed to create profile: ${createError.message}`);
            }

            profile = newProfile;
            console.log('✅ [Bikes] Profile created successfully:', profile);
        }

        const bikeData = {
            biker_id: profile.id,
            brand: document.getElementById('bikeBrand').value,
            model: document.getElementById('bikeModel').value,
            year: parseInt(document.getElementById('bikeYear').value),
            mileage: parseInt(document.getElementById('bikeMileage').value),
            color: document.getElementById('bikeColor').value || null,
            engine_size: document.getElementById('bikeEngineSize').value || null,
            vin: document.getElementById('bikeVin').value || null,
            license_plate: document.getElementById('bikeLicensePlate').value || null,
            notes: document.getElementById('bikeNotes').value || null
        };

        const bikeId = document.getElementById('bikeId').value;

        let result;
        if (bikeId) {
            // Update existing bike
            result = await supabase
                .from('bikes')
                .update(bikeData)
                .eq('id', bikeId)
                .select();
        } else {
            // Insert new bike
            result = await supabase
                .from('bikes')
                .insert([bikeData])
                .select();
        }

        if (result.error) {
            throw result.error;
        }

        console.log('✅ [Bikes] Bike saved successfully');

        // Handle photo uploads if any
        const photoInput = document.getElementById('bikePhotos');
        if (photoInput && photoInput.files && photoInput.files.length > 0) {
            console.log(`📸 [Bikes] Uploading ${photoInput.files.length} photos...`);
            showNotification('Uploading photos...', 'info');

            // Get the bike ID (either from update or from insert)
            let savedBikeId = bikeId;
            if (!bikeId && result.data) {
                savedBikeId = result.data[0].id;
            }

            // Upload each photo
            for (let i = 0; i < photoInput.files.length; i++) {
                const file = photoInput.files[i];
                try {
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${savedBikeId}/${Date.now()}_${i}.${fileExt}`;

                    // Upload to Supabase Storage
                    const { error: uploadError } = await supabase.storage
                        .from('images')
                        .upload(fileName, file);

                    if (uploadError) {
                        console.error('❌ [Bikes] Photo upload error:', uploadError);

                        // Show specific error message
                        if (uploadError.message.includes('not found') || uploadError.message.includes('does not exist')) {
                            showNotification('Storage bucket not found. Please create "images" bucket in Supabase Storage settings.', 'error');
                        } else {
                            showNotification(`Photo upload failed: ${uploadError.message}`, 'error');
                        }
                        continue; // Skip this photo and try the next one
                    }

                    // Get public URL
                    const { data: { publicUrl } } = supabase.storage
                        .from('images')
                        .getPublicUrl(fileName);

                    // Save photo record to database
                    console.log(`💾 [Bikes] Saving photo ${i + 1} to database...`, {
                        bike_id: savedBikeId,
                        photo_url: publicUrl,
                        is_primary: i === 0
                    });

                    const { data: photoRecord, error: dbError } = await supabase
                        .from('bike_photos')
                        .insert([{
                            bike_id: savedBikeId,
                            photo_url: publicUrl,
                            is_primary: i === 0
                        }])
                        .select();

                    if (dbError) {
                        console.error(`❌ [Bikes] Database error saving photo ${i + 1}:`, dbError);
                        showNotification(`Failed to save photo record: ${dbError.message}`, 'error');
                        continue;
                    }

                    console.log(`✅ [Bikes] Photo ${i + 1} uploaded and saved to database:`, photoRecord);
                } catch (photoError) {
                    console.error(`❌ [Bikes] Error uploading photo ${i + 1}:`, photoError);
                }
            }
        }

        showNotification(bikeId ? 'Bike updated successfully!' : 'Bike added successfully!', 'success');

        // Hide form and reload bikes
        hideBikeForm();
        await loadBikes();

    } catch (error) {
        console.error('❌ [Bikes] Error saving bike:', error);
        showNotification('Failed to save bike: ' + error.message, 'error');
    }
}

// ========================================
// Delete Bike
// ========================================
window.deleteBike = async function(bikeId) {
    if (!confirm('Are you sure you want to delete this motorcycle? This will also delete all associated photos and documents.')) {
        return;
    }

    try {
        console.log('🏍️ [Bikes] Deleting bike:', bikeId);

        const { error } = await supabase
            .from('bikes')
            .delete()
            .eq('id', bikeId);

        if (error) {
            throw error;
        }

        console.log('✅ [Bikes] Bike deleted successfully');
        showNotification('Bike deleted successfully', 'success');

        // Reload bikes
        await loadBikes();

    } catch (error) {
        console.error('❌ [Bikes] Error deleting bike:', error);
        showNotification('Failed to delete bike: ' + error.message, 'error');
    }
};

// ========================================
// View Bike Details (with Photos and Documents)
// ========================================
window.viewBikeDetails = async function(bikeId) {
    try {
        console.log('👁️ [Bikes] Viewing bike details:', bikeId);

        // Fetch bike with all related data from database
        const profile = await getBikerProfile();
        if (!profile) {
            throw new Error('You must be logged in to view bike details');
        }

        const { data: bikes, error } = await supabase
            .from('bikes')
            .select(`
                *,
                bike_photos (*),
                service_documents (*)
            `)
            .eq('id', bikeId)
            .eq('biker_id', profile.id);

        if (error) {
            console.error('❌ [Bikes] Database error:', error);
            throw new Error('Failed to load bike: ' + error.message);
        }

        if (!bikes || bikes.length === 0) {
            throw new Error('Bike not found');
        }

        const bike = bikes[0];
        console.log('✅ [Bikes] Loaded bike with details:', bike);
        console.log('📸 [Bikes] Photos found:', bike.bike_photos);
        console.log('📄 [Bikes] Documents found:', bike.service_documents);

        const photos = bike.bike_photos || [];
        const documents = bike.service_documents || [];

        console.log(`📊 [Bikes] Displaying ${photos.length} photos and ${documents.length} documents`);

        const modalContent = document.getElementById('bikeDetailContent');
        modalContent.innerHTML = `
            <h2>${bike.brand} ${bike.model} (${bike.year})</h2>

            <div class="bike-detail-section">
                <h3><i class="fas fa-info-circle"></i> Details</h3>
                <div class="bike-info-grid-detail">
                    <div><strong>Mileage:</strong> ${bike.mileage.toLocaleString()} km</div>
                    ${bike.color ? `<div><strong>Color:</strong> ${bike.color}</div>` : ''}
                    ${bike.engine_size ? `<div><strong>Engine Size:</strong> ${bike.engine_size}</div>` : ''}
                    ${bike.vin ? `<div><strong>VIN:</strong> ${bike.vin}</div>` : ''}
                    ${bike.license_plate ? `<div><strong>License Plate:</strong> ${bike.license_plate}</div>` : ''}
                    ${bike.notes ? `<div class="bike-notes"><strong>Notes:</strong><br>${bike.notes}</div>` : ''}
                </div>
            </div>

            <div class="bike-detail-section">
                <h3>
                    <i class="fas fa-camera"></i> Photos (${photos.length})
                    <button class="btn btn-sm btn-primary" onclick="window.uploadBikePhoto('${bike.id}')">
                        <i class="fas fa-upload"></i> Upload Photo
                    </button>
                </h3>
                <div class="photos-grid">
                    ${photos.length > 0 ? photos.map(photo => `
                        <div class="photo-item">
                            <img src="${photo.photo_url}" alt="Bike photo" />
                            ${photo.caption ? `<p class="photo-caption">${photo.caption}</p>` : ''}
                            <button class="btn btn-sm btn-danger" onclick="window.deletePhoto('${photo.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    `).join('') : '<p class="empty-text">No photos uploaded yet</p>'}
                </div>
            </div>

            <div class="bike-detail-section">
                <h3>
                    <i class="fas fa-file-alt"></i> Service Documents (${documents.length})
                    <button class="btn btn-sm btn-primary" onclick="window.uploadServiceDocument('${bike.id}')">
                        <i class="fas fa-upload"></i> Upload Document
                    </button>
                </h3>
                <div class="documents-list">
                    ${documents.length > 0 ? documents.map(doc => `
                        <div class="document-item">
                            <div class="document-info">
                                <i class="fas fa-file-pdf"></i>
                                <div>
                                    <strong>${doc.document_name}</strong>
                                    ${doc.service_date ? `<p>Date: ${new Date(doc.service_date).toLocaleDateString()}</p>` : ''}
                                    ${doc.service_provider ? `<p>Provider: ${doc.service_provider}</p>` : ''}
                                    ${doc.description ? `<p>${doc.description}</p>` : ''}
                                </div>
                            </div>
                            <div class="document-actions">
                                <a href="${doc.document_url}" target="_blank" class="btn btn-sm btn-secondary">
                                    <i class="fas fa-download"></i> View
                                </a>
                                <button class="btn btn-sm btn-danger" onclick="window.deleteDocument('${doc.id}')">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    `).join('') : '<p class="empty-text">No documents uploaded yet</p>'}
                </div>
            </div>
        `;

        // Show modal
        document.getElementById('bikeDetailModal').style.display = 'block';

    } catch (error) {
        console.error('❌ [Bikes] Error viewing bike details:', error);
        showNotification('Failed to load bike details', 'error');
    }
};

// ========================================
// Close Modal
// ========================================
function closeModal() {
    document.getElementById('bikeDetailModal').style.display = 'none';
}

// ========================================
// Upload Bike Photo
// ========================================
window.uploadBikePhoto = async function(bikeId) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            showNotification('Uploading photo...', 'info');

            // Upload to Supabase Storage
            const fileExt = file.name.split('.').pop();
            const fileName = `${bikeId}/${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(fileName, file);

            if (uploadError) {
                throw uploadError;
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('images')
                .getPublicUrl(fileName);

            // Save photo record
            const { error: dbError } = await supabase
                .from('bike_photos')
                .insert([{
                    bike_id: bikeId,
                    photo_url: publicUrl
                }]);

            if (dbError) {
                throw dbError;
            }

            showNotification('Photo uploaded successfully!', 'success');

            // Reload bikes and reopen modal
            await loadBikes();
            window.viewBikeDetails(bikeId);

        } catch (error) {
            console.error('❌ [Bikes] Error uploading photo:', error);
            showNotification('Failed to upload photo: ' + error.message, 'error');
        }
    };
    input.click();
};

// ========================================
// Upload Service Document
// ========================================
window.uploadServiceDocument = async function(bikeId) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,image/*';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const documentName = prompt('Enter document name:', file.name);
        if (!documentName) return;

        try {
            showNotification('Uploading document...', 'info');

            // Upload to Supabase Storage
            const fileExt = file.name.split('.').pop();
            const fileName = `${bikeId}/${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(fileName, file);

            if (uploadError) {
                throw uploadError;
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('images')
                .getPublicUrl(fileName);

            // Save document record
            const { error: dbError } = await supabase
                .from('service_documents')
                .insert([{
                    bike_id: bikeId,
                    document_url: publicUrl,
                    document_name: documentName
                }]);

            if (dbError) {
                throw dbError;
            }

            showNotification('Document uploaded successfully!', 'success');

            // Reload bikes and reopen modal
            await loadBikes();
            window.viewBikeDetails(bikeId);

        } catch (error) {
            console.error('❌ [Bikes] Error uploading document:', error);
            showNotification('Failed to upload document: ' + error.message, 'error');
        }
    };
    input.click();
};

// ========================================
// Delete Photo
// ========================================
window.deletePhoto = async function(photoId) {
    if (!confirm('Are you sure you want to delete this photo?')) {
        return;
    }

    try {
        const { error } = await supabase
            .from('bike_photos')
            .delete()
            .eq('id', photoId);

        if (error) {
            throw error;
        }

        showNotification('Photo deleted successfully', 'success');

        // Reload bikes
        await loadBikes();

        // Close and reopen modal if it was open
        const modal = document.getElementById('bikeDetailModal');
        if (modal.style.display === 'block') {
            const bikeCard = currentBikes.find(b =>
                b.bike_photos && b.bike_photos.some(p => p.id === photoId)
            );
            if (bikeCard) {
                window.viewBikeDetails(bikeCard.id);
            }
        }

    } catch (error) {
        console.error('❌ [Bikes] Error deleting photo:', error);
        showNotification('Failed to delete photo: ' + error.message, 'error');
    }
};

// ========================================
// Delete Document
// ========================================
window.deleteDocument = async function(documentId) {
    if (!confirm('Are you sure you want to delete this document?')) {
        return;
    }

    try {
        const { error } = await supabase
            .from('service_documents')
            .delete()
            .eq('id', documentId);

        if (error) {
            throw error;
        }

        showNotification('Document deleted successfully', 'success');

        // Reload bikes
        await loadBikes();

        // Close and reopen modal if it was open
        const modal = document.getElementById('bikeDetailModal');
        if (modal.style.display === 'block') {
            const bikeCard = currentBikes.find(b =>
                b.service_documents && b.service_documents.some(d => d.id === documentId)
            );
            if (bikeCard) {
                window.viewBikeDetails(bikeCard.id);
            }
        }

    } catch (error) {
        console.error('❌ [Bikes] Error deleting document:', error);
        showNotification('Failed to delete document: ' + error.message, 'error');
    }
};

// ========================================
// Show Notification
// ========================================
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}
