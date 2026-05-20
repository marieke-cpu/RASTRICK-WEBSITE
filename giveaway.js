// RASTRICK GIVEAWAY — v2  22.05.26
// ─────────────────────────────────────────────────────────────
// TO TEST STATE 2: set DRAW_TIME_UTC = Date.now() - 5000 and reload
// TO TEST STATE 3: set DRAW_TIME_UTC to any past timestamp and reload
// TO RESET WINNER:  localStorage.removeItem('rastrick_winner') in console
// TO UPDATE ENTRANTS: edit the ENTRANTS array below only
// ─────────────────────────────────────────────────────────────

// ── CONFIG ────────────────────────────────────────────────────

const ENTRANTS = [
  "@iamfrankievee",
  "@iamfrankievee",   // double entry — entered twice, two chances
  "@arnarastrick",
  "@kaylea.rastrick",
  "@djrhewetson",
  "@jessrastrick",
  "@fizzman676",
  "@dj_holdupz",
  "@usomarc3l"
];

// Draw: Friday 22 May 2026 at 10:00 AM AEST (Sydney, UTC+10)
// = 2026-05-22T00:00:00Z in UTC
const DRAW_TIME_UTC = new Date('2026-05-22T00:00:00Z').getTime();

const IG_URL       = 'https://www.instagram.com/rastrick.made';
const WINNER_KEY   = 'rastrick_winner';
const CONFETTI_KEY = 'rastrick_confetti_played';

// ── SEEDED RNG — mulberry32 ───────────────────────────────────

function mulberry32(seed) {
  return function () {
    seed += 0x6D2B79F5;
    let z = seed;
    z = Math.imul(z ^ (z >>> 15), z | 1);
    z ^= z + Math.imul(z ^ (z >>> 7), z | 61);
    return ((z ^ (z >>> 14)) >>> 0) / 0x100000000;
  };
}

function resolveWinner() {
  const cached = localStorage.getItem(WINNER_KEY);
  if (cached) return cached;
  const seed   = DRAW_TIME_UTC >>> 0;
  const rng    = mulberry32(seed);
  const idx    = Math.floor(rng() * ENTRANTS.length);
  const winner = ENTRANTS[idx];
  try { localStorage.setItem(WINNER_KEY, winner); } catch (e) {}
  return winner;
}

// ── DRUM CONSTANTS ────────────────────────────────────────────

const ITEM_H        = 56;
const MASK_H        = 280;
const CENTER_OFFSET = MASK_H / 2 - ITEM_H / 2; // 112

// ── STATE 3 HTML BUILDER ──────────────────────────────────────
// Generates the full winner panel HTML into #gw-result.
// Called once at init — replaces the static shell content.

