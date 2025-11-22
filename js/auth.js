// ========================================
// AUTHENTICATION MODULE
// Handles user registration, login, logout
// ========================================

import { supabase } from './supabase-clean.js';

// ========================================
// Initialize Authentication
// ========================================
export function initAuth() {
    console.log('🔐 [Auth] Initializing authentication... [VERSION: 2024-11-21-001]');

    // Verify DOM is ready and elements exist
    const requiredNavElements = [
        'loginNavLink',
        'profileNavLink',
        'logoutNavLink',
        'userInfo',
        'userEmail'
    ];

    const missingElements = requiredNavElements.filter(id => !document.getElementById(id));
    if (missingElements.length > 0) {
        console.warn('⚠️ [Auth] Missing navigation elements:', missingElements);
        console.warn('⚠️ [Auth] Will retry auth setup in 100ms...');
        setTimeout(() => initAuth(), 100);
        return;
    }

    // Check if user is already logged in
    checkAuthState();

    // Set up event listeners
    setupAuthListeners();

    // Listen for auth state changes
    supabase.auth.onAuthStateChange((event, session) => {
        console.log('🔐 [Auth] Auth state changed:', event);
        handleAuthStateChange(session);
    });
}

// ========================================
// Check Current Auth State
// ========================================
async function checkAuthState() {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
            console.error('❌ [Auth] Error checking auth state:', error);
            return;
        }

        handleAuthStateChange(session);
    } catch (error) {
        console.error('❌ [Auth] Error in checkAuthState:', error);
    }
}

// ========================================
// Handle Auth State Changes
// ========================================
function handleAuthStateChange(session) {
    const loginNavLink = document.getElementById('loginNavLink');
    const profileNavLink = document.getElementById('profileNavLink');
    const logoutNavLink = document.getElementById('logoutNavLink');
    const userInfo = document.getElementById('userInfo');
    const userEmail = document.getElementById('userEmail');

    // Check if elements exist
    if (!loginNavLink || !profileNavLink || !logoutNavLink || !userInfo || !userEmail) {
        console.warn('⚠️ [Auth] Some navigation elements not found');
        return;
    }

    if (session) {
        // User is logged in
        console.log('✅ [Auth] User is logged in:', session.user.email);

        // Update UI
        loginNavLink.style.display = 'none';
        profileNavLink.style.display = 'block';
        logoutNavLink.style.display = 'block';
        userInfo.style.display = 'flex';
        userEmail.textContent = session.user.email;

        // Navigate to profile if on auth pages
        const currentView = document.querySelector('.view-container.active');
        if (currentView && currentView.id === 'loginView') {
            navigateToView('shop-directory');
        }
    } else {
        // User is logged out
        console.log('🔓 [Auth] User is logged out');

        // Update UI
        loginNavLink.style.display = 'block';
        profileNavLink.style.display = 'none';
        logoutNavLink.style.display = 'none';
        userInfo.style.display = 'none';
        userEmail.textContent = '';

        // Navigate to shop directory if on profile page
        const currentView = document.querySelector('.view-container.active');
        if (currentView && currentView.id === 'profileView') {
            navigateToView('shop-directory');
        }
    }
}

// ========================================
// Setup Auth Event Listeners
// ========================================
function setupAuthListeners() {
    console.log('⚡ [Auth] Setting up event listeners...');

    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
        console.log('✅ [Auth] Login form listener attached');
    } else {
        console.error('❌ [Auth] Login form not found!');
    }

    // Register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
        console.log('✅ [Auth] Register form listener attached');
    } else {
        console.error('❌ [Auth] Register form not found!');
    }

    // Logout link
    const logoutNavLink = document.getElementById('logoutNavLink');
    if (logoutNavLink) {
        logoutNavLink.addEventListener('click', handleLogout);
    }

    // Auth tabs switching
    const authTabs = document.querySelectorAll('.auth-tab');
    authTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            const targetTab = e.currentTarget.getAttribute('data-tab');
            switchAuthTab(targetTab);
        });
    });

    // "Add Your Bike" button
    const addYourBikeBtn = document.getElementById('addYourBikeBtn');
    if (addYourBikeBtn) {
        addYourBikeBtn.addEventListener('click', handleAddYourBikeClick);
    }
}

