/**
 * ApexFlow Digital — Futuristic Cyber Effects Engine
 * Particle Canvas Mesh, 3D Card Tilt, Cyber Terminal Simulator & Reveal Animations
 */

document.addEventListener('DOMContentLoaded', () => {
  initHeroCanvas();
  init3DCardTilt();
  initLiveCyberTerminal();
  initScrollReveals();
});

/**
 * 1. Futuristic Hero Canvas Particle & Constellation Grid
 */
function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  const particleCount = 45;
  const maxDistance = 140;

  function resize() {
    width = canvas.width = canvas.offsetWidth;
    height = canvas.height = canvas.offsetHeight;
  }

  window.addEventListener('resize', resize);
  resize();

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.6;
      this.vy = (Math.random() - 0.5) * 0.6;
      this.radius = Math.random() * 2 + 1;
      this.color = Math.random() > 0.4 ? 'rgba(0, 242, 254, ' : 'rgba(157, 78, 221, ';
      this.alpha = Math.random() * 0.5 + 0.2;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color + this.alpha + ')';
      ctx.fill();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Draw connecting lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDistance) {
          const alpha = (1 - dist / maxDistance) * 0.18;
          ctx.strokeStyle = `rgba(0, 242, 254, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    particles.forEach(p => {
      p.update();
      p.draw();
    });

    requestAnimationFrame(animate);
  }

  animate();
}

/**
 * 2. 3D Perspective Card Tilt & Radial Cursor Spotlight
 */
function init3DCardTilt() {
  const cards = document.querySelectorAll('.bento-card, .service-pillar, .package-card, .problem-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -6; // max 6deg
      const rotateY = ((x - centerX) / centerX) * 6;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
      card.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(0, 242, 254, 0.08), rgba(10, 18, 38, 0.7) 70%)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.background = '';
    });
  });
}

/**
 * 3. Live Simulated Cyber Automation Terminal
 */
function initLiveCyberTerminal() {
  const terminalBody = document.getElementById('terminal-logs');
  if (!terminalBody) return;

  const sampleEvents = [
    { time: '02:04:12', type: 'cyan', text: '⚡ Inbound inquiry detected: "Luxury Penthouse Downtown Dubai"' },
    { time: '02:04:13', type: 'purple', text: '🧠 AI Agent parsed intent: Budget AED 8.5M | Buyer Location: UAE' },
    { time: '02:04:13', type: 'success', text: '💬 WhatsApp auto-qualification sent to +971 50 *** 7963' },
    { time: '02:04:14', type: 'cyan', text: '🔄 Webhook dispatched: Lead synced to CRM & Google Sheets (0.34s)' },
    { time: '02:04:16', type: 'success', text: '✅ Meeting booked on Senior Broker calendar | Status: Qualified' },
    { time: '02:04:22', type: 'cyan', text: '📈 SEO Crawler: Top 3 Google Map rank verified for "Dubai B2B Setup"' },
    { time: '02:04:25', type: 'purple', text: '🛡️ Core Web Vitals audit: 99/100 Mobile Speed score achieved' }
  ];

  let eventIndex = 0;

  function addLog() {
    const ev = sampleEvents[eventIndex];
    const line = document.createElement('div');
    line.className = 'terminal-log-line';
    
    let badgeClass = ev.type === 'success' ? 'log-success' : ev.type === 'cyan' ? 'log-cyan' : 'log-purple';

    line.innerHTML = `
      <span class="log-time">[${ev.time}]</span>
      <span class="${badgeClass}">${ev.text}</span>
    `;

    terminalBody.appendChild(line);

    // Keep only last 5 lines for clean look
    if (terminalBody.children.length > 5) {
      terminalBody.removeChild(terminalBody.children[0]);
    }

    eventIndex = (eventIndex + 1) % sampleEvents.length;
  }

  // Initial logs
  addLog();
  addLog();
  addLog();

  // Stream new logs every 2.8 seconds
  setInterval(addLog, 2800);
}

/**
 * 4. IntersectionObserver Scroll Reveal Animations
 */
function initScrollReveals() {
  const revealElements = document.querySelectorAll('.bento-card, .service-pillar, .process-step, .package-card, .problem-card');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  revealElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
    observer.observe(el);
  });
}
