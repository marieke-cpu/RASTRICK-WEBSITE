/* RASTRICK — cursor, draggable work cards, kinetic copy, form */
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
    // hover states
    document.querySelectorAll('a, button, .card, summary, .chip, input, textarea, select').forEach(el => {
      el.addEventListener('pointerenter', () => { dot.classList.add('hover'); ring.classList.add('hover'); });
      el.addEventListener('pointerleave', () => { dot.classList.remove('hover'); ring.classList.remove('hover'); });
    });
  }

  // ==================== intro gate (TV off) ====================
  const intro = document.getElementById('intro');
  const enterBtn = document.getElementById('enter-btn');
  if (intro && enterBtn){
    let closing = false;
    const open = () => {
      if (closing) return;
      closing = true;
      // TV powers off — static freezes, screen collapses.
      intro.classList.add('tv-off');
      setTimeout(() => {
        intro.classList.add('done');
        document.body.classList.remove('intro-open');
      }, 950);
      setTimeout(() => { intro.remove(); }, 1600);
    };
    enterBtn.addEventListener('click', (e) => { e.stopPropagation(); open(); });
  }

  // ==================== kinetic hero word swap ====================
  const kinetic = document.getElementById('kinetic-word');
  if (kinetic){
    const words = ['ignore', 'match', 'forget', 'replicate'];
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
    const ring = document.querySelector('.cursor-ring');
    const cards = stage.querySelectorAll('.card');
    // initial position
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
        const sr = stage.getBoundingClientRect();
        offX = e.clientX - r.left;
        offY = e.clientY - r.top;
        card.classList.add('dragging');
        card.style.zIndex = ++zTop;
        card.style.transition = 'none';
        card.style.transform = 'rotate(0deg) scale(1.03)';
        if (ring) ring.classList.add('drag');
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
      const release = (e) => {
        if (dragging !== card) return;
        card.classList.remove('dragging');
        card.style.transition = '';
        card.style.transform = `rotate(${card.dataset.r || 0}deg)`;
        if (ring) ring.classList.remove('drag');
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
  // Replace CALENDLY_URL with your own Calendly event link, e.g.
  // "https://calendly.com/hello-rastrick"
  const CALENDLY_URL = 'https://calendly.com/hello-rastrick';
  document.querySelectorAll('[data-calendly="true"]').forEach(el => {
    el.addEventListener('click', e => {
      if (window.Calendly && typeof window.Calendly.initPopupWidget === 'function'){
        e.preventDefault();
        window.Calendly.initPopupWidget({ url: CALENDLY_URL });
      }
    });
  });

  // ==================== scroll reveal ====================
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) en.target.classList.add('in');
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // ==================== local time for Canberra ====================
  const clock = document.getElementById('clock');
  if (clock){
    const tick = () => {
      const d = new Date();
      const opts = { timeZone: 'Australia/Sydney', hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' };
      const t = new Intl.DateTimeFormat('en-GB', opts).format(d);
      clock.textContent = t + ' AEST';
    };
    tick();
    setInterval(tick, 1000);
  }

})();