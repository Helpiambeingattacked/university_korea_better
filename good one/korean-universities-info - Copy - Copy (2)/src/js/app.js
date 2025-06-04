import { openModal } from './modal.js';
import { enigma_encrypt } from './utils.js';

let universities = []; // This will hold the university data
const DATA_SOURCE = 'data/universities_auto.json'; // or 'data/universities.json'

// Function to fetch university data from JSON file
async function fetchUniversityData() {
    const response = await fetch(DATA_SOURCE);
    const data = await response.json();
    return data;
}

// Function to render university cards
function renderUniversityCards(universities) {
    const mainSection = document.querySelector('#university-cards');
    mainSection.className = 'main'; // Add grid styling
    mainSection.innerHTML = ''; // Clear existing content

    let profile = currentUser ? loadUserProfile(currentUser) : { favorites: [] };
    const repUniversity = sessionStorage.getItem('repUniversity');
    const repUser = sessionStorage.getItem('repUser');

    universities.forEach(university => {
        const card = document.createElement('div');
        card.classList.add('card');
        // Favorite icon
        const isFav = profile.favorites.includes(university.name);
        const favIcon = `<span class="fav-icon" data-uni="${university.name}" style="float:right;cursor:pointer;color:${isFav ? '#e53935' : '#bbb'};font-size:1.3em;" title="${isFav ? 'Remove from favorites' : 'Add to favorites'}">&#9733;</span>`;
        const imgSrc = university.image.startsWith('http')
            ? university.image
            : `assets/images/${university.image}`;
        const isGoogleLogo = university.image.includes('google.com/search');
        const logoHtml = isGoogleLogo
            ? `<a href="${university.image}" target="_blank" style="display:block;text-align:center;color:#1976d2;">Search for logo</a>`
            : `<img src="${imgSrc}" alt="${university.name} logo">`;

        const isGoogleDesc = university.description && university.description.includes('google.com/search');
        const descHtml = isGoogleDesc
            ? `<a href="${university.description}" target="_blank" style="color:#1976d2;">Search for description</a>`
            : (university.description || '');

        // Add edit button for representative
        let editBtnHtml = '';
        if (repUser && repUniversity === university.name) {
            editBtnHtml = `<button class="edit-univ-btn small-btn" data-univ="${university.name}" style="margin-top:10px;">Edit</button>`;
        }

        card.innerHTML = `
            ${favIcon}
            ${logoHtml}
            <div class="card-content">
                <h3>${university.name}</h3>
                <p>${university.region || 'N/A'} | ${university.type || 'N/A'}</p>
                <p>${descHtml}</p>
                ${university.website ? `<a href="${university.website}" target="_blank">Visit Website</a>` : ''}
                ${editBtnHtml}
            </div>
        `;
        card.addEventListener('click', (e) => {
            // Prevent modal if clicking favorite icon or edit button
            if (e.target.classList.contains('fav-icon') || e.target.classList.contains('edit-univ-btn')) return;
            openModal(university);
        });
        // Favorite icon click
        card.querySelector('.fav-icon').onclick = (e) => {
            e.stopPropagation();
            toggleFavorite(university.name);
        };
        // Edit button click
        if (editBtnHtml) {
            card.querySelector('.edit-univ-btn').onclick = (e) => {
                e.stopPropagation();
                openRepEditModal(university);
            };
        }
        mainSection.appendChild(card);
    });
    updateRepUI();
}

// Function to initialize the application
async function init() {
    universities = await fetchUniversityData();
    renderUniversityCards(universities);
}

// Event listeners for filter buttons
document.querySelectorAll('.filter').forEach(button => {
    button.addEventListener('click', () => {
        const region = button.getAttribute('data-region');
        const type = button.getAttribute('data-type');
        let filtered = universities;
        if (region && region !== 'all') {
            filtered = filtered.filter(u => u.region === region);
        }
        if (type) {
            filtered = filtered.filter(u => u.type.toLowerCase() === type);
        }
        renderUniversityCards(filtered);
    });
});

