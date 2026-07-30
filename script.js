/* ============================================
   TYPING EFFECT
   ============================================ */

const typingTexts = [
    'Full Stack Developer',
    'UI/UX Designer',
    'Problem Solver',
    'Creative Coder'
];

let textIndex = 0;
let charIndex = 0;
let isDeleting = false;
const typingSpeed = 100;
const deletingSpeed = 50;
const pauseTime = 2000;

function type() {
    const typingElement = document.getElementById('typing');
    const currentText = typingTexts[textIndex];

    if (isDeleting) {
        charIndex--;
    } else {
        charIndex++;
    }

    typingElement.textContent = currentText.substring(0, charIndex);

    let speed = isDeleting ? deletingSpeed : typingSpeed;

    if (!isDeleting && charIndex === currentText.length) {
        speed = pauseTime;
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        textIndex = (textIndex + 1) % typingTexts.length;
        speed = typingSpeed;
    }

    setTimeout(type, speed);
}

document.addEventListener('DOMContentLoaded', () => {
    type();
});

/* ============================================
   SMOOTH SCROLL & ACTIVE NAV LINK
   ============================================ */

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && document.querySelector(href)) {
            e.preventDefault();
            const target = document.querySelector(href);
            target.scrollIntoView({ behavior: 'smooth' });
            
            // Close mobile menu if open
            const navMenu = document.querySelector('.nav-menu');
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
            }
        }
    });
});

window.addEventListener('scroll', () => {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');

    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.clientHeight;

        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                const href = link.getAttribute('href');
                if (href === '#' + section.id) {
                    link.classList.add('active');
                }
            });
        }
    });
});

/* ============================================
   MOBILE MENU TOGGLE
   ============================================ */

const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    
    // Animate hamburger
    const bars = document.querySelectorAll('.bar');
    if (navMenu.classList.contains('active')) {
        bars[0].style.transform = 'rotate(-45deg) translate(-5px, 6px)';
        bars[1].style.opacity = '0';
        bars[2].style.transform = 'rotate(45deg) translate(-5px, -6px)';
    } else {
        bars[0].style.transform = 'none';
        bars[1].style.opacity = '1';
        bars[2].style.transform = 'none';
    }
});

/* ============================================
   PROGRESS BAR ANIMATION ON SCROLL
   ============================================ */

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'progress-fill 1.5s ease-out forwards';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all progress bars
document.querySelectorAll('.progress').forEach(bar => {
    observer.observe(bar);
});

/* ============================================
   FORM VALIDATION & SUBMISSION
   ============================================ */

const contactForm = document.getElementById('contactForm');

const validateField = (field) => {
    let isValid = true;
    const errorElement = document.getElementById(field.name + 'Error');

    if (field.value.trim() === '') {
        isValid = false;
        errorElement.textContent = 'This field is required';
        errorElement.classList.add('show');
        field.classList.add('error');
    } else if (field.name === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(field.value)) {
            isValid = false;
            errorElement.textContent = 'Please enter a valid email address';
            errorElement.classList.add('show');
            field.classList.add('error');
        } else {
            errorElement.classList.remove('show');
            field.classList.remove('error');
        }
    } else if (field.name === 'name' && field.value.trim().length < 2) {
        isValid = false;
        errorElement.textContent = 'Name must be at least 2 characters';
        errorElement.classList.add('show');
        field.classList.add('error');
    } else if (field.name === 'message' && field.value.trim().length < 10) {
        isValid = false;
        errorElement.textContent = 'Message must be at least 10 characters';
        errorElement.classList.add('show');
        field.classList.add('error');
    } else {
        errorElement.classList.remove('show');
        field.classList.remove('error');
    }

    return isValid;
};

// Real-time validation on input
contactForm.querySelectorAll('input, textarea').forEach(field => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
        if (field.classList.contains('error')) {
            validateField(field);
        }
    });
});

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const fields = contactForm.querySelectorAll('input, textarea');
    let formIsValid = true;

    fields.forEach(field => {
        if (!validateField(field)) {
            formIsValid = false;
        }
    });

    if (formIsValid) {
        // Simulate form submission
        const successMessage = document.getElementById('successMessage');
        successMessage.textContent = '✓ Message sent successfully! I\'ll get back to you soon.';
        successMessage.classList.add('show');

        // Reset form
        contactForm.reset();

        // Hide success message after 5 seconds
        setTimeout(() => {
            successMessage.classList.remove('show');
            successMessage.textContent = '';
        }, 5000);
    }
});

/* ============================================
   SCROLL REVEAL ANIMATIONS
   ============================================ */

const revealElements = document.querySelectorAll('.project-card, .skill-item, .about-content');

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '0';
            entry.target.style.animation = 'fadeInUp 0.6s ease-out forwards';
            revealObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.1
});

revealElements.forEach(el => {
    el.style.opacity = '0';
    revealObserver.observe(el);
});

/* ============================================
   ACTIVE NAV LINK STYLING
   ============================================ */

const style = document.createElement('style');
style.textContent = `
    .nav-link.active::after {
        width: 100%;
    }
    .nav-link.active {
        color: var(--primary-color);
    }
`;
document.head.appendChild(style);

/* ============================================
   PAGE LOAD ANIMATION
   ============================================ */

window.addEventListener('load', () => {
    document.body.style.animation = 'fadeIn 0.5s ease-out';
});

const fadeInStyle = document.createElement('style');
fadeInStyle.textContent = `
    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
`;
document.head.appendChild(fadeInStyle);

/* ============================================
   PARALLAX SCROLL EFFECT
   ============================================ */

window.addEventListener('scroll', () => {
    const circles = document.querySelectorAll('.gradient-circle');
    circles.forEach((circle, index) => {
        const scrollPosition = window.scrollY;
        const speed = 0.5 * (index + 1);
        circle.style.transform = `translateY(${scrollPosition * speed}px)`;
    });
});

/* ============================================
   INTERSECTION OBSERVER FOR HERO SECTION
   ============================================ */

const heroObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
        }
    });
}, { threshold: 0.5 });

const hero = document.querySelector('.hero');
if (hero) {
    hero.style.opacity = '0';
    hero.style.transition = 'opacity 0.6s ease-out';
    heroObserver.observe(hero);
}

/* ============================================
   UTILITY: LOG INITIALIZATION
   ============================================ */

console.log('✓ Portfolio website initialized successfully!');
console.log('✓ Typing effect active');
console.log('✓ Scroll animations enabled');
console.log('✓ Form validation ready');
