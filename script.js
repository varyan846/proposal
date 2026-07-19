/* ==========================================================================
   DAAKSHII — CINEMATIC PROPOSAL
   script.js — vanilla JS only, no frameworks
   ========================================================================== */
(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  /* ------------------------------------------------------------------------
     Utility
     ------------------------------------------------------------------------ */
  const rand = (min, max) => Math.random() * (max - min) + min;
  const $ = (sel) => document.querySelector(sel);

  function resizeCanvas(canvas) {
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return ctx;
  }

  /* ==========================================================================
     1. NIGHT SKY — twinkling stars + occasional shooting stars
     ========================================================================== */
  const skyCanvas = $('#sky-canvas');
  let skyCtx = resizeCanvas(skyCanvas);
  let stars = [];
  let shootingStars = [];
  let skyOpacity = 0; // fades in on load

  function buildStars() {
    const count = window.innerWidth < 640 ? 140 : 260;
    stars = Array.from({ length: count }, () => ({
      x: rand(0, window.innerWidth),
      y: rand(0, window.innerHeight),
      r: rand(0.4, 1.6),
      baseAlpha: rand(0.3, 1),
      phase: rand(0, Math.PI * 2),
      speed: rand(0.4, 1.4),
    }));
  }
  buildStars();

  function maybeSpawnShootingStar() {
    if (Math.random() < 0.0035 && shootingStars.length < 3) {
      const startX = rand(window.innerWidth * 0.1, window.innerWidth * 0.9);
      shootingStars.push({
        x: startX,
        y: rand(0, window.innerHeight * 0.3),
        len: rand(80, 160),
        speed: rand(9, 15),
        angle: Math.PI / 4.5,
        life: 1,
      });
    }
  }

  let skyTime = 0;
  function drawSky() {
    skyCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    if (skyOpacity < 1) skyOpacity = Math.min(1, skyOpacity + 0.012);
    skyTime += 0.016;

    skyCtx.save();
    skyCtx.globalAlpha = skyOpacity;
    for (const s of stars) {
      const twinkle = 0.5 + 0.5 * Math.sin(skyTime * s.speed + s.phase);
      skyCtx.globalAlpha = skyOpacity * (s.baseAlpha * 0.5 + twinkle * 0.5);
      skyCtx.fillStyle = '#fdf6ff';
      skyCtx.beginPath();
      skyCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      skyCtx.fill();
    }
    skyCtx.restore();

    if (!reduceMotion) maybeSpawnShootingStar();
    skyCtx.save();
    skyCtx.globalAlpha = skyOpacity;
    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const s = shootingStars[i];
      const dx = Math.cos(s.angle) * s.speed;
      const dy = Math.sin(s.angle) * s.speed;
      s.x += dx;
      s.y += dy;
      s.life -= 0.02;

      const grad = skyCtx.createLinearGradient(s.x, s.y, s.x - dx * (s.len / s.speed), s.y - dy * (s.len / s.speed));
      grad.addColorStop(0, `rgba(255,255,255,${s.life})`);
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      skyCtx.strokeStyle = grad;
      skyCtx.lineWidth = 1.6;
      skyCtx.beginPath();
      skyCtx.moveTo(s.x, s.y);
      skyCtx.lineTo(s.x - dx * (s.len / s.speed), s.y - dy * (s.len / s.speed));
      skyCtx.stroke();

      if (s.life <= 0 || s.x > window.innerWidth || s.y > window.innerHeight) {
        shootingStars.splice(i, 1);
      }
    }
    skyCtx.restore();

    requestAnimationFrame(drawSky);
  }
  requestAnimationFrame(drawSky);

  /* ==========================================================================
     2. AMBIENT PARTICLES — floating rose petals + hearts
     ========================================================================== */
  const particleCanvas = $('#particle-canvas');
  let particleCtx = resizeCanvas(particleCanvas);
  let ambientParticles = [];
  let ambientIntensity = 1; // multiplier, boosted after YES

  function makeAmbientParticle(kind) {
    return {
      kind, // 'petal' | 'heart'
      x: rand(0, window.innerWidth),
      y: rand(-40, -10),
      size: rand(kind === 'petal' ? 8 : 6, kind === 'petal' ? 16 : 14),
      speedY: rand(0.35, 0.9),
      drift: rand(-0.4, 0.4),
      rot: rand(0, Math.PI * 2),
      rotSpeed: rand(-0.02, 0.02),
      sway: rand(0, Math.PI * 2),
      alpha: rand(0.4, 0.85),
    };
  }

  const AMBIENT_MAX = window.innerWidth < 640 ? 26 : 46;
  function seedAmbient() {
    ambientParticles = Array.from({ length: AMBIENT_MAX }, () =>
      makeAmbientParticle(Math.random() < 0.55 ? 'petal' : 'heart')
    );
    ambientParticles.forEach((p) => (p.y = rand(0, window.innerHeight)));
  }
  seedAmbient();

  function drawPetal(ctx, x, y, size, rot, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.globalAlpha = alpha;
    const grad = ctx.createLinearGradient(-size, 0, size, 0);
    grad.addColorStop(0, '#ff8fb1');
    grad.addColorStop(1, '#ff3b5c');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(0, 0, size, size * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawHeart(ctx, x, y, size, rot, alpha, color = '#ff6f9c') {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    const s = size / 16;
    ctx.beginPath();
    ctx.moveTo(0, 4 * s);
    ctx.bezierCurveTo(-8 * s, -4 * s, -16 * s, 6 * s, 0, 16 * s);
    ctx.bezierCurveTo(16 * s, 6 * s, 8 * s, -4 * s, 0, 4 * s);
    ctx.fill();
    ctx.restore();
  }

  let ambientTime = 0;
  function drawAmbient() {
    particleCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    ambientTime += 0.016;

    for (const p of ambientParticles) {
      p.y += p.speedY * ambientIntensity;
      p.sway += 0.01;
      p.x += Math.sin(p.sway) * 0.4 + p.drift * 0.2;
      p.rot += p.rotSpeed;

      if (p.kind === 'petal') drawPetal(particleCtx, p.x, p.y, p.size, p.rot, p.alpha * skyOpacity);
      else drawHeart(particleCtx, p.x, p.y, p.size, p.rot, p.alpha * skyOpacity);

      if (p.y > window.innerHeight + 30) {
        Object.assign(p, makeAmbientParticle(p.kind));
        p.y = -30;
      }
    }
    requestAnimationFrame(drawAmbient);
  }
  requestAnimationFrame(drawAmbient);

  /* ==========================================================================
     3. CURSOR TRAIL — tiny glowing hearts (desktop) / touch hearts (mobile)
     ========================================================================== */
  const cursorCanvas = $('#cursor-canvas');
  let cursorCtx = resizeCanvas(cursorCanvas);
  let cursorHearts = [];

  function spawnCursorHeart(x, y) {
    cursorHearts.push({
      x: x + rand(-4, 4),
      y: y + rand(-4, 4),
      size: rand(8, 14),
      life: 1,
      vy: rand(-0.6, -1.2),
      vx: rand(-0.4, 0.4),
    });
    if (cursorHearts.length > 60) cursorHearts.shift();
  }

  let lastCursorSpawn = 0;
  window.addEventListener('pointermove', (e) => {
    const now = performance.now();
    if (now - lastCursorSpawn < 55) return;
    lastCursorSpawn = now;
    spawnCursorHeart(e.clientX, e.clientY);
  }, { passive: true });

  window.addEventListener('touchstart', (e) => {
    for (const t of e.touches) spawnCursorHeart(t.clientX, t.clientY);
  }, { passive: true });

  function drawCursorTrail() {
    cursorCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (let i = cursorHearts.length - 1; i >= 0; i--) {
      const h = cursorHearts[i];
      h.life -= 0.02;
      h.y += h.vy;
      h.x += h.vx;
      if (h.life <= 0) {
        cursorHearts.splice(i, 1);
        continue;
      }
      drawHeart(cursorCtx, h.x, h.y, h.size * h.life, 0, h.life * 0.9, '#ff9fc0');
    }
    requestAnimationFrame(drawCursorTrail);
  }
  requestAnimationFrame(drawCursorTrail);

  /* ==========================================================================
     4. FX CANVAS — fireworks + heart bursts (triggered moments)
     ========================================================================== */
  const fxCanvas = $('#fx-canvas');
  let fxCtx = resizeCanvas(fxCanvas);
  let fxParticles = [];

  function burstHearts(cx, cy, count = 40) {
    for (let i = 0; i < count; i++) {
      const angle = rand(0, Math.PI * 2);
      const speed = rand(2, 8);
      fxParticles.push({
        type: 'heart',
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: rand(8, 18),
        life: 1,
        decay: rand(0.006, 0.014),
        color: Math.random() < 0.5 ? '#ff6f9c' : '#c9a7ff',
        gravity: 0.05,
      });
    }
  }

  function launchFirework(cx, cy) {
    const count = 60;
    const hue = Math.random() < 0.5 ? '#ff6f9c' : (Math.random() < 0.5 ? '#ffd1dc' : '#c9a7ff');
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = rand(3, 7);
      fxParticles.push({
        type: 'spark',
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: rand(1.5, 3),
        life: 1,
        decay: rand(0.012, 0.02),
        color: hue,
        gravity: 0.03,
      });
    }
  }

  function fireworksShow(duration = 2600) {
    if (reduceMotion) return;
    const start = performance.now();
    const interval = setInterval(() => {
      if (performance.now() - start > duration) { clearInterval(interval); return; }
      launchFirework(rand(window.innerWidth * 0.15, window.innerWidth * 0.85), rand(window.innerHeight * 0.15, window.innerHeight * 0.55));
    }, 350);
  }

  function drawFx() {
    fxCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (let i = fxParticles.length - 1; i >= 0; i--) {
      const p = fxParticles[i];
      p.vy += p.gravity * 0.15;
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      if (p.life <= 0) { fxParticles.splice(i, 1); continue; }

      if (p.type === 'heart') {
        drawHeart(fxCtx, p.x, p.y, p.size * Math.max(p.life, 0.2), p.vx * 0.05, p.life, p.color);
      } else {
        fxCtx.save();
        fxCtx.globalAlpha = p.life;
        fxCtx.fillStyle = p.color;
        fxCtx.beginPath();
        fxCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        fxCtx.fill();
        fxCtx.restore();
      }
    }
    requestAnimationFrame(drawFx);
  }
  requestAnimationFrame(drawFx);

  /* ==========================================================================
     5. RESIZE HANDLING
     ========================================================================== */
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      skyCtx = resizeCanvas(skyCanvas);
      particleCtx = resizeCanvas(particleCanvas);
      cursorCtx = resizeCanvas(cursorCanvas);
      fxCtx = resizeCanvas(fxCanvas);
      buildStars();
    }, 200);
  });

  /* ==========================================================================
     6. ENTRY OVERLAY — unlocks audio on first interaction
     ========================================================================== */
  const entryOverlay = $('#entry-overlay');
  const entryBtn = $('#entry-btn');
  const music = $('#bg-music');
  const musicPlayer = $('#music-player');
  const musicToggle = $('#music-toggle');
  const iconPlay = $('#icon-play');
  const iconPause = $('#icon-pause');
  const volumeSlider = $('#volume-slider');

  let musicFading = false;
  function fadeMusicTo(target, duration = 1800) {
    if (musicFading) return;
    musicFading = true;
    const start = music.volume;
    const startTime = performance.now();
    function step(now) {
      const t = Math.min(1, (now - startTime) / duration);
      music.volume = start + (target - start) * t;
      if (t < 1) requestAnimationFrame(step);
      else musicFading = false;
    }
    requestAnimationFrame(step);
  }

  function startExperience() {
    entryOverlay.classList.add('hidden');
    musicPlayer.classList.add('show');
    // attempt to play music, fading in gently — never blocks the experience if it fails
    music.volume = 0;
    const playPromise = music.play();
    if (playPromise && playPromise.then) {
      playPromise
        .then(() => {
          fadeMusicTo(parseFloat(volumeSlider.value) || 0.35);
          iconPlay.style.display = 'none';
          iconPause.style.display = 'block';
          musicToggle.setAttribute('aria-label', 'Pause music');
        })
        .catch(() => {
          // autoplay blocked or file missing — silently leave paused, user can press play
        });
    }
  }
  entryBtn.addEventListener('click', startExperience);

  musicToggle.addEventListener('click', () => {
    if (music.paused) {
      music.play().then(() => {
        iconPlay.style.display = 'none';
        iconPause.style.display = 'block';
        musicToggle.setAttribute('aria-label', 'Pause music');
      }).catch(() => showToast('Add music.mp3 to assets/music to enable sound 🎵'));
    } else {
      music.pause();
      iconPlay.style.display = 'block';
      iconPause.style.display = 'none';
      musicToggle.setAttribute('aria-label', 'Play music');
    }
  });
  volumeSlider.addEventListener('input', () => { music.volume = parseFloat(volumeSlider.value); });

  /* ==========================================================================
     7. TOASTS
     ========================================================================== */
  const toastContainer = $('#toast-container');
  function showToast(text) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = text;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  /* ==========================================================================
     8. RELATIONSHIP TIMER — live, starts 30 April 2026
     ========================================================================== */
  const START_DATE = new Date('2026-04-30T00:00:00');
  const tYears = $('#t-years'), tMonths = $('#t-months'), tDays = $('#t-days');
  const tHours = $('#t-hours'), tMins = $('#t-mins'), tSecs = $('#t-secs');
  const pad = (n) => String(n).padStart(2, '0');

  function updateTimer() {
    const now = new Date();
    let diffMs = now - START_DATE;
    if (diffMs < 0) diffMs = 0;

    let years = now.getFullYear() - START_DATE.getFullYear();
    let months = now.getMonth() - START_DATE.getMonth();
    let days = now.getDate() - START_DATE.getDate();
    let hours = now.getHours() - START_DATE.getHours();
    let mins = now.getMinutes() - START_DATE.getMinutes();
    let secs = now.getSeconds() - START_DATE.getSeconds();

    if (secs < 0) { secs += 60; mins--; }
    if (mins < 0) { mins += 60; hours--; }
    if (hours < 0) { hours += 24; days--; }
    if (days < 0) {
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += prevMonth.getDate();
      months--;
    }
    if (months < 0) { months += 12; years--; }
    if (years < 0) { years = months = days = hours = mins = secs = 0; }

    tYears.textContent = years;
    tMonths.textContent = months;
    tDays.textContent = days;
    tHours.textContent = pad(hours);
    tMins.textContent = pad(mins);
    tSecs.textContent = pad(secs);
  }
  updateTimer();
  setInterval(updateTimer, 1000);

  /* ==========================================================================
     9. NO BUTTON BEHAVIOUR
     ========================================================================== */
  const noBtn = $('#no-btn');
  const yesBtn = $('#yes-btn');
  const btnRow = $('.btn-row');

  const noMessages = [
    '😔 Ek baar aur soch lo...',
    '🥺 Please...',
    '😭 Itni bhi kya narazgi...',
    '❤️ Main wait kar lunga...',
  ];
  let noClicks = 0;
  let noScale = 1;
  let yesScale = 1;

  function moveNoButtonAway(fromX, fromY) {
    const rect = noBtn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let dx = cx - fromX;
    let dy = cy - fromY;
    const dist = Math.hypot(dx, dy) || 1;
    dx /= dist; dy /= dist;

    const jump = 140;
    let newX = cx + dx * jump + rand(-40, 40);
    let newY = cy + dy * jump + rand(-30, 30);

    const margin = 50;
    newX = Math.min(Math.max(newX, margin), window.innerWidth - margin);
    newY = Math.min(Math.max(newY, margin), window.innerHeight - margin);

    if (getComputedStyle(noBtn).position !== 'fixed') {
      noBtn.classList.add('escaping');
    }
    noBtn.style.left = `${newX - rect.width / 2}px`;
    noBtn.style.top = `${newY - rect.height / 2}px`;
  }

  function handleNoInteraction(x, y) {
    if (noClicks < noMessages.length) {
      showToast(noMessages[noClicks]);
    }
    noClicks++;

    // shrink NO, grow YES, gently, with floors/ceilings
    noScale = Math.max(0.45, noScale - 0.09);
    yesScale = Math.min(1.9, yesScale + 0.08);
    noBtn.style.transform = `scale(${noScale})`;
    yesBtn.style.transform = `scale(${yesScale})`;

    if (noClicks >= noMessages.length) {
      moveNoButtonAway(x, y);
    }
  }

  noBtn.addEventListener('click', (e) => handleNoInteraction(e.clientX, e.clientY));
  // if the button starts fleeing, chase-evade on hover too (desktop delight, still reachable)
  noBtn.addEventListener('pointerenter', (e) => {
    if (noClicks >= noMessages.length) moveNoButtonAway(e.clientX, e.clientY);
  });

  /* ==========================================================================
     10. YES BUTTON BEHAVIOUR
     ========================================================================== */
  const proposalSection = $('#proposal-section');
  const letterSection = $('#letter-section');
  const typewriterEl = $('#typewriter');
  const foreverBtnCard = $('#forever-btn');

  const PROPOSAL_MESSAGE =
