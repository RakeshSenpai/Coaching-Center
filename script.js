
// ==================== GLOBAL VARIABLES ====================
let coachesSlider = null;
let mobileMenuOpen = false;
let autoplayInterval = null;

// ==================== COACHES SLIDER ====================
class CoachesSlider {
    constructor() {
        this.container = document.querySelector('.slider-container');
        if (!this.container) {
            console.log('Slider container not found');
            return;
        }
        
        this.track = this.container.querySelector('.slider-track');
        this.slides = this.container.querySelectorAll('.slide');
        this.prevBtn = this.container.querySelector('.slider-nav.prev');
        this.nextBtn = this.container.querySelector('.slider-nav.next');
        this.paginationContainer = this.container.querySelector('.slider-pagination');
        
        if (!this.track || !this.slides.length) {
            console.log('Slider elements not found');
            return;
        }
        
        this.currentIndex = 0;
        this.totalSlides = this.slides.length;
        this.isAnimating = false;
        this.autoplayDelay = 5000; // 5 seconds
        
        // Touch/swipe
        this.touchStartX = 0;
        this.touchEndX = 0;
        
        this.init();
    }
    
    init() {
        console.log(`Initializing slider with ${this.totalSlides} slides`);
        
        this.createPagination();
        this.setupEventListeners();
        this.updateSlider(false); // No animation on initial load
        this.startAutoplay();
        
        // Set initial cursor
        this.track.style.cursor = 'grab';
    }
    
    createPagination() {
        if (!this.paginationContainer) return;
        
        this.paginationContainer.innerHTML = '';
        
        for (let i = 0; i < this.totalSlides; i++) {
            const dot = document.createElement('button');
            dot.className = 'pagination-dot';
            dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
            dot.setAttribute('tabindex', '0');
            
            if (i === 0) {
                dot.classList.add('active');
                dot.setAttribute('aria-current', 'true');
            }
            
            dot.addEventListener('click', (e) => {
                e.preventDefault();
                this.goToSlide(i);
            });
            
            this.paginationContainer.appendChild(dot);
        }
    }
    
    setupEventListeners() {
        // Navigation buttons
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.prevSlide();
            });
        }
        
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.nextSlide();
            });
        }
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.target.closest('.slider-container')) {
                if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    this.prevSlide();
                } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    this.nextSlide();
                }
            }
        });
        
        // Touch events
        this.track.addEventListener('touchstart', (e) => {
            this.touchStartX = e.touches[0].clientX;
            this.stopAutoplay();
        }, { passive: true });
        
        this.track.addEventListener('touchmove', (e) => {
            this.touchEndX = e.touches[0].clientX;
        }, { passive: true });
        
        this.track.addEventListener('touchend', () => {
            const diff = this.touchStartX - this.touchEndX;
            const swipeThreshold = 50;
            
            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    this.nextSlide();
                } else {
                    this.prevSlide();
                }
            }
            
            this.startAutoplay();
        });
        
        // Mouse drag (optional)
        let isDragging = false;
        let mouseStartX = 0;
        
        this.track.addEventListener('mousedown', (e) => {
            isDragging = true;
            mouseStartX = e.clientX;
            this.stopAutoplay();
            this.track.style.cursor = 'grabbing';
        });
        
        this.track.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
        });
        
        document.addEventListener('mouseup', () => {
            if (!isDragging) return;
            
            isDragging = false;
            this.track.style.cursor = 'grab';
            this.startAutoplay();
        });
        
        // Pause on hover
        this.container.addEventListener('mouseenter', () => this.stopAutoplay());
        this.container.addEventListener('mouseleave', () => this.startAutoplay());
        
        // Pause when tab is not visible
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stopAutoplay();
            } else {
                this.startAutoplay();
            }
        });
        
        // Window resize - reset slider position
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.updateSlider(false);
            }, 150);
        });
    }
    
    nextSlide() {
        if (this.isAnimating) return;
        
        this.currentIndex = (this.currentIndex + 1) % this.totalSlides;
        this.updateSlider();
    }
    
    prevSlide() {
        if (this.isAnimating) return;
        
        this.currentIndex = (this.currentIndex - 1 + this.totalSlides) % this.totalSlides;
        this.updateSlider();
    }
    
    goToSlide(index) {
        if (this.isAnimating || index === this.currentIndex) return;
        if (index < 0 || index >= this.totalSlides) return;
        
        this.currentIndex = index;
        this.updateSlider();
    }
    
    updateSlider(animate = true) {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        
        const translateX = -this.currentIndex * 100;
        
        if (animate) {
            this.track.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        } else {
            this.track.style.transition = 'none';
        }
        
        this.track.style.transform = `translateX(${translateX}%)`;
        
        // Update pagination
        this.updatePagination();
        
        // Reset animation flag
        setTimeout(() => {
            this.isAnimating = false;
        }, animate ? 500 : 0);
    }
    
    updatePagination() {
        if (!this.paginationContainer) return;
        
        const dots = this.paginationContainer.querySelectorAll('.pagination-dot');
        dots.forEach((dot, index) => {
            const isActive = index === this.currentIndex;
            dot.classList.toggle('active', isActive);
            dot.setAttribute('aria-current', isActive ? 'true' : 'false');
        });
    }
    
    startAutoplay() {
        this.stopAutoplay();
        
        autoplayInterval = setInterval(() => {
            this.nextSlide();
        }, this.autoplayDelay);
    }
    
    stopAutoplay() {
        if (autoplayInterval) {
            clearInterval(autoplayInterval);
            autoplayInterval = null;
        }
    }
}

