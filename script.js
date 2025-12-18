// ==================== DOM ELEMENTS ====================
const elements = {
    navbar: document.querySelector('.navbar'),
    mobileMenuBtn: document.querySelector('.mobile-menu-btn'),
    navLinks: document.querySelector('.nav-links'),
    coachesSlider: document.querySelector('.coaches-slider'),
    sliderPagination: document.querySelector('.slider-pagination'),
    prevArrow: document.querySelector('.prev-arrow'),
    nextArrow: document.querySelector('.next-arrow')
};

// ==================== STATE ====================
let sliderState = {
    currentIndex: 0,
    totalSlides: 0,
    isAnimating: false,
    touchStartX: 0,
    touchEndX: 0,
    slideWidth: 0
};

// ==================== INITIALIZATION ====================
function init() {
    if (elements.coachesSlider) {
        initializeSlider();
    }
    
    setupEventListeners();
    setupScrollAnimations();
    updateSliderDimensions();
}

// ==================== NAVIGATION ====================
function setupEventListeners() {
    // Mobile menu toggle
    if (elements.mobileMenuBtn) {
        elements.mobileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMobileMenu();
        });
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (elements.navLinks?.classList.contains('active') && 
            !elements.navLinks.contains(e.target) && 
            !elements.mobileMenuBtn?.contains(e.target)) {
            closeMobileMenu();
        }
    });

    // Smooth scroll for navigation links
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', handleNavClick);
    });

    // Contact button
    const ctaBtn = document.querySelector('.cta-btn');
    if (ctaBtn) {
        ctaBtn.addEventListener('click', () => smoothScroll('#home'));
    }

    // Hero CTA buttons
    document.querySelectorAll('.btn-primary, .btn-secondary').forEach(btn => {
        btn.addEventListener('click', handleCTAClick);
    });

    // Navbar scroll effect
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            updateSliderDimensions();
            updateSliderPosition(false);
        }, 150);
    });
}

function toggleMobileMenu() {
    const isActive = elements.navLinks.classList.toggle('active');
    elements.mobileMenuBtn.classList.toggle('active');
    document.body.style.overflow = isActive ? 'hidden' : '';
}

function closeMobileMenu() {
    elements.navLinks.classList.remove('active');
    elements.mobileMenuBtn.classList.remove('active');
    document.body.style.overflow = '';
}

function handleNavClick(e) {
    e.preventDefault();
    const targetId = e.currentTarget.getAttribute('href');
    
    if (targetId && targetId !== '#') {
        smoothScroll(targetId);
        if (window.innerWidth <= 768) {
            closeMobileMenu();
        }
    }
}

