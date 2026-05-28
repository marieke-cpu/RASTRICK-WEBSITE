/* RASTRICK. MADE — Entrance boot sequence
   Teaser-identical interaction system adapted for the main site entrance gate.
   Owns the full intro lifecycle: typed sequence → dismiss → cleanup.
   Mirrors teaser.js exactly: same timing, same utilities, same architecture.
*/
(function () {
  'use strict';

  const SESSION_KEY = 'rastrick_entered';

  const prefersReducedMotion =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Elements ────────────────────────────────────────────────
  const intro    = document.getElementById('intro');
  const sysLabel = document.getElementById('intro-sys-label');
  const rec      = document.getElementById('intro-rec');
  const initEl   = document.getElementById('intro-init');
  const hlEl     = document.getElementById('intro-hl');
  const loaderEl = document.getElementById('intro-loader');
  const barFill  = document.getElementById('boot-bar-inner');
  const barPct   = document.getElementById('intro-bar-pct');
  const botRow   = document.getElementById('intro-bot-row');
  const enterBtn = document.getElementById('enter-btn');

  if (!intro || !sysLabel) return;

  // ── Skip on revisit ─────────────────────────────────────────
  if (sessionStorage.getItem(SESSION_KEY)) {
    document.body.classList.remove('intro-open');
    intro.remove();
    return;
  }

  // ── Reduced motion: show everything instantly ────────────────
  if (prefersReducedMotion) {
    if (sysLabel) sysLabel.textContent = 'RASTRICK. MADE_OS v.2026 // INDEPENDENT WEB DESIGN STUDIO';
    if (rec)      rec.classList.add('visible');
    if (initEl)   initEl.textContent   = '> INITIALIZING_BRAND.exe';
    if (hlEl)     hlEl.textContent     = 'IMPOSSIBLE TO IGNORE.';
    if (loaderEl) loaderEl.classList.add('visible');
    if (barFill)  barFill.style.width  = '100%';
    if (barPct)   barPct.textContent   = '[ 100% ]';
    if (botRow)   botRow.classList.add('visible');
    if (enterBtn) enterBtn.classList.add('visible');
    // Dismiss is still available via click
    attachDismiss();
    return;
  }

  // ── Utilities (exact mirrors of teaser.js) ───────────────────

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

  function fillBar(durationMs) {
    return new Promise(resolve => {
      if (loaderEl) loaderEl.classList.add('visible');

      const labels = [
        'LOADING: IMPOSSIBLE_TO_IGNORE',
        'COMPILING: ZERO_TEMPLATES',
        'RENDERING: SOMETHING_DIFFERENT',
      ];
      let labelIdx = 0;
      const labelInterval = setInterval(() => {
        labelIdx = (labelIdx + 1) % labels.length;
        const lbl = document.getElementById('intro-loader-label');
        if (lbl) lbl.textContent = labels[labelIdx];
      }, durationMs / 3);

      const start = performance.now();
      function tick(now) {
        const t   = Math.min(1, (now - start) / durationMs);
        const pct = Math.round((1 - Math.pow(1 - t, 1.8)) * 100);
        if (barFill) barFill.style.width = pct + '%';
        if (barPct)  barPct.textContent  = '[ ' + String(pct).padStart(3, ' ') + '% ]';
        if (t < 1) {
          requestAnimationFrame(tick);
        } else {
          clearInterval(labelInterval);
          if (barPct) barPct.textContent = '[ 100% ]';
          resolve();
        }
      }
      requestAnimationFrame(tick);
    });
  }

  function delay(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  // ── Boot sequence (mirrors teaser.js runSequence exactly) ────

  async function runSequence() {
    // T=200ms: REC appears
    setTimeout(() => { if (rec) rec.classList.add('visible'); }, 200);

    // T=300ms: Type system label
    await typeInto(sysLabel, 'RASTRICK. MADE_OS v.2026 // INDEPENDENT WEB DESIGN STUDIO', 18, 300);

    // Type init line (50ms delay)
    await typeInto(initEl, '> INITIALIZING_BRAND.exe', 22, 50);

    // Short pause, type brand headline
    await delay(200);
    await typeInto(hlEl, 'RASTRICK. MADE', 55, 0);

    // Pause with blinking cursor, then delete
    await delay(500);
    await deleteFrom(hlEl, 25);

    // Short pause, type the display message
    await delay(150);
    await typeInto(hlEl, 'IMPOSSIBLE TO IGNORE.', 50, 0);

    // Start loading bar (overlaps with final typing completing)
    await delay(100);
    const barDone = fillBar(1400);

    // Show bottom row partway through loading
    setTimeout(() => { if (botRow) botRow.classList.add('visible'); }, 600);

    await barDone;

    // Show enter CTA
    if (enterBtn) enterBtn.classList.add('visible');
  }

  runSequence();

  // ── Dismiss ─────────────────────────────────────────────────

  let dismissed = false;

  function dismiss() {
    if (dismissed) return;
    dismissed = true;
    sessionStorage.setItem(SESSION_KEY, '1');
    intro.classList.add('tv-off');
    setTimeout(() => {
      intro.classList.add('done');
      document.body.classList.remove('intro-open');
    }, 1200);
    setTimeout(() => { intro.remove(); }, 2000);
  }

  function attachDismiss() {
    if (!enterBtn) return;
    enterBtn.addEventListener('click',   e => { e.stopPropagation(); dismiss(); });
    intro.addEventListener('click',      e => {
      if (e.target === enterBtn || enterBtn.contains(e.target)) return;
      dismiss();
    });
    window.addEventListener('keydown',   () => dismiss(), { once: true });
    window.addEventListener('touchmove', () => dismiss(), { once: true, passive: true });
    window.addEventListener('wheel',     () => dismiss(), { once: true, passive: true });
  }

  attachDismiss();

})();