// --- Login/Sign In Modal Logic ---
const loginBtn = document.getElementById('loginBtn');
const loginModal = document.getElementById('loginModal');
const closeLoginModal = document.getElementById('closeLoginModal');
const loginSubmit = document.getElementById('loginSubmit');
const loginMsg = document.getElementById('loginMsg');
const loginTitle = document.getElementById('loginTitle');
const loginUsername = document.getElementById('loginUsername');
const loginPassword = document.getElementById('loginPassword');
const toggleAuthLink = document.getElementById('toggleAuthLink');
const toggleAuthText = document.getElementById('toggleAuthText');

let isSignUp = false;

function setAuthMode(signUp) {
    isSignUp = signUp;
    loginTitle.textContent = signUp ? 'Sign Up' : 'Log In';
    loginSubmit.textContent = signUp ? 'Sign Up' : 'Log In';
    toggleAuthText.textContent = signUp ? 'Already have an account?' : "Don't have an account?";
    toggleAuthLink.textContent = signUp ? 'Log In' : 'Sign Up';
    loginMsg.textContent = '';
    loginMsg.style.color = 'red';
    loginUsername.value = '';
    loginPassword.value = '';
}

loginBtn.onclick = () => {
    loginModal.style.display = 'block';
    setAuthMode(false);
};

closeLoginModal.onclick = () => {
    loginModal.style.display = 'none';
    loginUsername.value = '';
    loginPassword.value = '';
};

toggleAuthLink.onclick = (e) => {
    e.preventDefault();
    setAuthMode(!isSignUp);
};

loginSubmit.onclick = () => {
    const username = loginUsername.value.trim();
    const password = loginPassword.value.trim();
    if (!username || !password) {
        loginMsg.textContent = 'Please enter username and password.';
        return;
    }
    if (isSignUp) {
        // Normal sign-up demands
        if (username.length < 3) {
            loginMsg.textContent = 'Username must be at least 3 characters.';
            return;
        }
        if (password.length < 6) {
            loginMsg.textContent = 'Password must be at least 6 characters.';
            return;
        }
        if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
            loginMsg.textContent = 'Password must contain upper, lower case letters and a number.';
            return;
        }
    }
    const encrypted = enigma_encrypt(password, 0, 0, 0);
    let users = JSON.parse(localStorage.getItem('users') || '{}');
    if (isSignUp) {
        if (users[username]) {
            loginMsg.textContent = 'User already exists.';
        } else {
            users[username] = encrypted;
            localStorage.setItem('users', JSON.stringify(users));
            // Create empty profile
            saveUserProfile(username, { favorites: [], gmail: "" });
            loginMsg.style.color = 'green';
            loginMsg.textContent = 'Sign up successful! You can now log in.';
            setTimeout(() => setAuthMode(false), 1000);
        }
    } else {
        if (users[username] && users[username] === encrypted) {
            loginMsg.style.color = 'green';
            loginMsg.textContent = 'Login successful!';
            currentUser = username;
            updateProfileBtn();
            setTimeout(() => {
                loginModal.style.display = 'none';
                loginUsername.value = '';
                loginPassword.value = '';
                loginMsg.style.color = 'red';
                renderUniversityCards(universities);
            }, 1000);
        } else {
            loginMsg.textContent = 'Invalid username or password.';
        }
    }
};

window.onclick = (event) => {
    if (event.target === loginModal) {
        loginModal.style.display = 'none';
        loginUsername.value = '';
        loginPassword.value = '';
    }
};

// --- Profile Modal Logic ---
const profileBtn = document.getElementById('profileBtn');
const profileModal = document.getElementById('profileModal');
const closeProfileModal = document.getElementById('closeProfileModal');
const profileInfo = document.getElementById('profileInfo');
const favoritesList = document.getElementById('favoritesList');
const gmailInput = document.getElementById('gmailInput');
const saveGmailBtn = document.getElementById('saveGmailBtn');
const gmailMsg = document.getElementById('gmailMsg');

let currentUser = null;

function updateProfileBtn() {
    if (currentUser) {
        profileBtn.style.display = '';
        loginBtn.style.display = 'none';
    } else {
        profileBtn.style.display = 'none';
        loginBtn.style.display = '';
    }
}

function loadUserProfile(username) {
    let profiles = JSON.parse(localStorage.getItem('profiles') || '{}');
    return profiles[username] || { favorites: [], gmail: "" };
}

