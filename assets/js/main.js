/* ============================================================
   Stackly Health Checkup Center - Main JavaScript
   GSAP powered animations + UI interactions
   ============================================================ */
(function () {
    'use strict';

    var docEl = document.documentElement;
    docEl.classList.add('has-js');

    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var hasGSAP = typeof window.gsap !== 'undefined';
    var hasST = hasGSAP && typeof window.ScrollTrigger !== 'undefined';
    var isDashboard = document.body.classList.contains('dashboard');
    var isAuth = document.body.classList.contains('auth-page');

    if (hasST) {
        gsap.registerPlugin(ScrollTrigger);
    }

    /* ---------------------------------------------------------
       Preloader
    --------------------------------------------------------- */
    function initPreloader() {
        var preloader = document.getElementById('preloader');
        if (!preloader) return;

        var bar = preloader.querySelector('.preloader__bar i');
        var pulse = preloader.querySelector('.preloader__pulse polyline');

        if (hasGSAP) {
            var tl = gsap.timeline();
            if (pulse) {
                tl.to(pulse, { strokeDashoffset: 0, duration: 0.9, ease: 'power2.inOut' }, 0);
            }
            if (bar) {
                tl.to(bar, { width: '100%', duration: 0.9, ease: 'power2.inOut' }, 0);
            }
            tl.to(preloader, {
                autoAlpha: 0,
                duration: 0.6,
                delay: 0.15,
                ease: 'power2.out',
                onComplete: function () { preloader.style.display = 'none'; }
            });
        } else {
            if (bar) bar.style.width = '100%';
            setTimeout(function () {
                preloader.style.transition = 'opacity .5s ease';
                preloader.style.opacity = '0';
                setTimeout(function () { preloader.style.display = 'none'; }, 500);
            }, 700);
        }
    }

    /* ---------------------------------------------------------
       Navbar scroll state + active link
    --------------------------------------------------------- */
    function initNavbar() {
        var nav = document.getElementById('mainNav');
        if (!nav) return;

        var onScroll = function () {
            nav.classList.toggle('is-scrolled', window.scrollY > 24);
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });

        var links = Array.prototype.slice.call(nav.querySelectorAll('.nav-link[href^="#"]'));
        var sections = links.map(function (l) {
            return document.querySelector(l.getAttribute('href'));
        }).filter(Boolean);

        if (sections.length && 'IntersectionObserver' in window) {
            var io = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        links.forEach(function (l) {
                            l.classList.toggle('active',
                                l.getAttribute('href') === '#' + entry.target.id);
                        });
                    }
                });
            }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
            sections.forEach(function (s) { io.observe(s); });
        }

        var toggler = nav.querySelector('.navbar-toggler');
        var menu = document.getElementById('navMenu');
        if (toggler && menu) {
            menu.querySelectorAll('a').forEach(function (a) {
                a.addEventListener('click', function () {
                    if (menu.classList.contains('show')) {
                        var instance = bootstrap.Collapse.getInstance(menu) ||
                            new bootstrap.Collapse(menu, { toggle: false });
                        instance.hide();
                    }
                });
            });
        }
    }

    /* ---------------------------------------------------------
       Scroll progress bar
    --------------------------------------------------------- */
    function initScrollProgress() {
        if (!hasST || prefersReduced || isAuth) return;
        if (!document.querySelector('.section, .error-page, .dash-main')) return;

        var bar = document.createElement('div');
        bar.className = 'scroll-progress';
        bar.setAttribute('aria-hidden', 'true');
        document.body.appendChild(bar);

        gsap.to(bar, {
            scaleX: 1,
            ease: 'none',
            scrollTrigger: { start: 0, end: 'max', scrub: 0.3 }
        });
    }

    /* ---------------------------------------------------------
       Active nav link based on current page
    --------------------------------------------------------- */
    function initActivePage() {
        var nav = document.getElementById('mainNav');
        if (!nav) return;

        var path = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();

        nav.querySelectorAll('.nav-link').forEach(function (link) {
            var href = (link.getAttribute('href') || '').split('#')[0];
            if (!href) return;
            var file = href.split('/').pop().toLowerCase();
            var isCurrent = file === path;
            link.classList.toggle('active', isCurrent);
            if (isCurrent) {
                link.setAttribute('aria-current', 'page');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    }

    /* ---------------------------------------------------------
       Smooth scroll for anchor links
    --------------------------------------------------------- */
    function initSmoothScroll() {
        document.addEventListener('click', function (e) {
            var link = e.target.closest('a[href^="#"]');
            if (!link) return;
            var id = link.getAttribute('href');
            if (id === '#' || id.length < 2) return;
            var target = document.querySelector(id);
            if (!target) return;
            e.preventDefault();
            var offset = 76;
            var top = target.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top: top, behavior: prefersReduced ? 'auto' : 'smooth' });
        });
    }

    /* ---------------------------------------------------------
       Split section titles into animated words
       (preserves <em> and other inline markup)
    --------------------------------------------------------- */
    function splitTitleWords(title) {
        if (title.dataset.splitWords) return title.querySelectorAll('.w > span');
        title.dataset.splitWords = '1';

        var wrapWords = function (node) {
            Array.prototype.slice.call(node.childNodes).forEach(function (child) {
                if (child.nodeType === 3) {
                    var parts = child.textContent.split(/(\s+)/);
                    var frag = document.createDocumentFragment();
                    parts.forEach(function (p) {
                        if (!p) return;
                        if (/^\s+$/.test(p)) {
                            frag.appendChild(document.createTextNode(p));
                        } else {
                            var outer = document.createElement('span');
                            outer.className = 'w';
                            var inner = document.createElement('span');
                            inner.textContent = p;
                            outer.appendChild(inner);
                            frag.appendChild(outer);
                        }
                    });
                    node.replaceChild(frag, child);
                } else if (child.nodeType === 1 && child.tagName !== 'BR' &&
                           !child.classList.contains('w')) {
                    wrapWords(child);
                }
            });
        };

        wrapWords(title);
        return title.querySelectorAll('.w > span');
    }

    /* ---------------------------------------------------------
       GSAP reveal animations
       - split-word section titles
       - batched stagger for reveal-up / reveal-scale
       - auto-reveal for remaining components
    --------------------------------------------------------- */
    function initReveal() {
        if (!hasGSAP) return;

        if (prefersReduced) {
            gsap.set('.reveal-up, .reveal-scale, ' +
                '.timeline__card, .testi-card, .feature-row__content, .feature-row__media, ' +
                '.footer__brand, .footer__col, .footer__bottom, .breadcrumb-nav, ' +
                '.section-title, .section-tag, .stat-card, .logos, .cta-banner__inner, ' +
                '.about__experience',
                { autoAlpha: 1, clearProps: 'all' });
            return;
        }

        /* ---- Split-word section titles ---- */
        var titles = gsap.utils.toArray('.section-title');
        titles.forEach(function (title) {
            gsap.set(title, { autoAlpha: 1 });
            var words = splitTitleWords(title);
            if (!words.length || !hasST) return;
            gsap.set(words, { yPercent: 115 });
            gsap.to(words, {
                yPercent: 0,
                duration: 1,
                ease: 'power4.out',
                stagger: 0.045,
                scrollTrigger: { trigger: title, start: 'top 88%', once: true }
            });
        });

        if (!hasST) {
            gsap.set('.reveal-up, .reveal-scale', { autoAlpha: 1, y: 0, scale: 1 });
            return;
        }

        /* ---- Batched reveal-up ---- */
        var revealUp = gsap.utils.toArray('.reveal-up').filter(function (el) {
            return !el.classList.contains('section-title');
        });
        if (revealUp.length) {
            gsap.set(revealUp, { autoAlpha: 0, y: 44 });
            ScrollTrigger.batch(revealUp, {
                start: 'top 88%',
                once: true,
                onEnter: function (batch) {
                    gsap.to(batch, {
                        autoAlpha: 1, y: 0,
                        duration: 0.9, ease: 'power3.out',
                        stagger: 0.09,
                        overwrite: 'auto',
                        clearProps: 'transform'
                    });
                }
            });
        }

        /* ---- Batched reveal-scale ---- */
        var revealScale = gsap.utils.toArray('.reveal-scale');
        if (revealScale.length) {
            gsap.set(revealScale, { autoAlpha: 0, y: 40, scale: 0.94 });
            ScrollTrigger.batch(revealScale, {
                start: 'top 86%',
                once: true,
                onEnter: function (batch) {
                    gsap.to(batch, {
                        autoAlpha: 1, y: 0, scale: 1,
                        duration: 1, ease: 'power3.out',
                        stagger: 0.1,
                        overwrite: 'auto',
                        clearProps: 'transform'
                    });
                }
            });
        }

        /* ---- Auto-reveal components without reveal classes ---- */
        var autoSel = [
            '.timeline__card', '.testi-card',
            '.feature-row__content', '.feature-row__media',
            '.footer__brand', '.footer__col',
            '.breadcrumb-nav',
            '.section-tag:not(.reveal-up)',
            '.stat-card:not(.reveal-up)',
            '.logos:not(.reveal-up)',
            '.cta-banner__inner:not(.reveal-up)',
            '.about__experience:not(.reveal-up)'
        ].join(', ');
        var autoEls = gsap.utils.toArray(autoSel).filter(function (el) {
            return !el.closest('.reveal-up, .reveal-scale') &&
                   !el.closest('.hero') &&
                   !el.closest('.preloader');
        });
        if (autoEls.length) {
            gsap.set(autoEls, { autoAlpha: 0, y: 36 });
            ScrollTrigger.batch(autoEls, {
                start: 'top 90%',
                once: true,
                onEnter: function (batch) {
                    gsap.to(batch, {
                        autoAlpha: 1, y: 0,
                        duration: 0.85, ease: 'power3.out',
                        stagger: 0.08,
                        overwrite: 'auto',
                        clearProps: 'transform'
                    });
                }
            });
        }

        /* ---- Footer newsletter / bottom flourish ---- */
        var footNote = document.querySelector('.footer__form-note');
        if (footNote) gsap.set(footNote, { autoAlpha: 1 });
    }

    /* ---------------------------------------------------------
       Safety net: footer content can sit below the batch trigger
       line on tall viewports - reveal it once the page bottom is
       reached so it never stays invisible.
    --------------------------------------------------------- */
    function initBottomSafety() {
        if (!hasGSAP || prefersReduced) return;

        var check = function () {
            if (window.innerHeight + window.scrollY <
                document.documentElement.scrollHeight - 4) return;
            var stuck = gsap.utils.toArray('.footer__brand, .footer__col').filter(function (el) {
                return parseFloat(getComputedStyle(el).opacity) < 0.9;
            });
            if (stuck.length) {
                gsap.to(stuck, {
                    autoAlpha: 1, y: 0, duration: 0.5, ease: 'power3.out', clearProps: 'transform'
                });
            }
        };

        window.addEventListener('scroll', check, { passive: true });
        window.addEventListener('resize', check);
        window.addEventListener('load', check);
        check();
    }

    /* ---------------------------------------------------------
       Hero intro timeline + pointer parallax
    --------------------------------------------------------- */
    function initHero() {
        if (!hasGSAP || prefersReduced) return;

        var lines = gsap.utils.toArray('.hero__title .line__inner');
        if (lines.length) {
            gsap.set(lines, { yPercent: 118 });
            gsap.to(lines, {
                yPercent: 0, duration: 1, ease: 'power4.out',
                stagger: 0.12, delay: 0.15
            });
        }

        gsap.from('.hero__eyebrow, .hero__subtitle, .hero__text, .hero__actions, .hero__trust', {
            autoAlpha: 0, y: 30, duration: 0.9, ease: 'power3.out',
            stagger: 0.1, delay: 0.45
        });

        gsap.from('.hero__card--main', {
            autoAlpha: 0, y: 50, scale: 0.96, duration: 1.1, ease: 'power3.out', delay: 0.3
        });

        gsap.from('.hero__float', {
            autoAlpha: 0, y: 26, duration: 0.8, ease: 'back.out(1.6)',
            stagger: 0.15, delay: 0.9
        });

        var scrollCue = document.querySelector('.hero__scroll');
        if (scrollCue && hasST) {
            gsap.to(scrollCue, {
                autoAlpha: 0, y: 20,
                scrollTrigger: {
                    trigger: '.hero', start: 'top top', end: '40% top', scrub: true
                }
            });
        }

        /* Pointer parallax on hero media (x-axis only; y is scroll-scrubbed) */
        var media = document.querySelector('.hero__media');
        if (!media || !window.matchMedia('(pointer: fine)').matches) return;

        var mainCard = media.querySelector('.hero__card--main');
        var floats = media.querySelectorAll('.hero__float');
        var xToMain = mainCard ? gsap.quickTo(mainCard, 'x', { duration: 0.7, ease: 'power3.out' }) : null;
        var xToFloats = [];
        floats.forEach(function (f, i) {
            xToFloats.push({
                fn: gsap.quickTo(f, 'x', { duration: 0.85, ease: 'power3.out' }),
                depth: 14 + i * 8
            });
        });

        media.addEventListener('mousemove', function (e) {
            var r = media.getBoundingClientRect();
            var relX = (e.clientX - r.left) / r.width - 0.5;
            if (xToMain) xToMain(relX * 18);
            xToFloats.forEach(function (item) { item.fn(relX * item.depth); });
        });
        media.addEventListener('mouseleave', function () {
            if (xToMain) xToMain(0);
            xToFloats.forEach(function (item) { item.fn(0); });
        });
    }

    /* ---------------------------------------------------------
       Parallax floating elements (scroll scrub)
    --------------------------------------------------------- */
    function initParallax() {
        if (!hasST || prefersReduced) return;
        var items = gsap.utils.toArray('[data-parallax]');
        if (!items.length) return;

        items.forEach(function (el) {
            var strength = parseFloat(el.getAttribute('data-parallax')) || 0.1;
            gsap.to(el, {
                y: function () { return -window.innerHeight * strength; },
                ease: 'none',
                scrollTrigger: {
                    trigger: el.closest('.hero') || el,
                    start: 'top top',
                    end: 'bottom top',
                    scrub: 1
                }
            });
        });

        /* Inner image parallax (containers without hover transforms) */
        var imgParallax = gsap.utils.toArray(
            '.about__img img, .feature-row__media img, .error-page__grid'
        );
        imgParallax.forEach(function (img) {
            gsap.fromTo(img,
                { yPercent: -5 },
                {
                    yPercent: 5,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: img.parentElement,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: true
                    }
                }
            );
        });
    }

    /* ---------------------------------------------------------
       Marquee: scroll velocity boost
    --------------------------------------------------------- */
    function initMarqueeVelocity() {
        if (!hasST || prefersReduced) return;
        var track = document.querySelector('.marquee__track');
        if (!track) return;

        var base = parseFloat(getComputedStyle(track).animationDuration) || 32;
        ScrollTrigger.create({
            onUpdate: function (self) {
                var v = Math.abs(self.getVelocity());
                var boost = gsap.utils.clamp(0, 2.2, v / 900);
                track.style.animationDuration = (base / (1 + boost)) + 's';
            }
        });
    }

    /* ---------------------------------------------------------
       Animated counters
    --------------------------------------------------------- */
    function initCounters() {
        if (isDashboard) return; /* dashboard.js owns its counters */
        var nums = gsap.utils.toArray('[data-count]');
        if (!nums.length) return;

        nums.forEach(function (el) {
            var target = parseFloat(el.getAttribute('data-count')) || 0;
            var suffix = el.getAttribute('data-suffix') || '';
            var obj = { value: 0 };

            var run = function () {
                if (hasGSAP && !prefersReduced) {
                    gsap.to(obj, {
                        value: target, duration: 1.8, ease: 'power2.out',
                        onUpdate: function () { el.textContent = Math.round(obj.value) + suffix; }
                    });
                } else {
                    el.textContent = target + suffix;
                }
            };

            if (hasST && !prefersReduced) {
                ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: run });
            } else {
                run();
            }
        });
    }

    /* ---------------------------------------------------------
       Process progress line
    --------------------------------------------------------- */
    function initProcess() {
        var line = document.getElementById('processLine');
        var section = document.querySelector('.process');
        if (!line || !section || !hasST) return;

        gsap.to(line, {
            width: '100%', ease: 'none',
            scrollTrigger: {
                trigger: section,
                start: 'top 65%',
                end: 'bottom 80%',
                scrub: 1
            }
        });
    }

    /* ---------------------------------------------------------
       Dashboard section entrance animations
       (sections toggle display, so animate on activation)
    --------------------------------------------------------- */
    function initDashboardAnims() {
        if (!isDashboard || !hasGSAP) return;

        var SELECTOR = '.kpi, .panel, .chart-card, .appt-card, .pkg-card, ' +
                       '.person, .metric-row, .empty-state, .table-responsive';

        var animateSection = function (section) {
            if (!section || prefersReduced) return;
            var items = section.querySelectorAll(SELECTOR);
            if (!items.length) return;
            gsap.killTweensOf(items);
            gsap.fromTo(items,
                { autoAlpha: 0, y: 26 },
                {
                    autoAlpha: 1, y: 0,
                    duration: 0.6, ease: 'power3.out',
                    stagger: 0.06,
                    clearProps: 'transform'
                }
            );
            if (hasST) ScrollTrigger.refresh();
        };

        animateSection(document.querySelector('.dash-section.is-active'));

        document.addEventListener('dash:section', function (e) {
            var id = e.detail && e.detail.id;
            var section = (id && (document.getElementById('section-' + id) ||
                                  document.getElementById(id))) ||
                          document.querySelector('.dash-section.is-active');
            animateSection(section);
        });
    }

    /* ---------------------------------------------------------
       404 page entrance
    --------------------------------------------------------- */
    function initErrorPage() {
        var page = document.getElementById('errorPage');
        if (!page || !hasGSAP || prefersReduced) return;

        var tl = gsap.timeline({ delay: 0.1 });
        tl.from('.error-page__logo', { autoAlpha: 0, y: -16, duration: 0.6, ease: 'power3.out' })
          .from('.error-page__code', {
              autoAlpha: 0, scale: 0.82, filter: 'blur(14px)',
              duration: 1, ease: 'power3.out'
          }, '-=0.3')
          .from('.error-page__title', { autoAlpha: 0, y: 20, duration: 0.7, ease: 'power3.out' }, '-=0.55')
          .from('.error-page__text', { autoAlpha: 0, y: 16, duration: 0.7, ease: 'power3.out' }, '-=0.5')
          .from('.error-page__actions', {
              y: 16, duration: 0.6, ease: 'back.out(1.5)', clearProps: 'transform'
          }, '-=0.4');

        gsap.to('.error-page__blob--1', {
            x: 16, y: -22, duration: 6, yoyo: true, repeat: -1, ease: 'sine.inOut'
        });
        gsap.to('.error-page__blob--2', {
            x: -14, y: 18, duration: 7, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 0.5
        });
    }

    /* ---------------------------------------------------------
       Auth pages: visual panel pointer parallax
    --------------------------------------------------------- */
    function initAuthTouch() {
        if (!isAuth || !hasGSAP || prefersReduced) return;
        var visual = document.querySelector('.auth-visual');
        if (!visual || !window.matchMedia('(pointer: fine)').matches) return;

        var body = visual.querySelector('.auth-visual__body');
        var features = visual.querySelector('.auth-features');
        if (body) {
            var xTo = gsap.quickTo(body, 'x', { duration: 0.8, ease: 'power3.out' });
            var yTo = gsap.quickTo(body, 'y', { duration: 0.8, ease: 'power3.out' });
            visual.addEventListener('mousemove', function (e) {
                var r = visual.getBoundingClientRect();
                xTo(((e.clientX - r.left) / r.width - 0.5) * 12);
                yTo(((e.clientY - r.top) / r.height - 0.5) * 10);
            });
            visual.addEventListener('mouseleave', function () { xTo(0); yTo(0); });
        }
        if (features) {
            gsap.from(features.children, {
                autoAlpha: 0, x: -18, duration: 0.6,
                stagger: 0.08, delay: 0.35, ease: 'power3.out'
            });
        }
    }

    /* ---------------------------------------------------------
       Pricing toggle
    --------------------------------------------------------- */
    function initPricing() {
        var switchEl = document.getElementById('priceSwitch');
        if (!switchEl) return;

        var buttons = switchEl.querySelectorAll('.packages__switch-btn');
        var amounts = document.querySelectorAll('.package-card__price .amount');

        switchEl.addEventListener('click', function (e) {
            var btn = e.target.closest('.packages__switch-btn');
            if (!btn || btn.classList.contains('active')) return;

            buttons.forEach(function (b) {
                var isActive = b === btn;
                b.classList.toggle('active', isActive);
                b.setAttribute('aria-selected', isActive ? 'true' : 'false');
            });

            var plan = btn.getAttribute('data-plan');
            amounts.forEach(function (el) {
                var value = el.getAttribute('data-' + plan);
                if (value === null) return;
                var counter = { n: parseFloat(el.textContent) || 0 };
                var dest = parseFloat(value);
                if (hasGSAP && !prefersReduced) {
                    gsap.to(counter, {
                        n: dest, duration: 0.5, ease: 'power2.out',
                        onUpdate: function () { el.textContent = Math.round(counter.n); }
                    });
                } else {
                    el.textContent = value;
                }
            });
        });
    }

    /* ---------------------------------------------------------
       Testimonials slider
    --------------------------------------------------------- */
    function initTestimonials() {
        var track = document.getElementById('testiTrack');
        if (!track) return;

        var cards = track.querySelectorAll('.testi-card');
        var prev = document.getElementById('tPrev');
        var next = document.getElementById('tNext');
        if (!cards.length) return;

        var index = 0;

        var perView = function () {
            if (window.innerWidth < 768) return 1;
            return 2;
        };

        var maxIndex = function () {
            return Math.max(0, cards.length - perView());
        };

        var update = function () {
            if (index > maxIndex()) index = maxIndex();
            var card = cards[0];
            var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 0;
            var step = card.getBoundingClientRect().width + gap;
            track.style.transform = 'translateX(' + (-index * step) + 'px)';
        };

        if (next) next.addEventListener('click', function () {
            index = index >= maxIndex() ? 0 : index + 1;
            update();
        });
        if (prev) prev.addEventListener('click', function () {
            index = index <= 0 ? maxIndex() : index - 1;
            update();
        });

        var raf;
        window.addEventListener('resize', function () {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(function () {
                update();
                if (hasST) ScrollTrigger.refresh();
            });
        });
        update();
    }

    /* ---------------------------------------------------------
       Test catalog filter
    --------------------------------------------------------- */
    function initTestsFilter() {
        var wrap = document.getElementById('testsFilter');
        if (!wrap) return;

        var buttons = wrap.querySelectorAll('.tests__filter-btn');
        var items = document.querySelectorAll('.test-item');
        var countEl = document.querySelector('[data-tests-count]');
        var emptyEl = document.querySelector('[data-tests-empty]');
        if (!items.length) return;

        wrap.addEventListener('click', function (e) {
            var btn = e.target.closest('.tests__filter-btn');
            if (!btn || btn.classList.contains('active')) return;

            buttons.forEach(function (b) {
                var isActive = b === btn;
                b.classList.toggle('active', isActive);
                b.setAttribute('aria-selected', isActive ? 'true' : 'false');
            });

            var filter = btn.getAttribute('data-filter');
            var visible = 0;

            items.forEach(function (item) {
                var match = filter === 'all' || item.getAttribute('data-category') === filter;
                item.classList.toggle('is-hidden', !match);
                if (match) visible++;
            });

            if (countEl) countEl.textContent = visible;
            if (emptyEl) emptyEl.hidden = visible > 0;
            if (hasST) ScrollTrigger.refresh();
        });
    }

    /* ---------------------------------------------------------
       Email validation + input restriction
       Only letters, numbers, "@" and "." are accepted. Any other
       character (including spaces) is rejected on typing/paste, and
       the value must match a valid email shape before submit.
    --------------------------------------------------------- */
    var EMAIL_RE = /^[A-Za-z0-9]+(?:\.[A-Za-z0-9]+)*@[A-Za-z0-9]+(?:\.[A-Za-z0-9]+)*\.[A-Za-z]{2,}$/;
    var EMAIL_STRIP_RE = /[^A-Za-z0-9@.]/g;
    var EMAIL_KEY_RE = /^[A-Za-z0-9@.]$/;

    function sanitizeEmail(value) {
        return String(value == null ? '' : value).replace(EMAIL_STRIP_RE, '');
    }

    function isValidEmail(value) {
        return EMAIL_RE.test(String(value).trim());
    }

    window.StacklyEmail = { sanitize: sanitizeEmail, isValid: isValidEmail, pattern: EMAIL_RE };

    /* ---------------------------------------------------------
       Display name derived from an email address
       e.g. "sangeetha@gmail.com" -> "Sangeetha"
            "sangeetha.raj@mail.com" -> "Sangeetha Raj"
    --------------------------------------------------------- */
    var NAME_SEP_RE = /[._+\-]+/g;

    function displayNameFromEmail(email) {
        var local = String(email == null ? '' : email).split('@')[0] || '';
        local = local.replace(NAME_SEP_RE, ' ').replace(/[0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
        if (!local) return '';
        return local.split(' ').map(function (word) {
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }).join(' ');
    }

    window.StacklyUser = { displayNameFromEmail: displayNameFromEmail };

    function initEmailFields() {
        var inputs = document.querySelectorAll('input[type="email"]');
        Array.prototype.forEach.call(inputs, function (input) {
            input.setAttribute('inputmode', 'email');
            input.setAttribute('autocapitalize', 'off');
            input.setAttribute('spellcheck', 'false');

            input.addEventListener('keydown', function (e) {
                if (e.ctrlKey || e.metaKey || e.altKey) return;
                if (e.key.length !== 1) return;
                if (!EMAIL_KEY_RE.test(e.key)) e.preventDefault();
            });

            input.addEventListener('input', function () {
                var original = input.value;
                var clean = sanitizeEmail(original);
                if (clean === original) return;
                var pos = input.selectionStart;
                var caret = sanitizeEmail(original.slice(0, pos)).length;
                input.value = clean;
                try { input.setSelectionRange(caret, caret); } catch (err) { /* noop */ }
            });
        });
    }

    /* ---------------------------------------------------------
       Name / Phone validation + input restriction
       - Name accepts only alphabetic characters and spaces.
       - Phone accepts only numeric digits (0-9).
       Invalid characters are prevented while typing and stripped
       on paste, with friendly inline messages on blur/submit.
    --------------------------------------------------------- */
    var NAME_STRIP_RE = /[^A-Za-z\s]/g;
    var NAME_KEY_RE = /^[A-Za-z\s]$/;
    var PHONE_STRIP_RE = /\D/g;
    var PHONE_KEY_RE = /^\d$/;

    function isValidName(value) { return /^[A-Za-z\s]+$/.test(String(value).trim()); }
    function isValidPhone(value) { return /^\d+$/.test(String(value).trim()); }

    function restrictField(input, keyRe, stripRe) {
        input.addEventListener('keydown', function (e) {
            if (e.ctrlKey || e.metaKey || e.altKey) return;
            if (e.key.length !== 1) return;
            if (!keyRe.test(e.key)) e.preventDefault();
        });
        input.addEventListener('input', function () {
            var original = input.value;
            var clean = String(original).replace(stripRe, '');
            if (clean === original) return;
            var pos = input.selectionStart;
            var caret = String(original).slice(0, pos).replace(stripRe, '').length;
            input.value = clean;
            try { input.setSelectionRange(caret, caret); } catch (err) { /* noop */ }
        });
    }

    function initInputRestrictions() {
        var nameFields = document.querySelectorAll('input[data-validate="name"]');
        Array.prototype.forEach.call(nameFields, function (input) {
            restrictField(input, NAME_KEY_RE, NAME_STRIP_RE);
            input.setAttribute('autocapitalize', 'words');
            input.setAttribute('spellcheck', 'false');
        });
        var phoneFields = document.querySelectorAll('input[data-validate="phone"]');
        Array.prototype.forEach.call(phoneFields, function (input) {
            restrictField(input, PHONE_KEY_RE, PHONE_STRIP_RE);
            input.setAttribute('inputmode', 'numeric');
        });
    }

    window.StacklyInput = {
        isValidName: isValidName,
        isValidPhone: isValidPhone,
        restrict: restrictField,
        nameStrip: NAME_STRIP_RE,
        phoneStrip: PHONE_STRIP_RE
    };

    /* ---------------------------------------------------------
       Appointment form validation
    --------------------------------------------------------- */
    function initAppointmentForm() {
        var form = document.getElementById('appointmentForm');
        if (!form) return;
        var note = document.getElementById('formNote');

        var setNote = function (msg, ok) {
            if (!note) return;
            note.textContent = msg;
            note.classList.toggle('is-success', !!ok);
            note.classList.toggle('is-error', !ok);
        };

        var name = form.querySelector('[name="name"]');
        var phone = form.querySelector('[name="phone"]');
        var email = form.querySelector('[name="email"]');
        var date = form.querySelector('[name="date"]');

        function feedbackFor(input) {
            var fb = input.nextElementSibling;
            if (!fb || !fb.classList.contains('invalid-feedback')) {
                fb = document.createElement('div');
                fb.className = 'invalid-feedback';
                input.parentNode.insertBefore(fb, input.nextSibling);
            }
            return fb;
        }
        function setFieldState(input, message) {
            var fb = feedbackFor(input);
            if (message) {
                input.classList.add('is-invalid');
                fb.textContent = message;
            } else {
                input.classList.remove('is-invalid');
                fb.textContent = '';
            }
        }
        function validateName(showEmpty) {
            var v = name.value.trim();
            if (!v) {
                if (showEmpty) { setFieldState(name, 'Please enter your full name.'); return false; }
                setFieldState(name, null); return true;
            }
            if (!isValidName(v)) { setFieldState(name, 'Name can only contain letters and spaces.'); return false; }
            setFieldState(name, null); return true;
        }
        function validatePhone(showEmpty) {
            var v = phone.value.trim();
            if (!v) {
                if (showEmpty) { setFieldState(phone, 'Please enter your phone number.'); return false; }
                setFieldState(phone, null); return true;
            }
            if (!isValidPhone(v)) { setFieldState(phone, 'Phone number can only contain digits (0–9).'); return false; }
            setFieldState(phone, null); return true;
        }

        name.addEventListener('input', function () { validateName(false); });
        name.addEventListener('blur', function () { validateName(true); });
        phone.addEventListener('input', function () { validatePhone(false); });
        phone.addEventListener('blur', function () { validatePhone(true); });

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var okName = validateName(true);
            var okPhone = validatePhone(true);

            if (!name.value.trim() || !phone.value.trim() || !email.value.trim() || !date.value) {
                setNote('Please complete all required fields.', false);
                return;
            }
            if (!okName || !okPhone) {
                setNote('Please correct the highlighted fields.', false);
                return;
            }
            if (!isValidEmail(email.value)) {
                setNote('Please enter a valid email address.', false);
                return;
            }

            setNote('Thank you, ' + name.value.trim().split(' ')[0] +
                '! Your request is received &mdash; we will confirm within 15 minutes.', true);
            setFieldState(name, null);
            setFieldState(phone, null);
            form.reset();

            if (hasGSAP && !prefersReduced) {
                gsap.fromTo(note, { autoAlpha: 0, y: 8 },
                    { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power2.out' });
            }
        });
    }

    /* ---------------------------------------------------------
       Newsletter form
    --------------------------------------------------------- */
    function initNewsletter() {
        var form = document.getElementById('newsletterForm');
        if (!form) return;
        var note = document.getElementById('newsNote');
        var input = form.querySelector('input[type="email"]');

        function setNote(message, isError) {
            if (!note) return;
            note.textContent = message;
            note.classList.toggle('is-error', !!isError);
        }

        if (input) {
            input.addEventListener('input', function () {
                if (note && note.classList.contains('is-error')) setNote('', false);
            });
        }

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            if (!input) return;

            var value = input.value.trim();
            if (!value) {
                setNote('Please enter your email address.', true);
                input.focus();
                return;
            }
            if (!isValidEmail(value)) {
                setNote('Please enter a valid email address.', true);
                input.focus();
                return;
            }

            setNote('Subscribed! Redirecting…', false);
            window.location.href = '404.html';
        });
    }

    /* ---------------------------------------------------------
       Back to top + year
    --------------------------------------------------------- */
    function initBackTop() {
        var btn = document.getElementById('backTop');
        if (btn) {
            var toggle = function () {
                btn.classList.toggle('is-visible', window.scrollY > 600);
            };
            toggle();
            window.addEventListener('scroll', toggle, { passive: true });
            btn.addEventListener('click', function () {
                window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
            });
        }

        var year = document.getElementById('year');
        if (year) year.textContent = new Date().getFullYear();
    }

    /* ---------------------------------------------------------
       Boot
    --------------------------------------------------------- */
    function boot() {
        initPreloader();
        initNavbar();
        initActivePage();
        initSmoothScroll();
        initPricing();
        initTestsFilter();
        initTestimonials();
        initEmailFields();
        initInputRestrictions();
        initAppointmentForm();
        initNewsletter();
        initBackTop();

        if (hasGSAP) {
            initReveal();
            initBottomSafety();
            initHero();
            initParallax();
            initMarqueeVelocity();
            initCounters();
            initProcess();
            initDashboardAnims();
            initErrorPage();
            initAuthTouch();
            initScrollProgress();
            if (hasST) {
                window.addEventListener('load', function () { ScrollTrigger.refresh(); });
            }
        } else {
            docEl.classList.remove('has-js');
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
