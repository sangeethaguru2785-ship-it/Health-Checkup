/* ============================================================
   Stackly Health Checkup Center - Authentication
   Login + Sign Up: validation, role selection, redirects
   ============================================================ */
(function () {
    'use strict';

    /* ---------------------------------------------------------
       Config
    --------------------------------------------------------- */
    var ROUTES = {
        admin: 'admin-dashboard.html',
        patient: 'patient-dashboard.html'
    };

    var EMAIL_RE = /^[A-Za-z0-9]+(?:\.[A-Za-z0-9]+)*@[A-Za-z0-9]+(?:\.[A-Za-z0-9]+)*\.[A-Za-z]{2,}$/;

    /* ---------------------------------------------------------
       Toast
    --------------------------------------------------------- */
    var toastTimer;
    function toast(message, type, icon) {
        var el = document.getElementById('authToast');
        if (!el) {
            el = document.createElement('div');
            el.id = 'authToast';
            el.className = 'auth-toast';
            document.body.appendChild(el);
        }
        el.classList.toggle('is-error', type === 'error');
        el.innerHTML = '<i class="bi ' + (icon || (type === 'error' ? 'bi-exclamation-triangle-fill' : 'bi-check-circle-fill')) + '"></i><span></span>';
        el.querySelector('span').textContent = message;
        requestAnimationFrame(function () { el.classList.add('is-visible'); });
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { el.classList.remove('is-visible'); }, 3200);
    }

    /* ---------------------------------------------------------
       Validators
    --------------------------------------------------------- */
    function isEmail(v) { return EMAIL_RE.test(String(v).trim()); }

    function isPhone(v) {
        v = String(v).trim();
        if (!/^[+()\-\s\d]+$/.test(v)) return false;
        var digits = (v.match(/\d/g) || []).length;
        return digits >= 7 && digits <= 15;
    }

    var PW_RULES = [
        function (v) { return v.length >= 8; },
        function (v) { return /[A-Z]/.test(v); },
        function (v) { return /[a-z]/.test(v); },
        function (v) { return /\d/.test(v); },
        function (v) { return /[^A-Za-z0-9]/.test(v); }
    ];

    var PASSWORD_ERROR = 'Password does not meet the required security criteria.';

    function checkPassword(v) {
        v = String(v);
        return PW_RULES.every(function (rule) { return rule(v); });
    }

    function passwordScore(v) {
        var score = 0;
        if (v.length >= 8) score++;
        if (v.length >= 12) score++;
        if (/[a-z]/.test(v) && /[A-Z]/.test(v)) score++;
        if (/\d/.test(v)) score++;
        if (/[^A-Za-z0-9]/.test(v)) score++;
        var label = 'Weak', cls = 'weak';
        if (score >= 5) { label = 'Strong'; cls = 'strong'; }
        else if (score === 4) { label = 'Good'; cls = 'good'; }
        else if (score === 3) { label = 'Fair'; cls = 'fair'; }
        return { score: score, label: label, cls: cls };
    }

    /* ---------------------------------------------------------
       Field error helpers
    --------------------------------------------------------- */
    function fieldOf(input) { return input.closest('.field'); }

    function showError(input, message) {
        var field = fieldOf(input);
        if (!field) return;
        field.classList.add('is-invalid');
        field.classList.remove('is-valid');
        var err = field.querySelector('.field__error span');
        if (err) err.textContent = message;
        input.setAttribute('aria-invalid', 'true');
    }

    function showValid(input) {
        var field = fieldOf(input);
        if (!field) return;
        field.classList.remove('is-invalid');
        field.classList.add('is-valid');
        input.removeAttribute('aria-invalid');
    }

    function clearState(input) {
        var field = fieldOf(input);
        if (!field) return;
        field.classList.remove('is-invalid', 'is-valid');
        input.removeAttribute('aria-invalid');
    }

    function isErrorVisible(input) {
        var field = fieldOf(input);
        return field && field.classList.contains('is-invalid');
    }

    /* ---------------------------------------------------------
       Password visibility toggle
    --------------------------------------------------------- */
    function initPasswordToggles() {
        document.querySelectorAll('[data-toggle-password]').forEach(function (btn) {
            var input = document.getElementById(btn.getAttribute('data-toggle-password'));
            if (!input) return;
            btn.addEventListener('click', function () {
                var show = input.type === 'password';
                input.type = show ? 'text' : 'password';
                btn.innerHTML = '<i class="bi ' + (show ? 'bi-eye-slash' : 'bi-eye') + '"></i>';
                btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
                btn.setAttribute('aria-pressed', String(show));
            });
        });
    }

    /* ---------------------------------------------------------
       Role selection (cards + radio, single choice enforced)
    --------------------------------------------------------- */
    function initRoleSelection(form) {
        var group = form.querySelector('.role-cards');
        if (!group) return null;
        var cards = Array.prototype.slice.call(group.querySelectorAll('.role-card'));
        var errorEl = form.querySelector('.role-error');

        function sync() {
            cards.forEach(function (card) {
                var input = card.querySelector('input[type="radio"]');
                card.classList.toggle('is-selected', input.checked);
            });
            if (group.querySelector('input[type="radio"]:checked')) {
                group.classList.remove('is-invalid');
                if (errorEl) errorEl.classList.remove('is-shown');
            }
        }

        cards.forEach(function (card) {
            var input = card.querySelector('input[type="radio"]');
            input.addEventListener('change', sync);
        });
        sync();

        return {
            value: function () {
                var checked = group.querySelector('input[type="radio"]:checked');
                return checked ? checked.value : '';
            },
            fail: function () {
                group.classList.add('is-invalid');
                if (errorEl) errorEl.classList.add('is-shown');
            },
            clear: function () {
                group.classList.remove('is-invalid');
                if (errorEl) errorEl.classList.remove('is-shown');
            }
        };
    }

    /* ---------------------------------------------------------
       Password strength meter (sign up)
    --------------------------------------------------------- */
    function initStrengthMeter(input) {
        var meter = document.querySelector('[data-strength-for="' + input.id + '"]');
        if (!meter) return;
        var bars = meter.querySelectorAll('.strength__bars span');
        var text = meter.querySelector('.strength__text');

        function render() {
            var v = input.value;
            if (!v) { meter.classList.remove('is-shown'); return; }
            meter.classList.add('is-shown');
            var r = passwordScore(v);
            var active = Math.max(1, Math.min(4, Math.ceil(r.score * 4 / 5)));
            var colors = { weak: '#f04438', fair: '#f79009', good: '#0b8783', strong: '#12b76a' };
            bars.forEach(function (b, i) {
                b.style.background = i < active ? colors[r.cls] : 'var(--au-line)';
            });
            text.textContent = 'Password strength: ' + r.label;
            text.className = 'strength__text ' + r.cls;
        }

        input.addEventListener('input', render);
        render();
    }

    /* ---------------------------------------------------------
       Login form
    --------------------------------------------------------- */
    function initLogin() {
        var form = document.getElementById('loginForm');
        if (!form) return;

        var email = document.getElementById('loginEmail');
        var pass = document.getElementById('loginPassword');
        var remember = document.getElementById('rememberMe');
        var rememberError = form.querySelector('.remember-error');
        var roles = initRoleSelection(form);

        // Restore remembered email
        try {
            var saved = localStorage.getItem('stackly-remember-email');
            if (saved && email) { email.value = saved; if (remember) remember.checked = true; }
        } catch (e) { /* ignore */ }

        // Forgot password link navigates to 404.html directly (no JS needed)

        function validateRemember() {
            if (!remember || remember.checked) {
                if (rememberError) rememberError.classList.remove('is-shown');
                if (remember) remember.classList.remove('is-invalid');
                return true;
            }
            if (rememberError) rememberError.classList.add('is-shown');
            remember.classList.add('is-invalid');
            return false;
        }

        if (remember) {
            remember.addEventListener('change', function () {
                if (remember.checked) validateRemember();
            });
        }

        email.addEventListener('blur', function () {
            if (!email.value) return;
            if (isEmail(email.value)) showValid(email);
            else showError(email, 'Please enter a valid email address.');
        });
        email.addEventListener('input', function () { if (isErrorVisible(email)) clearState(email); });
        function validatePass() {
            if (!pass.value) { showError(pass, 'Password is required.'); return false; }
            if (!checkPassword(pass.value)) { showError(pass, PASSWORD_ERROR); return false; }
            showValid(pass);
            return true;
        }

        pass.addEventListener('blur', function () { if (pass.value) validatePass(); });
        pass.addEventListener('input', function () {
            if (!pass.value) { clearState(pass); return; }
            if (isErrorVisible(pass)) validatePass();
        });

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var ok = true;

            if (!email.value.trim()) { showError(email, 'Email address is required.'); ok = false; }
            else if (!isEmail(email.value)) { showError(email, 'Please enter a valid email address.'); ok = false; }
            else showValid(email);

            if (!validatePass()) ok = false;

            var role = roles.value();
            if (!role) { roles.fail(); ok = false; } else roles.clear();

            if (!validateRemember()) ok = false;

            if (!ok) {
                var first = form.querySelector('.is-invalid input, .is-invalid .role-card input') ||
                            form.querySelector('.role-cards.is-invalid input') ||
                            form.querySelector('#rememberMe.is-invalid');
                if (first) first.focus();
                toast('Please fix the highlighted fields.', 'error');
                return;
            }

            // Persist preference
            try {
                if (remember && remember.checked) localStorage.setItem('stackly-remember-email', email.value.trim());
                else localStorage.removeItem('stackly-remember-email');
            } catch (e) { /* ignore */ }

            submitWithLoading(form, function () {
                var addr = email.value.trim();
                var displayName = window.StacklyUser ? window.StacklyUser.displayNameFromEmail(addr) : '';
                saveSession(addr, role, displayName);
                redirect(role);
            });
        });
    }

    /* ---------------------------------------------------------
       Sign up form
    --------------------------------------------------------- */
    function initSignup() {
        var form = document.getElementById('signupForm');
        if (!form) return;

        var name = document.getElementById('signupName');
        var email = document.getElementById('signupEmail');
        var phone = document.getElementById('signupPhone');
        var pass = document.getElementById('signupPassword');
        var confirm = document.getElementById('signupConfirm');
        var terms = document.getElementById('termsCheck');
        var roles = initRoleSelection(form);

        initStrengthMeter(pass);

        function checkName() {
            var v = name.value.trim();
            if (!v) { showError(name, 'Please enter your full name.'); return false; }
            if (!/^[A-Za-z\s]+$/.test(v)) { showError(name, 'Name can only contain letters and spaces.'); return false; }
            if (v.length < 3) { showError(name, 'Please enter your full name (min 3 characters).'); return false; }
            showValid(name); return true;
        }
        function checkEmail() {
            if (!isEmail(email.value)) { showError(email, 'Please enter a valid email address.'); return false; }
            showValid(email); return true;
        }
        function checkPhone() {
            var v = phone.value.trim();
            if (!v) { showError(phone, 'Please enter your phone number.'); return false; }
            if (!/^\d+$/.test(v)) { showError(phone, 'Phone number can only contain digits (0–9).'); return false; }
            if (v.length < 7 || v.length > 15) { showError(phone, 'Enter a valid phone number (7–15 digits).'); return false; }
            showValid(phone); return true;
        }
        function checkPass() {
            if (!pass.value) { showError(pass, 'Password is required.'); return false; }
            if (!checkPassword(pass.value)) { showError(pass, PASSWORD_ERROR); return false; }
            showValid(pass); return true;
        }
        function checkConfirm() {
            if (confirm.value !== pass.value) { showError(confirm, 'Passwords do not match.'); return false; }
            showValid(confirm); return true;
        }

        var touched = { name: false, phone: false };

        name.addEventListener('blur', function () { touched.name = true; if (name.value) checkName(); });
        email.addEventListener('blur', function () { if (email.value) checkEmail(); });
        phone.addEventListener('blur', function () { touched.phone = true; if (phone.value) checkPhone(); });
        pass.addEventListener('blur', function () { if (pass.value) checkPass(); });
        confirm.addEventListener('blur', function () { if (confirm.value) checkConfirm(); });

        name.addEventListener('input', function () {
            if (touched.name && name.value) checkName();
            else if (isErrorVisible(name)) clearState(name);
        });
        phone.addEventListener('input', function () {
            if (touched.phone && phone.value) checkPhone();
            else if (isErrorVisible(phone)) clearState(phone);
        });
        [email, confirm].forEach(function (input) {
            input.addEventListener('input', function () {
                if (isErrorVisible(input)) clearState(input);
            });
        });
        pass.addEventListener('input', function () {
            if (!pass.value) { clearState(pass); return; }
            if (isErrorVisible(pass)) checkPass();
            if (confirm.value && isErrorVisible(confirm)) clearState(confirm);
        });
        if (terms) terms.addEventListener('change', function () {
            if (terms.checked) document.querySelector('.terms-error').classList.remove('is-shown');
        });

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var ok = true;
            if (!checkName()) ok = false;
            if (!checkEmail()) ok = false;
            if (!checkPhone()) ok = false;
            if (!checkPass()) ok = false;
            if (!checkConfirm()) ok = false;

            var role = roles.value();
            if (!role) { roles.fail(); ok = false; } else roles.clear();

            if (!terms.checked) { document.querySelector('.terms-error').classList.add('is-shown'); ok = false; }
            else document.querySelector('.terms-error').classList.remove('is-shown');

            if (!ok) {
                var first = form.querySelector('.field.is-invalid input') ||
                            form.querySelector('.role-cards.is-invalid input');
                if (first) first.focus();
                toast('Please fix the highlighted fields.', 'error');
                return;
            }

            submitWithLoading(form, function () {
                saveSession(email.value.trim(), role, name.value.trim());
                toast('Account created! Signing you in…', 'success', 'bi-person-check-fill');
                setTimeout(function () { redirect(role); }, 650);
            });
        });
    }

    /* ---------------------------------------------------------
       Submission helpers
    --------------------------------------------------------- */
    function submitWithLoading(form, done) {
        var btn = form.querySelector('.btn-auth');
        var original = btn.innerHTML;
        btn.classList.add('is-loading');
        btn.innerHTML = '<span class="spinner-border" role="status" aria-hidden="true"></span> Please wait…';
        setTimeout(function () {
            btn.classList.remove('is-loading');
            btn.innerHTML = original;
            done();
        }, 850);
    }

    function saveSession(email, role, name) {
        try {
            localStorage.setItem('stackly-auth', JSON.stringify({
                email: email, role: role, name: name, at: Date.now()
            }));
        } catch (e) { /* ignore */ }
    }

    function redirect(role) {
        var url = ROUTES[role] || ROUTES.patient;
        window.location.href = url;
    }

    /* ---------------------------------------------------------
       Boot
    --------------------------------------------------------- */
    function init() {
        initPasswordToggles();
        initLogin();
        initSignup();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