function saveUserProfile(username, profile) {
    let profiles = JSON.parse(localStorage.getItem('profiles') || '{}');
    profiles[username] = profile;
    localStorage.setItem('profiles', JSON.stringify(profiles));
}

function showProfileModal() {
    if (!currentUser) return;
    const profile = loadUserProfile(currentUser);
    profileInfo.innerHTML = `<b>Username:</b> ${currentUser}`;
    gmailInput.value = profile.gmail || '';
    gmailMsg.textContent = '';
    // Render favorites
    favoritesList.innerHTML = '';
    if (profile.favorites.length === 0) {
        favoritesList.innerHTML = '<li>No favorites yet.</li>';
    } else {
        profile.favorites.forEach(name => {
            const li = document.createElement('li');
            li.textContent = name;
            // Remove favorite button
            const removeBtn = document.createElement('button');
            removeBtn.textContent = 'Remove';
            removeBtn.style.marginLeft = '10px';
            removeBtn.onclick = () => {
                profile.favorites = profile.favorites.filter(fav => fav !== name);
                saveUserProfile(currentUser, profile);
                showProfileModal();
            };
            li.appendChild(removeBtn);
            favoritesList.appendChild(li);
        });
    }
    profileModal.style.display = 'block';
}

profileBtn.onclick = showProfileModal;
closeProfileModal.onclick = () => profileModal.style.display = 'none';

saveGmailBtn.onclick = () => {
    if (!currentUser) return;
    const email = gmailInput.value.trim();
    if (!email.match(/^[\w.+-]+@gmail\.com$/i)) {
        gmailMsg.style.color = 'red';
        gmailMsg.textContent = 'Please enter a valid Gmail address.';
        return;
    }
    let profile = loadUserProfile(currentUser);
    profile.gmail = email;
    saveUserProfile(currentUser, profile);
    gmailMsg.style.color = 'green';
    gmailMsg.textContent = 'Gmail saved!';
};

// Hide profile modal on outside click
window.addEventListener('click', (event) => {
    if (event.target === profileModal) {
        profileModal.style.display = 'none';
    }
});

// --- FAVORITES FEATURE ---

function toggleFavorite(universityName) {
    if (!currentUser) {
        alert('Please log in to use favorites.');
        return;
    }
    let profile = loadUserProfile(currentUser);
    if (profile.favorites.includes(universityName)) {
        profile.favorites = profile.favorites.filter(fav => fav !== universityName);
    } else {
        profile.favorites.push(universityName);
    }
    saveUserProfile(currentUser, profile);
    renderUniversityCards(universities); // Update favorite icons
}

// --- LOGIN/LOGOUT/PROFILE STATE MANAGEMENT ---

// On logout (optional: add a logout button in profile modal)
profileInfo.insertAdjacentHTML('beforeend', `<br><button id="logoutBtn" style="margin-top:10px;">Log Out</button>`);
document.addEventListener('click', function(e) {
    if (e.target && e.target.id === 'logoutBtn') {
        currentUser = null;
        updateProfileBtn();
        profileModal.style.display = 'none';
        renderUniversityCards(universities);
    }
});

// On page load, check for logged-in user (optional: use sessionStorage or localStorage)
updateProfileBtn();

// Initialize the app
init();

// --- ADMIN PANEL LOGIC ---
let isAdmin = false;
let editMode = false;
let editedUniversities = [];

function showAdminPanel() {
    document.getElementById('adminPanel').style.display = '';
}

function hideAdminPanel() {
    document.getElementById('adminPanel').style.display = 'none';
}

