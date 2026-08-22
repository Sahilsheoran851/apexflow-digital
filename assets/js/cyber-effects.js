/**
 * ApexFlow Digital — Futuristic Cyber Effects & Humanizer Engine
 * 3D UAE Cyber Globe, Animated Beam Pipeline, Number Tickers, Live Terminal & Human Availability HUD
 */

document.addEventListener('DOMContentLoaded', () => {
  initHeroCanvas();
  init3DCardTilt();
  initLiveCyberTerminal();
  initScrollReveals();
  init3DUAEGlobe();
  initAnimatedBeamPipeline();
  initNumberTicker();
  initHumanStatusHUD();
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

      const rotateX = ((y - centerY) / centerY) * -6;
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
    { time: '02:04:12', type: 'cyan', text: '⚡ Inbound inquiry detected: "Luxury Real Estate Downtown Dubai"' },
    { time: '02:04:13', type: 'purple', text: '🧠 AI Agent parsed intent: Budget AED 6.5M | Buyer Location: UAE' },
    { time: '02:04:13', type: 'success', text: '💬 WhatsApp auto-qualification sent to +971 50 *** 7963' },
    { time: '02:04:14', type: 'cyan', text: '🔄 Webhook dispatched: Lead synced to CRM & Google Sheets (0.32s)' },
    { time: '02:04:16', type: 'success', text: '✅ Strategy call booked on Sahil Sheoran\'s calendar | Status: Qualified' },
    { time: '02:04:22', type: 'cyan', text: '📈 SEO Crawler: Top 3 Google Map rank verified for "Dubai Digital Agency"' },
    { time: '02:04:25', type: 'purple', text: '🛡️ Core Web Vitals audit: 100/100 Mobile Speed score achieved' }
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

    if (terminalBody.children.length > 5) {
      terminalBody.removeChild(terminalBody.children[0]);
    }

    eventIndex = (eventIndex + 1) % sampleEvents.length;
  }

  addLog();
  addLog();
  addLog();

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

/**
 * 5. Interactive 3D UAE Cyber Globe (Lightweight Canvas WebGL Simulation)
 */
function init3DUAEGlobe() {
  const canvas = document.getElementById('uae-globe-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let radius;
  let rotation = 0;
  let isDragging = false;
  let lastMouseX = 0;

  function resize() {
    width = canvas.width = canvas.offsetWidth;
    height = canvas.height = canvas.offsetHeight;
    radius = Math.min(width, height) * 0.42;
  }

  window.addEventListener('resize', resize);
  resize();

  // Generate sphere dots (Fibonacci sphere distribution)
  const dotCount = 450;
  const dots = [];
  for (let i = 0; i < dotCount; i++) {
    const phi = Math.acos(-1 + (2 * i) / dotCount);
    const theta = Math.sqrt(dotCount * Math.PI) * phi;
    dots.push({
      x: Math.cos(theta) * Math.sin(phi),
      y: Math.sin(theta) * Math.sin(phi),
      z: Math.cos(phi),
    });
  }

  // UAE Coordinates (Dubai ~ 25.2° N, 55.3° E)
  const uaeLat = (25.2 * Math.PI) / 180;
  const uaeLon = (55.3 * Math.PI) / 180;
  const uaePoint = {
    x: Math.cos(uaeLat) * Math.sin(uaeLon),
    y: -Math.sin(uaeLat),
    z: Math.cos(uaeLat) * Math.cos(uaeLon),
  };

  // Drag interaction
  canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastMouseX = e.clientX;
  });

  window.addEventListener('mouseup', () => (isDragging = false));

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - lastMouseX;
    rotation += deltaX * 0.008;
    lastMouseX = e.clientX;
  });

  let pingRadius = 0;

  function render() {
    ctx.clearRect(0, 0, width, height);

    if (!isDragging) {
      rotation += 0.005;
    }

    const cx = width / 2;
    const cy = height / 2;

    // Draw ambient atmosphere glow
    const grad = ctx.createRadialGradient(cx, cy, radius * 0.6, cx, cy, radius * 1.25);
    grad.addColorStop(0, 'rgba(0, 242, 254, 0.08)');
    grad.addColorStop(0.7, 'rgba(157, 78, 221, 0.04)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Draw 3D Dots
    dots.forEach((dot) => {
      // Rotate around Y axis
      const cosR = Math.cos(rotation);
      const sinR = Math.sin(rotation);
      const rotX = dot.x * cosR - dot.z * sinR;
      const rotZ = dot.x * sinR + dot.z * cosR;

      if (rotZ > -0.2) { // Front hemisphere only
        const screenX = cx + rotX * radius;
        const screenY = cy + dot.y * radius;
        const alpha = Math.max(0.1, (rotZ + 0.5) * 0.85);

        ctx.beginPath();
        ctx.arc(screenX, screenY, 1.4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 242, 254, ${alpha})`;
        ctx.fill();
      }
    });

    // Draw UAE Node & Beacon
    const cosR = Math.cos(rotation);
    const sinR = Math.sin(rotation);
    const uaeRotX = uaePoint.x * cosR - uaePoint.z * sinR;
    const uaeRotZ = uaePoint.x * sinR + uaePoint.z * cosR;

    if (uaeRotZ > 0) { // UAE is visible on front
      const uaeScreenX = cx + uaeRotX * radius;
      const uaeScreenY = cy + uaePoint.y * radius;

      // Radar pulse ring
      pingRadius = (pingRadius + 0.4) % 24;
      ctx.beginPath();
      ctx.arc(uaeScreenX, uaeScreenY, pingRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(5, 255, 161, ${1 - pingRadius / 24})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Glowing Node Pin
      ctx.beginPath();
      ctx.arc(uaeScreenX, uaeScreenY, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = '#05ffa1';
      ctx.shadowColor = '#05ffa1';
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Label
      ctx.font = '600 11px "JetBrains Mono", monospace';
      ctx.fillStyle = '#00f2fe';
      ctx.fillText('📍 DUBAI_HQ // UAE', uaeScreenX + 10, uaeScreenY - 6);
    }

    requestAnimationFrame(render);
  }

  render();
}

/**
 * 6. Magic UI-Style Animated Laser Beam Pipeline
 */
function initAnimatedBeamPipeline() {
  const beamContainers = document.querySelectorAll('.animated-beam-pipeline');
  if (!beamContainers.length) return;

  beamContainers.forEach(container => {
    const pulseDots = container.querySelectorAll('.beam-laser-dot');
    let progress = 0;

    function animateBeam() {
      progress = (progress + 0.012) % 1;
      pulseDots.forEach((dot, index) => {
        const offset = (progress + index * 0.33) % 1;
        dot.style.left = `${offset * 100}%`;
      });
      requestAnimationFrame(animateBeam);
    }
    animateBeam();
  });
}

/**
 * 7. Animated Number Ticker (Count-Up on Scroll)
 */
function initNumberTicker() {
  const counters = document.querySelectorAll('.number-ticker');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target;
        const targetVal = parseFloat(target.getAttribute('data-target') || '0');
        const prefix = target.getAttribute('data-prefix') || '';
        const suffix = target.getAttribute('data-suffix') || '';
        const duration = 1800;
        const startTime = performance.now();

        function update(currentTime) {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // Ease-out cubic
          const easeOut = 1 - Math.pow(1 - progress, 3);
          const currentVal = Math.round(targetVal * easeOut);

          target.textContent = `${prefix}${currentVal}${suffix}`;

          if (progress < 1) {
            requestAnimationFrame(update);
          } else {
            target.textContent = `${prefix}${targetVal}${suffix}`;
          }
        }

        requestAnimationFrame(update);
        observer.unobserve(target);
      }
    });
  }, { threshold: 0.3 });

  counters.forEach(counter => observer.observe(counter));
}

/**
 * 8. Live Human Availability HUD & WhatsApp Concierge (Humanizer)
 */
function initHumanStatusHUD() {
  // Update time dynamically in UAE Timezone (UTC+4)
  const timeElements = document.querySelectorAll('.live-uae-time');
  function updateTime() {
    const options = { timeZone: 'Asia/Dubai', hour: '2-digit', minute: '2-digit', hour12: true };
    const uaeTimeStr = new Intl.DateTimeFormat([], options).format(new Date());
    timeElements.forEach(el => el.textContent = uaeTimeStr);
  }
  updateTime();
  setInterval(updateTime, 30000);
}
