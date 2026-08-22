/**
 * ApexFlow Digital — Futuristic Cyber Effects & Humanizer Engine
 * 3D UAE Hero Background Globe, Magic UI Animated Beam Pipeline, Number Tickers, Live Terminal & Human Availability HUD
 */

document.addEventListener('DOMContentLoaded', () => {
  initHeroGlobeCanvas();
  init3DCardTilt();
  initLiveCyberTerminal();
  initScrollReveals();
  initAnimatedBeamPipeline();
  initNumberTicker();
  initHumanStatusHUD();
});

/**
 * 1. Futuristic Hero Canvas — 3D Holographic UAE Globe + Ambient Particle Space
 */
function initHeroGlobeCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let radius;
  let rotation = 0;
  let pitch = 0.25; // Subtle downward tilt to look majestic
  let targetRotationSpeed = 0.0035;
  let currentRotationSpeed = 0.0035;
  let isDragging = false;
  let lastMouseX = 0;
  let lastMouseY = 0;

  function resize() {
    width = canvas.width = canvas.offsetWidth;
    height = canvas.height = canvas.offsetHeight;
    // Scale globe size nicely according to screen width
    radius = Math.min(width * 0.35, height * 0.48, 320);
  }

  window.addEventListener('resize', resize);
  resize();

  // Mouse interaction
  window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    if (e.clientY >= rect.top && e.clientY <= rect.bottom) {
      if (isDragging) {
        const deltaX = e.clientX - lastMouseX;
        const deltaY = e.clientY - lastMouseY;
        rotation += deltaX * 0.006;
        pitch = Math.max(-0.6, Math.min(0.6, pitch + deltaY * 0.003));
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
      } else {
        // Subtle tilt based on cursor position
        const normX = (e.clientX - rect.left) / width - 0.5;
        targetRotationSpeed = 0.0035 + normX * 0.005;
      }
    }
  });

  canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
  });

  window.addEventListener('mouseup', () => (isDragging = false));

  // Generate sphere 3D dots using Fibonacci spiral
  const dotCount = 550;
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

  // Ambient background floating particles
  const ambientParticles = [];
  const ambientCount = 35;
  for (let i = 0; i < ambientCount; i++) {
    ambientParticles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.5 + 0.8,
      color: Math.random() > 0.4 ? 'rgba(0, 242, 254,' : 'rgba(157, 78, 221,',
      alpha: Math.random() * 0.4 + 0.1
    });
  }

  let pingRadius = 0;

  function render() {
    ctx.clearRect(0, 0, width, height);

    const cx = width / 2;
    // Position globe slightly above center for optimal hero typography backing
    const cy = height * 0.46;

    // 1. Draw Ambient Connecting Particles
    for (let i = 0; i < ambientParticles.length; i++) {
      const p = ambientParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `${p.color} ${p.alpha})`;
      ctx.fill();

      // Lines between close particles
      for (let j = i + 1; j < ambientParticles.length; j++) {
        const p2 = ambientParticles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.strokeStyle = `rgba(0, 242, 254, ${(1 - dist / 120) * 0.12})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }

    // 2. Draw Globe Ambient Radiant Aura
    const grad = ctx.createRadialGradient(cx, cy, radius * 0.3, cx, cy, radius * 1.4);
    grad.addColorStop(0, 'rgba(0, 242, 254, 0.12)');
    grad.addColorStop(0.5, 'rgba(157, 78, 221, 0.05)');
    grad.addColorStop(0.85, 'rgba(5, 255, 161, 0.02)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.35, 0, Math.PI * 2);
    ctx.fill();

    // 3. Update Rotation with Smooth Inertia
    if (!isDragging) {
      currentRotationSpeed += (targetRotationSpeed - currentRotationSpeed) * 0.05;
      rotation += currentRotationSpeed;
    }

    const cosR = Math.cos(rotation);
    const sinR = Math.sin(rotation);
    const cosP = Math.cos(pitch);
    const sinP = Math.sin(pitch);

    // 4. Draw 3D Globe Latitude & Longitude Rings
    const ringSteps = 60;
    // Equator Ring
    ctx.beginPath();
    for (let i = 0; i <= ringSteps; i++) {
      const angle = (i / ringSteps) * Math.PI * 2;
      const rx = Math.cos(angle);
      const rz = Math.sin(angle);
      
      const rotX = rx * cosR - rz * sinR;
      const rotZ = rx * sinR + rz * cosR;
      const rotY = rotZ * sinP;
      const finalZ = rotZ * cosP;

      if (finalZ > -0.25) {
        const sx = cx + rotX * radius;
        const sy = cy + rotY * radius;
        if (i === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
    }
    ctx.strokeStyle = 'rgba(0, 242, 254, 0.12)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 5. Draw 3D Sphere Points
    dots.forEach((dot) => {
      // Rotate around Y (longitude)
      const rotX = dot.x * cosR - dot.z * sinR;
      const rotZ = dot.x * sinR + dot.z * cosR;

      // Rotate around X (pitch)
      const rotY = dot.y * cosP - rotZ * sinP;
      const finalZ = dot.y * sinP + rotZ * cosP;

      if (finalZ > -0.15) { // Visible front hemisphere
        const screenX = cx + rotX * radius;
        const screenY = cy + rotY * radius;
        const alpha = Math.max(0.12, (finalZ + 0.6) * 0.85);

        ctx.beginPath();
        ctx.arc(screenX, screenY, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 242, 254, ${alpha})`;
        ctx.fill();
      }
    });

    // 6. Draw Dubai / UAE Active Node Beacon
    const uaeRotX = uaePoint.x * cosR - uaePoint.z * sinR;
    const uaeRotZ = uaePoint.x * sinR + uaePoint.z * cosR;
    const uaeRotY = uaePoint.y * cosP - uaeRotZ * sinP;
    const uaeFinalZ = uaePoint.y * sinP + uaeRotZ * cosP;

    if (uaeFinalZ > 0.05) { // UAE is currently facing front
      const uaeScreenX = cx + uaeRotX * radius;
      const uaeScreenY = cy + uaeRotY * radius;

      // Pulsing radar ripple
      pingRadius = (pingRadius + 0.45) % 28;
      ctx.beginPath();
      ctx.arc(uaeScreenX, uaeScreenY, pingRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(5, 255, 161, ${1 - pingRadius / 28})`;
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Second ripple
      const pingRadius2 = (pingRadius + 14) % 28;
      ctx.beginPath();
      ctx.arc(uaeScreenX, uaeScreenY, pingRadius2, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0, 242, 254, ${1 - pingRadius2 / 28})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Glowing Node Pin
      ctx.beginPath();
      ctx.arc(uaeScreenX, uaeScreenY, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#05ffa1';
      ctx.shadowColor = '#05ffa1';
      ctx.shadowBlur = 18;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Node Label with Cyber Background Badge
      const labelText = '📍 DUBAI_NODE // 25.2°N, 55.3°E';
      ctx.font = '700 11px "JetBrains Mono", monospace';
      const textWidth = ctx.measureText(labelText).width;

      ctx.fillStyle = 'rgba(3, 7, 18, 0.85)';
      ctx.strokeStyle = 'rgba(5, 255, 161, 0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(uaeScreenX + 12, uaeScreenY - 14, textWidth + 14, 22, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#05ffa1';
      ctx.fillText(labelText, uaeScreenX + 19, uaeScreenY + 1);
    }

    requestAnimationFrame(render);
  }

  render();
}

/**
 * 2. 3D Perspective Card Tilt & Radial Cursor Spotlight
 */
function init3DCardTilt() {
  const cards = document.querySelectorAll('.bento-card, .service-pillar, .package-card, .problem-card, .testimonial-card, .metric-ticker-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
      card.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(0, 242, 254, 0.08), rgba(10, 18, 38, 0.75) 70%)`;
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
  const revealElements = document.querySelectorAll('.bento-card, .service-pillar, .process-step, .package-card, .problem-card, .testimonial-card, .matrix-container');

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
 * 5. Magic UI-Style Animated Laser Beam Pipeline
 */
function initAnimatedBeamPipeline() {
  const beamContainers = document.querySelectorAll('.animated-beam-pipeline');
  if (!beamContainers.length) return;

  beamContainers.forEach(container => {
    const pulseDots = container.querySelectorAll('.beam-laser-dot');
    let progress = 0;

    function animateBeam() {
      progress = (progress + 0.01) % 1;
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
 * 6. Animated Number Ticker (Count-Up on Scroll)
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
 * 7. Live Human Availability HUD & WhatsApp Concierge (Humanizer)
 */
function initHumanStatusHUD() {
  const timeElements = document.querySelectorAll('.live-uae-time');
  function updateTime() {
    const options = { timeZone: 'Asia/Dubai', hour: '2-digit', minute: '2-digit', hour12: true };
    const uaeTimeStr = new Intl.DateTimeFormat([], options).format(new Date());
    timeElements.forEach(el => el.textContent = uaeTimeStr);
  }
  updateTime();
  setInterval(updateTime, 30000);
}