function renderUniversityCardsEditable(universities) {
    const mainSection = document.querySelector('#university-cards');
    mainSection.innerHTML = '';
    universities.forEach((university, idx) => {
        const card = document.createElement('div');
        card.classList.add('card');
        const imgSrc = university.image.startsWith('http')
            ? university.image
            : `assets/images/${university.image}`;
        card.innerHTML = `
            <div style="text-align:center;">
                <img src="${imgSrc}" alt="logo" style="max-height:60px;max-width:90px;display:inline-block;margin-bottom:8px;border:1px solid #eee;background:#fafafa;">
            </div>
            <input value="${university.name}" style="width:90%;font-weight:bold;" data-field="name" data-idx="${idx}"><br>
            <input value="${university.region}" placeholder="Region" data-field="region" data-idx="${idx}">
            <input value="${university.type}" placeholder="Type" data-field="type" data-idx="${idx}"><br>
            <textarea data-field="description" data-idx="${idx}" style="width:90%;">${university.description}</textarea><br>
            <input value="${university.image}" placeholder="Image URL" data-field="image" data-idx="${idx}" style="width:90%;"><br>
            <input value="${university.website}" placeholder="Website" data-field="website" data-idx="${idx}" style="width:90%;"><br>
        `;
        mainSection.appendChild(card);
    });
    // Listen for changes
    mainSection.querySelectorAll('input,textarea').forEach(input => {
        input.addEventListener('input', (e) => {
            const idx = +e.target.dataset.idx;
            const field = e.target.dataset.field;
            editedUniversities[idx][field] = e.target.value;
            // If image field changes, update preview
            if (field === 'image') {
                const img = mainSection.children[idx].querySelector('img');
                const val = e.target.value;
                img.src = val.startsWith('http') ? val : `assets/images/${val}`;
            }
        });
    });
}

function showStatistics() {
    const statsPanel = document.getElementById('statsPanel');
    let users = JSON.parse(localStorage.getItem('users') || '{}');
    let profiles = JSON.parse(localStorage.getItem('profiles') || '{}');
    let activeUsers = Object.keys(profiles).length;
    let totalUsers = Object.keys(users).length;
    statsPanel.innerHTML = `
        <b>Statistics</b><br>
        Total users: ${totalUsers}<br>
        Active users (with profile): ${activeUsers}<br>
        Total universities: ${universities.length}
    `;
    statsPanel.style.display = '';
}

function hideStatistics() {
    document.getElementById('statsPanel').style.display = 'none';
}

// Patch login logic for admin
const origLoginSubmit = loginSubmit.onclick;
loginSubmit.onclick = () => {
    const username = loginUsername.value.trim();
    const password = loginPassword.value.trim();
    if (username === 'admin' && password === 'admin') {
        isAdmin = true;
        showAdminPanel();
        loginModal.style.display = 'none';
        currentUser = 'admin';
        // After successful admin login
        sessionStorage.setItem('adminUser', username);
        updateAdminPanelUI();
        renderUniversityCards(universities);
        return;
    }
    if (origLoginSubmit) origLoginSubmit();
};

// Admin panel buttons
const refreshEditBtn = document.getElementById('refreshEditBtn');

document.getElementById('editModeBtn').onclick = function() {
    editMode = !editMode;
    this.textContent = editMode ? 'Exit Edit Mode' : 'Edit Universities';
    document.getElementById('saveChangesBtn').style.display = editMode ? '' : 'none';
    refreshEditBtn.style.display = editMode ? '' : 'none';
    if (editMode) {
        editedUniversities = JSON.parse(JSON.stringify(universities));
        renderUniversityCardsEditable(editedUniversities);
    } else {
        renderUniversityCards(universities);
    }
};

refreshEditBtn.onclick = function() {
    // Reload from last saved state (universities or admin edit)
    const adminEdit = localStorage.getItem('universities_admin_edit');
    if (adminEdit) {
        editedUniversities = JSON.parse(adminEdit);
    } else {
        editedUniversities = JSON.parse(JSON.stringify(universities));
    }
    renderUniversityCardsEditable(editedUniversities);
};

document.getElementById('saveChangesBtn').onclick = function() {
    if (confirm('Should we send email to all subscribers about changes?')) {
        alert('Email will be sent to all subscribers (feature coming soon).');
    }
    // Save to localStorage for now (simulate saving to JSON)
    localStorage.setItem('universities_admin_edit', JSON.stringify(editedUniversities));
    universities = JSON.parse(JSON.stringify(editedUniversities));
    editMode = false;
    document.getElementById('editModeBtn').textContent = 'Edit Universities';
    this.style.display = 'none';
    renderUniversityCards(universities);
};

document.getElementById('statsBtn').onclick = function() {
    const statsPanel = document.getElementById('statsPanel');
    if (statsPanel.style.display === 'none' || statsPanel.style.display === '') {
        showStatistics();
    } else {
        hideStatistics();
    }
};