// ========================================
// Switch Auth Tabs (Login/Signup)
// ========================================
function switchAuthTab(tabName) {
    // Remove active class from all tabs
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    // Remove active class from all tab contents
    document.querySelectorAll('.auth-tab-content').forEach(content => {
        content.classList.remove('active');
    });

    // Add active class to selected tab
    const selectedTab = document.querySelector(`.auth-tab[data-tab="${tabName}"]`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }

    // Show selected tab content
    const selectedContent = document.getElementById(`${tabName}Tab`);
    if (selectedContent) {
        selectedContent.classList.add('active');
    }

    // Clear any error messages
    const loginMessage = document.getElementById('loginMessage');
    const registerMessage = document.getElementById('registerMessage');
    if (loginMessage) loginMessage.textContent = '';
    if (registerMessage) registerMessage.textContent = '';
}

// ========================================
// Handle "Add Your Bike" Button Click
// ========================================
async function handleAddYourBikeClick(e) {
    e.preventDefault();

    // Check if user is logged in
    const user = await getCurrentUser();

    if (!user) {
        // Not logged in, redirect to login
        console.log('🔐 [Auth] User not logged in, redirecting to login...');
        navigateToView('login');

        // Show message in login tab
        const loginMessage = document.getElementById('loginMessage');
        if (loginMessage) {
            loginMessage.textContent = 'Please login or sign up to add your bike!';
            loginMessage.className = 'auth-message info';
        }
    } else {
        // User is logged in, go to profile and show bike form
        console.log('✅ [Auth] User logged in, navigating to add bike...');
        navigateToView('profile');

        // Wait a bit for profile view to load, then trigger add bike
        setTimeout(() => {
            const addBikeBtn = document.getElementById('addBikeBtn');
            if (addBikeBtn) {
                addBikeBtn.click();
            }
        }, 300);
    }
}

// ========================================
// Handle Login
// ========================================
async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const messageDiv = document.getElementById('loginMessage');

    try {
        messageDiv.textContent = 'Logging in...';
        messageDiv.className = 'auth-message info';

        console.log('🔐 [Auth] Attempting login for:', email);

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            throw error;
        }

        console.log('✅ [Auth] Login successful');
        messageDiv.textContent = 'Login successful! Redirecting...';
        messageDiv.className = 'auth-message success';

        // Clear form
        e.target.reset();

        // Navigation will be handled by onAuthStateChange
    } catch (error) {
        console.error('❌ [Auth] Login error:', error);

        // Handle specific error cases
        if (error.message.includes('Email not confirmed')) {
            messageDiv.textContent = 'Please confirm your email before logging in. Check your inbox for a confirmation link.';
        } else if (error.message.includes('Invalid login credentials')) {
            messageDiv.textContent = 'Invalid email or password. Please check your credentials and try again.';
        } else {
            messageDiv.textContent = `Login failed: ${error.message}`;
        }
        messageDiv.className = 'auth-message error';
    }
}

