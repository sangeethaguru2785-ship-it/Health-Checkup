/* ============================================================
   Stackly Health Checkup Center - Admin Dashboard
   Sample data + Chart.js visualisations + dynamic tables
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

    /* ---------------------------------------------------------
       Sample data
    --------------------------------------------------------- */
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
    var AV = function (id) {
        return AV_MAP[id] || ('assets/img/' + id + '.webp');
    };

    var patients = [
        { name: 'Amelia Hartwell', email: 'amelia.h@mail.com', avatar: AV('photo-1544005313-94ddf0286df2'), id: 'PT-20481', gender: 'Female', age: 34, visit: 'Oct 14, 2026', status: 'Active', pkg: 'Executive Health' },
        { name: 'Marcus Bennett', email: 'marcus.b@mail.com', avatar: AV('photo-1500648767791-00dcc994a43e'), id: 'PT-20480', gender: 'Male', age: 47, visit: 'Oct 13, 2026', status: 'Active', pkg: 'Cardiac Assessment' },
        { name: 'Priya Raghavan', email: 'priya.r@mail.com', avatar: AV('photo-1534528741775-53994a69daeb'), id: 'PT-20479', gender: 'Female', age: 29, visit: 'Oct 12, 2026', status: 'New', pkg: 'Women\'s Wellness' },
        { name: 'Daniel Okafor', email: 'daniel.o@mail.com', avatar: AV('photo-1506794778202-cad84cf45f1d'), id: 'PT-20478', gender: 'Male', age: 52, visit: 'Oct 12, 2026', status: 'Active', pkg: 'Full Body Checkup' },
        { name: 'Sofia Lindqvist', email: 'sofia.l@mail.com', avatar: AV('photo-1517841905240-472988babdf9'), id: 'PT-20477', gender: 'Female', age: 38, visit: 'Oct 11, 2026', status: 'Active', pkg: 'Diabetes Screening' },
        { name: 'Ethan Brooks', email: 'ethan.b@mail.com', avatar: AV('photo-1507003211169-0a1dd7228f2d'), id: 'PT-20476', gender: 'Male', age: 41, visit: 'Oct 10, 2026', status: 'Inactive', pkg: 'Basic Health' },
        { name: 'Hana Suzuki', email: 'hana.s@mail.com', avatar: AV('photo-1524504388940-b1c1722653e1'), id: 'PT-20475', gender: 'Female', age: 26, visit: 'Oct 09, 2026', status: 'New', pkg: 'Basic Health' },
        { name: 'Lucas Moreau', email: 'lucas.m@mail.com', avatar: AV('photo-1519085360753-af0119f7cbe7'), id: 'PT-20474', gender: 'Male', age: 60, visit: 'Oct 08, 2026', status: 'Active', pkg: 'Cardiac Assessment' },
        { name: 'Grace Mensah', email: 'grace.m@mail.com', avatar: AV('photo-1487412720507-e7ab37603c6f'), id: 'PT-20473', gender: 'Female', age: 45, visit: 'Oct 07, 2026', status: 'Active', pkg: 'Full Body Checkup' },
        { name: 'Ivan Petrov', email: 'ivan.p@mail.com', avatar: AV('photo-1504257432389-52343af06ae3'), id: 'PT-20472', gender: 'Male', age: 33, visit: 'Oct 06, 2026', status: 'Inactive', pkg: 'Pathology Panel' },
        { name: 'Chloe Nguyen', email: 'chloe.n@mail.com', avatar: AV('photo-1544723795-3fb6469f5b39'), id: 'PT-20471', gender: 'Female', age: 31, visit: 'Oct 05, 2026', status: 'Active', pkg: 'Women\'s Wellness' },
        { name: 'Omar Haddad', email: 'omar.h@mail.com', avatar: AV('photo-1560250097-0b93528c311a'), id: 'PT-20470', gender: 'Male', age: 55, visit: 'Oct 04, 2026', status: 'Active', pkg: 'Executive Health' }
    ];

    var appointments = [
        { patient: 'Amelia Hartwell', avatar: AV('photo-1544005313-94ddf0286df2'), type: 'Executive Health Checkup', date: 'Oct 14, 2026', time: '09:30 AM', doctor: 'Dr. Elena Moore', status: 'Confirmed', amount: 349 },
        { patient: 'Marcus Bennett', avatar: AV('photo-1500648767791-00dcc994a43e'), type: 'Cardiac Assessment', date: 'Oct 14, 2026', time: '11:00 AM', doctor: 'Dr. Samuel Reyes', status: 'Completed', amount: 420 },
        { patient: 'Priya Raghavan', avatar: AV('photo-1534528741775-53994a69daeb'), type: 'Women\'s Wellness Panel', date: 'Oct 15, 2026', time: '08:15 AM', doctor: 'Dr. Aisha Khan', status: 'Pending', amount: 260 },
        { patient: 'Daniel Okafor', avatar: AV('photo-1506794778202-cad84cf45f1d'), type: 'Full Body Checkup', date: 'Oct 15, 2026', time: '10:45 AM', doctor: 'Dr. Elena Moore', status: 'Confirmed', amount: 299 },
        { patient: 'Sofia Lindqvist', avatar: AV('photo-1517841905240-472988babdf9'), type: 'Diabetes Screening', date: 'Oct 16, 2026', time: '07:45 AM', doctor: 'Dr. Samuel Reyes', status: 'Confirmed', amount: 145 },
        { patient: 'Ethan Brooks', avatar: AV('photo-1507003211169-0a1dd7228f2d'), type: 'Basic Health Checkup', date: 'Oct 16, 2026', time: '01:30 PM', doctor: 'Dr. Aisha Khan', status: 'Cancelled', amount: 99 },
        { patient: 'Hana Suzuki', avatar: AV('photo-1524504388940-b1c1722653e1'), type: 'Basic Health Checkup', date: 'Oct 17, 2026', time: '09:00 AM', doctor: 'Dr. Elena Moore', status: 'Pending', amount: 99 },
        { patient: 'Lucas Moreau', avatar: AV('photo-1519085360753-af0119f7cbe7'), type: 'Cardiac Assessment', date: 'Oct 17, 2026', time: '12:00 PM', doctor: 'Dr. Samuel Reyes', status: 'Confirmed', amount: 420 },
        { patient: 'Grace Mensah', avatar: AV('photo-1487412720507-e7ab37603c6f'), type: 'Full Body Checkup', date: 'Oct 18, 2026', time: '08:30 AM', doctor: 'Dr. Aisha Khan', status: 'Confirmed', amount: 299 },
        { patient: 'Ivan Petrov', avatar: AV('photo-1504257432389-52343af06ae3'), type: 'Pathology Panel', date: 'Oct 18, 2026', time: '02:15 PM', doctor: 'Dr. Elena Moore', status: 'Completed', amount: 180 },
        { patient: 'Chloe Nguyen', avatar: AV('photo-1544723795-3fb6469f5b39'), type: 'Women\'s Wellness Panel', date: 'Oct 19, 2026', time: '10:00 AM', doctor: 'Dr. Aisha Khan', status: 'Pending', amount: 260 },
        { patient: 'Omar Haddad', avatar: AV('photo-1560250097-0b93528c311a'), type: 'Executive Health Checkup', date: 'Oct 19, 2026', time: '09:15 AM', doctor: 'Dr. Samuel Reyes', status: 'Confirmed', amount: 349 },
        { patient: 'Amelia Hartwell', avatar: AV('photo-1544005313-94ddf0286df2'), type: 'Follow-up Consultation', date: 'Oct 20, 2026', time: '11:30 AM', doctor: 'Dr. Elena Moore', status: 'Confirmed', amount: 75 },
        { patient: 'Daniel Okafor', avatar: AV('photo-1506794778202-cad84cf45f1d'), type: 'Radiology Imaging', date: 'Oct 20, 2026', time: '03:00 PM', doctor: 'Dr. Samuel Reyes', status: 'Pending', amount: 210 }
    ];

    var packages = [
        { name: 'Basic Health Checkup', icon: 'bi-clipboard2-pulse', tests: 32, price: 99, tag: 'Essential', color: 'info', desc: 'Core vitals, CBC, lipid profile and physician review.' },
        { name: 'Full Body Checkup', icon: 'bi-heart-pulse', tests: 68, price: 299, tag: 'Popular', color: 'brand', desc: 'Comprehensive screening across all major organ systems.' },
        { name: 'Cardiac Assessment', icon: 'bi-activity', tests: 41, price: 420, tag: 'Advanced', color: 'danger', desc: 'ECG, echo, stress test and cardiologist consultation.' },
        { name: 'Diabetes Screening', icon: 'bi-droplet-half', tests: 22, price: 145, tag: 'Focused', color: 'warning', desc: 'HbA1c, fasting glucose, insulin resistance and diet plan.' },
        { name: 'Women\'s Wellness', icon: 'bi-gender-female', tests: 54, price: 260, tag: 'Wellness', color: 'purple', desc: 'Hormonal panel, bone density, thyroid and pelvic scan.' },
        { name: 'Executive Health', icon: 'bi-briefcase', tests: 82, price: 349, tag: 'Premium', color: 'success', desc: 'Full-body MRI, advanced biomarkers and executive report.' }
    ];

    var reports = [
        { patient: 'Amelia Hartwell', avatar: AV('photo-1544005313-94ddf0286df2'), test: 'Complete Blood Count', date: 'Oct 14, 2026', doctor: 'Dr. Elena Moore', status: 'Ready', size: '1.8 MB' },
        { patient: 'Marcus Bennett', avatar: AV('photo-1500648767791-00dcc994a43e'), test: 'Lipid Profile', date: 'Oct 14, 2026', doctor: 'Dr. Samuel Reyes', status: 'Ready', size: '1.2 MB' },
        { patient: 'Daniel Okafor', avatar: AV('photo-1506794778202-cad84cf45f1d'), test: 'Liver Function Test', date: 'Oct 13, 2026', doctor: 'Dr. Aisha Khan', status: 'Processing', size: '—' },
        { patient: 'Sofia Lindqvist', avatar: AV('photo-1517841905240-472988babdf9'), test: 'HbA1c & Glucose', date: 'Oct 12, 2026', doctor: 'Dr. Samuel Reyes', status: 'Ready', size: '0.9 MB' },
        { patient: 'Lucas Moreau', avatar: AV('photo-1519085360753-af0119f7cbe7'), test: 'Cardiac Stress Test', date: 'Oct 11, 2026', doctor: 'Dr. Elena Moore', status: 'Pending', size: '—' },
        { patient: 'Grace Mensah', avatar: AV('photo-1487412720507-e7ab37603c6f'), test: 'Thyroid Panel', date: 'Oct 10, 2026', doctor: 'Dr. Aisha Khan', status: 'Ready', size: '1.5 MB' },
        { patient: 'Ivan Petrov', avatar: AV('photo-1504257432389-52343af06ae3'), test: 'Kidney Function Test', date: 'Oct 09, 2026', doctor: 'Dr. Samuel Reyes', status: 'Processing', size: '—' },
        { patient: 'Chloe Nguyen', avatar: AV('photo-1544723795-3fb6469f5b39'), test: 'Hormonal Panel', date: 'Oct 08, 2026', doctor: 'Dr. Aisha Khan', status: 'Ready', size: '2.1 MB' }
    ];

    var invoices = [
        { id: 'INV-8841', patient: 'Amelia Hartwell', date: 'Oct 14, 2026', amount: 349, method: 'Credit Card', status: 'Paid' },
        { id: 'INV-8840', patient: 'Marcus Bennett', date: 'Oct 14, 2026', amount: 420, method: 'Insurance', status: 'Paid' },
        { id: 'INV-8839', patient: 'Priya Raghavan', date: 'Oct 15, 2026', amount: 260, method: 'UPI', status: 'Pending' },
        { id: 'INV-8838', patient: 'Daniel Okafor', date: 'Oct 15, 2026', amount: 299, method: 'Debit Card', status: 'Paid' },
        { id: 'INV-8837', patient: 'Sofia Lindqvist', date: 'Oct 16, 2026', amount: 145, method: 'Cash', status: 'Paid' },
        { id: 'INV-8836', patient: 'Ethan Brooks', date: 'Oct 16, 2026', amount: 99, method: 'UPI', status: 'Overdue' },
        { id: 'INV-8835', patient: 'Hana Suzuki', date: 'Oct 17, 2026', amount: 99, method: 'Credit Card', status: 'Pending' },
        { id: 'INV-8834', patient: 'Lucas Moreau', date: 'Oct 17, 2026', amount: 420, method: 'Insurance', status: 'Paid' }
    ];

    /* ---------------------------------------------------------
       Helpers
    --------------------------------------------------------- */
    var statusClass = {
        Confirmed: 'success', Completed: 'info', Pending: 'warning', Cancelled: 'danger',
        Active: 'success', New: 'info', Inactive: 'gray',
        Ready: 'success', Processing: 'info',
        Paid: 'success', Overdue: 'danger'
    };

    function badge(text) {
        var cls = statusClass[text] || 'gray';
        return '<span class="badge-soft ' + cls + '"><i class="bi bi-circle-fill"></i>' + text + '</span>';
    }

    function money(n) {
        return '$' + Number(n).toLocaleString('en-US');
    }

    function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); }

    function person(p) {
        return '<div class="person">' +
            '<img src="' + p.avatar + '" alt="' + esc(p.name) + '" loading="lazy">' +
            '<div class="person__meta"><strong>' + esc(p.name) + '</strong><span>' + esc(p.id || p.email || '') + '</span></div>' +
            '</div>';
    }

    /* ---------------------------------------------------------
       Render tables
    --------------------------------------------------------- */
    function renderRecent() {
        var tbody = document.getElementById('recentAppointments');
        if (!tbody) return;
        tbody.innerHTML = appointments.slice(0, 6).map(function (a) {
            return '<tr>' +
                '<td>' + person(a) + '</td>' +
                '<td class="cell-strong">' + a.type + '</td>' +
                '<td>' + a.date + '</td>' +
                '<td>' + a.time + '</td>' +
                '<td>' + badge(a.status) + '</td>' +
                '<td class="text-end"><button class="btn btn-soft btn-sm" data-demo="Opening appointment ' + a.patient + '">View</button></td>' +
                '</tr>';
        }).join('');
    }

    function renderPatients() {
        var tbody = document.getElementById('patientsTableBody');
        if (!tbody) return;
        tbody.innerHTML = patients.map(function (p) {
            return '<tr data-status="' + p.status + '" data-gender="' + p.gender + '">' +
                '<td>' + person({ name: p.name, id: p.id, avatar: p.avatar }) + '</td>' +
                '<td>' + p.email + '</td>' +
                '<td>' + p.gender + ', ' + p.age + '</td>' +
                '<td>' + p.pkg + '</td>' +
                '<td>' + p.visit + '</td>' +
                '<td>' + badge(p.status) + '</td>' +
                '<td class="text-end">' +
                    '<button class="btn btn-ghost btn-icon me-1" data-bs-toggle="tooltip" title="View profile" data-demo="Viewing ' + p.name + '"><i class="bi bi-eye"></i></button>' +
                    '<button class="btn btn-ghost btn-icon" data-bs-toggle="tooltip" title="Edit" data-demo="Editing ' + p.name + '"><i class="bi bi-pencil"></i></button>' +
                '</td>' +
                '</tr>';
        }).join('');
    }

    function renderAppointments() {
        var tbody = document.getElementById('appointmentsTableBody');
        if (!tbody) return;
        tbody.innerHTML = appointments.map(function (a) {
            return '<tr data-status="' + a.status + '">' +
                '<td>' + person({ name: a.patient, id: a.type, avatar: a.avatar }) + '</td>' +
                '<td>' + a.doctor + '</td>' +
                '<td>' + a.date + '</td>' +
                '<td>' + a.time + '</td>' +
                '<td class="cell-strong">' + money(a.amount) + '</td>' +
                '<td>' + badge(a.status) + '</td>' +
                '<td class="text-end">' +
                    '<button class="btn btn-soft btn-sm" data-demo="Rescheduling ' + a.patient + '\'s appointment">Manage</button>' +
                '</td>' +
                '</tr>';
        }).join('');
    }

    function renderPackages() {
        var grid = document.getElementById('packagesGrid');
        if (!grid) return;
        grid.innerHTML = packages.map(function (p) {
            return '<div class="col-md-6 col-xl-4">' +
                '<div class="pkg-card h-100">' +
                    '<div class="d-flex justify-content-between align-items-start">' +
                        '<div class="pkg-card__icon" style="background:var(--db-' + p.color + '-soft);color:var(--db-' + p.color + ')"><i class="bi ' + p.icon + '"></i></div>' +
                        '<span class="badge-soft ' + p.color + '">' + p.tag + '</span>' +
                    '</div>' +
                    '<h4 class="mt-2">' + p.name + '</h4>' +
                    '<p>' + p.desc + '</p>' +
                    '<div class="d-flex justify-content-between align-items-center mt-3">' +
                        '<div class="pkg-card__price">' + money(p.price) + ' <small>/ ' + p.tests + ' tests</small></div>' +
                        '<button class="btn btn-soft btn-sm" data-demo="Editing ' + p.name + '">Edit</button>' +
                    '</div>' +
                '</div>' +
            '</div>';
        }).join('');
    }

    function renderReports() {
        var tbody = document.getElementById('reportsTableBody');
        if (!tbody) return;
        tbody.innerHTML = reports.map(function (r) {
            return '<tr data-status="' + r.status + '">' +
                '<td>' + person({ name: r.patient, id: r.test, avatar: r.avatar }) + '</td>' +
                '<td>' + r.doctor + '</td>' +
                '<td>' + r.date + '</td>' +
                '<td>' + r.size + '</td>' +
                '<td>' + badge(r.status) + '</td>' +
                '<td class="text-end">' +
                    '<button class="btn btn-ghost btn-icon me-1" data-demo="Previewing report for ' + r.patient + '"><i class="bi bi-eye"></i></button>' +
                    '<button class="btn btn-soft btn-icon" data-demo="Downloading report for ' + r.patient + '" ' + (r.status !== 'Ready' ? 'disabled' : '') + '><i class="bi bi-download"></i></button>' +
                '</td>' +
                '</tr>';
        }).join('');
    }

    function renderInvoices() {
        var tbody = document.getElementById('billingTableBody');
        if (!tbody) return;
        tbody.innerHTML = invoices.map(function (v) {
            return '<tr data-status="' + v.status + '">' +
                '<td class="cell-strong">' + v.id + '</td>' +
                '<td>' + v.patient + '</td>' +
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
        return {
            text: dark ? '#b9cdcd' : '#4f6b73',
            grid: dark ? 'rgba(255,255,255,.08)' : 'rgba(7,42,48,.07)'
        };
    }

    function gradient(ctx, area, top, bottom) {
        var g = ctx.createLinearGradient(0, area.top, 0, area.bottom);
        g.addColorStop(0, top);
        g.addColorStop(1, bottom);
        return g;
    }

    function initCharts() {
        if (typeof window.Chart === 'undefined') return;
        var C = themeColors();
        Chart.defaults.font.family = "'Plus Jakarta Sans', system-ui, sans-serif";
        Chart.defaults.color = C.text;

        /* ---- Patient visits (line) ---- */
        var visitLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        var visitNew = [420, 468, 512, 490, 560, 612, 588, 640, 702, 748, 715, 790];
        var visitReturning = [280, 305, 342, 360, 398, 430, 455, 470, 512, 548, 560, 602];

        var visitsCtx = document.getElementById('visitsChart');
        if (visitsCtx) {
            charts.visits = new Chart(visitsCtx, {
                type: 'line',
                data: {
                    labels: visitLabels,
                    datasets: [
                        {
                            label: 'New patients',
                            data: visitNew,
                            borderColor: PALETTE.brand,
                            backgroundColor: function (c) {
                                var a = c.chart.chartArea;
                                return a ? gradient(c.chart.ctx, a, 'rgba(14,159,154,.32)', 'rgba(14,159,154,0)') : 'rgba(14,159,154,.2)';
                            },
                            fill: true, tension: .42, borderWidth: 3,
                            pointRadius: 0, pointHoverRadius: 6, pointBackgroundColor: '#fff',
                            pointHoverBorderColor: PALETTE.brand, pointHoverBorderWidth: 3
                        },
                        {
                            label: 'Returning patients',
                            data: visitReturning,
                            borderColor: PALETTE.accent,
                            backgroundColor: function (c) {
                                var a = c.chart.chartArea;
                                return a ? gradient(c.chart.ctx, a, 'rgba(0,212,184,.26)', 'rgba(0,212,184,0)') : 'rgba(0,212,184,.15)';
                            },
                            fill: true, tension: .42, borderWidth: 3,
                            pointRadius: 0, pointHoverRadius: 6, pointBackgroundColor: '#fff',
                            pointHoverBorderColor: PALETTE.accent, pointHoverBorderWidth: 3
                        }
                    ]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    interaction: { mode: 'index', intersect: false },
                    animation: { duration: 1400, easing: 'easeOutQuart' },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: '#072a30', padding: 12, cornerRadius: 10,
                            titleFont: { weight: '700' }, boxPadding: 6, usePointStyle: true
                        }
                    },
                    scales: {
                        x: { grid: { display: false }, ticks: { color: C.text } },
                        y: {
                            beginAtZero: true, grid: { color: C.grid, drawBorder: false },
                            ticks: { color: C.text, padding: 8, stepSize: 200 }
                        }
                    }
                }
            });
        }

        /* ---- Visits range toggle (12M / 6M / 3M) ---- */
        var visitToggle = document.querySelector('[data-chart-toggle="visits"]');
        if (visitToggle && charts.visits) {
            visitToggle.addEventListener('pill:change', function (e) {
                var n = parseInt(e.detail.value, 10) || 12;
                charts.visits.data.labels = visitLabels.slice(-n);
                charts.visits.data.datasets[0].data = visitNew.slice(-n);
                charts.visits.data.datasets[1].data = visitReturning.slice(-n);
                charts.visits.update();
            });
        }

        /* ---- Appointment statistics (bar) ---- */
        var apptCtx = document.getElementById('appointmentsChart');
        if (apptCtx) {
            charts.appointments = new Chart(apptCtx, {
                type: 'bar',
                data: {
                    labels: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
                    datasets: [
                        { label: 'Completed', data: [286, 342, 318, 402, 458, 486], backgroundColor: PALETTE.brand, borderRadius: 7, barPercentage: .7, categoryPercentage: .62 },
                        { label: 'Scheduled', data: [120, 148, 132, 168, 190, 214], backgroundColor: PALETTE.accent, borderRadius: 7, barPercentage: .7, categoryPercentage: .62 },
                        { label: 'Cancelled', data: [34, 28, 41, 36, 30, 24], backgroundColor: '#f6c1bb', borderRadius: 7, barPercentage: .7, categoryPercentage: .62 }
                    ]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    animation: { duration: 1300, easing: 'easeOutQuart' },
                    plugins: {
                        legend: { display: false },
                        tooltip: { backgroundColor: '#072a30', padding: 12, cornerRadius: 10, usePointStyle: true }
                    },
                    scales: {
                        x: { grid: { display: false }, ticks: { color: C.text } },
                        y: { beginAtZero: true, grid: { color: C.grid, drawBorder: false }, ticks: { color: C.text, padding: 8 } }
                    }
                }
            });
        }

        /* ---- Test distribution (doughnut) ---- */
        var testCtx = document.getElementById('testDistributionChart');
        if (testCtx) {
            var labels = ['Blood Tests', 'Radiology', 'Cardiac', 'Pathology', 'Diabetes', 'Imaging'];
            var values = [428, 264, 182, 156, 128, 94];
            var colors = [PALETTE.brand, PALETTE.info, PALETTE.danger, PALETTE.purple, PALETTE.warning, PALETTE.accent];
            charts.distribution = new Chart(testCtx, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        data: values,
                        backgroundColor: colors,
                        borderWidth: 0,
                        hoverOffset: 10,
                        spacing: 2
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false, cutout: '68%',
                    animation: { animateRotate: true, animateScale: true, duration: 1500, easing: 'easeOutQuart' },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: '#072a30', padding: 12, cornerRadius: 10, usePointStyle: true,
                            callbacks: {
                                label: function (ctx) {
                                    var total = ctx.dataset.data.reduce(function (a, b) { return a + b; }, 0);
                                    var pct = Math.round(ctx.parsed / total * 100);
                                    return ' ' + ctx.label + ': ' + ctx.parsed.toLocaleString() + ' (' + pct + '%)';
                                }
                            }
                        }
                    }
                }
            });

            var legend = document.getElementById('distributionLegend');
            if (legend) {
                legend.innerHTML = labels.map(function (l, i) {
                    return '<div class="chart-legend__item"><span class="chart-legend__dot" style="background:' + colors[i] + '"></span>' + l + '</div>';
                }).join('');
            }
        }

        /* ---- KPI sparklines ---- */
        document.querySelectorAll('canvas[data-spark]').forEach(function (cv) {
            var data = cv.getAttribute('data-spark').split(',').map(Number);
            var color = cv.getAttribute('data-color') || PALETTE.brand;
            new Chart(cv, {
                type: 'line',
                data: {
                    labels: data.map(function () { return ''; }),
                    datasets: [{
                        data: data, borderColor: color, borderWidth: 2.5, tension: .45,
                        pointRadius: 0, fill: true,
                        backgroundColor: function (c) {
                            var a = c.chart.chartArea;
                            if (!a) return 'transparent';
                            var g = c.chart.ctx.createLinearGradient(0, a.top, 0, a.bottom);
                            g.addColorStop(0, color + '55');
                            g.addColorStop(1, color + '00');
                            return g;
                        }
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    animation: { duration: 1600, easing: 'easeOutQuart' },
                    plugins: { legend: { display: false }, tooltip: { enabled: false } },
                    scales: { x: { display: false }, y: { display: false } },
                    elements: { line: { capBezierPoints: true } }
                }
            });
        });
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
       Boot
    --------------------------------------------------------- */
    // Render synchronously (script is at end of <body>, DOM is ready)
    renderRecent();
    renderPatients();
    renderAppointments();
    renderPackages();
    renderReports();
    renderInvoices();

    Dash.searchMap = {
        patient: 'patients',
        appointment: 'appointments',
        package: 'packages', test: 'packages',
        report: 'reports', medical: 'reports',
        bill: 'billing', invoice: 'billing', payment: 'billing',
        setting: 'settings', profile: 'settings'
    };

    document.addEventListener('DOMContentLoaded', function () {
        initCharts();
        // Re-apply filters now that rows were injected
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
    document.addEventListener('dash:theme', function () {
        applyChartTheme();
    });
})();