// On page load, restore admin edits if present
window.addEventListener('DOMContentLoaded', () => {
    const adminEdit = localStorage.getItem('universities_admin_edit');
    if (adminEdit) {
        universities = JSON.parse(adminEdit);
        renderUniversityCards(universities);
    }
});

// --- DARK MODE TOGGLE ---
const darkModeToggle = document.getElementById('darkModeToggle');
let darkMode = localStorage.getItem('darkMode') === 'true';

function applyDarkMode(on) {
    document.body.classList.toggle('dark-mode', on);
    darkModeToggle.textContent = on ? '☀️ Light Mode' : '🌙 Dark Mode';
    localStorage.setItem('darkMode', on);
}

// Initial state
applyDarkMode(darkMode);

darkModeToggle.onclick = () => {
    darkMode = !darkMode;
    applyDarkMode(darkMode);
};

document.getElementById('darkModeToggle').addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
    // Optionally save preference
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
});

// --- Search Bar Logic ---
const searchBar = document.getElementById('searchBar');
if (searchBar) {
    searchBar.addEventListener('input', function() {
        const term = this.value.trim().toLowerCase();
        let filtered = universities.filter(u =>
            u.name.toLowerCase().includes(term) ||
            (u.region && u.region.toLowerCase().includes(term))
        );
        renderUniversityCards(filtered);
    });
}

// --- University Representative Modal Logic ---
const repLink = document.getElementById('repLink');
const repModal = document.getElementById('repModal');
const closeRepModal = document.getElementById('closeRepModal');
const repModalTitle = document.getElementById('repModalTitle');
const repUsername = document.getElementById('repUsername');
const repPassword = document.getElementById('repPassword');
const repUniversity = document.getElementById('repUniversity');
const repSubmit = document.getElementById('repSubmit');
const repMsg = document.getElementById('repMsg');
const toggleRepAuthLink = document.getElementById('toggleRepAuthLink');
const toggleRepAuthText = document.getElementById('toggleRepAuthText');

let repSignUp = false;

// Populate university dropdown on open
function populateRepUniversityDropdown() {
    repUniversity.innerHTML = '';
    universities.forEach(u => {
        const option = document.createElement('option');
        option.value = u.name;
        option.textContent = u.name;
        repUniversity.appendChild(option);
    });
}

function setRepAuthMode(signUp) {
    repSignUp = signUp;
    repModalTitle.textContent = signUp ? 'University Representative Sign Up' : 'University Representative Login';
    repSubmit.textContent = signUp ? 'Sign Up' : 'Log In';
    toggleRepAuthText.textContent = signUp ? 'Already registered?' : 'Not registered?';
    toggleRepAuthLink.textContent = signUp ? 'Log In' : 'Sign Up';
    repMsg.textContent = '';
    repUsername.value = '';
    repPassword.value = '';
    repUniversity.style.display = signUp ? '' : 'none';
}

repLink.onclick = (e) => {
    e.preventDefault();
    repModal.style.display = 'block';
    setRepAuthMode(false);
};

closeRepModal.onclick = () => {
    repModal.style.display = 'none';
};

toggleRepAuthLink.onclick = (e) => {
    e.preventDefault();
    setRepAuthMode(!repSignUp);
    if (repSignUp) populateRepUniversityDropdown();
};

repSubmit.onclick = () => {
    const username = repUsername.value.trim();
    const password = repPassword.value.trim();
    const university = repUniversity.value;
    if (!username || !password || (repSignUp && !university)) {
        repMsg.textContent = 'Please fill all fields.';
        return;
    }
    let reps = JSON.parse(localStorage.getItem('reps') || '{}');
    if (repSignUp) {
        if (reps[username]) {
            repMsg.textContent = 'Representative already exists.';
            return;
        }
        reps[username] = {
            password,
            university
        };
        localStorage.setItem('reps', JSON.stringify(reps));
        repMsg.style.color = 'green';
        repMsg.textContent = 'Sign up successful! You can now log in.';
        setTimeout(() => setRepAuthMode(false), 1000);
    } else {
        if (reps[username] && reps[username].password === password) {
            repMsg.style.color = 'green';
            repMsg.textContent = 'Login successful!';
            // Store rep session
            sessionStorage.setItem('repUser', username);
            sessionStorage.setItem('repUniversity', reps[username].university);
            setTimeout(() => {
                repModal.style.display = 'none';
                renderUniversityCards(universities); // Refresh cards to show edit button
            }, 1000);
        } else {
            repMsg.style.color = 'red';
            repMsg.textContent = 'Invalid credentials.';
        }
    }
};

