/* ============================================================
   RASTRICK. MADE — Teaser page script
   Vanilla JS only. No libraries.
============================================================ */

// ── TOP-LEVEL CONSTANTS ─────────────────────────────────────

// REPLACE WITH YOUR CALENDLY BOOKING URL
const CALENDLY_URL = 'https://calendly.com/hello-rastrick';

const LAUNCH_DATE = new Date('2026-05-22T10:00:00+10:00');

const SESSION_KEY = 'rm_teaser_seen';

// ── REDUCED MOTION CHECK ────────────────────────────────────

const prefersReducedMotion =
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── BOOT SEQUENCE ───────────────────────────────────────────

(function initBoot() {
  const boot      = document.getElementById('boot');
  const sysLabel  = document.getElementById('boot-sys-label');
  const rec       = document.getElementById('boot-rec');
  const initEl    = document.getElementById('boot-init');
  const hlEl      = document.getElementById('boot-hl');
  const loaderEl  = document.getElementById('boot-loader');
  const barFill   = document.getElementById('boot-bar-fill');
  const barPct    = document.getElementById('boot-loader-pct');
  const botRow    = document.getElementById('boot-bot-row');
  const enterBtn  = document.getElementById('boot-enter');

  if (!boot) return;

  // Skip boot on revisit or reduced motion
  if (sessionStorage.getItem(SESSION_KEY) || prefersReducedMotion) {
    boot.remove();
    revealMain();
    return;
  }

  // ── Utility: type text into an element character by character
  function typeInto(el, text, msPerChar, startDelay) {
    return new Promise(resolve => {
      setTimeout(() => {
        let i = 0;
        function next() {
          if (i > text.length) { resolve(); return; }
          el.textContent = text.slice(0, i);
          i++;
          setTimeout(next, msPerChar);
        }
        next();
      }, startDelay);
    });
  }

  // ── Utility: delete text from element character by character
  function deleteFrom(el, msPerChar) {
    return new Promise(resolve => {
      let i = el.textContent.length;
      function next() {
        if (i < 0) { resolve(); return; }
        el.textContent = el.textContent.slice(0, i);
        i--;
        setTimeout(next, msPerChar);
      }
      next();
    });
  }

  // ── Utility: fill progress bar from 0 to 100
  function fillBar(durationMs) {
    return new Promise(resolve => {
      loaderEl.classList.add('visible');
      const labels = [
        'LOADING: THE_FUTURE_OF_WEB',
        'COMPILING: ZERO_TEMPLATES',
        'RENDERING: SOMETHING_DIFFERENT',
      ];
      const labelEl = document.getElementById('boot-loader-label');
      let labelIdx = 0;
      const labelInterval = setInterval(() => {
        labelIdx = (labelIdx + 1) % labels.length;
        if (labelEl) labelEl.textContent = labels[labelIdx];
      }, durationMs / 3);

      const start = performance.now();
      function tick(now) {
        const t    = Math.min(1, (now - start) / durationMs);
        const pct  = Math.round((1 - Math.pow(1 - t, 1.8)) * 100);
        barFill.style.width = pct + '%';
        if (barPct) barPct.textContent = '[ ' + String(pct).padStart(3, ' ') + '% ]';
        if (t < 1) { requestAnimationFrame(tick); } else {
          clearInterval(labelInterval);
          if (barPct) barPct.textContent = '[ 100% ]';
          resolve();
        }
      }
      requestAnimationFrame(tick);
    });
  }

  // ── Main sequence
  async function runSequence() {
    // T=200ms: REC appears
    setTimeout(() => rec.classList.add('visible'), 200);

    // T=300ms: Type system label
    await typeInto(sysLabel, 'RASTRICK. MADE_OS V.2026 // TEASER_BUILD', 18, 300);

    // Type init line
    await typeInto(initEl, '> INITIALIZING_DROP.EXE', 22, 50);

    // Short pause, then type first headline
    await delay(200);
    await typeInto(hlEl, 'RASTRICK. MADE', 55, 0);

    // Pause with blinking cursor, then delete
    await delay(500);
    await deleteFrom(hlEl, 25);

    // Short pause, then type the real headline
    await delay(150);
    await typeInto(hlEl, 'THE DROP IS COMING.', 50, 0);

    // Start loading bar (overlaps with last headline typing completing)
    await delay(100);
    const barDone = fillBar(1400);

    // Show bottom row partway through loading
    setTimeout(() => botRow.classList.add('visible'), 600);

    await barDone;

    // Show enter CTA
    enterBtn.classList.add('visible');
  }

  function delay(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  runSequence();

  // ── Dismiss: click / key / scroll / tap
  let dismissed = false;

  function dismiss() {
    if (dismissed) return;
    dismissed = true;
    sessionStorage.setItem(SESSION_KEY, '1');
    boot.classList.add('dismissing');
    setTimeout(() => {
      boot.remove();
      revealMain();
    }, 700);
  }

  enterBtn.addEventListener('click',  e => { e.stopPropagation(); dismiss(); });
  boot.addEventListener('click',      () => dismiss());
  window.addEventListener('keydown',  () => dismiss(), { once: true });
  window.addEventListener('touchmove', () => dismiss(), { once: true, passive: true });
  window.addEventListener('wheel',    () => dismiss(), { once: true, passive: true });
})();


// ── REVEAL MAIN ─────────────────────────────────────────────

function revealMain() {
  const main   = document.getElementById('main');
  const chrome = document.getElementById('chrome');

  if (main) {
    main.removeAttribute('hidden');
    main.style.opacity = '0';
    requestAnimationFrame(() => {
      main.style.transition = 'opacity 0.5s ease';
      main.style.opacity    = '1';
    });
  }

  if (chrome) chrome.classList.add('visible');

  startApp();
}


// ── APP (runs after boot is cleared) ────────────────────────

function startApp() {
  setLocalLaunchLabels();
  initCountdown();
  initScrollProgress();
  initSectionLabels();
  initTypeIns();
  initCursor();
  initForms();
  initCalendly();
  initKonami();
}


// ── LOCAL TIMEZONE LAUNCH LABELS ────────────────────────────
// Converts the fixed AEST launch time into whatever the visitor's
// local timezone is. Canberra → Friday 10:00 AM AEST.
// Wellington NZ → Friday 12:00 PM NZST.
// Perth → Friday 8:00 AM AWST.
// New York → Thursday 8:00 PM EDT.

function setLocalLaunchLabels() {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Day name in visitor's timezone
  const weekday = LAUNCH_DATE.toLocaleDateString('en', {
    weekday: 'long',
    timeZone: tz,
  });

  // Time string — e.g. "10:00 AM"
  const timeStr = LAUNCH_DATE.toLocaleTimeString('en', {
    hour:   'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: tz,
  }).toUpperCase();

  // Timezone abbreviation — e.g. "AEST", "NZST", "EDT"
  const tzAbbr = new Intl.DateTimeFormat('en', {
    timeZoneName: 'short',
    timeZone: tz,
  }).formatToParts(LAUNCH_DATE).find(p => p.type === 'timeZoneName')?.value || '';

  // Date in DD.MM.YY format (in visitor's local timezone)
  const dp = new Intl.DateTimeFormat('en-AU', {
    day:   '2-digit',
    month: '2-digit',
    year:  '2-digit',
    timeZone: tz,
  }).formatToParts(LAUNCH_DATE);
  const gd  = t => (dp.find(p => p.type === t) || {}).value || '';
  const dateStr = `${gd('day')}.${gd('month')}.${gd('year')}`;

  // Hero sub — "Launching this Friday at 10:00 AM AEST"
  const heroText = document.getElementById('hero-launch-text');
  if (heroText) {
    heroText.innerHTML =
      `Launching this <strong>${weekday}</strong> at ${timeStr} ${tzAbbr}`;
  }

  // Countdown date stamp — "22.05.26 // 10:00 AM AEST"
  const cdLabel = document.getElementById('cd-date-label');
  if (cdLabel) {
    cdLabel.textContent = `${dateStr} // ${timeStr} ${tzAbbr}`;
  }
}


// ── COUNTDOWN ───────────────────────────────────────────────

function initCountdown() {
  const days = document.getElementById('cd-days');
  const hrs  = document.getElementById('cd-hrs');
  const min  = document.getElementById('cd-min');
  const sec  = document.getElementById('cd-sec');
  const live = document.getElementById('cd-live');
  const cd   = document.getElementById('countdown');

  if (!days) return;

  function pad(n) { return String(Math.max(0, n)).padStart(2, '0'); }

  function tick() {
    const diff = LAUNCH_DATE - Date.now();
    if (diff <= 0) {
      if (cd)   cd.hidden = true;
      if (live) live.hidden = false;
      return;
    }
    const totalSec = Math.floor(diff / 1000);
    days.textContent = pad(Math.floor(totalSec / 86400));
    hrs.textContent  = pad(Math.floor((totalSec % 86400) / 3600));
    min.textContent  = pad(Math.floor((totalSec % 3600)  / 60));
    sec.textContent  = pad(totalSec % 60);
  }

  tick();
  setInterval(tick, 1000);
}


// ── SCROLL PROGRESS ─────────────────────────────────────────

function initScrollProgress() {
  const bar = document.getElementById('chrome-scroll');
  if (!bar) return;

  function update() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollable <= 0) return;
    const pct = (window.scrollY / scrollable) * 100;
    bar.style.width = Math.min(100, pct) + '%';
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
}


