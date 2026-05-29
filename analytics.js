/* ============================================================
   RASTRICK. MADE — Growth Analytics System v1.0
   Conversion tracking · Lead scoring · Funnel instrumentation
   GA4 property: G-4PTWVZZBJ8

   ── CONVERSION FUNNEL ─────────────────────────────────────────
   Landing Page
   → site_enter          intro dismissed               (session start)
   → cta_click           any CTA clicked               (+10 score)
   → package_click       package-specific CTA clicked  (+25 score)
   → form_start          first field focused            (+20 score)
   → form_submit         form submitted                 (+30 score)
   → form_success        redirect lands on thank-you    (conversion)
   → lead_submit         full attribution fired         (GA4 generate_lead)

   ── LEAD SCORING ──────────────────────────────────────────────
   Return visit   +10   (localStorage flag)
   CTA click      +10   (non-package CTAs only)
   Package click  +25   (package-specific CTA)
   Scroll 75%+    +15   (once per page)
   Form start     +20   (once per session)
   Form submit    +30   (on valid submission)

   Thresholds:  0–39 = low  ·  40–79 = medium  ·  80+ = high

   ── EVENT MAP ─────────────────────────────────────────────────
   Event                  Trigger                         Key Params
   site_enter             #boot-enter click               page
   return_visit           localStorage flag on load       page
   cta_click              .cta / .hcta / .slot-cta etc.  cta_text, section, destination, package
   package_click          .cta/.pk-card-cta inside pkg    package_name, package_price, section
   package_view           .pkg/.pk-card enters viewport   package_name, package_price
   calendly_open          [data-calendly="true"] click    section
   form_start             first field focus               form_name, form_location
   form_chip_select       .chip click                     chip_value, chip_type
   form_error             required field missing          form_name
   form_submit            form.book submit                form_name, package_interest, lead_score
   form_success           thank-you page load             lead_score, engagement_level, package_interest
   lead_submit            thank-you page load             full attribution params
   generate_lead          thank-you page load             GA4 standard conversion
   scroll_depth           25/50/75/100% scroll            depth, lead_score_at_time
   faq_open               details.q toggle open           question, faq_index

   ── SELECTOR MAP ──────────────────────────────────────────────
   CTA elements:
     .cta                index.html + services.html package cards
     .hcta               hero primary + secondary CTAs
     .slot-cta           results section
     .result-cta         case study external links
     .pk-card-cta        packages.html card CTAs
     .kk-cta             Kickstart apply buttons
     .pk-btn             packages.html CTA section buttons
     .ct-book-btn        contact.html booking button
     [data-calendly]     nav Calendly trigger
     #boot-enter         intro gate enter button

   Package containers:
     .pkg                index.html / services.html
     .pk-card            packages.html

   Forms:
     form.book           index.html contact section + contact.html

   ============================================================ */

