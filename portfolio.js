// ===== SMOOTH SCROLLING & NAVIGATION =====
document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-link');
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const sections = document.querySelectorAll('section[id]');

    // Hamburger menu toggle
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close menu when a link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Update active nav link on scroll
    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').slice(1) === current) {
                link.classList.add('active');
            }
        });
    });

    // Smooth scroll for nav links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').slice(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
});

// ===== TYPING ANIMATION =====
const typingElement = document.querySelector('.typing');
const roles = ['Full Stack Developer', 'UI/UX Designer', 'Problem Solver', 'Tech Enthusiast'];
let roleIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typingSpeed = 100;
let deletingSpeed = 50;
let pauseTime = 2000;

function type() {
    const currentRole = roles[roleIndex];
    
    if (isDeleting) {
        typingElement.textContent = currentRole.substring(0, charIndex - 1);
        charIndex--;
        
        if (charIndex === 0) {
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            typingSpeed = 100;
        } else {
            typingSpeed = deletingSpeed;
        }
    } else {
        typingElement.textContent = currentRole.substring(0, charIndex + 1);
        charIndex++;
        
        if (charIndex === currentRole.length) {
            typingSpeed = pauseTime;
            isDeleting = true;
        } else {
            typingSpeed = 100;
        }
    }
    
    setTimeout(type, typingSpeed);
}

type();

// ===== SKILL PROGRESS ANIMATION =====
const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const progressBar = entry.target;
            const targetWidth = progressBar.style.getPropertyValue('--target');
            animateProgress(progressBar, targetWidth);
            observer.unobserve(progressBar);
        }
    });
}, observerOptions);

const progressBars = document.querySelectorAll('.progress');
progressBars.forEach(bar => observer.observe(bar));

function animateProgress(progressBar, targetWidth) {
    let currentWidth = 0;
    const increment = parseInt(targetWidth) / 30;
    
    const interval = setInterval(() => {
        currentWidth += increment;
        if (currentWidth >= parseInt(targetWidth)) {
            currentWidth = parseInt(targetWidth);
            clearInterval(interval);
        }
        progressBar.style.width = currentWidth + '%';
    }, 50);
}

// ===== FORM VALIDATION =====
const contactForm = document.getElementById('contactForm');
const formInputs = contactForm.querySelectorAll('input, textarea');
const formMessage = document.getElementById('formMessage');

// Real-time validation
formInputs.forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
        if (input.classList.contains('error')) {
            validateField(input);
        }
    });
});

function validateField(field) {
    const value = field.value.trim();
    const errorMessage = field.parentElement.querySelector('.error-message');
    let isValid = true;
    let message = '';

    switch (field.id) {
        case 'name':
            if (value.length === 0) {
                isValid = false;
                message = 'Name is required';
            } else if (value.length < 2) {
                isValid = false;
                message = 'Name must be at least 2 characters';
            } else if (!/^[a-zA-Z\s]+$/.test(value)) {
                isValid = false;
                message = 'Name can only contain letters and spaces';
            }
            break;

        case 'email':
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (value.length === 0) {
                isValid = false;
                message = 'Email is required';
            } else if (!emailPattern.test(value)) {
                isValid = false;
                message = 'Please enter a valid email address';
            }
            break;

        case 'subject':
            if (value.length === 0) {
                isValid = false;
                message = 'Subject is required';
            } else if (value.length < 3) {
                isValid = false;
                message = 'Subject must be at least 3 characters';
            }
            break;

        case 'message':
            if (value.length === 0) {
                isValid = false;
                message = 'Message is required';
            } else if (value.length < 10) {
                isValid = false;
                message = 'Message must be at least 10 characters';
            }
            break;
    }

    if (isValid) {
        field.classList.remove('error');
        if (errorMessage) {
            errorMessage.classList.remove('show');
            errorMessage.textContent = '';
        }
    } else {
        field.classList.add('error');
        if (errorMessage) {
            errorMessage.classList.add('show');
            errorMessage.textContent = message;
        }
    }

    return isValid;
}