// ── SECTION LABELS (IntersectionObserver) ───────────────────

function initSectionLabels() {
  const label = document.getElementById('chrome-section');
  if (!label) return;

  const sections = document.querySelectorAll('[data-section]');
  if (!sections.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        label.textContent = entry.target.dataset.section;
      }
    });
  }, { threshold: 0.3 });

  sections.forEach(s => obs.observe(s));
}


// ── TYPING ANIMATIONS ───────────────────────────────────────
// Each .type-in element has data-type="TEXT TO TYPE"
// .tt = text output span, .ic = blinking inline cursor

function initTypeIns() {
  if (prefersReducedMotion) {
    // Show all text instantly
    document.querySelectorAll('.type-in').forEach(el => {
      const tt = el.querySelector('.tt');
      if (tt) tt.textContent = el.dataset.type || '';
    });
    return;
  }

  const typed = new Set();

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting || typed.has(entry.target)) return;
      typed.add(entry.target);
      obs.unobserve(entry.target);
      typeElement(entry.target);
    });
  }, { threshold: 0.4 });

  document.querySelectorAll('.type-in').forEach(el => obs.observe(el));
}

function typeElement(el) {
  const tt   = el.querySelector('.tt');
  const ic   = el.querySelector('.ic');
  const text = el.dataset.type || '';
  if (!tt) return;

  if (ic) ic.classList.add('active');

  let i = 0;
  const msPerChar = el.classList.contains('word-line') ? 28 : 22;

  function next() {
    if (i > text.length) {
      if (ic) { ic.classList.remove('active'); ic.classList.add('done'); }
      return;
    }
    tt.textContent = text.slice(0, i);
    i++;
    setTimeout(next, msPerChar);
  }
  next();
}