function buildResultPanel(winner, el) {
  if (!el) return;
  el.innerHTML = `
    <div class="gwr-header">
      <span class="gwr-header-left">// DRAW COMPLETE — 22.05.26</span>
      <span class="gwr-header-right">
        <span class="gwr-rec-dot"></span>WINNER SELECTED
      </span>
    </div>

    <div class="gwr-section-label">
      <span class="gwr-accent-line"></span>
      RASTRICK. MADE — FREE WEBSITE DRAW
    </div>

    <div class="gwr-headline">
      <div class="gwr-hl-wrap"><div class="gwr-hl-line gwr-hl-ink">AND THE</div></div>
      <div class="gwr-hl-wrap"><div class="gwr-hl-line gwr-hl-mag">WINNER IS</div></div>
    </div>

    <div class="gwr-panel">
      <p class="gwr-panel-meta">// WINNER — FREE WEBSITE GIVEAWAY — RASTRICK. MADE 2026</p>
      <div class="gwr-divider"></div>

      <div class="gwr-handle-wrap">
        <span class="gwr-handle-ghost" aria-hidden="true">${winner}</span>
        <span class="gwr-handle-text" id="gw-winner-handle">${winner}</span>
      </div>

      <div class="gwr-divider" style="margin-top:20px"></div>

      <div class="gwr-info-grid">
        <div class="gwr-info-left">
          <span class="gwr-info-label">PRIZE</span>
          <span class="gwr-info-val">Custom Website Build</span>

          <span class="gwr-info-label" style="margin-top:20px">ESTIMATED VALUE</span>
          <span class="gwr-info-val gwr-info-accent">AUD $3,500+</span>
          <span class="gwr-info-note">(incl. GST)</span>
        </div>
        <div class="gwr-info-right">
          <span class="gwr-info-label">WHAT'S INCLUDED</span>
          <ul class="gwr-include-list">
            <li>Custom design (not a template)</li>
            <li>Mobile responsive build</li>
            <li>Contact form + lead capture</li>
            <li>On-page SEO setup</li>
            <li>30-day post-launch support</li>
            <li>Hosting advice included</li>
          </ul>
        </div>
      </div>

      <div class="gwr-divider" style="margin-top:20px"></div>

      <div class="gwr-bottom-row">
        <div class="gwr-drawn-by">
          <span class="gwr-info-label">DRAWN BY</span>
          <span class="gwr-drawn-val">Mulberry32 Seeded RNG — Verifiable &amp; Fair</span>
        </div>
        <a class="gwr-claim-btn" href="${IG_URL}" target="_blank" rel="noopener">DM TO CLAIM →</a>
      </div>
    </div>

    <div class="gwr-stats">
      <div class="gwr-stat">
        <span class="gwr-stat-num gwr-stat-accent">1</span>
        <span class="gwr-stat-lbl">WINNER</span>
      </div>
      <div class="gwr-stat">
        <span class="gwr-stat-num">9</span>
        <span class="gwr-stat-lbl">ENTRANTS</span>
      </div>
      <div class="gwr-stat">
        <span class="gwr-stat-num gwr-stat-mag">AUD $3,500+</span>
        <span class="gwr-stat-lbl">PRIZE VALUE (incl. GST)</span>
      </div>
    </div>

    <div class="gwr-ctas">
      <a class="gwr-btn gwr-btn-primary" href="${IG_URL}" target="_blank" rel="noopener">FOLLOW @RASTRICK.MADE →</a>
      <a class="gwr-btn gwr-btn-ghost" href="#contact">BOOK YOUR OWN SITE →</a>
    </div>

    <p class="gwr-fine-print">Winner has 7 days to claim via Instagram DM. Prize is a custom website build by RASTRICK. MADE valued at AUD $3,500+ incl. GST. Non-transferable. No cash alternative.</p>
  `;
}

// ── DOM INIT ──────────────────────────────────────────────────

