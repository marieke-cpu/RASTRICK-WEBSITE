/* RASTRICK — cursor, draggable work cards, kinetic copy, form, intro TV-off */
(function(){

  // ==================== custom cursor ====================
  const dot = document.querySelector('.cursor');
  const ring = document.querySelector('.cursor-ring');
  if (dot && ring && matchMedia('(hover: hover)').matches){
    let tx=0,ty=0,rx=0,ry=0;
    window.addEventListener('pointermove', e => {
      tx = e.clientX; ty = e.clientY;
      dot.style.transform = `translate(${tx}px, ${ty}px) translate(-50%,-50%)`;
    });
    function loop(){
      rx += (tx - rx)*0.18;
      ry += (ty - ry)*0.18;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    }
    loop();
    document.querySelectorAll('a, button, .card, summary, .chip, input, textarea, select').forEach(el => {
      el.addEventListener('pointerenter', () => { dot.classList.add('hover'); ring.classList.add('hover'); });
      el.addEventListener('pointerleave', () => { dot.classList.remove('hover'); ring.classList.remove('hover'); });
    });
  }

  // ==================== intro gate (TV off) ====================
  const intro = document.getElementById('intro');
  const enterBtn = document.getElementById('enter-btn');
  const bootBar = document.getElementById('boot-bar-inner');

  const alreadyEntered = !!sessionStorage.getItem('rastrick_entered');

  // animate the loader bar from 0 -> 100 over a few seconds, then idle at 100
  if (bootBar && !alreadyEntered){
    let pct = 0;
    const start = performance.now();
    const dur = 2200;
    function tick(now){
      const t = Math.min(1, (now - start)/dur);
      // ease-out
      pct = Math.round((1 - Math.pow(1 - t, 2)) * 100);
      bootBar.style.width = pct + '%';
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  if (intro && enterBtn){
    if (alreadyEntered) {
      // Return visit — skip the intro instantly, no animation
      intro.style.display = 'none';
      document.body.classList.remove('intro-open');
      intro.remove();
    } else {
      let closing = false;
      const open = () => {
        if (closing) return;
        closing = true;
        sessionStorage.setItem('rastrick_entered', '1');
        // CRT power-off: bright flash, horizontal line, collapse to a point.
        intro.classList.add('tv-off');
        setTimeout(() => {
          intro.classList.add('done');
          document.body.classList.remove('intro-open');
        }, 1200);
        setTimeout(() => { intro.remove(); }, 2000);
      };
      enterBtn.addEventListener('click', (e) => { e.stopPropagation(); open(); });
      // also allow clicking the boot screen itself to enter
      intro.addEventListener('click', (e) => {
        if (e.target === enterBtn || enterBtn.contains(e.target)) return;
        open();
      });
      // PRESS ANY KEY ▮ — keyboard activation
      window.addEventListener('keydown', () => { if (!closing) open(); }, { once: true });
    }
  }

  // ==================== kinetic hero word swap ====================
  const kinetic = document.getElementById('kinetic-word');
  if (kinetic){
    const words = ['scale', 'sell', 'grow'];
    let i = 0;
    const swap = () => {
      i = (i+1) % words.length;
      const w = words[i];
      kinetic.innerHTML = `<span class="ghost" aria-hidden="true">${w}</span>${w}`;
      kinetic.animate(
        [{ transform: 'translateY(30%) skewX(-8deg)', opacity: 0, filter: 'blur(6px)' },
         { transform: 'translateY(0) skewX(0)', opacity: 1, filter: 'blur(0)' }],
        { duration: 700, easing: 'cubic-bezier(.2,.8,.2,1)' }
      );
    };
    setInterval(swap, 2400);
  }

  // ==================== draggable work cards ====================
  const stage = document.querySelector('.work-stage');
  if (stage){
    // Desktop now uses a CSS hover stack interaction instead of drag.
    if (window.matchMedia('(min-width: 721px)').matches) return;
    const ringEl = document.querySelector('.cursor-ring');
    const cards = stage.querySelectorAll('.card');
    cards.forEach(c => {
      c.style.left = c.dataset.x + 'px';
      c.style.top  = c.dataset.y + 'px';
      c.style.transform = `rotate(${c.dataset.r || 0}deg)`;
    });

    let dragging = null, offX=0, offY=0, zTop = 10;
    cards.forEach(card => {
      card.addEventListener('pointerdown', e => {
        if (e.target.closest('a.visit')) return;
        dragging = card;
        const r = card.getBoundingClientRect();
        offX = e.clientX - r.left;
        offY = e.clientY - r.top;
        card.classList.add('dragging');
        card.style.zIndex = ++zTop;
        card.style.transition = 'none';
        card.style.transform = 'rotate(0deg) scale(1.03)';
        if (ringEl) ringEl.classList.add('drag');
        card.setPointerCapture(e.pointerId);
      });
      card.addEventListener('pointermove', e => {
        if (dragging !== card) return;
        const sr = stage.getBoundingClientRect();
        let x = e.clientX - sr.left - offX;
        let y = e.clientY - sr.top  - offY;
        x = Math.max(-40, Math.min(sr.width - card.offsetWidth + 40, x));
        y = Math.max(-40, Math.min(sr.height - card.offsetHeight + 40, y));
        card.style.left = x + 'px';
        card.style.top  = y + 'px';
      });
      const release = () => {
        if (dragging !== card) return;
        card.classList.remove('dragging');
        card.style.transition = '';
        card.style.transform = `rotate(${card.dataset.r || 0}deg)`;
        if (ringEl) ringEl.classList.remove('drag');
        dragging = null;
      };
      card.addEventListener('pointerup', release);
      card.addEventListener('pointercancel', release);
    });
  }

  // ==================== form chips ====================
  const syncServices = () => {
    const hidden = document.querySelector('#services-val');
    if (!hidden) return;
    hidden.value = [...document.querySelectorAll('form.book .chip.on')].map(c => c.textContent.trim()).join(', ');
  };
  document.querySelectorAll('form.book .chip').forEach(ch => {
    ch.addEventListener('click', e => {
      e.preventDefault();
      ch.classList.toggle('on');
      syncServices();
    });
  });

  // ==================== form submit (Netlify Forms) ====================
  const form = document.querySelector('form.book');
  if (form){
    form.addEventListener('submit', () => {
      syncServices();
      const btn = form.querySelector('button[type=submit]');
      if (btn){
        btn.disabled = true;
        btn.innerHTML = '<span>Sending…</span><span>↗</span>';
      }
    });
  }

  // ==================== calendly popup ====================
  const CALENDLY_URL = 'https://calendly.com/rastrick';
  document.querySelectorAll('[data-calendly="true"]').forEach(el => {
    el.addEventListener('click', e => {
      if (window.Calendly && typeof window.Calendly.initPopupWidget === 'function'){
        e.preventDefault();
        window.Calendly.initPopupWidget({ url: CALENDLY_URL });
      }
    });
  });

  // ==================== mobile nav toggle ====================
  const navToggle = document.getElementById('nav-toggle');
  const navEl = document.querySelector('.nav');
  if (navToggle && navEl) {
    navToggle.addEventListener('click', () => {
      const open = navEl.classList.toggle('nav-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    navEl.querySelectorAll('ul a').forEach(a => {
      a.addEventListener('click', () => {
        navEl.classList.remove('nav-open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Open menu');
        document.body.style.overflow = '';
      });
    });
  }

  // ==================== scroll reveal ====================
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) en.target.classList.add('in');
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // ==================== local time for Canberra ====================
  const clock = document.getElementById('clock');
  const clock2 = document.getElementById('clock-2');
  const clockMobile = document.getElementById('clock-mobile');
  if (clock || clock2 || clockMobile){
    const tick = () => {
      const d = new Date();
      const opts = { timeZone: 'Australia/Sydney', hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' };
      const t = new Intl.DateTimeFormat('en-GB', opts).format(d);
      if (clock)       clock.textContent       = t + ' AEST';
      if (clock2)      clock2.textContent      = t + ' AEST';
      if (clockMobile) clockMobile.textContent = t;
    };
    tick();
    setInterval(tick, 1000);
  }

})();
