# TaskCard Component Documentation

## Overview

The **TaskCard** component is a production-ready, accessible, and responsive task display component that follows the design system's dark theme with accent colors. It displays tasks with title, description, due date, and priority badge in a visually appealing and accessible manner.

## Features

✨ **Responsive Design**
- Adapts seamlessly from desktop (multi-column grid) to tablet (2 columns) to mobile (single column)
- Touch-friendly touch targets (minimum 44×44px)
- Optimized spacing and typography for each breakpoint

♿ **Accessibility (WCAG 2.1 AA Compliant)**
- Semantic HTML with proper heading hierarchy (h1-h6)
- ARIA labels and roles for screen reader users
- Keyboard navigation support (Tab, Enter, Space)
- Focus-visible states for keyboard users
- Color contrast ratios meeting WCAG AA standards
- Support for reduced motion preferences
- High contrast mode support
- Screen reader announcements for dynamic updates

🎨 **Design System Integration**
- Uses CSS custom properties (variables) from the design system
- Dark theme with accent colors (purple, pink, cyan)
- Smooth transitions and hover effects
- Glass-morphism inspired with subtle borders and shadows
- Consistent with event-countdown component aesthetic

🎯 **Features**
- Display task title with proper heading semantics
- Task description with line-wrapping support
- Due date with calendar icon
- Priority badge (High, Medium, Low) with color-coded styling
- Hover effects with transform and shadow enhancement
- Focus states for keyboard navigation
- Print-friendly styles

## Component Structure

### HTML Markup

```html
<div class="task-card" role="article" aria-label="Task: Design System Documentation - Due Dec 15 - High Priority">
  <div class="task-card__header">
    <h3 class="task-card__title">Design System Documentation</h3>
    <span class="task-card__badge task-card__badge--high" aria-label="High Priority">
      High
    </span>
  </div>
  <p class="task-card__description">
    Complete comprehensive documentation for all UI components including usage guidelines and accessibility notes.
  </p>
  <div class="task-card__footer">
    <span class="task-card__due-date" aria-label="Due date">
      <svg class="task-card__icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 10h10M7 14h7M19 3h-1V2h-2v1H8V2H6v1H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/>
      </svg>
      Dec 15, 2024
    </span>
  </div>
</div>
```

### CSS Classes

#### Component Classes (Block)
- `.task-card` - Root component container

#### Element Classes (BEM)
- `.task-card__header` - Header section with title and badge
- `.task-card__title` - Task title (should be h1-h6)
- `.task-card__badge` - Priority badge
- `.task-card__description` - Task description text
- `.task-card__footer` - Footer with due date
- `.task-card__due-date` - Due date with icon
- `.task-card__icon` - SVG icon container

#### Modifier Classes
- `.task-card__badge--high` - High priority styling (red/pink)
- `.task-card__badge--medium` - Medium priority styling (orange/amber)
- `.task-card__badge--low` - Low priority styling (cyan/turquoise)

#### Utility Classes
- `.sr-only` - Screen reader only text
- `.hidden` - Hide element

## Design System Variables

### Colors

```css
/* Base Colors */
--clr-bg:          #05070f;        /* Dark background */
--clr-surface:     #0d1124;        /* Card surface */
--clr-surface-2:   #131829;        /* Alternative surface */
--clr-border:      rgba(255, 255, 255, 0.08);  /* Subtle border */
--clr-accent:      #6c63ff;        /* Primary accent (purple) */
--clr-accent-2:    #ff6584;        /* Secondary accent (pink) */
--clr-accent-3:    #43e8d8;        /* Tertiary accent (cyan) */
--clr-text:        #e8eaf6;        /* Primary text */
--clr-text-muted:  #8892b0;        /* Muted text */
--clr-white:       #ffffff;        /* White */

/* Priority Colors */
--clr-priority-high:   #ff6584;     /* High priority (pink) */
--clr-priority-med:    #ffa500;     /* Medium priority (orange) */
--clr-priority-low:    #43e8d8;     /* Low priority (cyan) */
```

### Typography

```css
--font-main: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'Orbitron', 'Courier New', monospace;
```

### Spacing

```css
--space-xs:  4px;
--space-sm:  8px;
--space-md:  16px;
--space-lg:  24px;
--space-xl:  32px;
--space-2xl: 48px;
```

### Border Radius

```css
--radius-sm: 8px;
--radius-md: 16px;
--radius-lg: 24px;
```

### Shadows

```css
--shadow-card:  0 4px 32px rgba(0, 0, 0, 0.4);
--shadow-glow:  0 0 40px rgba(108, 99, 255, 0.3);
--shadow-hover: 0 8px 48px rgba(108, 99, 255, 0.2);
```

## Responsive Breakpoints

### Desktop (> 768px)
- Multi-column grid layout (360px minimum column width)
- Full spacing and typography
- Hover effects enabled

### Tablet (768px and below)
- 2-column or single-column grid
- Reduced padding and margins
- Optimized for touch

### Mobile (480px and below)
- Single-column layout (stacked)
- Reduced font sizes
- Reduced padding for screen real estate
- Header title stacks vertically with badge
- No transform on hover (better mobile UX)