function smoothScroll(targetId) {
    const target = document.querySelector(targetId);
    if (target) {
        const offsetTop = target.offsetTop - 80;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
}

function handleCTAClick(e) {
    // You can add your CTA logic here
    console.log('CTA clicked:', e.currentTarget.textContent);
    // Example: scroll to pricing or open modal
    smoothScroll('#pricing');
}

function handleScroll() {
    const scrollY = window.scrollY;
    
    // Navbar scroll effect
    if (elements.navbar) {
        if (scrollY > 50) {
            elements.navbar.classList.add('scrolled');
        } else {
            elements.navbar.classList.remove('scrolled');
        }
    }
}
// ==================== PROFESSIONAL SLIDER FUNCTIONALITY ====================

class ProfessionalSlider {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
        if (!this.container) return;
        
        this.track = this.container.querySelector('.slider-track');
        this.slides = this.container.querySelectorAll('.slide');
        this.prevBtn = document.querySelector('.slider-btn-prev');
        this.nextBtn = document.querySelector('.slider-btn-next');
        this.paginationContainer = document.querySelector('.slider-pagination');
        
        this.currentIndex = 0;
        this.totalSlides = this.slides.length;
        this.isAnimating = false;
        this.autoplayInterval = null;
        this.autoplayDelay = 5000; // 5 seconds
        
        // Touch/Swipe
        this.touchStartX = 0;
        this.touchEndX = 0;
        this.touchStartY = 0;
        this.touchEndY = 0;
        this.isDragging = false;
        
        this.init();
    }
    
    init() {
        if (this.totalSlides === 0) return;
        
        this.createPagination();
        this.attachEventListeners();
        this.updateSlider(false);
        this.startAutoplay();
    }
    
    createPagination() {
        if (!this.paginationContainer) return;
        
        this.paginationContainer.innerHTML = '';
        
        for (let i = 0; i < this.totalSlides; i++) {
            const dot = document.createElement('button');
            dot.className = 'pagination-dot';
            dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
            
            if (i === 0) {
                dot.classList.add('active');
            }
            
            dot.addEventListener('click', () => this.goToSlide(i));
            this.paginationContainer.appendChild(dot);
        }
    }
    
    attachEventListeners() {
        // Navigation buttons
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.prevSlide());
        }
        
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.nextSlide());
        }
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Touch events
        this.track.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
        this.track.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: true });
        this.track.addEventListener('touchend', () => this.handleTouchEnd());
        
        // Mouse drag events (optional)
        this.track.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.track.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.track.addEventListener('mouseup', () => this.handleMouseUp());
        this.track.addEventListener('mouseleave', () => this.handleMouseUp());
        
        // Pause autoplay on hover
        this.container.addEventListener('mouseenter', () => this.stopAutoplay());
        this.container.addEventListener('mouseleave', () => this.startAutoplay());
        
        // Pause autoplay on touch
        this.track.addEventListener('touchstart', () => this.stopAutoplay(), { passive: true });
        
        // Window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.updateSlider(false);
            }, 150);
        });
        
        // Visibility change (pause when tab is not visible)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stopAutoplay();
            } else {
                this.startAutoplay();
            }
        });
    }
    
    // Navigation Methods
    nextSlide() {
        if (this.isAnimating) return;
        
        const nextIndex = (this.currentIndex + 1) % this.totalSlides;
        this.goToSlide(nextIndex);
    }
    
    prevSlide() {
        if (this.isAnimating) return;
        
        const prevIndex = (this.currentIndex - 1 + this.totalSlides) % this.totalSlides;
        this.goToSlide(prevIndex);
    }
    
    goToSlide(index) {
        if (this.isAnimating || index === this.currentIndex) return;
        
        this.currentIndex = index;
        this.updateSlider(true);
        this.resetAutoplay();
    }
    
    updateSlider(animate = true) {
        this.isAnimating = true;
        
        const translateX = -this.currentIndex * 100;
        
        if (animate) {
            this.track.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        } else {
            this.track.style.transition = 'none';
        }
        
        this.track.style.transform = `translateX(${translateX}%)`;
        
        this.updatePagination();
        this.updateNavigationButtons();
        
        // Add slide change event
        this.container.dispatchEvent(new CustomEvent('slideChange', {
            detail: { currentIndex: this.currentIndex }
        }));
        
        setTimeout(() => {
            this.isAnimating = false;
        }, animate ? 600 : 0);
    }
    
    updatePagination() {
        if (!this.paginationContainer) return;
        
        const dots = this.paginationContainer.querySelectorAll('.pagination-dot');
        dots.forEach((dot, index) => {
            if (index === this.currentIndex) {
                dot.classList.add('active');
                dot.setAttribute('aria-current', 'true');
            } else {
                dot.classList.remove('active');
                dot.removeAttribute('aria-current');
            }
        });
    }
    
    updateNavigationButtons() {
        if (this.prevBtn) {
            this.prevBtn.disabled = false; // Always enabled for infinite loop
        }
        
        if (this.nextBtn) {
            this.nextBtn.disabled = false; // Always enabled for infinite loop
        }
    }
    
    // Touch/Swipe Handlers
    handleTouchStart(e) {
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
    }
    
    handleTouchMove(e) {
        this.touchEndX = e.touches[0].clientX;
        this.touchEndY = e.touches[0].clientY;
    }
    
    handleTouchEnd() {
        const swipeThreshold = 50;
        const diffX = this.touchStartX - this.touchEndX;
        const diffY = Math.abs(this.touchStartY - this.touchEndY);
        
        // Only trigger if horizontal swipe is greater than vertical
        if (Math.abs(diffX) > swipeThreshold && Math.abs(diffX) > diffY) {
            if (diffX > 0) {
                // Swipe left - next slide
                this.nextSlide();
            } else {
                // Swipe right - previous slide
                this.prevSlide();
            }
        }
        
        // Reset touch positions
        this.touchStartX = 0;
        this.touchEndX = 0;
        this.touchStartY = 0;
        this.touchEndY = 0;
    }
    
    // Mouse Drag Handlers (Optional)
    handleMouseDown(e) {
        this.isDragging = true;
        this.touchStartX = e.clientX;
        this.track.style.cursor = 'grabbing';
    }
    
    handleMouseMove(e) {
        if (!this.isDragging) return;
        this.touchEndX = e.clientX;
    }
    
    handleMouseUp() {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        this.track.style.cursor = 'grab';
        
        const swipeThreshold = 50;
        const diff = this.touchStartX - this.touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                this.nextSlide();
            } else {
                this.prevSlide();
            }
        }
        
        this.touchStartX = 0;
        this.touchEndX = 0;
    }
    
    // Keyboard Navigation
    handleKeyboard(e) {
        if (e.key === 'ArrowLeft') {
            this.prevSlide();
        } else if (e.key === 'ArrowRight') {
            this.nextSlide();
        }
    }
    
    // Autoplay Methods
    startAutoplay() {
        this.stopAutoplay(); // Clear any existing interval
        
        this.autoplayInterval = setInterval(() => {
            this.nextSlide();
        }, this.autoplayDelay);
    }
    
    stopAutoplay() {
        if (this.autoplayInterval) {
            clearInterval(this.autoplayInterval);
            this.autoplayInterval = null;
        }
    }
    
    resetAutoplay() {
        this.stopAutoplay();
        this.startAutoplay();
    }
    
    // Public API
    destroy() {
        this.stopAutoplay();
        // Remove event listeners if needed
    }
    
    setAutoplayDelay(delay) {
        this.autoplayDelay = delay;
        this.resetAutoplay();
    }
}