// ==================== MOBILE MENU ====================
function setupMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (!mobileMenuBtn || !navLinks) {
        console.log('Mobile menu elements not found');
        return;
    }
    
    mobileMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMobileMenu();
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (mobileMenuOpen && 
            !navLinks.contains(e.target) && 
            !mobileMenuBtn.contains(e.target)) {
            closeMobileMenu();
        }
    });
    
    // Close menu when clicking links
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            if (mobileMenuOpen) {
                closeMobileMenu();
            }
        });
    });
    
    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenuOpen) {
            closeMobileMenu();
        }
    });
    
    function toggleMobileMenu() {
        mobileMenuOpen = !mobileMenuOpen;
        
        if (mobileMenuOpen) {
            navLinks.classList.add('active');
            mobileMenuBtn.classList.add('active');
            document.body.style.overflow = 'hidden';
        } else {
            closeMobileMenu();
        }
    }
    
    function closeMobileMenu() {
        mobileMenuOpen = false;
        navLinks.classList.remove('active');
        mobileMenuBtn.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// ==================== NAVBAR SCROLL EFFECT ====================
function setupNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    
    let lastScrollTop = 0;
    const scrollThreshold = 50;
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Add/remove scrolled class based on scroll position
        if (scrollTop > scrollThreshold) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        lastScrollTop = scrollTop;
    });
}

// ==================== SMOOTH SCROLL ====================
function setupSmoothScroll() {
    // Select all anchor links with href starting with #
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Skip if it's just "#" or empty
            if (href === '#' || href === '') return;
            
            const targetElement = document.querySelector(href);
            if (!targetElement) return;
            
            e.preventDefault();
            
            // Calculate scroll position
            const navbar = document.querySelector('.navbar');
            const navbarHeight = navbar ? navbar.offsetHeight : 80;
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;
            
            // Smooth scroll to target
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        });
    });
}

// ==================== BUTTON HANDLERS ====================
function setupCTAButtons() {
    // Handle main CTA buttons
    const ctaButtons = document.querySelectorAll('.cta-btn, .btn-primary:not(.hero-cta .btn-primary)');
    ctaButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Scroll to pricing section
            const pricingSection = document.querySelector('#pricing');
            if (pricingSection) {
                const navbar = document.querySelector('.navbar');
                const navbarHeight = navbar ? navbar.offsetHeight : 80;
                const targetPosition = pricingSection.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Handle coach booking buttons
    const coachButtons = document.querySelectorAll('.coach-cta');
    coachButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Booking feature coming soon! You will be able to book sessions with coaches here.');
        });
    });
    
    // Handle course enrollment buttons
    const courseButtons = document.querySelectorAll('.course-btn');
    courseButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Enrollment feature coming soon! You will be able to enroll in courses here.');
        });
    });
    
    // Handle pricing buttons
    const pricingButtons = document.querySelectorAll('.pricing-btn');
    pricingButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Subscription feature coming soon! You will be able to choose your plan here.');
        });
    });
    
    // Handle secondary buttons (watch demo, etc.)
    const secondaryButtons = document.querySelectorAll('.btn-secondary');
    secondaryButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Demo feature coming soon! You will be able to watch tutorial videos here.');
        });
    });
}

// ==================== FORM HANDLING ====================
function setupForms() {
    const newsletterForm = document.querySelector('.newsletter-form');
    if (!newsletterForm) return;
    
    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const emailInput = this.querySelector('input[type="email"]');
        const email = emailInput.value.trim();
        
        if (!email) {
            showNotification('Please enter your email address', 'error');
            emailInput.focus();
            return;
        }
        
        if (!isValidEmail(email)) {
            showNotification('Please enter a valid email address', 'error');
            emailInput.focus();
            return;
        }
        
        // Simulate form submission
        console.log('Subscribing email:', email);
        showNotification('Thank you for subscribing to our newsletter!', 'success');
        emailInput.value = '';
    });
    
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    function showNotification(message, type = 'success') {
        // Remove existing notification if any
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            padding: 12px 24px;
            background: ${type === 'success' ? '#10b981' : '#ef4444'};
            color: white;
            border-radius: 8px;
            z-index: 9999;
            animation: notificationSlideIn 0.3s ease;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            font-weight: 500;
            max-width: 300px;
        `;
        
        document.body.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'notificationSlideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }
}

// ==================== SCROLL ANIMATIONS ====================
function setupScrollAnimations() {
    // Check if IntersectionObserver is supported
    if (!('IntersectionObserver' in window)) {
        // Fallback for older browsers
        document.querySelectorAll('.fade-in').forEach(el => {
            el.classList.add('visible');
        });
        return;
    }
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    // Observe all cards
    const cards = document.querySelectorAll('.feature-card, .learn-card, .course-card, .testimonial-card, .pricing-card, .coach-card');
    cards.forEach(card => {
        card.classList.add('fade-in');
        observer.observe(card);
    });
}

// ==================== INITIALIZATION ====================
function initializeWebsite() {
    console.log('Initializing Elevn Coaching Center...');
    
    try {
        // Initialize coaches slider
        coachesSlider = new CoachesSlider();
        
        // Setup other functionality
        setupMobileMenu();
        setupNavbarScroll();
        setupSmoothScroll();
        setupScrollAnimations();
        setupCTAButtons();
        setupForms();
        
        console.log('✅ Website initialized successfully!');
        
    } catch (error) {
        console.error('❌ Error during initialization:', error);
    }
}

// ==================== STARTUP ====================
// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWebsite);
} else {
    // DOM already loaded, initialize immediately
    setTimeout(initializeWebsite, 100);
}