(function () {
  'use strict';

  // ── Storage shims — safe in private/restricted contexts ───────
  var _ss = (function () {
    try {
      sessionStorage.setItem('_rm_t', '1');
      sessionStorage.removeItem('_rm_t');
      return sessionStorage;
    } catch (e) {
      var _mem = {};
      return {
        getItem:    function (k) { return _mem[k] !== undefined ? _mem[k] : null; },
        setItem:    function (k, v) { _mem[k] = String(v); },
        removeItem: function (k) { delete _mem[k]; },
      };
    }
  }());

  var _ls = (function () {
    try {
      localStorage.setItem('_rm_t', '1');
      localStorage.removeItem('_rm_t');
      return localStorage;
    } catch (e) {
      return { getItem: function () { return null; }, setItem: function () {} };
    }
  }());

  // ── Safe GA4 wrapper — queues events if gtag isn't ready ──────
  var _queue    = [];
  var _polling  = false;

  function track(name, params) {
    var p = Object.assign({
      page_path:     location.pathname,
      page_location: location.href,
    }, params);

    if (typeof window.gtag === 'function') {
      window.gtag('event', name, p);
    } else {
      _queue.push([name, p]);
      if (!_polling) _startPoll();
    }
  }

  function _startPoll() {
    _polling = true;
    var attempts = 0;
    var timer = setInterval(function () {
      if (typeof window.gtag === 'function') {
        clearInterval(timer);
        _queue.splice(0).forEach(function (item) {
          window.gtag('event', item[0], item[1]);
        });
      }
      if (++attempts > 60) clearInterval(timer); // give up after ~6 s
    }, 100);
  }

  // ── Page context ──────────────────────────────────────────────
  var _qs = new URLSearchParams(location.search);
  var PAGE = {
    path:      location.pathname,
    name:      (document.title.split('|')[0] || document.title).trim(),
    ref:       document.referrer,
    utm_src:   _qs.get('utm_source')   || '',
    utm_med:   _qs.get('utm_medium')   || '',
    utm_cmp:   _qs.get('utm_campaign') || '',
    pkgParam:  _qs.get('pkg')          || '',
    isThankYou: /thank.?you/i.test(location.pathname),
  };

  // ── Lead scoring ──────────────────────────────────────────────
  var RM = {
    score:           parseInt(_ss.getItem('rm_score')   || '0', 10),
    packageInterest: _ss.getItem('rm_package') || '',

    add: function (n) {
      this.score = Math.max(0, this.score + n);
      _ss.setItem('rm_score', String(this.score));
    },

    setPackage: function (name) {
      var clean = (name || '').trim();
      if (clean && clean !== 'Not sure yet' && clean !== this.packageInterest) {
        this.packageInterest = clean;
        _ss.setItem('rm_package', clean);
      }
    },

    level: function () {
      if (this.score >= 80) return 'high';
      if (this.score >= 40) return 'medium';
      return 'low';
    },

    toParams: function () {
      return {
        lead_score:       this.score,
        engagement_level: this.level(),
        package_interest: this.packageInterest || 'none',
        page:             PAGE.path,
      };
    },
  };

  // Carry URL package param into session (e.g. contact.html?pkg=kickstart)
  if (PAGE.pkgParam) RM.setPackage(PAGE.pkgParam);

  // ── Return visit detection ────────────────────────────────────
  var _isReturn = !!_ls.getItem('rm_visited');
  _ls.setItem('rm_visited', '1');
  if (_isReturn) {
    RM.add(10);
    track('return_visit', { page: PAGE.path });
  }

  // ── Utilities ─────────────────────────────────────────────────

  // Map known IDs to readable section names
  var SECTION_ID_MAP = {
    top:           'hero',
    'main-content': 'main',
    packages:      'packages',
    contact:       'contact',
    work:          'work',
    faq:           'faq',
  };

  function sectionOf(el) {
    var ancestor = el.closest('section, header, footer, nav, aside');
    if (!ancestor) return 'unknown';
    if (ancestor.id && SECTION_ID_MAP[ancestor.id]) return SECTION_ID_MAP[ancestor.id];
    if (ancestor.id) return ancestor.id;
    var knownClasses = [
      'hero', 'about', 'services', 'packages', 'faq', 'contact',
      'work', 'results', 'nav', 'pk-cards', 'pk-cta', 'sv-cta',
      'ct-faq', 'proof-strip', 'name-ticker',
    ];
    for (var i = 0; i < knownClasses.length; i++) {
      if (ancestor.classList.contains(knownClasses[i])) return knownClasses[i];
    }
    return ancestor.tagName.toLowerCase();
  }

  // Extract package name + price from .pkg (index/services) or .pk-card (packages page)
  function packageContextOf(el) {
    // index.html / services.html
    var pkg = el.closest('.pkg');
    if (pkg) {
      var nameEl  = pkg.querySelector('.name');
      var priceEl = pkg.querySelector('.amt');
      var name = nameEl ? nameEl.textContent.replace(/\s+/g, ' ').trim() : '';
      return name ? { package_name: name, package_price: priceEl ? priceEl.textContent.trim() : '' } : null;
    }

    // packages.html
    var pkCard = el.closest('.pk-card');
    if (pkCard) {
      var nameEl2   = pkCard.querySelector('.pk-card-name');
      var tagEl     = pkCard.querySelector('.pk-card-tagline');
      var name2     = nameEl2 ? nameEl2.textContent.replace(/\s+/g, ' ').trim() : '';
      var rawTag    = tagEl ? tagEl.textContent : '';
      var priceHit  = rawTag.match(/From\s+[\$\d,\s––+]+/i);
      return name2 ? { package_name: name2, package_price: priceHit ? priceHit[0].trim() : '' } : null;
    }

    // Kickstart via URL pattern (any page)
    if (el.href && el.href.indexOf('pkg=kickstart') !== -1) {
      return { package_name: 'Kickstart', package_price: 'From $1,000' };
    }

    return null;
  }

  // Clean CTA label text
  function ctaLabel(el) {
    return (el.textContent || '').replace(/[\s↗→←]+/g, ' ').trim().slice(0, 60);
  }

  // ── CTA + Package click tracking ─────────────────────────────
  var CTA_SELECTOR = [
    '.cta',
    '.hcta',
    '.slot-cta',
    '.result-cta',
    '.pk-card-cta',
    '.kk-cta',
    '.pk-btn',
    '.ct-book-btn',
    '[data-calendly="true"]',
    '#boot-enter',
  ].join(', ');

  // Use capture phase so delegation reaches all elements reliably
  document.addEventListener('click', function (e) {
    var el = e.target.closest(CTA_SELECTOR);
    if (!el) return;

    var section  = sectionOf(el);
    var label    = ctaLabel(el);
    var dest     = el.getAttribute('href') || '';
    var pkgCtx   = packageContextOf(el);

    // ── Package CTA ───────────────────────────
    if (pkgCtx) {
      RM.setPackage(pkgCtx.package_name);
      RM.add(25); // package click score
      track('package_click', {
        package_name:  pkgCtx.package_name,
        package_price: pkgCtx.package_price,
        cta_text:      label,
        section:       section,
        page:          PAGE.path,
      });
    } else {
      RM.add(10); // generic CTA score
    }

    // ── Calendly trigger ──────────────────────
    if (el.hasAttribute('data-calendly')) {
      track('calendly_open', {
        section:  section,
        cta_text: label,
        page:     PAGE.path,
      });
    }

    // ── Intro enter ───────────────────────────
    if (el.id === 'boot-enter') {
      track('site_enter', { page: PAGE.path });
    }

    // ── General CTA (always fires) ────────────
    track('cta_click', {
      cta_text:    label,
      cta_name:    label,
      section:     section,
      destination: dest,
      package:     pkgCtx ? pkgCtx.package_name : '',
      lead_score:  RM.score,
      page:        PAGE.path,
    });
  }, true);

  // ── Package card impression tracking ─────────────────────────
  if ('IntersectionObserver' in window) {
    var pkgObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var card    = en.target;
        var nameEl  = card.querySelector('.name, .pk-card-name');
        var priceEl = card.querySelector('.amt, .pk-card-tagline');
        var pkgName = nameEl ? nameEl.textContent.replace(/\s+/g, ' ').trim() : '';
        if (!pkgName) return;
        track('package_view', {
          package_name:  pkgName,
          package_price: priceEl ? priceEl.textContent.trim().slice(0, 40) : '',
          page:          PAGE.path,
        });
        pkgObserver.unobserve(card);
      });
    }, { threshold: 0.4 });

    document.querySelectorAll('.pkg, .pk-card').forEach(function (card) {
      pkgObserver.observe(card);
    });
  }

  // ── Form funnel tracking ──────────────────────────────────────
  document.querySelectorAll('form.book').forEach(function (form) {
    var formName = form.getAttribute('name') || 'contact';
    var started  = false;

    // form_start — fires once on first text/email/textarea focus
    form.querySelectorAll('input[type=text], input[type=email], textarea').forEach(function (field) {
      field.addEventListener('focus', function onFocus() {
        if (started) return;
        started = true;
        RM.add(20);
        track('form_start', {
          form_name:     formName,
          form_location: PAGE.path,
          page:          PAGE.path,
        });
        field.removeEventListener('focus', onFocus);
      });
    });

    // form_chip_select — package/upgrade chip selection
    form.querySelectorAll('.chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        var isUpgrade = !!chip.closest('.chips.upgrades');
        var val       = chip.textContent.trim();
        if (!isUpgrade) RM.setPackage(val);
        track('form_chip_select', {
          form_name:  formName,
          chip_value: val,
          chip_type:  isUpgrade ? 'upgrade' : 'package',
          page:       PAGE.path,
        });
      });
    });

    // form_error — native validation failure on submit attempt
    var submitBtn = form.querySelector('button[type=submit]');
    if (submitBtn) {
      submitBtn.addEventListener('click', function () {
        if (!form.checkValidity()) {
          track('form_error', {
            form_name:     formName,
            form_location: PAGE.path,
            page:          PAGE.path,
          });
        }
      });
    }

    // form_submit — fires on valid submission (before web3forms redirect)
    form.addEventListener('submit', function () {
      var svcEl  = form.querySelector('#services-val');
      var upgEl  = form.querySelector('#upgrades-val');
      var pkg    = (svcEl && svcEl.value) ? svcEl.value : RM.packageInterest;

      RM.setPackage(pkg);
      RM.add(30);

      track('form_submit', {
        form_name:         formName,
        form_location:     PAGE.path,
        package_interest:  RM.packageInterest || 'none',
        upgrades_interest: upgEl ? upgEl.value : '',
        lead_score:        RM.score,
        page:              PAGE.path,
      });
    });
  });

  // ── Scroll depth tracking ─────────────────────────────────────
  // rAF-throttled, fires each threshold once per page load.
  var DEPTHS       = [25, 50, 75, 100];
  var depthFired   = {};
  var scrollQueued = false;

  function checkDepth() {
    var scrolled = window.scrollY + window.innerHeight;
    var total    = document.documentElement.scrollHeight;
    if (total <= 0) return;
    var pct = Math.round((scrolled / total) * 100);
    DEPTHS.forEach(function (d) {
      if (pct >= d && !depthFired[d]) {
        depthFired[d] = true;
        if (d >= 75) RM.add(15);
        track('scroll_depth', {
          depth:              d,
          lead_score_at_time: RM.score,
          page:               PAGE.path,
        });
      }
    });
  }

  window.addEventListener('scroll', function () {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(function () {
      checkDepth();
      scrollQueued = false;
    });
  }, { passive: true });

  // ── FAQ engagement tracking ───────────────────────────────────
  document.querySelectorAll('details.q').forEach(function (detail, idx) {
    detail.addEventListener('toggle', function () {
      if (!this.open) return;
      var summary = this.querySelector('summary');
      var q = summary
        ? summary.textContent.replace(/[+\-±✕]/g, '').trim().slice(0, 80)
        : '';
      track('faq_open', {
        question:  q,
        faq_index: idx + 1,
        page:      PAGE.path,
      });
    });
  });

  // ── Thank-you page: conversion attribution ───────────────────
  // form_success + lead_submit + generate_lead fire on redirect landing.
  // Package interest + score persist via sessionStorage from the form page.
  if (PAGE.isThankYou) {
    track('form_success', Object.assign({ form_name: 'contact' }, RM.toParams()));

    track('lead_submit', Object.assign({
      utm_source:   PAGE.utm_src,
      utm_medium:   PAGE.utm_med,
      utm_campaign: PAGE.utm_cmp,
      referrer:     PAGE.ref,
    }, RM.toParams()));

    // GA4 standard lead conversion event (mark as conversion in GA4 dashboard)
    track('generate_lead', Object.assign({ currency: 'AUD' }, RM.toParams()));

    // Reset engagement score after conversion; preserve package interest for
    // any follow-up session analysis.
    _ss.removeItem('rm_score');
  }

  // Expose for debug console: window._RM.score, window._RM.packageInterest
  window._RM = RM;

}());