// ==================== INITIALIZE SLIDER ====================
let coachSlider;

function initializeSlider() {
    coachSlider = new ProfessionalSlider('.slider-container');
    
    // Optional: Listen to slide change events
    const container = document.querySelector('.slider-container');
    if (container) {
        container.addEventListener('slideChange', (e) => {
            console.log('Current slide:', e.detail.currentIndex + 1);
        });
    }
}

// ==================== OTHER PAGE FUNCTIONALITY ====================

// Navigation
const navbar = document.querySelector('.navbar');
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

function setupNavigation() {
    // Mobile menu toggle
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMobileMenu();
        });
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (navLinks?.classList.contains('active') && 
            !navLinks.contains(e.target) && 
            !mobileMenuBtn?.contains(e.target)) {
            closeMobileMenu();
        }
    });

    // Smooth scroll for navigation links
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', handleNavClick);
    });

    // Navbar scroll effect
    window.addEventListener('scroll', handleScroll, { passive: true });
}

function toggleMobileMenu() {
    const isActive = navLinks.classList.toggle('active');
    mobileMenuBtn.classList.toggle('active');
    document.body.style.overflow = isActive ? 'hidden' : '';
}

function closeMobileMenu() {
    navLinks.classList.remove('active');
    mobileMenuBtn.classList.remove('active');
    document.body.style.overflow = '';
}

function handleNavClick(e) {
    e.preventDefault();
    const targetId = e.currentTarget.getAttribute('href');
    
    if (targetId && targetId !== '#') {
        smoothScroll(targetId);
        if (window.innerWidth <= 768) {
            closeMobileMenu();
        }
    }
}

function smoothScroll(targetId) {
    const target = document.querySelector(targetId);
    if (target) {
        const offsetTop = target.offsetTop - 80;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
}

function handleScroll() {
    const scrollY = window.scrollY;
    
    if (navbar) {
        if (scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
}

// Scroll Animations
function setupScrollAnimations() {
    const animatedElements = document.querySelectorAll(
        '.feature-card, .learn-card, .course-card, .testimonial-card, .pricing-card'
    );
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in', 'visible');
            }
        });
    }, observerOptions);
    
    animatedElements.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
}

// CTA Buttons
function setupCTAButtons() {
    document.querySelectorAll('.btn-primary, .btn-secondary, .cta-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Add your CTA logic here
            console.log('CTA clicked:', btn.textContent);
            smoothScroll('#pricing');
        });
    });
}

// ==================== INITIALIZATION ====================

function init() {
    setupNavigation();
    setupScrollAnimations();
    setupCTAButtons();
    initializeSlider();
}

// Fast initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Export for debugging (optional)
if (typeof window !== 'undefined') {
    window.sliderAPI = {
        instance: () => coachSlider,
        goToSlide: (index) => coachSlider?.goToSlide(index),
        next: () => coachSlider?.nextSlide(),
        prev: () => coachSlider?.prevSlide(),
        startAutoplay: () => coachSlider?.startAutoplay(),
        stopAutoplay: () => coachSlider?.stopAutoplay()
    };
}
// ==================== SCROLL ANIMATIONS ====================
function setupScrollAnimations() {
    const animatedElements = document.querySelectorAll(
        '.feature-card, .learn-card, .course-card, .testimonial-card, .pricing-card, .coach-card'
    );
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in', 'visible');
            }
        });
    }, observerOptions);
    
    animatedElements.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
}

// ==================== AUTO SLIDER (OPTIONAL) ====================
let autoSlideInterval;

function startAutoSlide() {
    stopAutoSlide(); // Clear any existing interval
    
    autoSlideInterval = setInterval(() => {
        if (sliderState.currentIndex < sliderState.totalSlides - 1) {
            navigateSlider('next');
        } else {
            sliderState.currentIndex = 0;
            updateSliderPosition(true);
        }
    }, 5000); // Change slide every 5 seconds
}

function stopAutoSlide() {
    if (autoSlideInterval) {
        clearInterval(autoSlideInterval);
    }
}

// Pause auto-slide on user interaction
function pauseAutoSlideOnInteraction() {
    if (elements.coachesSlider) {
        elements.coachesSlider.addEventListener('mouseenter', stopAutoSlide);
        elements.coachesSlider.addEventListener('touchstart', stopAutoSlide);
    }
}

// ==================== UTILITY FUNCTIONS ====================
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ==================== PERFORMANCE OPTIMIZATION ====================
// Lazy load images (if you add actual images later)
function setupLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// ==================== INITIALIZE ON PAGE LOAD ====================
// Fast initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Additional setup after full page load
window.addEventListener('load', () => {
    setupLazyLoading();
    
    // Uncomment to enable auto-slide
    // startAutoSlide();
    // pauseAutoSlideOnInteraction();
});

// ==================== EXPORT FOR TESTING (OPTIONAL) ====================
// If you need to access these functions from the console for debugging
if (typeof window !== 'undefined') {
    window.sliderDebug = {
        state: sliderState,
        goToSlide,
        navigateSlider,
        startAutoSlide,
        stopAutoSlide
    };
}