window.addEventListener('click', (event) => {
    if (event.target === repModal) {
        repModal.style.display = 'none';
    }
});

// On first sign up click, populate dropdown
toggleRepAuthLink.addEventListener('click', () => {
    if (repSignUp) populateRepUniversityDropdown();
});

// Add after all DOMContentLoaded and session logic

function updateRepUI() {
    const repUser = sessionStorage.getItem('repUser');
    const repUniversity = sessionStorage.getItem('repUniversity');
    let repStatus = document.getElementById('repStatus');
    if (!repStatus) {
        repStatus = document.createElement('div');
        repStatus.id = 'repStatus';
        repStatus.style.cssText = 'text-align:center;background:#ffe082;color:#333;padding:8px 0;';
        document.body.insertBefore(repStatus, document.body.firstChild.nextSibling);
    }
    if (repUser && repUniversity) {
        repStatus.innerHTML = `Logged in as representative for <b>${repUniversity}</b> 
            (<span style="color:#1976d2">${repUser}</span>)
            <button id="repLogoutBtn" style="margin-left:20px;" class="small-btn">Log Out</button>`;
        repStatus.style.display = '';
        document.getElementById('repLogoutBtn').onclick = () => {
            sessionStorage.removeItem('repUser');
            sessionStorage.removeItem('repUniversity');
            updateRepUI();
            renderUniversityCards(universities);
        };
    } else {
        repStatus.style.display = 'none';
    }
}

// Call this after rep login/logout and on page load
window.addEventListener('DOMContentLoaded', updateRepUI);

function openRepEditModal(university) {
    // Use the existing universityModal for editing
    const modal = document.getElementById('universityModal');
    const modalContent = document.getElementById('modalContent');
    modalContent.innerHTML = `
        <h2>Edit: ${university.name}</h2>
        <label>Region: <input id="editRegion" value="${university.region || ''}" style="width:90%"></label><br>
        <label>Type: <input id="editType" value="${university.type || ''}" style="width:90%"></label><br>
        <label>Description:<br>
            <textarea id="editDesc" style="width:90%">${university.description || ''}</textarea>
        </label><br>
        <label>Website: <input id="editWebsite" value="${university.website || ''}" style="width:90%"></label><br>
        <button id="saveRepEditBtn" class="small-btn" style="margin-top:10px;">Save</button>
    `;
    modal.style.display = 'block';
    document.getElementById('saveRepEditBtn').onclick = () => {
        university.region = document.getElementById('editRegion').value;
        university.type = document.getElementById('editType').value;
        university.description = document.getElementById('editDesc').value;
        university.website = document.getElementById('editWebsite').value;
        // Save changes to localStorage (simulate backend)
        let adminEdit = localStorage.getItem('universities_admin_edit');
        let universitiesArr = adminEdit ? JSON.parse(adminEdit) : universities;
        let idx = universitiesArr.findIndex(u => u.name === university.name);
        if (idx !== -1) {
            universitiesArr[idx] = university;
            localStorage.setItem('universities_admin_edit', JSON.stringify(universitiesArr));
        }
        renderUniversityCards(universitiesArr);
        modal.style.display = 'none';
    };
}

// Admin panel user management (supreme only)
document.getElementById('manageUsersBtn').onclick = () => {
    const usersPanel = document.getElementById('usersPanel');
    const usersList = document.getElementById('usersList');
    usersPanel.style.display = usersPanel.style.display === 'none' || !usersPanel.style.display ? '' : 'none';
    if (usersPanel.style.display === '') {
        // Load users
        usersList.innerHTML = '';
        let users = JSON.parse(localStorage.getItem('users') || '{}');
        Object.keys(users).forEach(username => {
            const li = document.createElement('li');
            li.textContent = username;
            // Add remove button for supreme admin
            const removeBtn = document.createElement('button');
            removeBtn.textContent = 'Remove';
            removeBtn.style.marginLeft = '10px';
            removeBtn.onclick = () => {
                delete users[username];
                localStorage.setItem('users', JSON.stringify(users));
                renderAdminUsers();
            };
            li.appendChild(removeBtn);
            usersList.appendChild(li);
        });
    }
};

