/**
 * Resume Website - Main JavaScript
 * Handles animations, smooth scrolling, and interactive features
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all features
    initSmoothScrolling();
    initProgressBarAnimations();
    initScrollAnimations();

    console.log('Resume website loaded successfully!');
});

/**
 * Enable smooth scrolling for anchor links
 */
function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');

            // Skip if it's just "#"
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/**
 * Animate skill progress bars when they come into view
 */
function initProgressBarAnimations() {
    const progressBars = document.querySelectorAll('.progress-fill');

    if (progressBars.length === 0) return;

    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const progressBar = entry.target;
                const width = progressBar.style.width;

                // Reset and animate
                progressBar.style.width = '0%';
                setTimeout(() => {
                    progressBar.style.width = width;
                }, 100);

                // Only animate once
                observer.unobserve(progressBar);
            }
        });
    }, observerOptions);

    progressBars.forEach(bar => observer.observe(bar));
}

/**
 * Add fade-in animations for sections as they scroll into view
 */
function initScrollAnimations() {
    const sections = document.querySelectorAll('section');

    if (sections.length === 0) return;

    // Add initial styles
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';

                // Stop observing once animated
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));
}

/**
 * Handle print functionality
 * This is called by the "Download Resume" button
 */
window.printResume = function() {
    window.print();
};

/**
 * Add hover effects to project cards
 */
document.addEventListener('DOMContentLoaded', function() {
    const projectCards = document.querySelectorAll('.project-item, .testimonial-card');

    projectCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
});

/**
 * Responsive navigation (if needed in future)
 */
function initMobileMenu() {
    // Placeholder for mobile menu functionality if needed
    const mobileBreakpoint = 768;

    function handleResize() {
        const width = window.innerWidth;

        if (width <= mobileBreakpoint) {
            // Mobile view
            document.body.classList.add('mobile');
        } else {
            // Desktop view
            document.body.classList.remove('mobile');
        }
    }

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call
}

/**
 * Add "Back to Top" button functionality (optional)
 */
function initBackToTop() {
    const button = document.createElement('button');
    button.innerHTML = '<i class="fas fa-arrow-up"></i>';
    button.className = 'back-to-top';
    button.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background-color: var(--primary-color);
        color: white;
        border: none;
        cursor: pointer;
        opacity: 0;
        transition: opacity 0.3s ease;
        z-index: 1000;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    `;

    document.body.appendChild(button);

    // Show/hide button based on scroll position
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            button.style.opacity = '1';
        } else {
            button.style.opacity = '0';
        }
    });

    // Scroll to top on click
    button.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Initialize back to top button
document.addEventListener('DOMContentLoaded', initBackToTop);

/**
 * Track analytics events (placeholder for Google Analytics or similar)
 */
function trackEvent(category, action, label) {
    // If Google Analytics is loaded
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            'event_category': category,
            'event_label': label
        });
    }

    console.log('Event tracked:', category, action, label);
}

// Track download resume clicks
document.addEventListener('DOMContentLoaded', function() {
    const downloadButtons = document.querySelectorAll('.btn-primary');

    downloadButtons.forEach(button => {
        button.addEventListener('click', function() {
            trackEvent('Resume', 'download', 'PDF');
        });
    });
});

/**
 * Email obfuscation helper (to prevent spam bots)
 */
function deobfuscateEmail(element) {
    const encoded = element.getAttribute('data-email');
    if (encoded) {
        element.href = 'mailto:' + atob(encoded);
    }
}

/**
 * Lazy load images (if needed for performance)
 */
function initLazyLoading() {
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

// Console message
console.log('%c Resume Website Builder ', 'background: #2563eb; color: white; padding: 5px 10px; border-radius: 3px;');
console.log('Built with Resume Website Builder - https://github.com/your-repo');