(function init() {
  const elPre    = document.getElementById('gw-pre');
  const elSlot   = document.getElementById('gw-slot');
  const elResult = document.getElementById('gw-result');

  if (!elPre) return;

  const winner = resolveWinner();

  // Build STATE 3 content (replaces static shell)
  buildResultPanel(winner, elResult);

  // ── State helpers ──────────────────────────────────────────

  function showPre()    { elPre.hidden = false; elSlot.hidden = true;  elResult.hidden = true;  }
  function showSlot()   { elPre.hidden = true;  elSlot.hidden = false; elResult.hidden = true;  }
  function showResult() { elPre.hidden = true;  elSlot.hidden = true;  elResult.hidden = false; }

  // ── Headline lineUp animation ──────────────────────────────

  function animateHeadlines() {
    const lines = document.querySelectorAll('.gw-hl-line');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      lines.forEach(el => el.classList.add('gw-animated'));
      return;
    }
    lines.forEach((el, i) => {
      setTimeout(() => el.classList.add('gw-animated'), 120 + i * 130);
    });
  }

  animateHeadlines();

  // ── Countdown with digit flash ─────────────────────────────

  const elDays = document.getElementById('gcd-days');
  const elHrs  = document.getElementById('gcd-hrs');
  const elMin  = document.getElementById('gcd-min');
  const elSec  = document.getElementById('gcd-sec');

  function pad2(n) { return String(Math.max(0, n)).padStart(2, '0'); }

  function flashDigit(el, val) {
    if (!el) return;
    const str = pad2(val);
    if (el.textContent !== str) {
      el.textContent = str;
      el.classList.add('gw-flash');
      setTimeout(() => el.classList.remove('gw-flash'), 150);
    }
  }

  function updateCountdown(diffMs) {
    const s = Math.floor(diffMs / 1000);
    flashDigit(elDays, Math.floor(s / 86400));
    flashDigit(elHrs,  Math.floor((s % 86400) / 3600));
    flashDigit(elMin,  Math.floor((s % 3600) / 60));
    flashDigit(elSec,  s % 60);
  }

  // ── Drum machine animation ─────────────────────────────────
  // Single rAF loop — monotonically increasing interval (18ms → 700ms)
  // Guarantees no re-acceleration after deceleration begins. Total: 8000ms

  const unique    = [...new Set(ENTRANTS)];
  const SETS      = 45;
  const drumList  = Array.from({ length: SETS }, () => [...unique]).flat();
  const winnerIdx = unique.indexOf(winner);
  const targetIdx = unique.length * (SETS - 1) + winnerIdx;
  const endY      = targetIdx * ITEM_H - CENTER_OFFSET;

  const DRUM_DURATION = 8000;

  function buildDrum() {
    const drum = document.getElementById('gw-drum');
    if (!drum) return;
    drum.innerHTML = drumList.map(h =>
      `<div class="gw-drum-item">${h}</div>`
    ).join('');
  }

  function setDrumPos(drum, items, y) {
    drum.style.transform = `translateY(-${Math.max(0, y)}px)`;
    const ci = Math.round((Math.max(0, y) + CENTER_OFFSET) / ITEM_H);
    items.forEach((el, i) => el.classList.toggle('gw-drum-center', i === ci));
  }

  function lockWinner(items) {
    items.forEach((el, i) => {
      if (i === targetIdx) {
        el.style.transform  = 'scale(1.06)';
        el.style.color      = 'var(--accent)';
        el.style.textShadow = '0 0 30px rgba(198,255,58,0.7)';
      } else {
        el.style.opacity = '0.15';
        el.style.filter  = 'blur(2px)';
      }
    });
  }

  function runDrum(onComplete) {
    buildDrum();
    const drum     = document.getElementById('gw-drum');
    const progress = document.getElementById('gw-progress-bar');
    if (!drum) { onComplete(); return; }

    const items   = drum.querySelectorAll('.gw-drum-item');
    let drumStart = null;
    let lastSwap  = null;
    let currentY  = 0;

    function getInterval(elapsed) {
      const t = Math.min(elapsed / DRUM_DURATION, 1);
      if (t < 0.19) return 18;
      if (t < 0.50) return 22;
      if (t < 0.81) {
        const p     = (t - 0.50) / 0.31;
        const eased = 1 - Math.pow(2, -10 * p);
        return Math.round(22 + eased * (320 - 22));
      }
      const p = (t - 0.81) / 0.19;
      return Math.round(320 + p * (700 - 320));
    }

    function swapDrum() {
      const safeY = endY - 8 * ITEM_H;
      currentY    = currentY + ITEM_H > safeY ? 0 : currentY + ITEM_H;
      setDrumPos(drum, items, currentY);
    }

    function drumLoop(timestamp) {
      if (!drumStart) drumStart = timestamp;
      const elapsed = timestamp - drumStart;

      if (elapsed >= DRUM_DURATION) {
        setDrumPos(drum, items, endY);
        if (progress) progress.style.width = '100%';
        lockWinner(items);
        setTimeout(onComplete, 800);
        return;
      }

      const interval = getInterval(elapsed);
      if (!lastSwap || timestamp - lastSwap >= interval) {
        swapDrum();
        lastSwap = timestamp;
      }

      if (progress) progress.style.width = (elapsed / DRUM_DURATION * 100) + '%';

      requestAnimationFrame(drumLoop);
    }

    setDrumPos(drum, items, 0);
    requestAnimationFrame(drumLoop);
  }

  // ── Multi-burst confetti ───────────────────────────────────

  function triggerConfetti() {
    if (localStorage.getItem(CONFETTI_KEY)) return;
    if (typeof confetti === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Burst 1 — left cannon
    confetti({
      particleCount: 80, angle: 60, spread: 65,
      origin: { x: 0, y: 0.65 },
      colors: ['#c6ff3a', '#ffffff', '#ff3df0'],
      shapes: ['square'], startVelocity: 52,
      gravity: 0.85, ticks: 260, scalar: 1.1,
    });

    // Burst 2 — right cannon
    setTimeout(() => confetti({
      particleCount: 80, angle: 120, spread: 65,
      origin: { x: 1, y: 0.65 },
      colors: ['#c6ff3a', '#ffffff', '#ff3df0'],
      shapes: ['square'], startVelocity: 52,
      gravity: 0.85, ticks: 260, scalar: 1.1,
    }), 150);

    // Burst 3 — centre rain
    setTimeout(() => confetti({
      particleCount: 60, spread: 120,
      origin: { x: 0.5, y: 0.4 },
      colors: ['#c6ff3a', '#ff3df0', '#eef1f5'],
      shapes: ['square'], startVelocity: 30,
      gravity: 1, ticks: 200, scalar: 0.9,
    }), 400);

    try { localStorage.setItem(CONFETTI_KEY, '1'); } catch (e) {}
  }

  // ── Cinematic STATE 2 → STATE 3 reveal ────────────────────

  function cinematicReveal() {
    const section = document.querySelector('.gw-section');

    // Step 1 (0ms): phosphor burst overlay
    const burst = document.createElement('div');
    burst.className = 'gw-burst-overlay';
    if (section) section.appendChild(burst);
    requestAnimationFrame(() => {
      burst.style.transition = 'opacity 40ms ease';
      burst.style.opacity    = '0.08';
      setTimeout(() => {
        burst.style.opacity = '0';
        setTimeout(() => burst.remove(), 100);
      }, 80);
    });

    // Step 2 (80ms): horizontal scan line top → bottom
    setTimeout(() => {
      const scan = document.createElement('div');
      scan.className = 'gw-scan-line';
      if (section) section.appendChild(scan);
      requestAnimationFrame(() => {
        scan.style.transition = 'top 300ms linear';
        scan.style.top        = '100%';
        setTimeout(() => scan.remove(), 360);
      });
    }, 80);

    // Step 3 (380ms): cross-fade STATE 2 → STATE 3
    setTimeout(() => {
      elSlot.style.transition = 'opacity 200ms ease';
      elSlot.style.opacity    = '0';

      setTimeout(() => {
        elSlot.hidden          = true;
        elSlot.style.opacity   = '';
        elSlot.style.transition = '';

        elResult.hidden              = false;
        elResult.style.opacity       = '0';
        elResult.style.transform     = 'translateY(12px)';
        elResult.style.transition    = 'none';

        requestAnimationFrame(() => {
          elResult.style.transition = 'opacity 400ms ease, transform 400ms cubic-bezier(0.16,1,0.3,1)';
          elResult.style.opacity    = '1';
          elResult.style.transform  = 'translateY(0)';
        });
      }, 200);
    }, 380);

    // Step 4 (600ms): winner handle glitch
    setTimeout(() => {
      const handle = document.getElementById('gw-winner-handle');
      if (!handle) return;
      const jitters = [
        { x: -4, c: 'var(--accent-2)' },
        { x:  3, c: 'var(--accent-2)' },
        { x: -2, c: 'var(--accent-2)' },
        { x:  0, c: 'var(--accent)'   },
      ];
      let step = 0;
      function nextGlitch() {
        if (step >= jitters.length) return;
        const { x, c } = jitters[step++];
        handle.style.transform = `translateX(${x}px)`;
        handle.style.color     = c;
        setTimeout(nextGlitch, 60);
      }
      nextGlitch();
    }, 600);

    // Step 5 (900ms): confetti
    setTimeout(triggerConfetti, 900);

    // Step 6 (1000ms): stagger in stats, CTAs, fine print
    setTimeout(() => {
      const staggerEls = [
        elResult.querySelector('.gwr-stats'),
        elResult.querySelector('.gwr-ctas'),
        elResult.querySelector('.gwr-fine-print'),
      ].filter(Boolean);

      staggerEls.forEach((el, i) => {
        el.style.opacity   = '0';
        el.style.transform = 'translateY(8px)';
        setTimeout(() => {
          el.style.transition = 'opacity 300ms ease, transform 300ms ease';
          el.style.opacity    = '1';
          el.style.transform  = 'translateY(0)';
        }, i * 120);
      });
    }, 1000);
  }

  // ── Background pulse during STATE 2 ───────────────────────

  function setPulse(on) {
    const section = document.querySelector('.gw-section');
    if (section) section.classList.toggle('gw-pulsing', on);
  }

  // ── Main tick loop ─────────────────────────────────────────

  let animationTriggered = false;

  function tick() {
    const diff = DRAW_TIME_UTC - Date.now();

    if (diff > 0) {
      // STATE 1 — before draw
      showPre();
      updateCountdown(diff);

    } else if (diff >= -10000 && !animationTriggered) {
      // STATE 2 — draw window: drum animation
      animationTriggered = true;
      clearInterval(timer);
      showSlot();
      setPulse(true);

      runDrum(function () {
        setPulse(false);
        cinematicReveal(); // handles STATE 3 transition, confetti, stagger
      });

    } else {
      // STATE 3 — draw already done: show winner immediately
      clearInterval(timer);
      showResult();
      triggerConfetti();
    }
  }

  const timer = setInterval(tick, 1000);
  tick();
})();
