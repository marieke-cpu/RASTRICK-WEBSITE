/* ============================================================
   RASTRICK. MADE — Growth Analytics System v2.0
   Conversion tracking · Lead scoring · Attribution intelligence
   Engagement quality · Package funnel · GA4 custom dimensions
   GA4 property: G-4PTWVZZBJ8

   ── CONVERSION FUNNEL ─────────────────────────────────────────
   Landing Page
   → site_enter               intro dismissed               (session start)
   → cta_click                any CTA clicked               (+10 score)
   → package_click            package-specific CTA clicked  (+25 score)
   → form_start               first field focused            (+20 score)
   → form_submit              form submitted                 (+30 score)
   → form_success             redirect lands on thank-you    (conversion)
   → lead_submit              full attribution fired         (GA4 generate_lead)

   ── ENGAGEMENT MILESTONES ─────────────────────────────────────
   → engaged_30s              30 s active time on page
   → engaged_60s              60 s active time on page
   → engaged_120s             120 s active time on page
   → form_abandon             form started, left without submitting
   → calendly_booking_complete Calendly postMessage: event_scheduled

   ── LEAD SCORING ──────────────────────────────────────────────
   Return visit   +10   (localStorage flag)
   CTA click      +10   (non-package CTAs only)
   Package click  +25   (package-specific CTA)
   Scroll 75%+    +15   (once per page)
   Form start     +20   (once per session)
   Form submit    +30   (on valid submission)

   Thresholds:  0–39 = low  ·  40–79 = medium  ·  80+ = high

   ── EVENT MAP ─────────────────────────────────────────────────
   Event                       Trigger                        Key Params
   site_enter                  #boot-enter click              page, traffic_source
   return_visit                localStorage flag on load      page
   cta_click                   .cta / .hcta / etc.            cta_text, section, + std dims
   package_click               pkg-specific CTA               package_name, + std dims
   package_view                .pkg/.pk-card enters viewport  package_name, viewed_count
   calendly_open               [data-calendly="true"] click   section, + std dims
   calendly_booking_complete   Calendly postMessage           full attribution
   form_start                  first field focus              form_name, + std dims
   form_chip_select            .chip click                    chip_value, chip_type
   form_error                  required field missing         form_name
   form_submit                 form.book submit               form_name, + std dims + funnel
   form_abandon                pagehide with started form     form_name, + std dims + time
   form_success                thank-you page load            lead_score, engagement_level
   lead_submit                 thank-you page load            full attribution params
   generate_lead               thank-you page load            GA4 standard conversion
   engaged_30s/60s/120s        active-time milestones         lead_score, scroll_depth
   scroll_depth                25/50/75/100% scroll           depth, lead_score_at_time
   faq_open                    details.q toggle open          question, faq_index

   ── GA4 CUSTOM DIMENSIONS ─────────────────────────────────────
   lead_score · engagement_level · package_interest
   upgrades_interest · traffic_source · landing_page
   session_type · device_type · journey_depth

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
  var _queue   = [];
  var _polling = false;

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
    path:       location.pathname,
    name:       (document.title.split('|')[0] || document.title).trim(),
    ref:        document.referrer,
    utm_src:    _qs.get('utm_source')   || '',
    utm_med:    _qs.get('utm_medium')   || '',
    utm_cmp:    _qs.get('utm_campaign') || '',
    pkgParam:   _qs.get('pkg')          || '',
    isThankYou: /thank.?you/i.test(location.pathname),
  };

  // ── UTM persistence — Task 1 ──────────────────────────────────
  // First-touch wins: write once on URL-bearing entry, preserve across all navigation.
  var UTM = (function () {
    try {
      var stored  = JSON.parse(_ss.getItem('rm_utm') || 'null');
      var fromUrl = {};
      ['utm_source','utm_medium','utm_campaign','utm_content','utm_term'].forEach(function (k) {
        var v = _qs.get(k);
        if (v) fromUrl[k] = v;
      });
      // Only write on first-touch; never overwrite existing valid session attribution
      if (Object.keys(fromUrl).length && !stored) {
        _ss.setItem('rm_utm', JSON.stringify(fromUrl));
        return fromUrl;
      }
      return stored || {};
    } catch (e) { return {}; }
  }());

  // ── Landing page + page-journey persistence ───────────────────
  var LANDING_PAGE = (function () {
    var lp = _ss.getItem('rm_landing');
    if (!lp) {
      lp = PAGE.path + (location.search || '');
      _ss.setItem('rm_landing', lp);
    }
    return lp;
  }());

  var _journey = (function () {
    try {
      var j = JSON.parse(_ss.getItem('rm_journey') || '[]');
      if (j.indexOf(PAGE.path) === -1) {
        j.push(PAGE.path);
        _ss.setItem('rm_journey', JSON.stringify(j));
      }
      return j;
    } catch (e) { return [PAGE.path]; }
  }());

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

  // ── Attribution + device helpers — Tasks 3/7/8 ───────────────

  function _getDeviceType() {
    var ua = navigator.userAgent || '';
    if (/iPad|Tablet/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua))) return 'tablet';
    if (/Mobi|Android|iPhone/i.test(ua)) return 'mobile';
    return 'desktop';
  }

  function _getTrafficSource() {
    var src = UTM.utm_source || '';
    var med = UTM.utm_medium || '';
    var ref = PAGE.ref;
    if (src) {
      if (/instagram/i.test(src))     return 'instagram';
      if (/google/i.test(src))        return med === 'cpc' ? 'google_paid' : 'google_organic';
      if (/facebook|meta/i.test(src)) return 'facebook';
      if (/linkedin/i.test(src))      return 'linkedin';
      return src.toLowerCase();
    }
    if (!ref)                          return 'direct';
    if (/google\./i.test(ref))         return 'google_organic';
    if (/instagram\.com/i.test(ref))   return 'instagram';
    if (/facebook\.com/i.test(ref))    return 'facebook';
    if (/linkedin\.com/i.test(ref))    return 'linkedin';
    return 'referral';
  }

  // Standard GA4 custom dimension set — attached to all key events
  function _stdDims() {
    return {
      lead_score:        RM.score,
      engagement_level:  RM.level(),
      package_interest:  RM.packageInterest || 'none',
      upgrades_interest: _ss.getItem('rm_upgrades') || '',
      traffic_source:    _getTrafficSource(),
      landing_page:      LANDING_PAGE,
      session_type:      _isReturn ? 'return' : 'new',
      page:              PAGE.path,
    };
  }

  // Full attribution bundle — used in lead events and booking complete
  function _fullAttrib() {
    return Object.assign(_stdDims(), {
      utm_source:    UTM.utm_source   || '',
      utm_medium:    UTM.utm_medium   || '',
      utm_campaign:  UTM.utm_campaign || '',
      utm_content:   UTM.utm_content  || '',
      utm_term:      UTM.utm_term     || '',
      referrer:      PAGE.ref         || '',
      device_type:   _getDeviceType(),
      journey_depth: _journey.length,
    });
  }

  // ── Package funnel intelligence — Task 6 ─────────────────────
  var _pkgFunnel = (function () {
    try {
      return JSON.parse(_ss.getItem('rm_pkg_funnel') || '{"viewed":[],"clicks":{}}');
    } catch (e) { return { viewed: [], clicks: {} }; }
  }());

  function _savePkgFunnel() {
    try { _ss.setItem('rm_pkg_funnel', JSON.stringify(_pkgFunnel)); } catch (e) {}
  }

  function _recordPkgView(name) {
    if (!name || _pkgFunnel.viewed.indexOf(name) !== -1) return;
    _pkgFunnel.viewed.push(name);
    _savePkgFunnel();
  }

  function _recordPkgClick(name) {
    if (!name) return;
    _pkgFunnel.clicks[name] = (_pkgFunnel.clicks[name] || 0) + 1;
    _savePkgFunnel();
  }

  function _topPkg() {
    var max = 0, top = '';
    Object.keys(_pkgFunnel.clicks).forEach(function (k) {
      if (_pkgFunnel.clicks[k] > max) { max = _pkgFunnel.clicks[k]; top = k; }
    });
    return top || RM.packageInterest || 'none';
  }

  // ── Utilities ─────────────────────────────────────────────────

  // Map known IDs to readable section names
  var SECTION_ID_MAP = {
    top:            'hero',
    'main-content': 'main',
    packages:       'packages',
    contact:        'contact',
    work:           'work',
    faq:            'faq',
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
      var name    = nameEl ? nameEl.textContent.replace(/\s+/g, ' ').trim() : '';
      return name ? { package_name: name, package_price: priceEl ? priceEl.textContent.trim() : '' } : null;
    }

    // packages.html
    var pkCard = el.closest('.pk-card');
    if (pkCard) {
      var nameEl2  = pkCard.querySelector('.pk-card-name');
      var tagEl    = pkCard.querySelector('.pk-card-tagline');
      var name2    = nameEl2 ? nameEl2.textContent.replace(/\s+/g, ' ').trim() : '';
      var rawTag   = tagEl ? tagEl.textContent : '';
      var priceHit = rawTag.match(/From\s+[\$\d,\s––+]+/i);
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

    var section = sectionOf(el);
    var label   = ctaLabel(el);
    var dest    = el.getAttribute('href') || '';
    var pkgCtx  = packageContextOf(el);

    // ── Package CTA ───────────────────────────
    if (pkgCtx) {
      RM.setPackage(pkgCtx.package_name);
      RM.add(25); // package click score
      _recordPkgClick(pkgCtx.package_name);
      track('package_click', Object.assign(_stdDims(), {
        package_name:          pkgCtx.package_name,
        package_price:         pkgCtx.package_price,
        cta_text:              label,
        section:               section,
        viewed_packages_count: _pkgFunnel.viewed.length,
        top_package:           _topPkg(),
      }));
    } else {
      RM.add(10); // generic CTA score
    }

    // ── Calendly trigger ──────────────────────
    if (el.hasAttribute('data-calendly')) {
      track('calendly_open', Object.assign(_stdDims(), {
        section:  section,
        cta_text: label,
      }));
    }

    // ── Intro enter ───────────────────────────
    if (el.id === 'boot-enter') {
      track('site_enter', Object.assign(_stdDims(), { section: 'intro' }));
    }

    // ── General CTA (always fires) ────────────
    track('cta_click', Object.assign(_stdDims(), {
      cta_text:    label,
      cta_name:    label,
      section:     section,
      destination: dest,
      package:     pkgCtx ? pkgCtx.package_name : '',
    }));
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
        _recordPkgView(pkgName);
        track('package_view', Object.assign(_stdDims(), {
          package_name:          pkgName,
          package_price:         priceEl ? priceEl.textContent.trim().slice(0, 40) : '',
          viewed_packages_count: _pkgFunnel.viewed.length,
        }));
        pkgObserver.unobserve(card);
      });
    }, { threshold: 0.4 });

    document.querySelectorAll('.pkg, .pk-card').forEach(function (card) {
      pkgObserver.observe(card);
    });
  }

  // ── Form funnel tracking ──────────────────────────────────────
  document.querySelectorAll('form.book').forEach(function (form) {
    var formName     = form.getAttribute('name') || 'contact';
    var started      = false;
    var submitted    = false;
    var abandonFired = false;
    var pageStart    = Date.now();

    // form_start — fires once on first text/email/textarea focus
    form.querySelectorAll('input[type=text], input[type=email], textarea').forEach(function (field) {
      field.addEventListener('focus', function onFocus() {
        if (started) return;
        started = true;
        RM.add(20);
        track('form_start', Object.assign(_stdDims(), {
          form_name:     formName,
          form_location: PAGE.path,
        }));
        field.removeEventListener('focus', onFocus);
      });
    });

    // form_chip_select — package/upgrade chip selection
    form.querySelectorAll('.chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        var isUpgrade = !!chip.closest('.chips.upgrades');
        var val       = chip.textContent.trim();
        if (!isUpgrade) {
          RM.setPackage(val);
        } else {
          started = true; // upgrade chip = high-intent signal
        }
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
      submitted = true;
      var svcEl = form.querySelector('#services-val');
      var upgEl = form.querySelector('#upgrades-val');
      var pkg   = (svcEl && svcEl.value) ? svcEl.value : RM.packageInterest;

      RM.setPackage(pkg);
      RM.add(30);

      // Persist upgrades for thank-you page attribution
      if (upgEl && upgEl.value) _ss.setItem('rm_upgrades', upgEl.value);

      track('form_submit', Object.assign(_stdDims(), {
        form_name:                formName,
        form_location:            PAGE.path,
        upgrades_interest:        upgEl ? upgEl.value : (_ss.getItem('rm_upgrades') || ''),
        highest_interest_package: _topPkg(),
        viewed_packages_count:    _pkgFunnel.viewed.length,
        journey_depth:            _journey.length,
      }));
    });

    // ── Form abandonment — Task 5 ─────────────────────────────
    // pagehide is bfcache-compatible and fires reliably across all modern browsers.
    window.addEventListener('pagehide', function () {
      if (abandonFired || submitted) return;
      if (!started && !RM.packageInterest) return; // no meaningful intent shown
      abandonFired = true;
      var upgEl = form.querySelector('#upgrades-val');
      track('form_abandon', Object.assign(_stdDims(), {
        form_name:         formName,
        upgrades_interest: upgEl ? upgEl.value : (_ss.getItem('rm_upgrades') || ''),
        time_on_page:      Math.round((Date.now() - pageStart) / 1000),
      }));
    });
  });

  // ── Scroll depth tracking ─────────────────────────────────────
  // rAF-throttled, fires each threshold once per page load.
  var DEPTHS       = [25, 50, 75, 100];
  var depthFired   = {};
  var scrollQueued = false;
  var _scrollPct   = 0; // read by engagement quality timer

  function checkDepth() {
    var scrolled = window.scrollY + window.innerHeight;
    var total    = document.documentElement.scrollHeight;
    if (total <= 0) return;
    _scrollPct = Math.round((scrolled / total) * 100);
    DEPTHS.forEach(function (d) {
      if (_scrollPct >= d && !depthFired[d]) {
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

  // ── Thank-you page: conversion attribution — Tasks 3/7/8 ─────
  // form_success + lead_submit + generate_lead fire on redirect landing.
  // All attribution + scoring persists via sessionStorage from the form page.
  if (PAGE.isThankYou) {
    track('form_success', Object.assign({ form_name: 'contact' }, RM.toParams()));

    track('lead_submit', Object.assign(_fullAttrib(), {
      highest_interest_package: _topPkg(),
      viewed_packages_count:    _pkgFunnel.viewed.length,
      journey_depth:            _journey.length,
    }));

    // GA4 standard lead conversion event (mark as conversion in GA4 dashboard)
    track('generate_lead', Object.assign(_fullAttrib(), {
      currency:                 'AUD',
      highest_interest_package: _topPkg(),
      viewed_packages_count:    _pkgFunnel.viewed.length,
      journey_depth:            _journey.length,
    }));

    // Reset engagement score after conversion; preserve package + attribution for
    // any follow-up session analysis.
    _ss.removeItem('rm_score');
  }

  // ── Calendly booking complete — Task 2 ───────────────────────
  // Official postMessage API: origin check is required for the listener to
  // receive Calendly's cross-frame messages in all browser/embed configurations.
  // Handles both object payloads and JSON-string payloads (popup vs inline embed).
  var _bookingFired = false;
  window.addEventListener('message', function (e) {
    try {
      if (e.origin !== 'https://calendly.com') return;
      var data = e.data;
      if (typeof data === 'string') {
        try { data = JSON.parse(data); } catch (_) { return; }
      }
      if (!data || data.event !== 'calendly.event_scheduled') return;
      if (_bookingFired) return; // prevent duplicate on rapid re-render
      _bookingFired = true;
      console.log('Calendly booking completed', data); // remove after GA4 verification
      track('calendly_booking_complete', Object.assign(_fullAttrib(), {
        highest_interest_package: _topPkg(),
        viewed_packages_count:    _pkgFunnel.viewed.length,
        journey_depth:            _journey.length,
        booking_timestamp:        new Date().toISOString(),
      }));
    } catch (err) {}
  });

  // ── Engagement quality tracking — Task 4 ─────────────────────
  // Active-time milestones: paused when tab is hidden, fire each once only.
  (function () {
    var MILESTONES = [30, 60, 120];
    var fired      = {};
    var activeMs   = 0;
    var lastTick   = Date.now();
    var tabHidden  = (typeof document.hidden !== 'undefined') ? document.hidden : false;

    document.addEventListener('visibilitychange', function () {
      tabHidden = document.hidden;
      if (!tabHidden) lastTick = Date.now(); // reset reference on return from hidden
    });

    var _engTimer = setInterval(function () {
      var now = Date.now();
      if (!tabHidden) activeMs += now - lastTick;
      lastTick = now;

      var activeSec = Math.floor(activeMs / 1000);
      var allFired  = true;

      MILESTONES.forEach(function (s) {
        if (fired[s]) return;
        allFired = false;
        if (activeSec >= s) {
          fired[s] = true;
          track('engaged_' + s + 's', {
            page:               PAGE.path,
            lead_score_at_time: RM.score,
            package_interest:   RM.packageInterest || 'none',
            scroll_depth:       _scrollPct,
            engagement_level:   RM.level(),
            traffic_source:     _getTrafficSource(),
          });
        }
      });

      if (allFired) clearInterval(_engTimer);
    }, 1000);
  }());

  // Expose for debug console: window._RM.score, .UTM, .pkgFunnel, .journey
  window._RM            = RM;
  window._RM.UTM        = UTM;
  window._RM.pkgFunnel  = _pkgFunnel;
  window._RM.journey    = _journey;

}());