function renderAdminUsers() {
    const usersList = document.getElementById('usersList');
    usersList.innerHTML = '';
    let users = JSON.parse(localStorage.getItem('users') || '{}');
    Object.keys(users).forEach(username => {
        const li = document.createElement('li');
        li.textContent = username;
        // Add remove button for supreme admin
        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remove';
        removeBtn.style.marginLeft = '10px';
        removeBtn.onclick = () => {
            delete users[username];
            localStorage.setItem('users', JSON.stringify(users));
            renderAdminUsers();
        };
        li.appendChild(removeBtn);
        usersList.appendChild(li);
    });
}

// Update admin panel UI based on session
function updateAdminPanelUI() {
    const adminPanel = document.getElementById('adminPanel');
    const manageUsersBtn = document.getElementById('manageUsersBtn');
    const adminUser = sessionStorage.getItem('adminUser');
    if (adminUser === 'supreme' || adminUser === 'one end only' || adminUser === 'admin') {
        adminPanel.style.display = '';
        manageUsersBtn.style.display = '';
    } else {
        adminPanel.style.display = 'none';
        manageUsersBtn.style.display = 'none';
    }
}

// Call updateAdminPanelUI() after admin login/logout
window.addEventListener('DOMContentLoaded', updateAdminPanelUI);
document.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'logoutBtn') {
        currentUser = null;
        updateProfileBtn();
        profileModal.style.display = 'none';
        renderUniversityCards(universities);
    }
});

// --- Manage Users Modal Logic ---
const manageUsersBtn = document.getElementById('manageUsersBtn');
const manageUsersModal = document.getElementById('manageUsersModal');
const closeManageUsersModal = document.getElementById('closeManageUsersModal');
const usersList = document.getElementById('usersList');

// Example: Load users from localStorage (replace with your real user storage)
function getAllUsers() {
    // Example structure: { username: { email, role, ... }, ... }
    return JSON.parse(localStorage.getItem('users') || '{}');
}

function saveAllUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

function renderUsersList() {
    const users = getAllUsers();
    let html = '<table style="width:100%;border-collapse:collapse;"><tr><th>Username</th><th>Email</th><th>Role</th><th>Actions</th></tr>';
    Object.entries(users).forEach(([username, info]) => {
        html += `<tr>
            <td>${username}</td>
            <td>${info.email || ''}</td>
            <td>${info.role || 'user'}</td>
            <td>
                <button class="editUserBtn" data-user="${username}">Edit</button>
                <button class="deleteUserBtn" data-user="${username}">Delete</button>
            </td>
        </tr>`;
    });
    html += '</table>';
    usersList.innerHTML = html;

    // Edit and Delete handlers
    document.querySelectorAll('.editUserBtn').forEach(btn => {
        btn.onclick = function() {
            const user = this.getAttribute('data-user');
            // Simple edit: prompt for new email/role
            const users = getAllUsers();
            const newEmail = prompt('Edit email:', users[user].email || '');
            const newRole = prompt('Edit role (user/admin):', users[user].role || 'user');
            if (newEmail !== null && newRole !== null) {
                users[user].email = newEmail;
                users[user].role = newRole;
                saveAllUsers(users);
                renderUsersList();
            }
        };
    });
    document.querySelectorAll('.deleteUserBtn').forEach(btn => {
        btn.onclick = function() {
            const user = this.getAttribute('data-user');
            if (confirm(`Delete user "${user}"?`)) {
                const users = getAllUsers();
                delete users[user];
                saveAllUsers(users);
                renderUsersList();
            }
        };
    });
}

manageUsersBtn.onclick = function() {
    renderUsersList();
    manageUsersModal.style.display = 'block';
};
closeManageUsersModal.onclick = function() {
    manageUsersModal.style.display = 'none';
};
window.addEventListener('click', function(event) {
    if (event.target === manageUsersModal) {
        manageUsersModal.style.display = 'none';
    }
});