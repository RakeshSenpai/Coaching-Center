
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


    // Contact button
    document.querySelector('.cta-btn')?.addEventListener('click', () => {
        smoothScroll('#home');
    });

    // Slider buttons
    elements.prevBtn?.addEventListener('click', () => {
        if (currentSlide > 0 && !isAnimating) {
            currentSlide--;
            updateSlider();
        }
    });

    elements.nextBtn?.addEventListener('click', () => {
        const slides = document.querySelectorAll('.coach-item');
        if (currentSlide < slides.length - 1 && !isAnimating) {
            currentSlide++;
            updateSlider();
        }
    });



    // Touch/swipe for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    elements.coachesTrack?.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });

    elements.coachesTrack?.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold && !isAnimating) {
            if (diff > 0) {
                // Swipe left - next slide
                const slides = document.querySelectorAll('.coach-item');
                if (currentSlide < slides.length - 1) {
                    currentSlide++;
                    updateSlider();
                }
            } else {
                // Swipe right - previous slide
                if (currentSlide > 0) {
                    currentSlide--;
                    updateSlider();
                }
            }
        }
    }
}
