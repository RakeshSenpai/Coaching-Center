
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



// Slider Functions
function initSlider() {
    if (!elements.coachesTrack) return;
    
    const container = elements.coachesTrack.parentElement;
    slideWidth = container.offsetWidth;
    
    // Set slide widths
    const slides = document.querySelectorAll('.coach-item');
    slides.forEach(slide => {
        slide.style.minWidth = `${slideWidth}px`;
        slide.style.width = `${slideWidth}px`;
    });
    
    createDots();
    
    // Update on resize (debounced)
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            slideWidth = elements.coachesTrack.parentElement.offsetWidth;
            slides.forEach(slide => {
                slide.style.minWidth = `${slideWidth}px`;
                slide.style.width = `${slideWidth}px`;
            });
            updateSlider();
        }, 150);
    });
}



function createDots() {
    if (!elements.sliderDots) return;
    
    const slides = document.querySelectorAll('.coach-item');
    elements.sliderDots.innerHTML = '';
    
    for (let i = 0; i < slides.length; i++) {
        const dot = document.createElement('div');
        dot.className = 'slider-dot';
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => {
            if (!isAnimating) {
                currentSlide = i;
                updateSlider();
            }
        });
        elements.sliderDots.appendChild(dot);
    }
}

function updateSlider() {
    if (!elements.coachesTrack || isAnimating) return;
    
    isAnimating = true;
    const translateX = -currentSlide * slideWidth;
    
    // Fast CSS transform
    elements.coachesTrack.style.transform = `translateX(${translateX}px)`;
    elements.coachesTrack.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
    
    // Update dots
    const dots = document.querySelectorAll('.slider-dot');
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
    
    // Update button states
    updateButtonStates();
    
    // Reset animation flag
    setTimeout(() => {
        isAnimating = false;
    }, 500);
}

function updateButtonStates() {
    const slides = document.querySelectorAll('.coach-item');
    
    if (elements.prevBtn) {
        elements.prevBtn.disabled = currentSlide === 0;
        elements.prevBtn.style.opacity = currentSlide === 0 ? '0.5' : '1';
    }
    
    if (elements.nextBtn) {
        elements.nextBtn.disabled = currentSlide === slides.length - 1;
        elements.nextBtn.style.opacity = currentSlide === slides.length - 1 ? '0.5' : '1';
    }
}



// Navbar scroll effect
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    
    if (currentScroll > 50) {
        elements.navbar?.classList.add('scrolled');
    } else {
        elements.navbar?.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
});

// Initialize everything
document.addEventListener('DOMContentLoaded', init);

// Simple animations without GSAP for speed
function animateOnScroll() {
    const elements = document.querySelectorAll('.feature-card, .learn-card, .course-card, .testimonial-card, .pricing-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    elements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(el);
    });
}

// Start animations when page loads
window.addEventListener('load', animateOnScroll);