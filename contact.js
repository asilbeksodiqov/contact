document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        document.getElementById('loading').style.display = 'none';
    }, 1500);

    initForm();
    initContactTypeSelector();
    initFromURLParams();
});

function initFromURLParams() {
    const params = new URLSearchParams(window.location.search);
    const method = params.get('method');

    if (method) {
        const toast = {
            email:    { type: 'info', title: 'Aqlli Aloqa', message: 'Ish vaqti - email orqali murojaat qilish ma`qul.' },
            telegram: { type: 'info', title: 'Aqlli Aloqa', message: 'Telegram orqali tezkor javob.' },
            phone:    { type: 'info', title: 'Aqlli Aloqa', message: 'Kechki soatlar - shoshilinch bo`lsa qo`ng`iroq qiling.' }
        };

        if (toast[method]) {
            setTimeout(() => {
                showToast(toast[method]);

                const contactBtn = document.querySelector(`.type-option[data-type="${method}"]`);
                if (contactBtn) {
                    contactBtn.click();
                    // URL parametridan kelganda fokus beramiz (foydalanuvchi o'zi bosgan)
                    setTimeout(() => {
                        document.getElementById('contact_input').focus();
                    }, 100);
                }
            }, 500);
        }
    }
}

/* ============================================================
   TELEFON RAQAM FORMATLASH
   Ko'rsatish:  94 703 08 06  (9 raqam, bo'shliqlar bilan)
   Yuborish:   +998947030806  (prefiks bilan, bo'shliqsiz)
   ============================================================ */
function formatPhoneDisplay(digits) {
    // digits — faqat raqamlar, max 9 ta
    const d = digits.substring(0, 9);
    if (d.length === 0) return '';
    if (d.length <= 2) return d;
    if (d.length <= 5) return `${d.slice(0,2)} ${d.slice(2)}`;
    if (d.length <= 7) return `${d.slice(0,2)} ${d.slice(2,5)} ${d.slice(5)}`;
    return `${d.slice(0,2)} ${d.slice(2,5)} ${d.slice(5,7)} ${d.slice(7)}`;
}

function initPhoneNumberFormatting() {
    const phoneInput = document.getElementById('contact_input');
    if (!phoneInput) return;

    phoneInput.addEventListener('keydown', function(e) {
        const activeType = document.querySelector('.type-option.active')?.dataset.type || 'phone';
        if (activeType !== 'phone') return;

        // Navigatsiya tugmalariga ruxsat
        const navKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End'];
        if (navKeys.includes(e.key)) return;

        // Faqat raqamga ruxsat
        if (!/^\d$/.test(e.key)) {
            e.preventDefault();
            return;
        }

        // Max 9 raqam
        const digits = this.value.replace(/\D/g, '');
        if (digits.length >= 9) {
            e.preventDefault();
        }
    });

    phoneInput.addEventListener('input', function() {
        const activeType = document.querySelector('.type-option.active')?.dataset.type || 'phone';
        if (activeType !== 'phone') return;

        const digits = this.value.replace(/\D/g, '').substring(0, 9);

        if (digits.length === 0) {
            this.value = '';
            this.parentElement.classList.remove('has-value');
            return;
        }

        // Kursorni oxirida saqlash uchun formatted qiymat o'rnatamiz
        this.value = formatPhoneDisplay(digits);
        this.parentElement.classList.add('has-value');
    });
}

function initContactTypeSelector() {
    const typeOptions        = document.querySelectorAll('.type-option');
    const contactInput       = document.getElementById('contact_input');
    const contactPrefix      = document.getElementById('contactPrefix');
    const contactLabel       = document.getElementById('contactLabel');
    const contactFieldContainer = document.getElementById('contactFieldContainer');

    typeOptions.forEach(option => {
        option.addEventListener('click', function() {
            typeOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');

            const type = this.dataset.type;
            contactInput.value = '';
            contactInput.placeholder = '';
            contactFieldContainer.classList.remove('has-value');

            switch (type) {
                case 'phone':
                    contactInput.type        = 'tel';
                    contactInput.inputMode   = 'numeric';
                    contactInput.maxLength   = 11; // "94 703 08 06" — 11 belgi (bo'shliqlar bilan)
                    contactInput.placeholder = '94 703 08 06';
                    contactPrefix.textContent     = '+998';
                    contactPrefix.style.display   = 'flex';
                    contactLabel.textContent      = 'Telefon raqamingiz';
                    contactFieldContainer.className = 'floating-label-dynamic phone-mode';
                    contactInput.removeAttribute('pattern');
                    break;

                case 'telegram':
                    contactInput.type        = 'text';
                    contactInput.inputMode   = 'text';
                    contactInput.maxLength   = 32;
                    contactInput.placeholder = 'username';
                    contactPrefix.textContent     = '@';
                    contactPrefix.style.display   = 'flex';
                    contactLabel.textContent      = 'Telegram username';
                    contactFieldContainer.className = 'floating-label-dynamic telegram-mode';
                    contactInput.removeAttribute('pattern');
                    break;

                case 'email':
                    contactInput.type        = 'email';
                    contactInput.inputMode   = 'email';
                    contactInput.maxLength   = 255;
                    contactInput.placeholder = 'sth@email.com';
                    contactPrefix.textContent     = '';
                    contactPrefix.style.display   = 'none';
                    contactLabel.textContent      = 'Email manzilingiz';
                    contactFieldContainer.className = 'floating-label-dynamic email-mode';
                    contactInput.removeAttribute('pattern');
                    break;
            }

            // Foydalanuvchi o'zi bosganida fokus — bu tabiiy
            setTimeout(() => contactInput.focus(), 50);
        });
    });

    // Default: phone tanlangan, lekin FOKUS BERILMAYDI
    if (typeOptions.length > 0) {
        const phoneOption = document.querySelector('.type-option[data-type="phone"]');
        if (phoneOption) {
            phoneOption.classList.add('active');
            contactInput.removeAttribute('pattern');
            // focus() chaqirilmaydi — foydalanuvchi o'zi bosguncha kutiladi
        }
    }

    initPhoneNumberFormatting();
}

function initForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const name        = document.getElementById('name').value.trim();
        const contactType = document.querySelector('.type-option.active')?.dataset.type || 'phone';
        let   contactValue = document.getElementById('contact_input').value.trim();
        const message     = document.getElementById('message').value.trim();

        if (!name || !contactValue || !message) {
            showToast({
                type: 'warning',
                title: 'Diqqat!',
                message: 'Iltimos, barcha maydonlarni to`ldiring'
            });
            return;
        }

        let contactInfo      = '';
        let validationPassed = true;

        switch (contactType) {
            case 'phone':
                // Bo'shliqlarni olib tashlab, +998 prefiksini qo'shamiz
                const digits = contactValue.replace(/\D/g, '');
                if (digits.length !== 9) {
                    showToast({
                        type: 'error',
                        title: 'Noto`g`ri format',
                        message: 'Telefon raqami 9 ta raqamdan iborat bo`lishi kerak'
                    });
                    validationPassed = false;
                    break;
                }
                contactInfo = `+998${digits}`;
                break;

            case 'telegram':
                contactValue = contactValue.replace(/^@/, '');
                if (contactValue.length < 4) {
                    showToast({
                        type: 'error',
                        title: 'Noto`g`ri format',
                        message: 'Telegram username kamida 5 belgidan iborat bo`lishi kerak'
                    });
                    validationPassed = false;
                }
                contactInfo = `@${contactValue}`;
                break;

            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(contactValue)) {
                    showToast({
                        type: 'error',
                        title: 'Noto`g`ri format',
                        message: 'Iltimos, to`g`ri email manzilini kiriting'
                    });
                    validationPassed = false;
                }
                contactInfo = contactValue;
                break;
        }

        if (!validationPassed) return;

        const submitBtn  = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled  = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Yuborilmoqda...';

        try {
            const TELEGRAM_BOT_TOKEN = '8561049037:AAEbMoh0BTPRx5mUR99ui-uyg764vGO8spY';
            const TELEGRAM_CHAT_ID   = '7123672881';

            const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: TELEGRAM_CHAT_ID,
                    text: `📬 Yangi xabar | sodiqov.uz\n👤 Ism: ${name}\n📞 ${contactType.toUpperCase()}: ${contactInfo}\n💬 Xabar: ${message}`
                })
            });

            if (response.ok) {
                showToast({
                    type: 'success',
                    title: 'Muvaffaqiyatli!',
                    message: 'Xabaringiz yuborildi! Tez orada aloqaga chiqamiz.'
                });

                form.reset();

                document.querySelectorAll('.floating-label, .floating-label-dynamic').forEach(el => {
                    el.classList.remove('has-value');
                });

                // Phone holatiga qaytarish
                document.querySelectorAll('.type-option').forEach(opt => {
                    opt.classList.remove('active');
                    if (opt.dataset.type === 'phone') opt.classList.add('active');
                });

                const contactInput          = document.getElementById('contact_input');
                const contactPrefix         = document.getElementById('contactPrefix');
                const contactLabel          = document.getElementById('contactLabel');
                const contactFieldContainer = document.getElementById('contactFieldContainer');

                contactInput.type        = 'tel';
                contactInput.inputMode   = 'numeric';
                contactInput.maxLength   = 11;
                contactInput.placeholder = '94 703 08 06';
                contactPrefix.textContent     = '+998';
                contactPrefix.style.display   = 'flex';
                contactLabel.textContent      = 'Telefon raqamingiz';
                contactFieldContainer.className = 'floating-label-dynamic phone-mode';
                contactInput.removeAttribute('pattern');

                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);

            } else {
                throw new Error('Xabar yuborishda xatolik');
            }

        } catch (error) {
            showToast({
                type: 'error',
                title: 'Xatolik!',
                message: 'Xatolik yuz berdi. Iltimos, keyinroq urinib ko`ring.'
            });
            console.error(error);

        } finally {
            submitBtn.disabled  = false;
            submitBtn.innerHTML = originalText;
        }
    });

    // Floating label logikasi
    const floatingInputs = document.querySelectorAll(
        '.floating-label input, .floating-label textarea, .floating-label-dynamic input'
    );

    floatingInputs.forEach(input => {
        input.addEventListener('input', function() {
            this.parentElement.classList.toggle('has-value', this.value.trim().length > 0);
        });

        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });

        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
            if (!this.value.trim()) {
                this.parentElement.classList.remove('has-value');
            }
        });

        if (input.value.trim()) {
            input.parentElement.classList.add('has-value');
        }
    });
}

/* ============================================================
   TOAST
   ============================================================ */
function showToast(options) {
    const { type = 'info', title = '', message = '', duration = 4000 } = options;

    const existingToast = document.querySelector('.toast.show');
    if (existingToast) {
        existingToast.classList.remove('show');
        setTimeout(() => existingToast.remove(), 400);
    }

    const icons = {
        success: 'fas fa-check-circle',
        error:   'fas fa-exclamation-circle',
        info:    'fas fa-info-circle',
        warning: 'fas fa-exclamation-triangle'
    };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-icon"><i class="${icons[type] || icons.info}"></i></div>
        <div class="toast-content">
            ${title   ? `<div class="toast-title">${title}</div>` : ''}
            <div class="toast-message">${message}</div>
        </div>
    `;

    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);

    if (duration > 0) {
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, duration);
    }

    return toast;
}
