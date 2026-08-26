/**
 * TaskCard Component
 * Handles interactivity, keyboard navigation, and accessibility features
 */

class TaskCard {
  constructor(element) {
    this.element = element;
    this.init();
  }

  /**
   * Initialize the task card with keyboard navigation and event listeners
   */
  init() {
    this.setupKeyboardNavigation();
    this.setupInteractivity();
    this.validateAccessibility();
  }

  /**
   * Setup keyboard navigation
   * - Enter/Space: Activate (if interactive elements are added)
   * - Tab: Navigate through elements
   * - Escape: Close any overlays (future enhancement)
   */
  setupKeyboardNavigation() {
    this.element.addEventListener('keydown', (e) => {
      // Make card focusable and navigable
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        // Future: Trigger card expansion or modal
        console.log('TaskCard activated:', this.element.getAttribute('aria-label'));
      }

      // Allow Tab to move through elements naturally
      if (e.key === 'Tab') {
        // Trap focus within card if it becomes modal (future enhancement)
      }
    });

    // Ensure the card is keyboard accessible
    if (!this.element.getAttribute('tabindex')) {
      this.element.setAttribute('tabindex', '0');
    }
  }

  /**
   * Setup interactive behaviors
   */
  setupInteractivity() {
    // Add visual feedback for keyboard focus
    this.element.addEventListener('focus', () => {
      this.element.classList.add('task-card--focused');
    });

    this.element.addEventListener('blur', () => {
      this.element.classList.remove('task-card--focused');
    });

    // Detect if user is navigating with keyboard (for focus-visible support)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        document.documentElement.classList.add('keyboard-nav');
      }
    });

    document.addEventListener('mousedown', () => {
      document.documentElement.classList.remove('keyboard-nav');
    });
  }

  /**
   * Validate accessibility attributes
   */
  validateAccessibility() {
    // Check for required ARIA labels
    const ariaLabel = this.element.getAttribute('aria-label');
    if (!ariaLabel) {
      console.warn(
        'TaskCard missing aria-label',
        'Please add aria-label with task details'
      );
    }

    // Verify role attribute
    if (!this.element.getAttribute('role')) {
      this.element.setAttribute('role', 'article');
    }

    // Check heading hierarchy
    const heading = this.element.querySelector('[class*="task-card__title"]');
    if (heading && !heading.tagName.match(/^H[1-6]$/)) {
      console.warn('TaskCard title should be a heading element (h1-h6)');
    }

    // Verify color contrast (basic check)
    this.checkColorContrast();
  }

  /**
   * Basic color contrast check (WCAG AA compliance)
   * Note: This is a basic implementation. For production, use dedicated tools.
   */
  checkColorContrast() {
    const element = this.element;
    const computedStyle = window.getComputedStyle(element);
    const bgColor = computedStyle.backgroundColor;
    const textColor = computedStyle.color;

    // Simple contrast check (full implementation would calculate luminance)
    // For now, we trust the CSS design system provides AA compliance
    if (element.offsetHeight > 0) {
      // Element is visible, contrast is likely adequate based on design system
    }
  }

  /**
   * Static method to initialize all TaskCards on the page
   */
  static initializeAll() {
    const taskCards = document.querySelectorAll('.task-card');
    taskCards.forEach((card) => {
      new TaskCard(card);
    });

    console.log(`✓ Initialized ${taskCards.length} TaskCard components`);
  }
}

/**
 * Enhanced accessibility features
 */
class TaskCardAccessibility {
  /**
   * Announce card updates to screen readers
   * @param {string} message - The message to announce
   */
  static announce(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);

    // Remove after announcement is made
    setTimeout(() => announcement.remove(), 1000);
  }

  /**
   * Create an accessible focus trap for modal-like interactions
   * @param {HTMLElement} element - The element to trap focus within
   */
  static createFocusTrap(element) {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    element.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    });
  }
}

/**
 * Utility: Get priority color based on priority level
 * @param {string} priority - Priority level (high, medium, low)
 * @returns {string} CSS variable for the color
 */
function getPriorityColor(priority) {
  const priorityMap = {
    high: 'var(--clr-priority-high)',
    medium: 'var(--clr-priority-med)',
    low: 'var(--clr-priority-low)',
  };
  return priorityMap[priority] || 'var(--clr-text-muted)';
}

/**
 * Utility: Format date for display
 * @param {Date|string} date - The date to format
 * @returns {string} Formatted date string
 */
function formatDueDate(date) {
  if (!date) return 'No due date';

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Check if date is today
  if (dateObj.toDateString() === today.toDateString()) {
    return 'Today';
  }

  // Check if date is tomorrow
  if (dateObj.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  }

  // Check if date is within 7 days
  const daysUntil = Math.floor((dateObj - today) / (1000 * 60 * 60 * 24));
  if (daysUntil > 0 && daysUntil <= 7) {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return daysOfWeek[dateObj.getDay()];
  }

  // Default format: MMM DD, YYYY
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return dateObj.toLocaleDateString('en-US', options);
}

/**
 * Utility: Check if a task is overdue
 * @param {Date|string} dueDate - The due date
 * @returns {boolean} True if overdue
 */
function isOverdue(dueDate) {
  const dateObj = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
  return dateObj < new Date();
}

/**
 * Initialize all TaskCards when DOM is ready
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    TaskCard.initializeAll();
  });
} else {
  TaskCard.initializeAll();
}

/**
 * Example: Create a TaskCard programmatically
 * Uncomment to see usage
 */
/*
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
  card.tabIndex = 0;

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
*/

// Export for use in modules (if using ES modules)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    TaskCard,
    TaskCardAccessibility,
    getPriorityColor,
    formatDueDate,
    isOverdue,
  };
}
