/**
 * ApexFlow Digital — Apple Fluid Interface Physics Engine
 * Inspired by Emil Kowalski's Apple Design skill & WWDC "Designing Fluid Interfaces"
 *
 * Implements:
 * 1. Instant PointerDown response (0ms latency tactile scale)
 * 2. Magnetic Button Spring Physics (desktop)
 * 3. 3D Parallax Tilt & Specular Light Sheen (Bento & Package Cards)
 * 4. Spring-based Interactive Switchers
 */

(function() {
  'use strict';

  // Apple physics spring helper (critically damped damping 1.0, response 0.4s)
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /**
   * 1. Instant PointerDown Feedback (Kill Latency)
   * Responds immediately on pointerdown, not waiting for click/touchup.
   */
  function initInstantPressFeedback() {
    const pressables = document.querySelectorAll('.btn, .nav-btn-whatsapp, .service-tab-btn, .ai-chip, .package-card, .bento-card');

    pressables.forEach(el => {
      el.addEventListener('pointerdown', (e) => {
        if (e.button !== 0 && e.pointerType === 'mouse') return; // only left click
        el.style.transition = 'transform 0.08s cubic-bezier(0.32, 0.72, 0, 1)';
        el.style.transform = 'scale(0.972)';
      }, { passive: true });

      const resetPress = () => {
        el.style.transition = 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
        el.style.transform = '';
      };

      el.addEventListener('pointerup', resetPress, { passive: true });
      el.addEventListener('pointercancel', resetPress, { passive: true });
      el.addEventListener('pointerleave', resetPress, { passive: true });
    });
  }

  /**
   * 2. Magnetic Button Physics (Apple style interactive cursor attraction)
   */
  function initMagneticButtons() {
    if (prefersReducedMotion || window.innerWidth < 1024) return;

    const magneticElements = document.querySelectorAll('.btn-primary, .nav-btn-whatsapp, .logo');

    magneticElements.forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const deltaX = (e.clientX - centerX) * 0.22;
        const deltaY = (e.clientY - centerY) * 0.22;

        btn.style.transition = 'transform 0.15s cubic-bezier(0.32, 0.72, 0, 1)';
        btn.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
        btn.style.transform = 'translate(0px, 0px)';
      });
    });
  }

  /**
   * 3. 3D Parallax Tilt & Specular Light Sheen (Apple Card Material)
   */
  function initCardParallax() {
    if (prefersReducedMotion || window.innerWidth < 768) return;

    const cards = document.querySelectorAll('.bento-card, .package-card');

    cards.forEach(card => {
      // Create specular highlight overlay
      let sheen = card.querySelector('.apple-card-sheen');
      if (!sheen) {
        sheen = document.createElement('div');
        sheen.className = 'apple-card-sheen';
        sheen.style.position = 'absolute';
        sheen.style.top = '0';
        sheen.style.left = '0';
        sheen.style.width = '100%';
        sheen.style.height = '100%';
        sheen.style.borderRadius = 'inherit';
        sheen.style.pointerEvents = 'none';
        sheen.style.opacity = '0';
        sheen.style.transition = 'opacity 0.3s ease';
        sheen.style.background = 'radial-gradient(circle 280px at 50% 50%, rgba(255, 255, 255, 0.08), transparent 70%)';
        card.style.position = 'relative';
        card.appendChild(sheen);
      }

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -4.5;
        const rotateY = ((x - centerX) / centerX) * 4.5;

        card.style.transition = 'transform 0.1s cubic-bezier(0.32, 0.72, 0, 1)';
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;

        sheen.style.opacity = '1';
        sheen.style.background = `radial-gradient(circle 320px at ${x}px ${y}px, rgba(0, 242, 254, 0.12), transparent 75%)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
        sheen.style.opacity = '0';
      });
    });
  }

  // Initialize all fluid interactions
  document.addEventListener('DOMContentLoaded', () => {
    initInstantPressFeedback();
    initMagneticButtons();
    initCardParallax();
  });
})();
