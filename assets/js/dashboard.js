/* ============================================================
   Stackly Health Checkup Center - Dashboard UI (shared)
   Sidebar, theme, section routing, search/filter, counters
   ============================================================ */
(function () {
    'use strict';

    var body = document.body;
    var isDesktop = function () { return window.matchMedia('(min-width: 992px)').matches; };

    /* ---------------------------------------------------------
       Theme (permanently dark - toggle has been removed)
    --------------------------------------------------------- */
    function initTheme() {
        body.classList.remove('theme-light');
        body.classList.add('theme-dark');
        try { localStorage.removeItem('stackly-dash-theme'); } catch (e) { /* ignore */ }
    }

    /* ---------------------------------------------------------
       Personalise the dashboard with the logged-in user's name
       The display name is derived from the saved email address
       (e.g. sangeetha@gmail.com -> Sangeetha).
    --------------------------------------------------------- */
    function initUser() {
        var session = null;
        try { session = JSON.parse(localStorage.getItem('stackly-auth') || 'null'); } catch (e) { /* ignore */ }
        if (!session || !session.email) return;

        var name = (window.StacklyUser && window.StacklyUser.displayNameFromEmail)
            ? window.StacklyUser.displayNameFromEmail(session.email)
            : '';
        if (!name) name = session.name || '';
        if (!name) return;

        var firstName = name.split(' ')[0];

        var sidebarName = document.getElementById('sidebarUserName');
        if (sidebarName) sidebarName.textContent = name;

        var sidebarAvatar = document.getElementById('sidebarAvatar');
        if (sidebarAvatar) {
            var initial = (name || firstName || '?').trim().charAt(0).toUpperCase();
            if (initial === '') initial = '?';
            sidebarAvatar.textContent = initial;
        }

        var greetingText = document.getElementById('welcomeGreetingText');
        if (greetingText) {
            var prefix = greetingText.getAttribute('data-greeting-prefix') || 'Hello,';
            greetingText.textContent = prefix + ' ' + firstName;
        }

        var settingsName = document.getElementById('settingsFullName');
        if (settingsName) settingsName.value = name;

        var settingsEmail = document.getElementById('settingsEmail');
        if (settingsEmail) settingsEmail.value = session.email;
    }

    /* ---------------------------------------------------------
       Sidebar: desktop mini + mobile off-canvas
    --------------------------------------------------------- */
    function initSidebar() {
        var sidebar = document.getElementById('sidebar');
        var shell = document.getElementById('dashShell');
        var backdrop = document.getElementById('sidebarBackdrop');
        if (!sidebar) return;

        function open() {
            sidebar.classList.add('is-open');
            if (backdrop) backdrop.classList.add('is-visible');
        }
        function close() {
            sidebar.classList.remove('is-open');
            if (backdrop) backdrop.classList.remove('is-visible');
        }

        document.querySelectorAll('[data-sidebar-toggle]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                if (isDesktop()) {
                    sidebar.classList.toggle('sidebar--mini');
                    if (shell) shell.classList.toggle('is-mini', sidebar.classList.contains('sidebar--mini'));
                    try { localStorage.setItem('stackly-dash-mini', sidebar.classList.contains('sidebar--mini') ? '1' : '0'); } catch (e) { /* ignore */ }
                } else {
                    sidebar.classList.contains('is-open') ? close() : open();
                }
                document.dispatchEvent(new CustomEvent('dash:resize'));
            });
        });

        if (backdrop) backdrop.addEventListener('click', close);

        document.querySelectorAll('.sidebar .side-link').forEach(function (link) {
            link.addEventListener('click', function () {
                if (!isDesktop()) close();
            });
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') close();
        });

        // Restore desktop mini state
        if (isDesktop()) {
            var mini = false;
            try { mini = localStorage.getItem('stackly-dash-mini') === '1'; } catch (e) { /* ignore */ }
            if (mini) {
                sidebar.classList.add('sidebar--mini');
                if (shell) shell.classList.add('is-mini');
            }
        }

        window.addEventListener('resize', function () {
            if (isDesktop()) {
                sidebar.classList.remove('is-open');
                if (backdrop) backdrop.classList.remove('is-visible');
            }
        });
    }

    /* ---------------------------------------------------------
       Section routing (SPA style)
    --------------------------------------------------------- */
    function initRouting() {
        var links = document.querySelectorAll('[data-section]');
        var titleEl = document.getElementById('pageTitle');
        var subtitleEl = document.getElementById('pageSubtitle');

        function show(id) {
            var target = document.getElementById('section-' + id) || document.getElementById(id);
            if (!target) return;

            document.querySelectorAll('.dash-section').forEach(function (s) {
                s.classList.toggle('is-active', s === target);
            });

            links.forEach(function (l) {
                var active = l.getAttribute('data-section') === id;
                l.classList.toggle('is-active', active);
                l.setAttribute('aria-current', active ? 'page' : 'false');
                if (active) {
                    if (titleEl && l.getAttribute('data-title')) titleEl.textContent = l.getAttribute('data-title');
                    if (subtitleEl && l.getAttribute('data-subtitle')) subtitleEl.textContent = l.getAttribute('data-subtitle');
                }
            });

            window.scrollTo({ top: 0, behavior: 'smooth' });
            animateCounters(target);
            document.dispatchEvent(new CustomEvent('dash:section', { detail: { id: id } }));
            if (history.replaceState) history.replaceState(null, '', '#' + id);
        }

        links.forEach(function (link) {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                show(link.getAttribute('data-section'));
            });
        });

        // Deep-link + "go to section" buttons
        document.querySelectorAll('[data-goto]').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                show(btn.getAttribute('data-goto'));
            });
        });

        var initial = (location.hash || '').replace('#', '') || 'overview';
        var hasInitial = document.querySelector('.dash-section[id="section-' + initial + '"]') ||
                         document.querySelector('.dash-section#' + initial);
        show(hasInitial ? initial : 'overview');

        Dash.showSection = show;
    }

    /* ---------------------------------------------------------
       Animated number counters
    --------------------------------------------------------- */
    function animateCounters(scope) {
        var nodes = (scope || document).querySelectorAll('[data-count]');
        nodes.forEach(function (node) {
            if (node.dataset.counted === '1') return;
            node.dataset.counted = '1';
            var target = parseFloat(node.getAttribute('data-count')) || 0;
            var decimals = parseInt(node.getAttribute('data-decimals') || '0', 10);
            var prefix = node.getAttribute('data-prefix') || '';
            var suffix = node.getAttribute('data-suffix') || '';
            var duration = 1100;
            var start = null;

            function fmt(v) {
                return prefix + v.toLocaleString('en-US', {
                    minimumFractionDigits: decimals,
                    maximumFractionDigits: decimals
                }) + suffix;
            }

            function step(ts) {
                if (!start) start = ts;
                var p = Math.min((ts - start) / duration, 1);
                var eased = 1 - Math.pow(1 - p, 3);
                node.textContent = fmt(target * eased);
                if (p < 1) requestAnimationFrame(step);
                else node.textContent = fmt(target);
            }
            requestAnimationFrame(step);
        });
    }

    /* ---------------------------------------------------------
       Table search + filtering
       Markup contract:
         <table data-table="tblPatients">
         toolbar: [data-table-search] and [data-table-filter="dataKey"]
         rows: data-* attributes matching dataKey (or data-status)
    --------------------------------------------------------- */
    function initTables() {
        document.querySelectorAll('table[data-table]').forEach(function (table) {
            var panel = table.closest('.panel') || document;
            var search = panel.querySelector('[data-table-search]');
            var filters = panel.querySelectorAll('[data-table-filter]');
            var counter = panel.querySelector('[data-table-count]');
            var emptyRow = table.querySelector('[data-empty-row]');
            var rows = Array.prototype.slice.call(table.querySelectorAll('tbody tr')).filter(function (r) {
                return !r.hasAttribute('data-empty-row') && !r.classList.contains('is-template');
            });
            if (!rows.length) return;

            function apply() {
                var term = search ? search.value.trim().toLowerCase() : '';
                var visible = 0;

                rows.forEach(function (row) {
                    var match = !term || row.textContent.toLowerCase().indexOf(term) !== -1;

                    filters.forEach(function (f) {
                        if (!match) return;
                        var key = f.getAttribute('data-table-filter');
                        var val = f.value;
                        if (val && val !== 'all' && row.getAttribute('data-' + key) !== val) match = false;
                    });

                    row.style.display = match ? '' : 'none';
                    if (match) visible++;
                });

                if (emptyRow) emptyRow.style.display = visible ? 'none' : '';
                if (counter) counter.textContent = visible + ' of ' + rows.length;
                if (typeof Dash.onFilter === 'function') Dash.onFilter(table, visible, rows.length);
            }

            if (search) search.addEventListener('input', apply);
            filters.forEach(function (f) { f.addEventListener('change', apply); });
            table._applyFilter = apply;
            apply();
        });
    }

    /* ---------------------------------------------------------
       Pill-group toggle (handled generically + table filters)
    --------------------------------------------------------- */
    function initPills() {
        document.querySelectorAll('.pill-group').forEach(function (group) {
            var buttons = group.querySelectorAll('button');
            buttons.forEach(function (btn) {
                btn.addEventListener('click', function () {
                    buttons.forEach(function (b) { b.classList.remove('is-active'); });
                    btn.classList.add('is-active');
                    group.dispatchEvent(new CustomEvent('pill:change', {
                        detail: { value: btn.getAttribute('data-value') }, bubbles: true
                    }));
                });
            });
        });
    }

    /* ---------------------------------------------------------
       Toast helper
    --------------------------------------------------------- */
    var toastTimer;
    function toast(message, icon) {
        var el = document.getElementById('dashToast');
        if (!el) {
            el = document.createElement('div');
            el.id = 'dashToast';
            el.className = 'dash-toast';
            document.body.appendChild(el);
        }
        el.innerHTML = '<i class="bi ' + (icon || 'bi-check-circle-fill') + '"></i><span></span>';
        el.querySelector('span').textContent = message;
        requestAnimationFrame(function () { el.classList.add('is-visible'); });
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { el.classList.remove('is-visible'); }, 2600);
    }

    /* ---------------------------------------------------------
       Demo interactions (buttons with data-demo)
    --------------------------------------------------------- */
    function initDemoActions() {
        document.addEventListener('click', function (e) {
            var el = e.target.closest('[data-demo]');
            if (!el) return;
            e.preventDefault();
            toast(el.getAttribute('data-demo') || 'Action completed successfully');
        });
        var emailApi = window.StacklyEmail;
        document.querySelectorAll('form[data-demo-form]').forEach(function (form) {
            var email = form.querySelector('input[type="email"]');
            if (email) {
                email.addEventListener('input', function () { email.classList.remove('is-invalid'); });
            }
            form.addEventListener('submit', function (e) {
                e.preventDefault();
                if (email && emailApi && !emailApi.isValid(email.value)) {
                    email.classList.add('is-invalid');
                    toast('Please enter a valid email address', 'bi-exclamation-triangle-fill');
                    email.focus();
                    return;
                }
                if (email) email.classList.remove('is-invalid');
                toast(form.getAttribute('data-demo-form') || 'Changes saved successfully', 'bi-check2-circle');
            });
        });
        var y = document.getElementById('year');
        if (y) y.textContent = new Date().getFullYear();
    }

    /* ---------------------------------------------------------
       Demo lock-down
       Every clickable control (links, buttons, action cards)
       redirects to the 404 page, except for the topbar/header,
       the brand logo, the sidebar navigation and the sign-out
       button. Uses event delegation so it also covers content
       injected by the admin/patient scripts.
    --------------------------------------------------------- */
    function initRedirects() {
        var KEEP = '.topbar, .sidebar__brand-logo, .sidebar__nav, .sidebar__logout';
        document.addEventListener('click', function (e) {
            if (e.defaultPrevented || e.button !== 0) return;
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
            if (!e.target || typeof e.target.closest !== 'function') return;
            var control = e.target.closest('a[href], button, [role="button"]');
            if (!control || control.closest(KEEP)) return;
            e.preventDefault();
            e.stopPropagation();
            window.location.href = '404.html';
        }, true);
    }

    /* ---------------------------------------------------------
       Bootstrap tooltips
    --------------------------------------------------------- */
    function initTooltips() {
        if (!window.bootstrap) return;
        document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(function (el) {
            new bootstrap.Tooltip(el);
        });
    }

    var Dash = {
        toast: toast,
        animateCounters: animateCounters,
        showSection: null,
        searchMap: {},
        onFilter: null
    };
    window.Dash = Dash;

    document.addEventListener('DOMContentLoaded', function () {
        initTheme();
        initUser();
        initSidebar();
        initRouting();
        initTables();
        initPills();
        initDemoActions();
        initRedirects();
        initTooltips();
        animateCounters(document.querySelector('.dash-section.is-active') || document);
    });
})();
