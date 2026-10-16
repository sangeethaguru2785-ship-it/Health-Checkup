/* ============================================================
   Stackly Health Checkup Center - Patient Dashboard
   Sample data + Chart.js health visualisations + dynamic lists
   ============================================================ */
(function () {
    'use strict';

    var PALETTE = {
        brand: '#0e9f9a',
        accent: '#00d4b8',
        info: '#2e90fa',
        warning: '#f79009',
        purple: '#7a5af8',
        danger: '#f04438',
        success: '#12b76a'
    };

    var AV_MAP = {
        'photo-1544005313-94ddf0286df2': 'assets/img/avatar-amelia.webp',
        'photo-1500648767791-00dcc994a43e': 'assets/img/avatar-marcus.webp',
        'photo-1534528741775-53994a69daeb': 'assets/img/avatar-priya.webp',
        'photo-1506794778202-cad84cf45f1d': 'assets/img/avatar-daniel.webp',
        'photo-1517841905240-472988babdf9': 'assets/img/avatar-sofia.webp',
        'photo-1507003211169-0a1dd7228f2d': 'assets/img/avatar-ethan.webp',
        'photo-1524504388940-b1c1722653e1': 'assets/img/avatar-hana.webp',
        'photo-1519085360753-af0119f7cbe7': 'assets/img/avatar-lucas.webp',
        'photo-1487412720507-e7ab37603c6f': 'assets/img/avatar-grace.webp',
        'photo-1504257432389-52343af06ae3': 'assets/img/avatar-ivan.webp',
        'photo-1544723795-3fb6469f5b39': 'assets/img/avatar-chloe.webp',
        'photo-1560250097-0b93528c311a': 'assets/img/avatar-omar.webp'
    };
    var AV = function (id) { return AV_MAP[id] || ('assets/img/' + id + '.webp'); };

    var appointments = [
        { type: 'Full Body Checkup', date: 'Oct 22, 2026', day: '22', month: 'Oct', time: '09:30 AM', doctor: 'Dr. Elena Moore', location: 'Main Center, Room 204', status: 'Confirmed', prep: 'Fast 8–10 hours before your visit.' },
        { type: 'Follow-up Consultation', date: 'Nov 05, 2026', day: '05', month: 'Nov', time: '11:00 AM', doctor: 'Dr. Samuel Reyes', location: 'Teleconsultation', status: 'Pending', prep: 'Keep previous reports handy.' },
        { type: 'Diabetes Screening', date: 'Nov 19, 2026', day: '19', month: 'Nov', time: '08:15 AM', doctor: 'Dr. Aisha Khan', location: 'Main Center, Room 108', status: 'Confirmed', prep: 'No food for 10 hours before the test.' },
        { type: 'Cardiac Assessment', date: 'Sep 18, 2026', day: '18', month: 'Sep', time: '10:00 AM', doctor: 'Dr. Samuel Reyes', location: 'Cardiology Wing', status: 'Completed', prep: '—' },
        { type: 'Basic Health Checkup', date: 'Jul 21, 2026', day: '21', month: 'Jul', time: '08:00 AM', doctor: 'Dr. Elena Moore', location: 'Main Center, Room 204', status: 'Completed', prep: '—' }
    ];

    var testResults = [
        { test: 'Complete Blood Count', date: 'Oct 14, 2026', doctor: 'Dr. Elena Moore', result: 'Normal', value: '5.2 M/µL', status: 'Ready', icon: 'bi-droplet', color: 'danger' },
        { test: 'Lipid Profile', date: 'Oct 14, 2026', doctor: 'Dr. Samuel Reyes', result: 'Borderline', value: 'LDL 132 mg/dL', status: 'Ready', icon: 'bi-heart-pulse', color: 'warning' },
        { test: 'HbA1c & Fasting Glucose', date: 'Sep 02, 2026', doctor: 'Dr. Aisha Khan', result: 'Normal', value: '5.4%', status: 'Ready', icon: 'bi-droplet-half', color: 'info' },
        { test: 'Thyroid Panel', date: 'Aug 10, 2026', doctor: 'Dr. Elena Moore', result: 'Normal', value: 'TSH 2.1 mIU/L', status: 'Ready', icon: 'bi-activity', color: 'purple' },
        { test: 'Vitamin D & B12', date: 'Aug 10, 2026', doctor: 'Dr. Samuel Reyes', result: 'Attention', value: 'Vit D 18 ng/mL', status: 'Ready', icon: 'bi-sun', color: 'warning' },
        { test: 'Liver Function Test', date: 'Jul 21, 2026', doctor: 'Dr. Aisha Khan', result: 'Normal', value: 'ALT 24 U/L', status: 'Ready', icon: 'bi-clipboard2-pulse', color: 'brand' }
    ];

    var invoices = [
        { id: 'INV-8841', date: 'Oct 14, 2026', desc: 'Full Body Checkup', amount: 349, method: 'Credit Card', status: 'Paid' },
        { id: 'INV-8760', date: 'Sep 18, 2026', desc: 'Cardiac Assessment', amount: 420, method: 'Insurance', status: 'Paid' },
        { id: 'INV-8612', date: 'Jul 21, 2026', desc: 'Basic Health Checkup', amount: 99, method: 'UPI', status: 'Paid' },
        { id: 'INV-8842', date: 'Oct 22, 2026', desc: 'Full Body Checkup (upcoming)', amount: 349, method: '—', status: 'Pending' }
    ];

    var documents = [
        { title: 'Full Body Checkup Report', date: 'Oct 14, 2026', type: 'PDF', size: '2.4 MB', icon: 'bi-file-earmark-medical' },
        { title: 'Lipid Profile Analysis', date: 'Oct 14, 2026', type: 'PDF', size: '1.1 MB', icon: 'bi-file-earmark-text' },
        { title: 'Cardiac Stress Test', date: 'Sep 18, 2026', type: 'PDF', size: '3.2 MB', icon: 'bi-file-earmark-medical' },
        { title: 'Vaccination Record', date: 'Jun 02, 2026', type: 'PDF', size: '0.6 MB', icon: 'bi-file-earmark-check' },
        { title: 'Physician Notes — Dr. Moore', date: 'Jul 21, 2026', type: 'DOCX', size: '0.3 MB', icon: 'bi-file-earmark-word' }
    ];

    var timeline = [
        { title: 'Full Body Checkup completed', desc: 'All 68 parameters screened · report ready', done: true },
        { title: 'Cardiac Assessment completed', desc: 'ECG and echo within normal range', done: true },
        { title: 'Follow-up scheduled with Dr. Reyes', desc: 'Nov 05, 2026 · 11:00 AM teleconsultation', done: false },
        { title: 'Annual health review due', desc: 'Book your yearly preventive screening', done: false }
    ];

    /* ---------------------------------------------------------
       Helpers
    --------------------------------------------------------- */
    var statusClass = {
        Confirmed: 'success', Completed: 'info', Pending: 'warning', Cancelled: 'danger',
        Normal: 'success', Borderline: 'warning', Attention: 'danger',
        Ready: 'success', Paid: 'success'
    };
    function badge(t) {
        return '<span class="badge-soft ' + (statusClass[t] || 'gray') + '"><i class="bi bi-circle-fill"></i>' + t + '</span>';
    }
    function money(n) { return '$' + Number(n).toLocaleString('en-US'); }
    function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); }

    /* ---------------------------------------------------------
       Render
    --------------------------------------------------------- */
    function renderUpcoming() {
        var featured = document.getElementById('featuredAppointment');
        var upcoming = appointments.filter(function (a) { return a.status !== 'Completed'; });
        if (featured && upcoming.length) {
            var a = upcoming[0];
            featured.innerHTML =
                '<div class="appt-card__date"><strong>' + a.day + '</strong><span>' + a.month + '</span></div>' +
                '<div class="appt-card__body">' +
                    '<div class="d-flex align-items-center gap-2 mb-1 flex-wrap"><h4 class="mb-0">' + esc(a.type) + '</h4>' + badge(a.status) + '</div>' +
                    '<p>' + esc(a.prep) + '</p>' +
                    '<div class="appt-card__meta">' +
                        '<span><i class="bi bi-clock"></i>' + a.time + '</span>' +
                        '<span><i class="bi bi-person-badge"></i>' + a.doctor + '</span>' +
                        '<span><i class="bi bi-geo-alt"></i>' + a.location + '</span>' +
                    '</div>' +
                '</div>';
        }

        var list = document.getElementById('upcomingList');
        if (list) {
            list.innerHTML = upcoming.map(function (a) {
                return '<div class="appt-card mb-3">' +
                    '<div class="appt-card__date"><strong>' + a.day + '</strong><span>' + a.month + '</span></div>' +
                    '<div class="appt-card__body">' +
                        '<div class="d-flex align-items-center gap-2 mb-1 flex-wrap"><h4 class="mb-0">' + esc(a.type) + '</h4>' + badge(a.status) + '</div>' +
                        '<div class="appt-card__meta">' +
                            '<span><i class="bi bi-clock"></i>' + a.time + '</span>' +
                            '<span><i class="bi bi-person-badge"></i>' + a.doctor + '</span>' +
                            '<span><i class="bi bi-geo-alt"></i>' + a.location + '</span>' +
                        '</div>' +
                    '</div>' +
                    '<div class="d-flex flex-column gap-2">' +
                        '<button class="btn btn-soft btn-sm" data-demo="Reschedule request sent for ' + a.type + '">Reschedule</button>' +
                    '</div>' +
                '</div>';
            }).join('');
        }
    }

    function renderRecentResults() {
        var list = document.getElementById('recentResults');
        if (!list) return;
        list.innerHTML = testResults.slice(0, 4).map(function (r) {
            return '<div class="d-flex align-items-center gap-3 py-3 border-bottom">' +
                '<div class="metric-row__icon" style="background:var(--db-' + r.color + '-soft);color:var(--db-' + r.color + ')"><i class="bi ' + r.icon + '"></i></div>' +
                '<div class="flex-grow-1 min-w-0">' +
                    '<strong class="d-block">' + esc(r.test) + '</strong>' +
                    '<span class="text-muted small">' + r.date + ' · ' + r.value + '</span>' +
                '</div>' +
                '<div class="d-none d-sm-block">' + badge(r.result) + '</div>' +
                '<button class="btn btn-ghost btn-sm" data-demo="Opening report: ' + r.test + '"><i class="bi bi-file-earmark-text me-1"></i>View Report</button>' +
                '</div>';
        }).join('');
    }

    function renderTestResultsTable() {
        var tbody = document.getElementById('testResultsTableBody');
        if (!tbody) return;
        tbody.innerHTML = testResults.map(function (r) {
            return '<tr data-result="' + r.result + '">' +
                '<td>' +
                    '<div class="person">' +
                        '<span class="metric-row__icon" style="background:var(--db-' + r.color + '-soft);color:var(--db-' + r.color + ')"><i class="bi ' + r.icon + '"></i></span>' +
                        '<div class="person__meta"><strong>' + esc(r.test) + '</strong><span>' + r.value + '</span></div>' +
                    '</div>' +
                '</td>' +
                '<td>' + r.date + '</td>' +
                '<td>' + r.doctor + '</td>' +
                '<td>' + badge(r.result) + '</td>' +
                '<td>' + badge(r.status) + '</td>' +
                '<td class="text-end"><button class="btn btn-soft btn-sm" data-demo="Opening report: ' + r.test + '"><i class="bi bi-file-earmark-text me-1"></i>View Report</button></td>' +
                '</tr>';
        }).join('');
    }

    function renderAppointmentsTable() {
        var tbody = document.getElementById('myAppointmentsBody');
        if (!tbody) return;
        tbody.innerHTML = appointments.map(function (a) {
            return '<tr data-status="' + a.status + '">' +
                '<td class="cell-strong">' + esc(a.type) + '</td>' +
                '<td>' + a.date + '</td>' +
                '<td>' + a.time + '</td>' +
                '<td>' + a.doctor + '</td>' +
                '<td>' + badge(a.status) + '</td>' +
                '<td class="text-end">' +
                    (a.status === 'Completed'
                        ? '<button class="btn btn-ghost btn-sm" data-demo="Viewing notes for ' + a.type + '">View Notes</button>'
                        : '<button class="btn btn-soft btn-sm" data-demo="Reschedule request sent for ' + a.type + '">Reschedule</button>') +
                '</td>' +
                '</tr>';
        }).join('');
    }

    function renderDocuments() {
        var list = document.getElementById('documentsList');
        if (!list) return;
        list.innerHTML = documents.map(function (d) {
            return '<div class="d-flex align-items-center gap-3 py-3 border-bottom">' +
                '<div class="metric-row__icon" style="background:var(--db-brand-soft);color:var(--db-brand)"><i class="bi ' + d.icon + '"></i></div>' +
                '<div class="flex-grow-1 min-w-0">' +
                    '<strong class="d-block text-truncate">' + esc(d.title) + '</strong>' +
                    '<span class="text-muted small">' + d.date + ' · ' + d.type + ' · ' + d.size + '</span>' +
                '</div>' +
                '<button class="btn btn-ghost btn-icon" data-bs-toggle="tooltip" title="Download" data-demo="Downloading ' + d.title + '"><i class="bi bi-download"></i></button>' +
                '</div>';
        }).join('');

        var tl = document.getElementById('healthTimeline');
        if (tl) {
            tl.innerHTML = timeline.map(function (t) {
                return '<div class="timeline__item ' + (t.done ? 'is-done' : '') + '">' +
                    '<h4>' + esc(t.title) + '</h4>' +
                    '<p>' + esc(t.desc) + '</p>' +
                    '</div>';
            }).join('');
        }
    }

    function renderBilling() {
        var tbody = document.getElementById('billingTableBody');
        if (!tbody) return;
        tbody.innerHTML = invoices.map(function (v) {
            return '<tr data-status="' + v.status + '">' +
                '<td class="cell-strong">' + v.id + '</td>' +
                '<td>' + esc(v.desc) + '</td>' +
                '<td>' + v.date + '</td>' +
                '<td>' + v.method + '</td>' +
                '<td class="cell-strong">' + money(v.amount) + '</td>' +
                '<td>' + badge(v.status) + '</td>' +
                '<td class="text-end"><button class="btn btn-soft btn-sm" data-demo="Opening invoice ' + v.id + '">View</button></td>' +
                '</tr>';
        }).join('');
    }

    /* ---------------------------------------------------------
       Charts
    --------------------------------------------------------- */
    var charts = {};
    function themeColors() {
        var dark = document.body.classList.contains('theme-dark');
        return { text: dark ? '#b9cdcd' : '#4f6b73', grid: dark ? 'rgba(255,255,255,.08)' : 'rgba(7,42,48,.07)' };
    }

    function initCharts() {
        if (typeof window.Chart === 'undefined') return;
        var C = themeColors();
        Chart.defaults.font.family = "'Plus Jakarta Sans', system-ui, sans-serif";
        Chart.defaults.color = C.text;

        /* ---- Health metrics (line) ---- */
        var hm = document.getElementById('healthMetricsChart');
        if (hm) {
            charts.health = new Chart(hm, {
                type: 'line',
                data: {
                    labels: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
                    datasets: [
                        {
                            label: 'Blood Sugar (mg/dL)',
                            data: [112, 108, 104, 101, 98, 96, 94, 92],
                            borderColor: PALETTE.brand, borderWidth: 3, tension: .42,
                            pointRadius: 0, pointHoverRadius: 6, pointBackgroundColor: '#fff',
                            pointHoverBorderColor: PALETTE.brand, pointHoverBorderWidth: 3,
                            fill: true,
                            backgroundColor: function (c) {
                                var a = c.chart.chartArea; if (!a) return 'transparent';
                                var g = c.chart.ctx.createLinearGradient(0, a.top, 0, a.bottom);
                                g.addColorStop(0, 'rgba(14,159,154,.30)'); g.addColorStop(1, 'rgba(14,159,154,0)');
                                return g;
                            }
                        },
                        {
                            label: 'Cholesterol (mg/dL)',
                            data: [208, 204, 199, 196, 191, 188, 184, 178],
                            borderColor: PALETTE.warning, borderWidth: 3, tension: .42,
                            pointRadius: 0, pointHoverRadius: 6, pointBackgroundColor: '#fff',
                            pointHoverBorderColor: PALETTE.warning, pointHoverBorderWidth: 3,
                            fill: true,
                            backgroundColor: function (c) {
                                var a = c.chart.chartArea; if (!a) return 'transparent';
                                var g = c.chart.ctx.createLinearGradient(0, a.top, 0, a.bottom);
                                g.addColorStop(0, 'rgba(247,144,9,.22)'); g.addColorStop(1, 'rgba(247,144,9,0)');
                                return g;
                            }
                        }
                    ]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    interaction: { mode: 'index', intersect: false },
                    animation: { duration: 1400, easing: 'easeOutQuart' },
                    plugins: {
                        legend: { display: false },
                        tooltip: { backgroundColor: '#072a30', padding: 12, cornerRadius: 10, usePointStyle: true }
                    },
                    scales: {
                        x: { grid: { display: false }, ticks: { color: C.text } },
                        y: { beginAtZero: false, suggestedMin: 60, suggestedMax: 230, grid: { color: C.grid, drawBorder: false }, ticks: { color: C.text, padding: 8 } }
                    }
                }
            });
        }

        /* ---- Test history (bar) ---- */
        var th = document.getElementById('testHistoryChart');
        if (th) {
            charts.history = new Chart(th, {
                type: 'bar',
                data: {
                    labels: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
                    datasets: [{
                        label: 'Tests completed',
                        data: [4, 3, 5, 6, 7, 5, 4, 6],
                        backgroundColor: function (c) {
                            var a = c.chart.chartArea; if (!a) return PALETTE.brand;
                            var g = c.chart.ctx.createLinearGradient(0, a.bottom, 0, a.top);
                            g.addColorStop(0, 'rgba(0,212,184,.35)'); g.addColorStop(1, PALETTE.brand);
                            return g;
                        },
                        borderRadius: 8, maxBarThickness: 34, hoverBackgroundColor: PALETTE.accent
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    animation: { duration: 1300, easing: 'easeOutQuart' },
                    plugins: {
                        legend: { display: false },
                        tooltip: { backgroundColor: '#072a30', padding: 12, cornerRadius: 10 }
                    },
                    scales: {
                        x: { grid: { display: false }, ticks: { color: C.text } },
                        y: { beginAtZero: true, grid: { color: C.grid, drawBorder: false }, ticks: { color: C.text, stepSize: 2, padding: 8 } }
                    }
                }
            });
        }

        /* ---- Vitals overview (doughnut) ---- */
        var vo = document.getElementById('vitalsChart');
        if (vo) {
            var labels = ['Normal', 'Borderline', 'Needs attention'];
            var colors = [PALETTE.success, PALETTE.warning, PALETTE.danger];
            charts.vitals = new Chart(vo, {
                type: 'doughnut',
                data: { labels: labels, datasets: [{ data: [42, 8, 3], backgroundColor: colors, borderWidth: 0, hoverOffset: 10, spacing: 2 }] },
                options: {
                    responsive: true, maintainAspectRatio: false, cutout: '70%',
                    animation: { animateRotate: true, animateScale: true, duration: 1500, easing: 'easeOutQuart' },
                    plugins: { legend: { display: false }, tooltip: { backgroundColor: '#072a30', padding: 12, cornerRadius: 10, usePointStyle: true } }
                }
            });
            var lg = document.getElementById('vitalsLegend');
            if (lg) {
                lg.innerHTML = labels.map(function (l, i) {
                    return '<div class="chart-legend__item"><span class="chart-legend__dot" style="background:' + colors[i] + '"></span>' + l + '</div>';
                }).join('');
            }
        }
    }

    function applyChartTheme() {
        var C = themeColors();
        Chart.defaults.color = C.text;
        Object.keys(charts).forEach(function (k) {
            var ch = charts[k];
            if (!ch || !ch.options.scales) return;
            Object.keys(ch.options.scales).forEach(function (s) {
                if (ch.options.scales[s].grid) ch.options.scales[s].grid.color = C.grid;
                if (ch.options.scales[s].ticks) ch.options.scales[s].ticks.color = C.text;
            });
            ch.update('none');
        });
    }

    /* ---------------------------------------------------------
       Boot (script at end of body -> DOM ready)
    --------------------------------------------------------- */
    renderUpcoming();
    renderRecentResults();
    renderTestResultsTable();
    renderAppointmentsTable();
    renderDocuments();
    renderBilling();

    Dash.searchMap = {
        book: 'book', 'health checkup': 'book', appointment: 'appointments',
        result: 'results', test: 'results', report: 'results',
        record: 'records', document: 'records',
        bill: 'billing', invoice: 'billing', payment: 'billing',
        setting: 'settings', profile: 'settings'
    };

    document.addEventListener('DOMContentLoaded', function () {
        initCharts();
        document.querySelectorAll('table[data-table]').forEach(function (t) {
            if (t._applyFilter) t._applyFilter();
        });
    });

    document.addEventListener('dash:section', function () {
        Object.keys(charts).forEach(function (k) { if (charts[k]) charts[k].resize(); });
    });
    document.addEventListener('dash:resize', function () {
        Object.keys(charts).forEach(function (k) { if (charts[k]) charts[k].resize(); });
    });
    document.addEventListener('dash:theme', function () { applyChartTheme(); });
})();
