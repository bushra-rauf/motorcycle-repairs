// ========================================
// PROFILE MODULE
// Handles biker profile management
// ========================================

import { supabase } from './supabase-clean.js';
import { getCurrentUser, getBikerProfile } from './auth.js';

// ========================================
// Initialize Profile
// ========================================
export function initProfile() {
    console.log('👤 [Profile] Initializing profile module...');

    // Set up event listeners
    setupProfileListeners();

    // Load profile data when profile view is shown
    const profileView = document.getElementById('profileView');
    if (profileView) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    if (profileView.classList.contains('active')) {
                        loadProfileData();
                    }
                }
            });
        });

        observer.observe(profileView, { attributes: true });
    }
}

// ========================================
// Setup Profile Event Listeners
// ========================================
function setupProfileListeners() {
    // Edit profile button
    const editProfileBtn = document.getElementById('editProfileBtn');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', showEditProfileForm);
    }

    // Cancel edit button
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', hideEditProfileForm);
    }

    // Profile edit form
    const profileEditForm = document.getElementById('profileEditForm');
    if (profileEditForm) {
        profileEditForm.addEventListener('submit', handleProfileUpdate);
    }
}

// ========================================
// Load Profile Data
// ========================================
async function loadProfileData() {
    try {
        console.log('👤 [Profile] Loading profile data...');

        const user = await getCurrentUser();
        if (!user) {
            console.log('⚠️ [Profile] No user logged in');
            return;
        }

        const profile = await getBikerProfile();
        if (!profile) {
            console.log('⚠️ [Profile] No profile found');
            return;
        }

        console.log('✅ [Profile] Profile loaded:', profile);

        // Display profile data
        document.getElementById('displayFullName').textContent = profile.full_name || '-';
        document.getElementById('displayEmail').textContent = profile.email || '-';
        document.getElementById('displayPhone').textContent = profile.phone || '-';

        // Pre-fill edit form
        document.getElementById('editFullName').value = profile.full_name || '';
        document.getElementById('editPhone').value = profile.phone || '';

    } catch (error) {
        console.error('❌ [Profile] Error loading profile:', error);
        showNotification('Failed to load profile data', 'error');
    }
}

// ========================================
// Show Edit Profile Form
// ========================================
function showEditProfileForm() {
    document.getElementById('profileInfoDisplay').style.display = 'none';
    document.getElementById('profileEditForm').style.display = 'block';
    document.getElementById('editProfileBtn').style.display = 'none';
}

// ========================================
// Hide Edit Profile Form
// ========================================
function hideEditProfileForm() {
    document.getElementById('profileInfoDisplay').style.display = 'block';
    document.getElementById('profileEditForm').style.display = 'none';
    document.getElementById('editProfileBtn').style.display = 'block';
}

// ========================================
// Handle Profile Update
// ========================================
async function handleProfileUpdate(e) {
    e.preventDefault();

    try {
        console.log('👤 [Profile] Updating profile...');

        const user = await getCurrentUser();
        if (!user) {
            throw new Error('No user logged in');
        }

        const fullName = document.getElementById('editFullName').value;
        const phone = document.getElementById('editPhone').value;

        // Update biker profile in database
        const { error } = await supabase
            .from('bikers')
            .update({
                full_name: fullName,
                phone: phone,
                updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id);

        if (error) {
            throw error;
        }

        console.log('✅ [Profile] Profile updated successfully');
        showNotification('Profile updated successfully!', 'success');

        // Reload profile data
        await loadProfileData();

        // Hide edit form
        hideEditProfileForm();

    } catch (error) {
        console.error('❌ [Profile] Error updating profile:', error);
        showNotification('Failed to update profile: ' + error.message, 'error');
    }
}

// ========================================
// Show Notification
// ========================================
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;

    // Add to body
    document.body.appendChild(notification);

    // Trigger animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}
