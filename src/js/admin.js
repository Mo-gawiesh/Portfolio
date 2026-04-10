import { auth, db } from './firebase.js';
import { 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from "firebase/auth";
import { 
    collection, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    doc, 
    onSnapshot, 
    query, 
    orderBy 
} from "firebase/firestore";

// UI Elements
const adminDashboard = document.getElementById('admin-dashboard');
const adminSecretTrigger = document.getElementById('admin-secret-trigger');
const closeAdmin = document.getElementById('close-admin');
const adminAuthSection = document.getElementById('admin-auth');
const adminContentSection = document.getElementById('admin-content');
const projectFormContainer = document.getElementById('project-form-container');
const loginForm = document.getElementById('admin-login-form');
const projectForm = document.getElementById('project-form');
const projectList = document.getElementById('admin-project-list');
const portfolioGrid = document.getElementById('portfolio-grid');
const imagePreview = document.getElementById('image-preview');
const projectImageUrlInput = document.getElementById('project-imageUrl');

let isEditing = false;
let currentProjectId = null;

// Initialize Admin Logic
export function initAdmin() {
    setupEventListeners();
    listenToAuthState();
    listenToProjects();
}

function setupEventListeners() {
    // Secret Admin Toggle: Click 5 times in 2 seconds
    let clickCount = 0;
    let clickTimer;

    adminSecretTrigger.addEventListener('click', () => {
        clickCount++;
        clearTimeout(clickTimer);
        
        if (clickCount >= 5) {
            adminDashboard.classList.add('active');
            clickCount = 0;
        } else {
            clickTimer = setTimeout(() => {
                clickCount = 0;
            }, 2000);
        }
    });

    closeAdmin.addEventListener('click', () => adminDashboard.classList.remove('active'));

    // Authentication
    loginForm.addEventListener('submit', handleLogin);
    document.getElementById('admin-logout').addEventListener('click', () => signOut(auth));

    // Dashboard Navigation
    document.getElementById('show-add-project').addEventListener('click', () => {
        openProjectForm();
    });

    document.getElementById('cancel-project').addEventListener('click', () => {
        closeProjectForm();
    });

    // Real-time Image Preview from URL
    projectImageUrlInput.addEventListener('input', (e) => {
        const url = e.target.value.trim();
        if (url) {
            imagePreview.innerHTML = `<img src="${url}" alt="Preview" onerror="this.src='https://placehold.co/600x400?text=Invalid+Image+URL'">`;
        } else {
            imagePreview.innerHTML = '';
        }
    });

    // Project Form Submission
    projectForm.addEventListener('submit', handleProjectSubmit);
}

// --- Auth Logic ---
async function handleLogin(e) {
    e.preventDefault();
    const password = document.getElementById('admin-password').value;
    const email = "admin@portfolio.com"; 

    try {
        await signInWithEmailAndPassword(auth, email, password);
        loginForm.reset();
    } catch (error) {
        document.getElementById('admin-error').innerText = "Invalid password. Access denied.";
    }
}

function listenToAuthState() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            adminAuthSection.classList.add('hidden');
            adminContentSection.classList.remove('hidden');
        } else {
            adminAuthSection.classList.remove('hidden');
            adminContentSection.classList.add('hidden');
            closeProjectForm();
        }
    });
}

// --- Project CRUD Logic ---
function listenToProjects() {
    const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
    
    // Real-time update for both Admin List and Portfolio Grid
    onSnapshot(q, (snapshot) => {
        const projects = [];
        snapshot.forEach((doc) => {
            projects.push({ id: doc.id, ...doc.data() });
        });
        
        renderAdminList(projects);
        renderPortfolioGrid(projects);
    });
}