// ========================================
// Handle Registration
// ========================================
async function handleRegister(e) {
    console.log('🔐 [Auth] Registration form submitted! [VERSION: 2024-11-21-001]');
    e.preventDefault();

    const messageDiv = document.getElementById('registerMessage');

    if (!messageDiv) {
        console.error('❌ [Auth] Message div not found!');
        return;
    }

    try {
        // Get form elements with null checks
        const fullNameEl = document.getElementById('registerFullName');
        const emailEl = document.getElementById('registerEmail');
        const phoneEl = document.getElementById('registerPhone');
        const passwordEl = document.getElementById('registerPassword');

        // Log element status for debugging
        console.log('📝 [Auth] Form elements check:', {
            fullName: !!fullNameEl,
            email: !!emailEl,
            phone: !!phoneEl,
            password: !!passwordEl
        });

        if (!fullNameEl || !emailEl || !passwordEl) {
            const missing = [];
            if (!fullNameEl) missing.push('Full Name');
            if (!emailEl) missing.push('Email');
            if (!passwordEl) missing.push('Password');

            messageDiv.textContent = `Form elements not found: ${missing.join(', ')}. Please refresh the page.`;
            messageDiv.className = 'auth-message error';
            console.error('❌ [Auth] Missing form elements:', missing);
            return;
        }

        // Get user information (safe - elements verified above)
        const fullName = fullNameEl.value;
        const email = emailEl.value;
        const phone = phoneEl ? phoneEl.value : '';
        const password = passwordEl.value;

        console.log('📝 [Auth] Form data collected:', { fullName, email, phone: phone ? 'yes' : 'no' });

        // Validate required fields
        if (!fullName || !email || !password) {
            messageDiv.textContent = 'Please fill in all required fields';
            messageDiv.className = 'auth-message error';
            return;
        }

        // Validate password length
        if (password.length < 6) {
            messageDiv.textContent = 'Password must be at least 6 characters';
            messageDiv.className = 'auth-message error';
            return;
        }

        messageDiv.textContent = 'Creating your account...';
        messageDiv.className = 'auth-message info';

        console.log('🔐 [Auth] Attempting registration for:', email);

        // Step 1: Sign up with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    phone: phone
                }
            }
        });

        if (authError) {
            throw authError;
        }

        console.log('✅ [Auth] User registered successfully');

        // Step 2: Create biker profile in database
        console.log('📝 [Auth] Creating biker profile...');
        const { data: profileData, error: profileError } = await supabase
            .from('bikers')
            .insert([
                {
                    user_id: authData.user.id,
                    email: email,
                    full_name: fullName,
                    phone: phone || null
                }
            ])
            .select()
            .single();

        if (profileError) {
            console.error('❌ [Auth] Error creating profile:', profileError);

            // If it's an RLS error, show specific message
            if (profileError.code === '42501') {
                messageDiv.textContent = 'Account created but profile setup failed due to database security. Please contact support.';
                messageDiv.className = 'auth-message error';
                return;
            }

            throw new Error('Account created but profile setup failed: ' + profileError.message);
        }

        console.log('✅ [Auth] Biker profile created:', profileData);

        // Step 3: Automatically log the user in
        messageDiv.textContent = 'Account created! Logging you in...';
        messageDiv.className = 'auth-message info';

        const { error: loginError } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (loginError) {
            console.error('❌ [Auth] Auto-login error:', loginError);

            // Handle specific error cases
            if (loginError.message.includes('Email not confirmed')) {
                messageDiv.textContent = 'Account created! Please check your email to confirm your account, then login.';
                messageDiv.className = 'auth-message info';
            } else {
                messageDiv.textContent = 'Account created but auto-login failed. Please login manually.';
                messageDiv.className = 'auth-message error';
            }

            setTimeout(() => {
                switchAuthTab('login');
            }, 3000);
            return;
        }

        console.log('✅ [Auth] User logged in successfully');

        messageDiv.textContent = 'Success! You are now logged in. Redirecting to homepage...';
        messageDiv.className = 'auth-message success';

        // Clear form
        e.target.reset();

        // Navigate to shop directory after 2 seconds
        setTimeout(() => {
            navigateToView('shop-directory');
        }, 2000);

    } catch (error) {
        console.error('❌ [Auth] Registration error:', error);
        messageDiv.textContent = `Registration failed: ${error.message}`;
        messageDiv.className = 'auth-message error';
    }
}

// ========================================
// Handle Logout
// ========================================
async function handleLogout(e) {
    e.preventDefault();

    try {
        console.log('🔐 [Auth] Logging out...');

        const { error } = await supabase.auth.signOut();

        if (error) {
            throw error;
        }

        console.log('✅ [Auth] Logout successful');

        // Navigation will be handled by onAuthStateChange
    } catch (error) {
        console.error('❌ [Auth] Logout error:', error);
        alert('Logout failed: ' + error.message);
    }
}

// ========================================
// Get Current User
// ========================================
export async function getCurrentUser() {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error) {
            throw error;
        }

        return user;
    } catch (error) {
        console.error('❌ [Auth] Error getting current user:', error);
        return null;
    }
}

// ========================================
// Get Biker Profile
// ========================================
export async function getBikerProfile() {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return null;
        }

        const { data, error } = await supabase
            .from('bikers')
            .select('*')
            .eq('user_id', user.id)
            .single();

        // If profile doesn't exist, create it automatically
        if (error && error.code === 'PGRST116') {
            console.log('⚠️ [Auth] No profile found, creating one automatically...');

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
                console.error('❌ [Auth] Failed to auto-create profile:', createError);
                return null;
            }

            console.log('✅ [Auth] Profile created automatically');
            return newProfile;
        }

        if (error) {
            throw error;
        }

        return data;
    } catch (error) {
        console.error('❌ [Auth] Error getting biker profile:', error);
        return null;
    }
}

// ========================================
// Check if User is Authenticated
// ========================================
export async function isAuthenticated() {
    const user = await getCurrentUser();
    return user !== null;
}

// ========================================
// Navigate to View (Helper Function)
// Use the global navigateToView from app.js
// ========================================
function navigateToView(viewName) {
    // Use the global navigation function from app.js if available
    if (window.navigateToView) {
        window.navigateToView(viewName);
        return;
    }

    // Fallback implementation if app.js hasn't loaded yet
    console.warn('⚠️ [Auth] Using fallback navigation');
    const view = document.getElementById(viewName === 'shop-directory' ? 'shopDirectoryView' : viewName + 'View');
    if (view) {
        document.querySelectorAll('.view-container').forEach(v => v.classList.remove('active'));
        view.classList.add('active');
    }
}
