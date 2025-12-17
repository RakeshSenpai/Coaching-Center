
// DOM Elements Cache
const elements = {
    navbar: document.querySelector('.navbar'),
    mobileMenuBtn: document.querySelector('.mobile-menu-btn'),
    navLinks: document.querySelector('.nav-links'),
    coachesTrack: document.querySelector('.coaches-track'),
    sliderDots: document.querySelector('.slider-dots'),
    prevBtn: document.querySelector('.prev-btn'),
    nextBtn: document.querySelector('.next-btn')
};


// State
let currentSlide = 0;
let slideWidth = 0;
let isAnimating = false;

// Initialize
function init() {
    // Fast DOM ready operations
    if (elements.coachesTrack) {
        initSlider();
        setupEventListeners();
        updateSlider();
    }
}

// Mobile Menu
function toggleMobileMenu() {
    if (!elements.mobileMenuBtn || !elements.navLinks) return;
    
    const isActive = elements.navLinks.classList.toggle('active');
    elements.mobileMenuBtn.classList.toggle('active');
    document.body.style.overflow = isActive ? 'hidden' : '';
}

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (elements.navLinks?.classList.contains('active') && 
        !elements.navLinks.contains(e.target) && 
        !elements.mobileMenuBtn?.contains(e.target)) {
        toggleMobileMenu();
    }
});


// Smooth Scroll
function smoothScroll(targetId) {
    const target = document.querySelector(targetId);
    if (target) {
        const offsetTop = target.offsetTop - 80;
        window.scrollTo({ top: offsetTop, behavior: 'smooth' });
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Mobile menu
    elements.mobileMenuBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMobileMenu();
    });

    // Navigation links
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            if (targetId === '#') return;
            
            smoothScroll(targetId);
            if (elements.navLinks.classList.contains('active')) {
                toggleMobileMenu();
            }
        });
    });