function renderAdminList(projects) {
    projectList.innerHTML = projects.map(proj => `
        <div class="admin-project-item">
            <img src="${proj.imageUrl}" class="admin-proj-img">
            <div class="admin-proj-info">
                <h5>${proj.title}</h5>
                <span>${proj.category}</span>
            </div>
            <div class="admin-proj-btns">
                <button class="btn-edit" data-id="${proj.id}"><i class="fa-solid fa-pen"></i></button>
                <button class="btn-delete" data-id="${proj.id}"><i class="fa-solid fa-trash"></i></button>
            </div>
        </div>
    `).join('');

    // Attach list listeners
    projectList.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', () => editProject(btn.dataset.id, projects));
    });
    projectList.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', () => deleteProjectConfirm(btn.dataset.id, projects));
    });
}

function renderPortfolioGrid(projects) {
    const grid = document.getElementById('portfolio-grid');
    if (!grid) return;

    if (projects.length === 0) {
        grid.innerHTML = '<p class="loading-spinner">No projects found. Add your first one!</p>';
        return;
    }

    // Determine current filter from active button
    const activeBtn = document.querySelector('.filter-btn.active');
    const filter = activeBtn ? activeBtn.getAttribute('data-filter') : 'all';

    grid.innerHTML = projects.map(proj => {
        const isVisible = filter === 'all' || proj.category === filter;
        const displayStyle = isVisible ? 'block' : 'none';
        
        return `
            <div class="project-card" data-category="${proj.category}" data-aos="fade-up" style="display: ${displayStyle}">
                <img src="${proj.imageUrl}" alt="${proj.title}" class="project-image">
                <div class="project-overlay">
                    <h3 class="project-title">${proj.title}</h3>
                    <span class="project-category">${proj.category}</span>
                </div>
            </div>
        `;
    }).join('');
    
    if (window.AOS) window.AOS.refresh();
}

async function handleProjectSubmit(e) {
    e.preventDefault();
    const saveBtn = document.getElementById('save-project');
    const originalText = saveBtn.innerText;
    
    const title = document.getElementById('project-title').value;
    const category = document.getElementById('project-category').value;
    const imageUrl = projectImageUrlInput.value.trim();

    if (!imageUrl) {
        alert("Please provide an image URL.");
        return;
    }

    saveBtn.innerText = "Saving...";
    saveBtn.disabled = true;

    try {
        const projectData = {
            title,
            category,
            imageUrl,
            updatedAt: new Date(),
        };

        if (isEditing) {
            await updateDoc(doc(db, "projects", currentProjectId), projectData);
        } else {
            await addDoc(collection(db, "projects"), { ...projectData, createdAt: new Date() });
        }

        closeProjectForm();
        alert("Project saved successfully!");
    } catch (error) {
        console.error("Error saving project:", error);
        alert("Failed to save project.");
    } finally {
        saveBtn.innerText = originalText;
        saveBtn.disabled = false;
    }
}

function openProjectForm(data = null) {
    isEditing = !!data;
    currentProjectId = data ? data.id : null;
    
    adminContentSection.classList.add('hidden');
    projectFormContainer.classList.remove('hidden');
    
    if (data) {
        document.getElementById('form-title').innerText = "Edit Project";
        document.getElementById('project-title').value = data.title;
        document.getElementById('project-category').value = data.category;
        projectImageUrlInput.value = data.imageUrl;
        imagePreview.innerHTML = `<img src="${data.imageUrl}" alt="Preview">`;
    } else {
        document.getElementById('form-title').innerText = "Add New Project";
        projectForm.reset();
        imagePreview.innerHTML = '';
    }
}

function closeProjectForm() {
    projectFormContainer.classList.add('hidden');
    adminContentSection.classList.remove('hidden');
}

function editProject(id, projects) {
    const project = projects.find(p => p.id === id);
    if (project) openProjectForm(project);
}

async function deleteProjectConfirm(id, projects) {
    const project = projects.find(p => p.id === id);
    if (!confirm(`Are you sure you want to delete "${project.title}"?`)) return;

    try {
        await deleteDoc(doc(db, "projects", id));
        alert("Project deleted.");
    } catch (error) {
        console.error("Delete failed:", error);
        alert("Delete failed.");
    }
}