// ── CUSTOM CURSOR (desktop only) ────────────────────────────

function initCursor() {
  const dot  = document.getElementById('cur-dot');
  const glow = document.getElementById('cur-glow');

  if (!dot || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  let mx = 0, my = 0;

  window.addEventListener('pointermove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left  = mx + 'px';
    dot.style.top   = my + 'px';
  }, { passive: true });

  // Glow follows with lerp
  let gx = 0, gy = 0;
  function lerpGlow() {
    gx += (mx - gx) * 0.08;
    gy += (my - gy) * 0.08;
    glow.style.left = gx + 'px';
    glow.style.top  = gy + 'px';
    requestAnimationFrame(lerpGlow);
  }
  lerpGlow();

  // Hover states on interactive elements
  document.querySelectorAll('a, button, .pill, input, .pillar, .filter-list li').forEach(el => {
    el.addEventListener('pointerenter', () => dot.classList.add('on-link'));
    el.addEventListener('pointerleave', () => dot.classList.remove('on-link'));
  });
}


// ── WEB3FORMS HANDLERS ──────────────────────────────────────

function initForms() {
  handleForm('ef1', 'fm1');
  handleForm('ef2', 'fm2');
}

function handleForm(formId, msgId) {
  const form = document.getElementById(formId);
  const msg  = document.getElementById(msgId);
  if (!form || !msg) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const btn        = form.querySelector('button[type="submit"]');
    const btnOriginal = btn ? btn.innerHTML : '';
    if (btn) { btn.disabled = true; btn.textContent = '● SENDING...'; }

    msg.className   = 'form-msg';
    msg.textContent = '';

    try {
      const data = new FormData(form);
      const res  = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: data,
      });
      const json = await res.json();

      if (json.success) {
        form.innerHTML = '<div class="form-msg ok">&gt; ACCESS_GRANTED. YOU\'RE IN.</div>';
      } else {
        throw new Error(json.message || 'Failed');
      }
    } catch {
      msg.className   = 'form-msg err';
      msg.textContent = '> CONNECTION_FAILED. TRY_AGAIN.';
      if (btn) { btn.disabled = false; btn.innerHTML = btnOriginal; }
    }
  });
}