// Form submission
contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Validate all fields
    let isFormValid = true;
    formInputs.forEach(input => {
        if (!validateField(input)) {
            isFormValid = false;
        }
    });

    if (isFormValid) {
        // Simulate form submission
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
        
        // Simulate API call
        setTimeout(() => {
            formMessage.classList.remove('error');
            formMessage.classList.add('success');
            formMessage.textContent = '✓ Message sent successfully! I\'ll get back to you soon.';
            
            // Reset form
            contactForm.reset();
            formInputs.forEach(input => {
                input.classList.remove('error');
                const errorMsg = input.parentElement.querySelector('.error-message');
                if (errorMsg) {
                    errorMsg.classList.remove('show');
                    errorMsg.textContent = '';
                }
            });

            submitBtn.disabled = false;
            submitBtn.textContent = originalText;

            // Hide message after 5 seconds
            setTimeout(() => {
                formMessage.classList.remove('success');
                formMessage.textContent = '';
            }, 5000);
        }, 1500);
    } else {
        formMessage.classList.add('error');
        formMessage.classList.remove('success');
        formMessage.textContent = '⚠ Please fix the errors above before submitting.';
        
        setTimeout(() => {
            formMessage.classList.remove('error');
            formMessage.textContent = '';
        }, 4000);
    }
});

// ===== SCROLL ANIMATIONS =====
const scrollElements = document.querySelectorAll('.hero-content, .about-content, .skills-grid > *, .projects-grid > *, .contact-info, .contact-form');

const elementInView = (el, dividend = 1) => {
    const elementTop = el.getBoundingClientRect().top;
    return (
        elementTop <= (window.innerHeight || document.documentElement.clientHeight) / dividend
    );
};

const elementOutofView = (el) => {
    const elementTop = el.getBoundingClientRect().top;
    return elementTop > (window.innerHeight || document.documentElement.clientHeight);
};

const displayScrollElements = () => {
    scrollElements.forEach((element) => {
        if (elementInView(element, 1.25)) {
            element.classList.add('scrolled');
        } else if (elementOutofView(element)) {
            element.classList.remove('scrolled');
        }
    });
};

window.addEventListener('scroll', () => {
    displayScrollElements();
});

// ===== PARALLAX EFFECT =====
const hero = document.querySelector('.hero');
window.addEventListener('scroll', () => {
    if (hero) {
        const scrollPosition = window.pageYOffset;
        const heroHeight = hero.offsetHeight;
        
        if (scrollPosition < heroHeight) {
            hero.style.backgroundPosition = `0px ${scrollPosition * 0.5}px`;
        }
    }
});

// ===== PROJECT CARD TILT EFFECT (optional enhancement) =====
const projectCards = document.querySelectorAll('.project-card');
projectCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(0)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
    });
});

// ===== SCROLL TO TOP BUTTON =====
const createScrollToTopButton = () => {
    const button = document.createElement('button');
    button.innerHTML = '↑';
    button.classList.add('scroll-to-top');
    button.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        border: none;
        border-radius: 50%;
        font-size: 24px;
        cursor: pointer;
        display: none;
        align-items: center;
        justify-content: center;
        z-index: 999;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    `;

    document.body.appendChild(button);

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 500) {
            button.style.display = 'flex';
        } else {
            button.style.display = 'none';
        }
    });

    button.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    button.addEventListener('mouseover', () => {
        button.style.transform = 'translateY(-5px)';
    });

    button.addEventListener('mouseout', () => {
        button.style.transform = 'translateY(0)';
    });
};

createScrollToTopButton();

// ===== COUNTER ANIMATION FOR STATS =====
const stats = document.querySelectorAll('.stat h3');
const counterObserverOptions = {
    threshold: 0.5
};

const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const element = entry.target;
            const finalValue = parseInt(element.textContent);
            animateCounter(element, finalValue);
            counterObserver.unobserve(element);
        }
    });
}, counterObserverOptions);

stats.forEach(stat => counterObserver.observe(stat));

function animateCounter(element, finalValue) {
    let currentValue = 0;
    const increment = Math.ceil(finalValue / 30);
    
    const interval = setInterval(() => {
        currentValue += increment;
        if (currentValue >= finalValue) {
            currentValue = finalValue;
            clearInterval(interval);
        }
        element.textContent = currentValue + '+';
    }, 30);
}

// ===== LAZY LOADING IMAGES (for future image optimization) =====
const lazyImages = document.querySelectorAll('img[loading="lazy"]');
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('loading');
                imageObserver.unobserve(img);
            }
        });
    });

    lazyImages.forEach(img => imageObserver.observe(img));
}

// ===== PERFORMANCE OPTIMIZATION: Debounce scroll events =====
function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
}

const debouncedScroll = debounce(displayScrollElements, 100);
window.addEventListener('scroll', debouncedScroll, { passive: true });

console.log('Portfolio website loaded successfully!');
