# Personal Portfolio Website 🎨

A modern, fully responsive personal portfolio website built with vanilla HTML, CSS, and JavaScript. Features a dark theme with gradient colors, smooth animations, and interactive elements.

## 📋 Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Sections Overview](#sections-overview)
- [Technologies](#technologies)
- [Getting Started](#getting-started)
- [Customization](#customization)
- [Browser Support](#browser-support)

## ✨ Features

### 🎭 Hero Section
- Animated typing effect cycling through multiple professions
- Gradient text and CTA buttons
- Animated mouse scroll indicator
- Floating background circles with parallax effect

### 📖 About Section
- Professional bio with two paragraphs
- Statistics display (projects completed, clients, experience)
- Animated profile placeholder with SVG
- Hover effects on stat cards

### 🛠️ Skills Section
- Organized by categories (Frontend, Backend, Tools)
- 9 different technologies with proficiency levels
- Animated progress bars that fill on scroll
- Responsive 3-column grid

### 💼 Projects Section
- 6 featured projects in a responsive card grid
- Gradient image placeholders
- Hover overlay with "View Project" link
- Technology tags for each project
- Project descriptions and metadata

### 📬 Contact Section
- Contact information with icons (email, phone, location)
- Functional contact form with validation
- Real-time error messages
- Success confirmation on submission
- Accessible form inputs

### 🧭 Navigation
- Fixed navigation bar with smooth scroll links
- Active link highlighting based on scroll position
- Mobile-responsive hamburger menu
- Animated hamburger icon (3-bar to X transition)

## 📁 Project Structure

```
portfolio-website/
├── index.html          # HTML structure and content
├── styles.css          # All styling and animations
├── script.js           # JavaScript interactivity
└── README.md           # This file
```

## 🎯 Sections Overview

### Hero (`#home`)
- Welcomes visitors with your name and profession
- Typing animation that cycles through 4 different roles
- Animated scroll indicator at the bottom

### About (`#about`)
- Describes your background and expertise
- Shows key statistics
- Profile image placeholder (easily replaceable with actual image)

### Skills (`#skills`)
- Organized into 3 categories
- Progress bars show proficiency (0-100%)
- Animations trigger when scrolling into view

### Projects (`#projects`)
- 6 project cards with descriptions
- Technology tags for quick skill identification
- Gradient image placeholders (customize with real images)

### Contact (`#contact`)
- Contact information with direct links
- Form with validation
- Error messages for invalid inputs
- Success confirmation

## 🚀 Technologies

### HTML5
- Semantic markup
- Proper heading hierarchy
- Accessible form elements

### CSS3
- CSS Grid and Flexbox for layouts
- CSS Variables for theming
- CSS Animations and Keyframes
- Gradient backgrounds
- Media queries for responsiveness

### JavaScript (Vanilla)
- Intersection Observer API for animations
- Real-time form validation
- Typing effect animation
- Smooth scroll behavior
- Mobile menu toggle

## 🛠️ Getting Started

### Installation
No build tools required! Simply open `index.html` in your browser.

```bash
# Clone the repository
git clone <repository-url>

# Navigate to the directory
cd portfolio-website

# Open in browser (on macOS)
open index.html

# Or open in browser (on Windows)
start index.html

# Or simply double-click index.html
```

### Quick Customization

1. **Update Your Information**
   ```html
   <!-- In index.html -->
   <h1 class="hero-title">Hi, I'm <span class="gradient-text">Your Name</span></h1>
   ```

2. **Modify Typing Effect Professions**
   ```javascript
   // In script.js, around line 11
   const typingTexts = [
       'Your Profession 1',
       'Your Profession 2',
       'Your Profession 3',
       'Your Profession 4'
   ];
   ```

3. **Change Color Theme**
   ```css
   /* In styles.css, in :root */
   --primary-color: #00d4ff;      /* Change this to your primary color */
   --secondary-color: #0099ff;    /* Change this to your secondary color */
   --accent-color: #ff006e;       /* Change this to your accent color */
   ```

4. **Add Your Projects**
   - Replace project cards with your actual projects
   - Update project titles, descriptions, and tags
   - Replace gradient placeholders with real project images

5. **Update Contact Information**
   - Change email, phone, and location in the contact section
   - Update social media links in the footer

6. **Replace Profile Image**
   - Replace the SVG placeholder in the About section with your actual profile photo

## 📱 Customization Guide

### Colors
All colors are defined as CSS variables in `:root`. Modify them to match your brand:
```css
--primary-color: #00d4ff;        /* Cyan */
--secondary-color: #0099ff;      /* Blue */
--accent-color: #ff006e;         /* Pink */
--bg-dark: #0a0e27;              /* Dark background */
```

### Fonts
The default font is `Segoe UI`. Change it in the `body` selector:
```css
font-family: 'Your Font', sans-serif;
```

### Animation Speed
Modify animation durations in CSS (search for `animation:` or `transition:`):
```css
animation: fadeInUp 0.6s ease-out forwards;  /* Change 0.6s to your desired duration */
```

### Skills Proficiency
Update the `--progress` CSS variable on each progress bar:
```html
<div class="progress" style="--progress: 95%"></div>  <!-- Change 95% to your proficiency level -->
```

## 🔍 Form Validation

The contact form includes client-side validation for:
- **Name**: Minimum 2 characters required
- **Email**: Valid email format required
- **Subject**: Required field
- **Message**: Minimum 10 characters required

Validation happens both on blur and in real-time as the user types. Error messages are displayed below each field.

## 🎨 Animation Details

| Animation | Trigger | Duration |
|-----------|---------|----------|
| Typing Effect | Page Load | Continuous |
| Fade In | Page Load & Scroll | 0.6s |
| Float | On Load | 6-8s loop |
| Progress Fill | Scroll into View | 1.5s |
| Hover Transform | Mouse Over | 0.3s |
| Parallax | Scroll | Continuous |

## 📊 Performance

- **No external dependencies** - Pure HTML, CSS, and JavaScript
- **No jQuery or frameworks** - Built with vanilla JavaScript
- **Optimized animations** - Using CSS transforms for 60fps performance
- **Lazy loading ready** - Intersection Observer for efficient animation triggering
- **Mobile optimized** - Responsive design works on all device sizes

## ♿ Accessibility

- Semantic HTML5 structure
- Proper heading hierarchy (h1 → h6)
- Form labels for all inputs
- Focus states for keyboard navigation
- Color contrast meets WCAG standards
- Descriptive alt text for images

## 🌐 Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (iOS 13+)
- Opera: Full support
- Internet Explorer: Not supported (uses modern CSS/JS features)

## 📝 License

This portfolio template is free to use and customize for your personal projects.

## 🎯 Next Steps

1. Open `index.html` in your browser to see the portfolio
2. Customize the text, colors, and information to match your profile
3. Add real project images and descriptions
4. Replace the profile placeholder with your photo
5. Deploy to a hosting platform (GitHub Pages, Netlify, Vercel, etc.)

## 📧 Deployment

### GitHub Pages
1. Push to GitHub repository
2. Go to Settings → Pages
3. Set source to main branch
4. Your site will be live at `https://yourusername.github.io/repository-name`

### Netlify
1. Drag and drop the folder on netlify.com
2. Your site will be live in seconds

### Vercel
1. Connect your GitHub repository
2. Deploy with one click

---

**Enjoy your new portfolio! 🚀**
