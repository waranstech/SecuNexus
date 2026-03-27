/**
 * SecuNexa Website - Main JavaScript
 * Vanilla JS, no dependencies
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // -------------------------------------------------------
  // 1. Mobile Navigation Toggle
  // -------------------------------------------------------
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navOverlay = document.querySelector('.nav-overlay');

  function openMobileNav() {
    if (!navMenu) return;
    navMenu.classList.add('is-open');
    navToggle?.classList.add('is-active');
    navOverlay?.classList.add('is-visible');
    document.body.classList.add('nav-open');
  }

  function closeMobileNav() {
    if (!navMenu) return;
    navMenu.classList.remove('is-open');
    navToggle?.classList.remove('is-active');
    navOverlay?.classList.remove('is-visible');
    document.body.classList.remove('nav-open');
  }

  navToggle?.addEventListener('click', () => {
    navMenu.classList.contains('is-open') ? closeMobileNav() : openMobileNav();
  });

  navOverlay?.addEventListener('click', closeMobileNav);

  // Close mobile nav when a link is clicked
  navMenu?.addEventListener('click', (e) => {
    if (e.target.closest('a')) closeMobileNav();
  });

  // -------------------------------------------------------
  // 2. Sticky Header on Scroll
  // -------------------------------------------------------
  const header = document.querySelector('.site-header');
  const stickyThreshold = 50;

  function handleStickyHeader() {
    if (!header) return;
    if (window.scrollY > stickyThreshold) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  window.addEventListener('scroll', handleStickyHeader, { passive: true });
  handleStickyHeader();

  // -------------------------------------------------------
  // 3. Smooth Scroll for Anchor Links
  // -------------------------------------------------------
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;

    const targetId = anchor.getAttribute('href');
    if (targetId === '#' || targetId === '#!') return;

    const target = document.querySelector(targetId);
    if (!target) return;

    e.preventDefault();
    const headerOffset = header ? header.offsetHeight : 0;
    const top = target.getBoundingClientRect().top + window.scrollY - headerOffset;

    window.scrollTo({ top, behavior: 'smooth' });
  });

  // -------------------------------------------------------
  // 4. Animated Counters
  // -------------------------------------------------------
  const counters = document.querySelectorAll('[data-counter]');
  const animatedCounters = new Set();

  function animateCounter(el) {
    if (animatedCounters.has(el)) return;
    animatedCounters.add(el);

    const target = parseInt(el.getAttribute('data-counter'), 10);
    const suffix = el.getAttribute('data-counter-suffix') || '';
    const prefix = el.getAttribute('data-counter-prefix') || '';
    const duration = parseInt(el.getAttribute('data-counter-duration'), 10) || 2000;
    const start = performance.now();

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);

      el.textContent = prefix + current.toLocaleString() + suffix;

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }

  if (counters.length) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    counters.forEach((el) => counterObserver.observe(el));
  }

  // -------------------------------------------------------
  // 5. Tab Switching
  // -------------------------------------------------------
  document.addEventListener('click', (e) => {
    const tabBtn = e.target.closest('[data-tab]');
    if (!tabBtn) return;

    const tabGroup = tabBtn.closest('[data-tab-group]') || tabBtn.parentElement?.parentElement;
    if (!tabGroup) return;

    const targetPanel = tabBtn.getAttribute('data-tab');

    // Deactivate all tabs in this group
    tabGroup.querySelectorAll('[data-tab]').forEach((btn) => {
      btn.classList.remove('is-active');
      btn.setAttribute('aria-selected', 'false');
    });

    // Activate clicked tab
    tabBtn.classList.add('is-active');
    tabBtn.setAttribute('aria-selected', 'true');

    // Toggle panels
    const panelContainer =
      tabGroup.querySelector('.tab-panels') ||
      tabGroup.closest('section')?.querySelector('.tab-panels') ||
      document.querySelector(`.tab-panels[data-tab-group="${tabGroup.getAttribute('data-tab-group')}"]`);

    if (panelContainer) {
      panelContainer.querySelectorAll('[data-tab-panel]').forEach((panel) => {
        panel.classList.toggle('is-active', panel.getAttribute('data-tab-panel') === targetPanel);
      });
    }
  });

  // -------------------------------------------------------
  // 6. Accordion / FAQ Toggle
  // -------------------------------------------------------
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('.accordion-trigger, [data-accordion]');
    if (!trigger) return;

    const item = trigger.closest('.accordion-item');
    if (!item) return;

    const content = item.querySelector('.accordion-content');
    if (!content) return;

    const isOpen = item.classList.contains('is-open');

    // Optionally close siblings (single-open mode)
    const accordion = item.closest('.accordion');
    if (accordion && accordion.hasAttribute('data-single-open')) {
      accordion.querySelectorAll('.accordion-item.is-open').forEach((openItem) => {
        if (openItem !== item) {
          openItem.classList.remove('is-open');
          const c = openItem.querySelector('.accordion-content');
          if (c) {
            c.style.maxHeight = null;
            c.setAttribute('aria-hidden', 'true');
          }
        }
      });
    }

    item.classList.toggle('is-open', !isOpen);
    trigger.setAttribute('aria-expanded', String(!isOpen));

    if (!isOpen) {
      content.style.maxHeight = content.scrollHeight + 'px';
      content.setAttribute('aria-hidden', 'false');
    } else {
      content.style.maxHeight = null;
      content.setAttribute('aria-hidden', 'true');
    }
  });

  // -------------------------------------------------------
  // 7. Modal Open / Close
  // -------------------------------------------------------
  let activeModal = null;

  function openModal(modalId) {
    const modal = document.querySelector(modalId);
    if (!modal) return;

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    activeModal = modal;

    // Focus first focusable element
    const focusable = modal.querySelector(
      'input:not([type="hidden"]), button, textarea, select, a[href]'
    );
    focusable?.focus();

    // Trap focus inside modal
    modal.addEventListener('keydown', trapFocus);
  }

  function closeModal() {
    if (!activeModal) return;
    activeModal.classList.remove('is-open');
    activeModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    activeModal.removeEventListener('keydown', trapFocus);
    activeModal = null;
  }

  function trapFocus(e) {
    if (e.key !== 'Tab') return;
    const modal = activeModal;
    if (!modal) return;

    const focusable = modal.querySelectorAll(
      'input:not([type="hidden"]), button, textarea, select, a[href], [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  // Open modal via data attribute
  document.addEventListener('click', (e) => {
    const opener = e.target.closest('[data-modal-open]');
    if (opener) {
      e.preventDefault();
      openModal(opener.getAttribute('data-modal-open'));
      return;
    }

    const closer = e.target.closest('[data-modal-close]');
    if (closer) {
      e.preventDefault();
      closeModal();
      return;
    }

    // Close when clicking backdrop
    if (e.target.classList.contains('modal') && e.target.classList.contains('is-open')) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && activeModal) closeModal();
  });

  // -------------------------------------------------------
  // 8. Form Validation
  // -------------------------------------------------------
  const personalDomains = [
    'gmail.com',
    'yahoo.com',
    'yahoo.co',
    'hotmail.com',
    'outlook.com',
    'aol.com',
    'icloud.com',
    'mail.com',
    'protonmail.com',
    'zoho.com',
    'yandex.com',
    'gmx.com',
    'live.com',
    'me.com',
  ];

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function isPersonalEmail(email) {
    const domain = email.split('@')[1]?.toLowerCase();
    return personalDomains.includes(domain);
  }

  function validateField(field) {
    const value = field.value.trim();
    const type = field.type;
    const isRequired = field.hasAttribute('required');
    const isBusinessForm = field.closest('[data-business-form]') !== null;
    let error = '';

    // Required check
    if (isRequired && !value) {
      error = field.getAttribute('data-error-required') || 'This field is required.';
    }
    // Email format
    else if (type === 'email' && value && !isValidEmail(value)) {
      error = 'Please enter a valid email address.';
    }
    // Block personal emails on business forms
    else if (type === 'email' && value && isBusinessForm && isPersonalEmail(value)) {
      error = 'Please use your business email address.';
    }
    // Min length
    else if (field.minLength > 0 && value.length < field.minLength) {
      error = `Must be at least ${field.minLength} characters.`;
    }
    // Pattern
    else if (field.pattern && value && !new RegExp(field.pattern).test(value)) {
      error = field.getAttribute('data-error-pattern') || 'Invalid format.';
    }

    setFieldError(field, error);
    return !error;
  }

  function setFieldError(field, message) {
    const wrapper = field.closest('.form-group') || field.parentElement;
    let errorEl = wrapper.querySelector('.field-error');

    if (message) {
      field.classList.add('is-invalid');
      field.classList.remove('is-valid');
      if (!errorEl) {
        errorEl = document.createElement('span');
        errorEl.className = 'field-error';
        errorEl.setAttribute('role', 'alert');
        wrapper.appendChild(errorEl);
      }
      errorEl.textContent = message;
    } else {
      field.classList.remove('is-invalid');
      if (field.value.trim()) field.classList.add('is-valid');
      if (errorEl) errorEl.remove();
    }
  }

  // Live validation on blur
  document.addEventListener(
    'blur',
    (e) => {
      if (e.target.matches('input, textarea, select')) {
        validateField(e.target);
      }
    },
    true
  );

  // Clear error on input
  document.addEventListener('input', (e) => {
    if (e.target.matches('.is-invalid')) {
      setFieldError(e.target, '');
    }
  });

  // -------------------------------------------------------
  // 9. TechPoint Comparison Card Click Handler
  // -------------------------------------------------------
  document.addEventListener('click', (e) => {
    const compareBtn = e.target.closest('.btn-view-comparison, [data-action="view-comparison"]');
    if (!compareBtn) return;

    e.preventDefault();
    openModal('#registration-modal');
  });

  // -------------------------------------------------------
  // 10. Back to Top Button
  // -------------------------------------------------------
  const backToTop = document.querySelector('.back-to-top');
  const backToTopThreshold = 400;

  function handleBackToTop() {
    if (!backToTop) return;
    backToTop.classList.toggle('is-visible', window.scrollY > backToTopThreshold);
  }

  window.addEventListener('scroll', handleBackToTop, { passive: true });
  handleBackToTop();

  backToTop?.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // -------------------------------------------------------
  // 11. Intersection Observer for Fade-In Animations
  // -------------------------------------------------------
  const animatedElements = document.querySelectorAll(
    '.fade-in, .slide-up, .slide-in-left, .slide-in-right, [data-animate]'
  );

  if (animatedElements.length) {
    const animationObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const delay = entry.target.getAttribute('data-animate-delay') || 0;
            setTimeout(() => {
              entry.target.classList.add('is-visible');
            }, parseInt(delay, 10));
            animationObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    animatedElements.forEach((el) => animationObserver.observe(el));
  }

  // -------------------------------------------------------
  // 12. Cookie Consent Banner
  // -------------------------------------------------------
  const cookieBanner = document.querySelector('.cookie-banner');
  const COOKIE_KEY = 'secunexa_cookie_consent';

  function showCookieBanner() {
    if (!cookieBanner) return;
    if (localStorage.getItem(COOKIE_KEY)) return;
    cookieBanner.classList.add('is-visible');
  }

  function acceptCookies() {
    localStorage.setItem(COOKIE_KEY, 'accepted');
    cookieBanner?.classList.remove('is-visible');
  }

  function declineCookies() {
    localStorage.setItem(COOKIE_KEY, 'declined');
    cookieBanner?.classList.remove('is-visible');
  }

  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-cookie-accept]')) {
      e.preventDefault();
      acceptCookies();
    } else if (e.target.closest('[data-cookie-decline]')) {
      e.preventDefault();
      declineCookies();
    }
  });

  // Show banner after a short delay
  setTimeout(showCookieBanner, 1000);

  // -------------------------------------------------------
  // 13. Newsletter / Form Submission Handler
  // -------------------------------------------------------
  document.addEventListener('submit', (e) => {
    const form = e.target.closest('form');
    if (!form) return;

    // Validate all fields first
    const fields = form.querySelectorAll('input, textarea, select');
    let isValid = true;

    fields.forEach((field) => {
      if (!validateField(field)) isValid = false;
    });

    if (!isValid) {
      e.preventDefault();
      // Focus the first invalid field
      const firstInvalid = form.querySelector('.is-invalid');
      firstInvalid?.focus();
      return;
    }

    // If the form has data-ajax, handle via JS
    if (form.hasAttribute('data-ajax')) {
      e.preventDefault();

      const submitBtn = form.querySelector('[type="submit"]');
      const originalText = submitBtn?.textContent;
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';
      }

      // Simulate submission (replace with real endpoint as needed)
      setTimeout(() => {
        // Show success message
        const successEl = form.querySelector('.form-success') || createSuccessMessage(form);
        successEl.classList.add('is-visible');
        form.reset();

        // Remove validation classes
        fields.forEach((f) => {
          f.classList.remove('is-valid', 'is-invalid');
        });

        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }

        // Hide success after a delay
        setTimeout(() => {
          successEl.classList.remove('is-visible');
        }, 5000);
      }, 800);
    }
  });

  function createSuccessMessage(form) {
    const el = document.createElement('div');
    el.className = 'form-success';
    el.setAttribute('role', 'status');
    el.textContent =
      form.getAttribute('data-success-message') || 'Thank you! Your submission has been received.';
    form.appendChild(el);
    return el;
  }

  // -------------------------------------------------------
  // 14. Active Nav Link Highlighting
  // -------------------------------------------------------
  function setActiveNavLink() {
    const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
    const navLinks = document.querySelectorAll('.nav-menu a, .nav-link');

    navLinks.forEach((link) => {
      const linkPath = link.getAttribute('href')?.replace(/\/$/, '') || '/';

      // Exact match or starts-with for sub-pages
      const isActive =
        linkPath === currentPath ||
        (linkPath !== '/' && currentPath.startsWith(linkPath));

      link.classList.toggle('is-active', isActive);

      if (isActive) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  setActiveNavLink();

  // -------------------------------------------------------
  // 15. Search / Filtering (Blog & TechPoint)
  // -------------------------------------------------------
  const searchInput = document.querySelector('[data-search]');
  const searchTarget = searchInput?.getAttribute('data-search');

  if (searchInput && searchTarget) {
    let debounceTimer;

    searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => filterItems(searchInput.value), 300);
    });
  }

  function filterItems(query) {
    const target = document.querySelector(searchTarget);
    if (!target) return;

    const items = target.querySelectorAll('[data-searchable]');
    const normalizedQuery = query.toLowerCase().trim();
    let visibleCount = 0;

    items.forEach((item) => {
      const text = (item.getAttribute('data-searchable') || item.textContent).toLowerCase();
      const tags = item.getAttribute('data-tags')?.toLowerCase() || '';
      const match = !normalizedQuery || text.includes(normalizedQuery) || tags.includes(normalizedQuery);

      item.style.display = match ? '' : 'none';
      if (match) visibleCount++;
    });

    // Show/hide no-results message
    let noResults = target.querySelector('.no-results');
    if (visibleCount === 0) {
      if (!noResults) {
        noResults = document.createElement('div');
        noResults.className = 'no-results';
        noResults.textContent = 'No results found. Try a different search term.';
        target.appendChild(noResults);
      }
      noResults.style.display = '';
    } else if (noResults) {
      noResults.style.display = 'none';
    }
  }

  // Category filter buttons
  document.addEventListener('click', (e) => {
    const filterBtn = e.target.closest('[data-filter]');
    if (!filterBtn) return;

    const group = filterBtn.closest('.filter-group');
    const category = filterBtn.getAttribute('data-filter');
    const targetSelector = group?.getAttribute('data-filter-target') || filterBtn.getAttribute('data-filter-target');
    const container = document.querySelector(targetSelector);
    if (!container) return;

    // Update active filter button
    group?.querySelectorAll('[data-filter]').forEach((btn) => btn.classList.remove('is-active'));
    filterBtn.classList.add('is-active');

    // Filter items
    container.querySelectorAll('[data-category]').forEach((item) => {
      const match = category === 'all' || item.getAttribute('data-category') === category;
      item.style.display = match ? '' : 'none';
    });
  });

  // -------------------------------------------------------
  // 16. Testimonial Slider / Carousel
  // -------------------------------------------------------
  const sliders = document.querySelectorAll('.testimonial-slider, [data-slider]');

  sliders.forEach((slider) => {
    const track = slider.querySelector('.slider-track');
    const slides = slider.querySelectorAll('.slider-slide');
    const prevBtn = slider.querySelector('.slider-prev');
    const nextBtn = slider.querySelector('.slider-next');
    const dots = slider.querySelector('.slider-dots');

    if (!track || slides.length === 0) return;

    let current = 0;
    let autoplayTimer;
    const autoplayDelay = parseInt(slider.getAttribute('data-autoplay'), 10) || 5000;

    // Build dots
    if (dots) {
      slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'slider-dot' + (i === 0 ? ' is-active' : '');
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        dot.addEventListener('click', () => goTo(i));
        dots.appendChild(dot);
      });
    }

    function goTo(index) {
      current = ((index % slides.length) + slides.length) % slides.length;
      track.style.transform = `translateX(-${current * 100}%)`;

      // Update dots
      dots?.querySelectorAll('.slider-dot').forEach((d, i) => {
        d.classList.toggle('is-active', i === current);
      });

      // Update slides aria
      slides.forEach((s, i) => {
        s.setAttribute('aria-hidden', String(i !== current));
      });

      resetAutoplay();
    }

    function next() {
      goTo(current + 1);
    }

    function prev() {
      goTo(current - 1);
    }

    prevBtn?.addEventListener('click', prev);
    nextBtn?.addEventListener('click', next);

    // Touch/swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    track.addEventListener(
      'touchstart',
      (e) => {
        touchStartX = e.changedTouches[0].screenX;
      },
      { passive: true }
    );

    track.addEventListener(
      'touchend',
      (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
          diff > 0 ? next() : prev();
        }
      },
      { passive: true }
    );

    // Autoplay
    function startAutoplay() {
      if (autoplayDelay > 0 && slides.length > 1) {
        autoplayTimer = setInterval(next, autoplayDelay);
      }
    }

    function resetAutoplay() {
      clearInterval(autoplayTimer);
      startAutoplay();
    }

    // Pause on hover
    slider.addEventListener('mouseenter', () => clearInterval(autoplayTimer));
    slider.addEventListener('mouseleave', startAutoplay);

    goTo(0);
    startAutoplay();
  });

  // -------------------------------------------------------
  // 17. Lazy Loading for Images
  // -------------------------------------------------------
  const lazyImages = document.querySelectorAll('img[data-src], [data-bg]');

  if (lazyImages.length) {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            const el = entry.target;

            if (el.hasAttribute('data-src')) {
              el.src = el.getAttribute('data-src');
              if (el.hasAttribute('data-srcset')) {
                el.srcset = el.getAttribute('data-srcset');
              }
              el.removeAttribute('data-src');
              el.removeAttribute('data-srcset');
              el.classList.add('is-loaded');
            }

            if (el.hasAttribute('data-bg')) {
              el.style.backgroundImage = `url(${el.getAttribute('data-bg')})`;
              el.removeAttribute('data-bg');
              el.classList.add('is-loaded');
            }

            imageObserver.unobserve(el);
          });
        },
        { rootMargin: '200px 0px' }
      );

      lazyImages.forEach((img) => imageObserver.observe(img));
    } else {
      // Fallback: load all immediately
      lazyImages.forEach((el) => {
        if (el.hasAttribute('data-src')) {
          el.src = el.getAttribute('data-src');
        }
        if (el.hasAttribute('data-bg')) {
          el.style.backgroundImage = `url(${el.getAttribute('data-bg')})`;
        }
      });
    }
  }

  // -------------------------------------------------------
  // 18. Copy Code Block to Clipboard
  // -------------------------------------------------------
  document.addEventListener('click', (e) => {
    const copyBtn = e.target.closest('[data-copy], .btn-copy-code');
    if (!copyBtn) return;

    e.preventDefault();

    const targetSelector = copyBtn.getAttribute('data-copy');
    const codeBlock = targetSelector
      ? document.querySelector(targetSelector)
      : copyBtn.closest('.code-block')?.querySelector('code, pre');

    if (!codeBlock) return;

    const text = codeBlock.textContent;

    navigator.clipboard
      .writeText(text)
      .then(() => {
        const originalText = copyBtn.textContent;
        const originalHTML = copyBtn.innerHTML;

        copyBtn.textContent = 'Copied!';
        copyBtn.classList.add('is-copied');

        setTimeout(() => {
          copyBtn.innerHTML = originalHTML;
          copyBtn.classList.remove('is-copied');
        }, 2000);
      })
      .catch(() => {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();

        try {
          document.execCommand('copy');
          copyBtn.textContent = 'Copied!';
          copyBtn.classList.add('is-copied');
          setTimeout(() => {
            copyBtn.classList.remove('is-copied');
          }, 2000);
        } catch {
          copyBtn.textContent = 'Failed';
        }

        document.body.removeChild(textarea);
      });
  });

  // -------------------------------------------------------
  // 19. Print Report Button Handler
  // -------------------------------------------------------
  document.addEventListener('click', (e) => {
    const printBtn = e.target.closest('[data-print], .btn-print-report');
    if (!printBtn) return;

    e.preventDefault();

    const targetSelector = printBtn.getAttribute('data-print');
    if (targetSelector) {
      // Print specific section
      const section = document.querySelector(targetSelector);
      if (!section) return;

      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      // Copy stylesheets
      const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
        .map((s) => s.outerHTML)
        .join('\n');

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${document.title} - Print</title>
          ${styles}
          <style>
            body { padding: 2rem; }
            .no-print { display: none !important; }
          </style>
        </head>
        <body>${section.innerHTML}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    } else {
      window.print();
    }
  });
});