## Keyboard Navigation

### Supported Keys

| Key | Action |
|-----|--------|
| `Tab` | Navigate to next focusable element |
| `Shift + Tab` | Navigate to previous focusable element |
| `Enter` / `Space` | Activate card (future enhancement for expandable content) |
| `Escape` | Close modal/overlay (future enhancement) |

### Focus Management

- TaskCard receives `tabindex="0"` to make it keyboard-accessible
- `:focus-visible` outline (2px solid accent color)
- Clear outline offset (4px) for visibility
- Glow shadow on focus for visual enhancement

## Accessibility Features

### Screen Reader Support

- Semantic `role="article"` for proper context
- Descriptive `aria-label` on card root with task summary
- Heading elements (h3) for title with proper hierarchy
- `aria-hidden="true"` on decorative icons
- `aria-label` on functional badges and date spans

### Color Contrast

All text meets WCAG AA standards:
- Title: `#e8eaf6` on `#0d1124` → ~13.5:1
- Description: `#8892b0` on `#0d1124` → ~6.2:1
- Badge text: Priority colors on semi-transparent backgrounds

### Reduced Motion Support

Users with `prefers-reduced-motion: reduce` see:
- No transitions or animations
- No transform effects on hover
- Instant visual state changes

### High Contrast Mode

- Border width increases from 1px to 2px
- Outline increases from 2px to 3px
- Badge borders become more visible

### Touch-Friendly

- Minimum touch target sizes: 44×44px (badges, etc.)
- Sufficient spacing between interactive elements
- No hover-dependent information (all content always visible)

## JavaScript API

### Initialization

#### Automatic Initialization
```javascript
// All TaskCards initialize automatically on page load
TaskCard.initializeAll();  // Called automatically
```

#### Manual Initialization
```javascript
const cardElement = document.querySelector('.task-card');
const card = new TaskCard(cardElement);
```

### Class: `TaskCard`

#### Constructor
```javascript
new TaskCard(element)
```
- **element** (HTMLElement) - The `.task-card` DOM element

#### Methods

##### init()
Initialize the card with keyboard navigation and event listeners.

```javascript
card.init();
```

##### setupKeyboardNavigation()
Configure keyboard event handlers for Tab, Enter, Space, and Escape keys.

```javascript
card.setupKeyboardNavigation();
```

##### setupInteractivity()
Setup hover and focus event handlers.

```javascript
card.setupInteractivity();
```

##### validateAccessibility()
Validate accessibility attributes and warn about missing ARIA labels or improper heading structure.

```javascript
card.validateAccessibility();
```

#### Static Methods

##### TaskCard.initializeAll()
Initialize all TaskCard instances on the page.

```javascript
TaskCard.initializeAll();
// Output: ✓ Initialized 6 TaskCard components
```

### Class: `TaskCardAccessibility`

#### Static Methods

##### announce(message)
Announce updates to screen readers using `aria-live` region.

```javascript
TaskCardAccessibility.announce('Task marked as complete');
```

##### createFocusTrap(element)
Create a focus trap for modal-like interactions.

```javascript
const modal = document.querySelector('.modal');
TaskCardAccessibility.createFocusTrap(modal);
```

### Utility Functions

#### getPriorityColor(priority)
Get the CSS color variable for a priority level.

```javascript
const color = getPriorityColor('high');  // Returns: 'var(--clr-priority-high)'
```

#### formatDueDate(date)
Format a date for display with smart formatting.

```javascript
formatDueDate(new Date('2024-12-15'));  // Returns: 'Dec 15, 2024'
formatDueDate(new Date());               // Returns: 'Today'
formatDueDate(new Date(Date.now() + 86400000));  // Returns: 'Tomorrow'
```

#### isOverdue(dueDate)
Check if a task is overdue.

```javascript
const overdue = isOverdue('2024-12-01');
```

## Programmatic Component Creation

Create TaskCard components dynamically:

