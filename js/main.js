/**
 * SecuNexa Website - Main JavaScript
 * Vanilla JS, no dependencies
 */
document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // -------------------------------------------------------
  // 1. Mobile Navigation Toggle (handles all nav variants)
  // -------------------------------------------------------
  const mobileToggle = document.querySelector('.mobile-toggle, .mobile-menu-toggle, .nav__toggle, .hamburger, #navToggle');
  const navMenu = document.querySelector('.nav-links, .nav-list, .nav-menu, .nav__menu, .main-nav, #navMenu');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      navMenu.classList.toggle('is-open');
      mobileToggle.classList.toggle('active');
      document.body.classList.toggle('nav-open');
    });

    // Close nav when clicking a link
    navMenu.addEventListener('click', (e) => {
      if (e.target.closest('a') && window.innerWidth < 1024) {
        navMenu.classList.remove('active', 'is-open');
        mobileToggle.classList.remove('active');
        document.body.classList.remove('nav-open');
      }
    });
  }

  // -------------------------------------------------------
  // 2. Dropdown Menus (hover on desktop, click on mobile)
  // -------------------------------------------------------
  const dropdowns = document.querySelectorAll('.dropdown, .has-dropdown, .nav__dropdown');

  dropdowns.forEach(dropdown => {
    const trigger = dropdown.querySelector('a, .dropdown-trigger, .dropdown-toggle');
    const menu = dropdown.querySelector('.dropdown-menu, .nav__dropdown-menu');

    if (trigger && menu) {
      trigger.addEventListener('click', (e) => {
        if (window.innerWidth < 1024) {
          e.preventDefault();
          menu.classList.toggle('active');
          dropdown.classList.toggle('active');
        }
      });
    }
  });

  // -------------------------------------------------------
  // 3. Sticky Header
  // -------------------------------------------------------
  const header = document.querySelector('.header, .site-header, #header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('is-scrolled', window.scrollY > 50);
      header.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });
  }

  // -------------------------------------------------------
  // 4. Smooth Scroll for Anchor Links
  // -------------------------------------------------------
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;
    const targetId = anchor.getAttribute('href');
    if (targetId === '#' || targetId === '#!' || targetId.length < 2) return;
    const target = document.querySelector(targetId);
    if (!target) return;
    e.preventDefault();
    const headerOffset = header ? header.offsetHeight : 0;
    const top = target.getBoundingClientRect().top + window.scrollY - headerOffset - 20;
    window.scrollTo({ top, behavior: 'smooth' });
  });

  // -------------------------------------------------------
  // 5. FAQ Accordion Toggle
  // -------------------------------------------------------
  document.addEventListener('click', (e) => {
    const faqQuestion = e.target.closest('.faq-question');
    if (!faqQuestion) return;

    const faqItem = faqQuestion.closest('.faq-item');
    if (!faqItem) return;

    const faqAnswer = faqItem.querySelector('.faq-answer');
    if (!faqAnswer) return;

    const isOpen = faqItem.classList.contains('active');

    // Close other open items in same category
    const category = faqItem.closest('.faq-category, .faq-list');
    if (category) {
      category.querySelectorAll('.faq-item.active').forEach(item => {
        if (item !== faqItem) {
          item.classList.remove('active');
          const answer = item.querySelector('.faq-answer');
          if (answer) answer.style.maxHeight = null;
          const question = item.querySelector('.faq-question');
          if (question) question.setAttribute('aria-expanded', 'false');
        }
      });
    }

    faqItem.classList.toggle('active', !isOpen);
    faqQuestion.setAttribute('aria-expanded', String(!isOpen));

    if (!isOpen) {
      faqAnswer.style.maxHeight = faqAnswer.scrollHeight + 'px';
    } else {
      faqAnswer.style.maxHeight = null;
    }
  });

  // -------------------------------------------------------
  // 6. Animated Counters
  // -------------------------------------------------------
  const counters = document.querySelectorAll('[data-counter]');
  const animatedCounters = new Set();

  function animateCounter(el) {
    if (animatedCounters.has(el)) return;
    animatedCounters.add(el);
    const target = parseInt(el.getAttribute('data-counter'), 10);
    const suffix = el.getAttribute('data-counter-suffix') || '';
    const prefix = el.getAttribute('data-counter-prefix') || '';
    const duration = 2000;
    const start = performance.now();

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      el.textContent = prefix + current.toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  if (counters.length) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    counters.forEach(el => counterObserver.observe(el));
  }

  // -------------------------------------------------------
  // 7. Form Handling
  // -------------------------------------------------------
  document.addEventListener('submit', (e) => {
    const form = e.target.closest('form');
    if (!form) return;
    e.preventDefault();

    const submitBtn = form.querySelector('[type="submit"], .btn-primary, .btn');
    const originalText = submitBtn?.textContent;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';
    }

    // Simulate submission
    setTimeout(() => {
      alert('Thank you! Your submission has been received. Our team will contact you shortly.');
      form.reset();
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    }, 800);
  });

  // -------------------------------------------------------
  // 8. Blog Filter Buttons
  // -------------------------------------------------------
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active from all
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const category = btn.getAttribute('data-filter') || btn.textContent.trim().toLowerCase();
      const cards = document.querySelectorAll('.blog-card, [data-category]');

      cards.forEach(card => {
        if (category === 'all') {
          card.style.display = '';
        } else {
          const cardCat = card.getAttribute('data-category') || '';
          card.style.display = cardCat.includes(category) ? '' : 'none';
        }
      });
    });
  });

  // -------------------------------------------------------
  // 9. Blog Search
  // -------------------------------------------------------
  const blogSearch = document.querySelector('.blog-search-input, [data-search]');
  if (blogSearch) {
    blogSearch.addEventListener('input', () => {
      const query = blogSearch.value.toLowerCase().trim();
      const cards = document.querySelectorAll('.blog-card, .tp-card, [data-searchable]');
      cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = (!query || text.includes(query)) ? '' : 'none';
      });
    });
  }

  // -------------------------------------------------------
  // 10. TechPoint Gated Content - Registration Overlay
  // -------------------------------------------------------
  document.addEventListener('click', (e) => {
    const unlockBtn = e.target.closest('.btn-unlock, [data-action="unlock"]');
    if (unlockBtn) {
      e.preventDefault();
      // Check if form fields are filled
      const form = unlockBtn.closest('form') || unlockBtn.closest('.gated-overlay, .comparison-locked');
      if (form) {
        const email = form.querySelector('input[type="email"]');
        const name = form.querySelector('input[name="name"], input[type="text"]');
        if (email && email.value && name && name.value) {
          // Unlock the content
          const blurredSection = document.querySelector('.comparison-locked, .blurred-content, .gated-content');
          if (blurredSection) {
            blurredSection.style.filter = 'none';
            blurredSection.style.pointerEvents = 'auto';
          }
          const overlay = document.querySelector('.gated-overlay, .unlock-overlay');
          if (overlay) overlay.style.display = 'none';
          alert('Thank you! Full comparison unlocked.');
        } else {
          alert('Please fill in your name and email to unlock the full comparison.');
        }
      }
    }
  });

  // -------------------------------------------------------
  // 11. Back to Top
  // -------------------------------------------------------
  const backToTop = document.querySelector('.back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      backToTop.classList.toggle('is-visible', window.scrollY > 400);
      backToTop.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });

    backToTop.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // -------------------------------------------------------
  // 12. Intersection Observer for Fade-In Animations
  // -------------------------------------------------------
  const animatedElements = document.querySelectorAll('.fade-in, .slide-up, [data-animate]');
  if (animatedElements.length) {
    const animObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible', 'visible');
          animObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    animatedElements.forEach(el => animObs.observe(el));
  }

  // -------------------------------------------------------
  // 13. FAQ Nav Link Active State
  // -------------------------------------------------------
  const faqNavLinks = document.querySelectorAll('.faq-nav-link');
  faqNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      faqNavLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });

  // -------------------------------------------------------
  // 14. Tab Switching
  // -------------------------------------------------------
  document.addEventListener('click', (e) => {
    const tabBtn = e.target.closest('[data-tab]');
    if (!tabBtn) return;
    const tabGroup = tabBtn.closest('[data-tab-group]') || tabBtn.parentElement?.parentElement;
    if (!tabGroup) return;
    const targetPanel = tabBtn.getAttribute('data-tab');

    tabGroup.querySelectorAll('[data-tab]').forEach(btn => btn.classList.remove('active', 'is-active'));
    tabBtn.classList.add('active', 'is-active');

    const panels = tabGroup.querySelectorAll('[data-tab-panel]') ||
                   document.querySelectorAll('[data-tab-panel]');
    panels.forEach(panel => {
      panel.classList.toggle('active', panel.getAttribute('data-tab-panel') === targetPanel);
    });
  });
});