`You just made me the happiest person alive. ❤️

Thank you for believing in us again. 🥹

I know I can't erase the pain I caused...
But I promise I'll spend every single day giving you reasons to smile instead of cry.

From this moment...
I'll protect your heart,
respect your feelings,
and love you the way you deserve.

No more empty promises.

Only actions.

Only us. ❤️

I love you, Daakshii.

Today.
Tomorrow.
Always. ♾️💍`;

  function typewrite(el, text, speed = 28) {
    return new Promise((resolve) => {
      el.textContent = '';
      const cursor = document.createElement('span');
      cursor.className = 'cursor-blink';
      cursor.textContent = '|';
      let i = 0;

      function tick() {
        if (i <= text.length) {
          el.textContent = text.slice(0, i);
          el.appendChild(cursor);
          i++;
          const ch = text[i - 1];
          const delay = ch === '\n' ? speed * 6 : speed;
          setTimeout(tick, reduceMotion ? 0 : delay);
        } else {
          cursor.remove();
          resolve();
        }
      }
      tick();
    });
  }

  let yesTriggered = false;
  async function handleYes() {
    if (yesTriggered) return;
    yesTriggered = true;

    // camera-style zoom + fade
    document.body.style.transition = 'filter 1.2s ease';
    document.body.style.filter = 'brightness(0.2)';
    ambientIntensity = 2.2;
    fadeMusicTo(Math.min(1, parseFloat(volumeSlider.value) + 0.25));

    burstHearts(window.innerWidth / 2, window.innerHeight / 2, 90);
    fireworksShow(3200);

    setTimeout(() => {
      document.body.style.filter = 'brightness(1)';
      proposalSection.classList.add('hidden');
      letterSection.classList.remove('hidden');
      letterSection.scrollIntoView({ behavior: 'instant' in document.body.style ? 'instant' : 'auto' });

      typewrite(typewriterEl, PROPOSAL_MESSAGE, 26).then(() => {
        foreverBtnCard.classList.remove('hidden');
        foreverBtnCard.classList.add('show');
      });
    }, 900);
  }
  yesBtn.addEventListener('click', handleYes);

  /* ==========================================================================
     11. "START OUR FOREVER" BUTTON
     ========================================================================== */
  const foreverSection = $('#forever-section');
  foreverBtnCard.addEventListener('click', () => {
    burstHearts(window.innerWidth / 2, window.innerHeight * 0.4, 70);
    fireworksShow(2400);
    document.body.style.transition = 'filter 1s ease';
    document.body.style.filter = 'brightness(0.2)';

    setTimeout(() => {
      document.body.style.filter = 'brightness(1)';
      letterSection.classList.add('hidden');
      foreverSection.classList.remove('hidden');
      ambientIntensity = 1.4;
    }, 700);
  });

  /* ==========================================================================
     12. LOVE LETTER ENVELOPES
     ========================================================================== */
  document.querySelectorAll('.envelope').forEach((env) => {
    function toggle() {
      const isOpen = env.classList.toggle('open');
      env.setAttribute('aria-expanded', String(isOpen));
    }
    env.addEventListener('click', toggle);
    env.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
  });

})();