```javascript
function createTaskCard(config) {
  const {
    title,
    description,
    dueDate,
    priority = 'medium',
    ariaLabel = ''
  } = config;

  const card = document.createElement('div');
  card.className = 'task-card';
  card.setAttribute('role', 'article');
  card.setAttribute('aria-label', ariaLabel || title);

  const priorityClass = `task-card__badge--${priority}`;
  card.innerHTML = `
    <div class="task-card__header">
      <h3 class="task-card__title">${title}</h3>
      <span class="task-card__badge ${priorityClass}" aria-label="${priority} priority">
        ${priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    </div>
    <p class="task-card__description">${description}</p>
    <div class="task-card__footer">
      <span class="task-card__due-date" aria-label="Due date">
        <svg class="task-card__icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7 10h10M7 14h7M19 3h-1V2h-2v1H8V2H6v1H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/>
        </svg>
        ${formatDueDate(dueDate)}
      </span>
    </div>
  `;

  new TaskCard(card);
  return card;
}

// Usage
const taskCard = createTaskCard({
  title: 'Review Design Mockups',
  description: 'Review and provide feedback on the latest design mockups from the team.',
  dueDate: new Date('2024-12-20'),
  priority: 'high',
  ariaLabel: 'Task: Review Design Mockups - Due Dec 20 - High Priority'
});

document.querySelector('.task-grid').appendChild(taskCard);
```

## Usage Examples

### Basic Usage in HTML

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="task-card.css">
</head>
<body>
  <div class="task-grid">
    <div class="task-card" role="article" aria-label="Task: Complete project - Due Dec 25 - High">
      <div class="task-card__header">
        <h3 class="task-card__title">Complete Project</h3>
        <span class="task-card__badge task-card__badge--high">High</span>
      </div>
      <p class="task-card__description">Finish all remaining tasks for the project launch.</p>
      <div class="task-card__footer">
        <span class="task-card__due-date" aria-label="Due date">
          <svg class="task-card__icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 10h10M7 14h7M19 3h-1V2h-2v1H8V2H6v1H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/>
          </svg>
          Dec 25, 2024
        </span>
      </div>
    </div>
  </div>

  <script src="task-card.js"></script>
</body>
</html>
```

### Grid Layout

```html
<section class="demo-section">
  <h2>My Tasks</h2>
  <div class="task-grid">
    <!-- TaskCards go here -->
  </div>
</section>
```

### Styling Container

```css
/* Customize grid layout */
.task-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
  gap: 24px;  /* Uses var(--space-lg) */
}

/* Single column for specific sections */
.task-grid--single {
  grid-template-columns: 1fr;
  max-width: 500px;
}
```

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

### CSS Features Used

- CSS Custom Properties (Variables) - IE 11 not supported
- CSS Grid - Excellent browser support
- CSS Flexbox - Excellent browser support
- CSS Focus-Visible - Polyfill available for older browsers
- Modern media queries - Excellent support

## Testing

### Accessibility Testing

1. **Keyboard Navigation**
   - Test Tab/Shift+Tab navigation
   - Verify Enter/Space activation
   - Check focus visibility on all browsers

2. **Screen Reader Testing**
   - Test with NVDA (Windows), JAWS (Windows), VoiceOver (macOS/iOS)
   - Verify ARIA labels are announced correctly
   - Check heading hierarchy

3. **Color Contrast**
   - Use WCAG Contrast Checker
   - Verify all text meets AA standards (4.5:1 for normal text)

4. **Responsive Testing**
   - Test on desktop, tablet, and mobile
   - Verify breakpoints at 768px and 480px
   - Check touch target sizes on mobile

### Visual Testing

1. Test hover states on desktop
2. Test focus states with keyboard
3. Verify print styles by printing page
4. Check reduced motion preferences in browser settings

## Browser DevTools Tips

### Chrome DevTools

1. **Accessibility Inspector**
   - Right-click card → Inspect → Elements tab
   - Check computed accessibility tree

2. **Focus Highlights**
   - Right-click card → Inspect
   - Check "Show focus indicators" in DevTools settings

3. **Responsive Design Mode**
   - Toggle device toolbar (Ctrl+Shift+M)
   - Test breakpoints at 768px and 480px

### Firefox DevTools

1. **Inspector**
   - Inspect element → Accessibility tab
   - Review ARIA labels and roles

2. **Responsive Design Mode**
   - Toggle device toolbar (Ctrl+Shift+M)
   - Test touch emulation

## Customization

### Changing Colors

Modify CSS variables in `:root`:

```css
:root {
  --clr-priority-high: #ff0000;    /* Your custom high priority color */
  --clr-priority-med: #ffff00;     /* Your custom medium priority color */
  --clr-priority-low: #00ff00;     /* Your custom low priority color */
}
```

### Changing Spacing

```css
:root {
  --space-md: 20px;  /* Increase from 16px */
  --space-lg: 32px;  /* Increase from 24px */
}
```

### Changing Typography

```css
:root {
  --font-main: 'Custom Font', sans-serif;
}

.task-card__title {
  font-size: 1.5rem;  /* Increase from 1.25rem */
}
```

### Changing Border Radius

```css
:root {
  --radius-md: 20px;  /* Increase from 16px */
}
```

## Performance Considerations

- Uses CSS variables for efficient theming
- CSS Grid for responsive layout (hardware accelerated)
- Minimal JavaScript (event listeners only)
- No external dependencies
- Smooth animations (GPU accelerated)

## Browser Rendering Performance

- **Paint**: Single paint per card with gradients
- **Layout**: Efficient grid layout with flexbox
- **Composite**: Hardware-accelerated transforms on hover

## File Size

- `task-card.css`: ~12 KB (uncompressed)
- `task-card.js`: ~8 KB (uncompressed)
- Total: ~20 KB (uncompressed)
- **Minified + Gzipped**: ~4-5 KB

## License

MIT (or your project's license)

## Support

For issues or questions about the TaskCard component, please refer to the main project documentation or open an issue in the repository.

---

## Changelog

### Version 1.0.0
- Initial release
- Full responsive design (desktop, tablet, mobile)
- Complete accessibility features (WCAG 2.1 AA)
- Keyboard navigation support
- Dark theme with priority badges
- Print-friendly styles
- Reduced motion support
- High contrast mode support
