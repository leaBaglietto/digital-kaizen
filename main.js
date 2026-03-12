/**
 * Digital Kaizen — main.js
 * Handles: sticky header, hamburger menu, smooth scroll, active nav,
 *          accordion, scroll reveal animations, contact form, footer year.
 */

(function () {
    'use strict';

    /* ================================================================
       1. UTILITIES
    ================================================================ */
    function $(id) { return document.getElementById(id); }
    function $$(sel, parent) { return (parent || document).querySelectorAll(sel); }

    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    /* ================================================================
       2. FOOTER YEAR
    ================================================================ */
    const yearEl = $('footer-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* ================================================================
       3. HEADER: Sticky shadow + scroll detection
    ================================================================ */
    const header = $('site-header');

    if (header) {
        const onScroll = () => {
            if (window.scrollY > 10) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    /* ================================================================
       4. HAMBURGER MENU
    ================================================================ */
    const hamburger = $('hamburger-btn');
    const mobileMenu = $('mobile-menu');

    if (hamburger && mobileMenu) {
        function openMenu() {
            hamburger.classList.add('is-open');
            hamburger.setAttribute('aria-expanded', 'true');
            hamburger.setAttribute('aria-label', 'Cerrar menú');
            mobileMenu.classList.add('is-visible');
            mobileMenu.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        }

        function closeMenu() {
            hamburger.classList.remove('is-open');
            hamburger.setAttribute('aria-expanded', 'false');
            hamburger.setAttribute('aria-label', 'Abrir menú');
            mobileMenu.classList.remove('is-visible');
            mobileMenu.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }

        hamburger.addEventListener('click', () => {
            const isOpen = hamburger.classList.contains('is-open');
            isOpen ? closeMenu() : openMenu();
        });

        // Close on nav link click
        $$('.mobile-nav-link, .nav-mobile .btn', mobileMenu).forEach(link => {
            link.addEventListener('click', closeMenu);
        });

        // Close on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && hamburger.classList.contains('is-open')) {
                closeMenu();
                hamburger.focus();
            }
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (hamburger.classList.contains('is-open') &&
                !header.contains(e.target)) {
                closeMenu();
            }
        });
    }

    /* ================================================================
       5. SMOOTH SCROLL (for anchor links)
    ================================================================ */
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href^="#"]');
        if (!link) return;

        const targetId = link.getAttribute('href').slice(1);
        if (!targetId) return;

        const target = document.getElementById(targetId);
        if (!target) return;

        e.preventDefault();

        const headerHeight = header ? header.getBoundingClientRect().height : 0;
        const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 8;

        window.scrollTo({ top, behavior: 'smooth' });

        // Update URL without jump
        history.pushState(null, '', `#${targetId}`);
    });

    /* ================================================================
       6. ACTIVE NAV LINK (IntersectionObserver)
    ================================================================ */
    const sections = $$('section[id]');
    const navLinks = $$('.nav-link[href^="#"]');

    if (sections.length && navLinks.length) {
        const headerHeight = header ? header.getBoundingClientRect().height : 72;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${entry.target.id}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, {
            rootMargin: `-${headerHeight + 16}px 0px -60% 0px`,
            threshold: 0,
        });

        sections.forEach(section => observer.observe(section));
    }

    /* ================================================================
       7. ACCORDION (Casos de Éxito)
    ================================================================ */
    const accordion = $('casos-accordion');

    if (accordion) {
        const triggers = $$('.accordion-trigger:not(.accordion-trigger--disabled)', accordion);

        triggers.forEach(trigger => {
            const contentId = trigger.getAttribute('aria-controls');
            const content = document.getElementById(contentId);
            if (!content) return;

            // Initialize: hide non-open items
            const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
            if (!isExpanded) {
                content.setAttribute('hidden', '');
            }

            trigger.addEventListener('click', () => {
                const currentlyExpanded = trigger.getAttribute('aria-expanded') === 'true';

                // Close all other items
                triggers.forEach(t => {
                    if (t !== trigger) {
                        t.setAttribute('aria-expanded', 'false');
                        const c = document.getElementById(t.getAttribute('aria-controls'));
                        if (c) c.setAttribute('hidden', '');
                        t.closest('.accordion-item')?.classList.remove('accordion-item--active');
                    }
                });

                // Toggle this item
                const newState = !currentlyExpanded;
                trigger.setAttribute('aria-expanded', String(newState));

                if (newState) {
                    content.removeAttribute('hidden');
                    trigger.closest('.accordion-item')?.classList.add('accordion-item--active');
                } else {
                    content.setAttribute('hidden', '');
                    trigger.closest('.accordion-item')?.classList.remove('accordion-item--active');
                }
            });

            // Keyboard: Space and Enter
            trigger.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    trigger.click();
                }
            });
        });
    }

    /* ================================================================
       8. SCROLL REVEAL (IntersectionObserver)
    ================================================================ */
    const revealElements = $$('.method-card, .servicio-card, .ekv-item, .accordion-item, .caso-block, .stat-item');

    revealElements.forEach((el, i) => {
        el.classList.add('reveal');
        // Staggered delay for grouped elements
        const delay = (i % 4) * 100;
        el.style.transitionDelay = `${delay}ms`;
    });

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    revealElements.forEach(el => revealObserver.observe(el));

    // Also observe section headers
    $$('.section-header, .hero-content, .equipo-content, .contacto-copy').forEach(el => {
        el.classList.add('reveal');
        revealObserver.observe(el);
    });

    /* ================================================================
       9. CONTACT FORM
    ================================================================ */
    const form = $('contact-form');

    if (form) {
        const submitBtn = $('submit-btn');
        const btnText = submitBtn?.querySelector('.btn-text');
        const btnSpinner = submitBtn?.querySelector('.btn-spinner');
        const successEl = $('form-success');
        const errorEl = $('form-error-state');
        const resetBtn = $('form-reset-btn');
        const retryBtn = $('form-retry-btn');

        // --- Validation helpers ---
        function getField(name) { return form.elements[name]; }
        function getError(name) { return document.getElementById(`${name}-error`); }

        function setError(name, message) {
            const input = getField(name);
            const errEl = getError(name);
            if (!input || !errEl) return;
            input.classList.add('has-error');
            errEl.textContent = message;
        }

        function clearError(name) {
            const input = getField(name);
            const errEl = getError(name);
            if (!input || !errEl) return;
            input.classList.remove('has-error');
            errEl.textContent = '';
        }

        function validateNombre() {
            const val = (getField('nombre')?.value || '').trim();
            if (!val) { setError('nombre', 'El nombre es requerido.'); return false; }
            if (val.length < 2) { setError('nombre', 'El nombre debe tener al menos 2 caracteres.'); return false; }
            clearError('nombre'); return true;
        }

        function validateEmail() {
            const val = (getField('email')?.value || '').trim();
            if (!val) { setError('email', 'El email es requerido.'); return false; }
            if (!EMAIL_REGEX.test(val)) { setError('email', 'Ingresá un email válido.'); return false; }
            clearError('email'); return true;
        }

        function validateProceso() {
            const val = (getField('proceso')?.value || '').trim();
            if (!val) { setError('proceso', 'Contanos sobre tu proceso para poder ayudarte.'); return false; }
            if (val.length < 10) { setError('proceso', 'Por favor, describí el proceso con un poco más de detalle (mínimo 10 caracteres).'); return false; }
            clearError('proceso'); return true;
        }

        // Inline validation on blur
        ['nombre', 'email', 'proceso'].forEach(name => {
            const input = getField(name);
            if (!input) return;
            input.addEventListener('blur', () => {
                if (name === 'nombre') validateNombre();
                else if (name === 'email') validateEmail();
                else if (name === 'proceso') validateProceso();
            });
            input.addEventListener('input', () => clearError(name));
        });

        // --- Loading state ---
        function setLoading(isLoading) {
            if (!submitBtn) return;
            submitBtn.disabled = isLoading;

            if (btnText) btnText.style.display = isLoading ? 'none' : '';
            if (btnSpinner) {
                btnSpinner.hidden = !isLoading;
            }

            // Disable all inputs
            const inputs = form.querySelectorAll('input, textarea, button[type="submit"]');
            inputs.forEach(el => { if (isLoading) el.setAttribute('disabled', ''); else el.removeAttribute('disabled'); });
        }

        function showSuccess() {
            form.querySelectorAll('.form-group, .form-footer, .honeypot').forEach(el => el.hidden = true);
            if (successEl) successEl.hidden = false;
            if (errorEl) errorEl.hidden = true;
        }

        function showError() {
            setLoading(false);
            if (errorEl) errorEl.hidden = false;
            if (successEl) successEl.hidden = true;
        }

        function resetForm() {
            form.reset();
            form.querySelectorAll('.form-group, .form-footer, .honeypot').forEach(el => el.hidden = false);
            if (successEl) successEl.hidden = true;
            if (errorEl) errorEl.hidden = true;
            setLoading(false);
            ['nombre', 'email', 'proceso'].forEach(clearError);
        }

        if (resetBtn) resetBtn.addEventListener('click', resetForm);
        if (retryBtn) retryBtn.addEventListener('click', () => {
            if (errorEl) errorEl.hidden = true;
            setLoading(false);
        });

        // Form submission is now handled natively via HTML FormSubmit
    }

    /* ================================================================
       10. LINKEDIN BUTTON FALLBACK
       If the href is a placeholder, show accessible fallback text.
    ================================================================ */
    const linkedinBtn = document.querySelector('.linkedin-btn');
    if (linkedinBtn) {
        const href = linkedinBtn.getAttribute('href');
        const isPlaceholder = !href || href === '#' || href.includes('placeholder') || href.trim() === '';
        if (isPlaceholder) {
            linkedinBtn.setAttribute('aria-label', 'LinkedIn disponible a pedido');
            linkedinBtn.style.display = 'none';

            const fallback = document.createElement('span');
            fallback.className = 'linkedin-fallback';
            fallback.style.cssText = 'font-size:0.8rem;color:#7e95aa;font-style:italic;';
            fallback.textContent = 'LinkedIn disponible a pedido';
            linkedinBtn.parentNode?.appendChild(fallback);
        }
    }

})();