// ── CALENDLY TRIGGERS ───────────────────────────────────────

function initCalendly() {
  ['cal1', 'cal2'].forEach(id => {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.addEventListener('click', () => {
      if (typeof Calendly !== 'undefined') {
        Calendly.initPopupWidget({ url: CALENDLY_URL });
      } else {
        window.open(CALENDLY_URL, '_blank', 'noopener');
      }
    });
  });
}


// ── KONAMI / EASTER EGG ─────────────────────────────────────
// Type "RASTRICK" on keyboard to trigger

function initKonami() {
  const target = 'RASTRICK';
  let buf = '';

  window.addEventListener('keydown', e => {
    if (!e.key || e.key.length !== 1) return;
    buf = (buf + e.key.toUpperCase()).slice(-target.length);
    if (buf === target) {
      buf = '';
      triggerEasterEgg();
    }
  });
}

function triggerEasterEgg() {
  const msg = document.createElement('div');
  msg.setAttribute('aria-live', 'polite');
  msg.style.cssText = [
    'position:fixed',
    'inset:0',
    'display:flex',
    'align-items:center',
    'justify-content:center',
    'flex-direction:column',
    'gap:16px',
    'z-index:9000',
    'background:rgba(8,9,11,0.92)',
    'font-family:var(--f-mono)',
    'font-size:clamp(14px,3vw,22px)',
    'color:var(--lime)',
    'letter-spacing:0.08em',
    'text-align:center',
    'padding:40px',
    'cursor:pointer',
  ].join(';');

  msg.innerHTML = [
    '<div style="font-size:clamp(1.5rem,5vw,3rem);color:#ff3df0;animation:blink-block 0.6s step-end infinite">█</div>',
    '<div>&gt; CHEAT CODE ACCEPTED.</div>',
    '<div style="color:#eef1f5">You found it. I respect that.</div>',
    '<div style="color:#9aa2ae;font-size:0.8em;margin-top:8px">// Click to close</div>',
  ].join('');

  msg.addEventListener('click', () => {
    msg.style.opacity = '0';
    msg.style.transition = 'opacity 0.3s ease';
    setTimeout(() => msg.remove(), 300);
  });

  document.body.appendChild(msg);

  // Auto-dismiss after 5s
  setTimeout(() => {
    if (msg.parentNode) {
      msg.style.opacity = '0';
      msg.style.transition = 'opacity 0.4s ease';
      setTimeout(() => msg.remove(), 400);
    }
  }, 5000);
}
