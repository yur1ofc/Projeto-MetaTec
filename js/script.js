document.addEventListener('DOMContentLoaded', function() {
    const header = document.querySelector('.header-container');
    const nav = document.querySelector('nav');

    if (header && nav && !document.querySelector('.menu-toggle')) {
        const menuToggle = document.createElement('button');
        menuToggle.className = 'menu-toggle';
        menuToggle.setAttribute('aria-label', 'Abrir menu');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.innerHTML = '<span></span><span></span><span></span>';
        header.insertBefore(menuToggle, nav);

        const navMenu = document.querySelector('.nav-menu');

        menuToggle.addEventListener('click', function() {
            const expanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', String(!expanded));
            navMenu.classList.toggle('active');
            document.body.classList.toggle('menu-open', !expanded && window.innerWidth <= 992);
        });

        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 992) {
                    menuToggle.setAttribute('aria-expanded', 'false');
                    navMenu.classList.remove('active');
                    document.body.classList.remove('menu-open');
                }
            });
        });

        window.addEventListener('resize', function() {
            if (window.innerWidth > 992) {
                navMenu.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
                document.body.classList.remove('menu-open');
            }
        });
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    const maskPhone = value => {
        const digits = value.replace(/\D/g, '').slice(0, 11);
        if (digits.length <= 2) return digits;
        if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
        if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    };

    document.querySelectorAll('input[type="tel"]').forEach(input => {
        input.addEventListener('input', () => {
            input.value = maskPhone(input.value);
        });
    });

    document.querySelectorAll('.contato-form').forEach(form => {
        const status = form.querySelector('.form-status');

        const setStatus = (message, kind = '') => {
            if (!status) return;
            status.textContent = message;
            status.classList.remove('error', 'success');
            if (kind) status.classList.add(kind);
        };

        const clearError = input => {
            input.classList.remove('error');
            const errorMsg = input.parentNode.querySelector('.error-message');
            if (errorMsg) errorMsg.remove();
        };

        const showError = (input, message) => {
            clearError(input);
            input.classList.add('error');
            const errorMsg = document.createElement('span');
            errorMsg.className = 'error-message';
            errorMsg.style.color = '#c0392b';
            errorMsg.style.fontSize = '0.875rem';
            errorMsg.style.marginTop = '0.25rem';
            errorMsg.style.display = 'block';
            errorMsg.textContent = message;
            input.parentNode.appendChild(errorMsg);
        };

        form.addEventListener('submit', async function(e) {
            e.preventDefault();

            let isValid = true;
            const inputs = this.querySelectorAll('[required]');

            inputs.forEach(input => {
                clearError(input);
                const value = input.value.trim();
                let message = '';

                if (!value) {
                    message = 'Este campo é obrigatório.';
                } else if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    message = 'Informe um e-mail válido.';
                } else if (input.type === 'tel' && value.replace(/\D/g, '').length < 10) {
                    message = 'Informe um telefone válido com DDD.';
                }

                if (message) {
                    isValid = false;
                    showError(input, message);
                }
            });

            if (!isValid) {
                setStatus('Revise os campos obrigatórios antes de enviar.', 'error');
                return;
            }

            const data = Object.fromEntries(new FormData(form).entries());
            const subjectText = (data.assunto || '').replace(/[-_]/g, ' ');
            const whatsapp = form.dataset.whatsapp || '';
            const email = form.dataset.email || '';
            const whatsappMessage = [
                'Olá, vim pelo site da Metal Tec e quero um orçamento.',
                `Nome: ${data.nome || ''}`,
                `E-mail: ${data.email || ''}`,
                `Telefone: ${data.telefone || ''}`,
                `Assunto: ${subjectText || ''}`,
                `Mensagem: ${data.mensagem || ''}`
            ].join('\n');

            setStatus('Enviando mensagem...', '');

            let sent = false;

            if (email) {
                try {
                    const response = await fetch(`https://formsubmit.co/ajax/${email}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify({
                            name: data.nome || '',
                            email: data.email || '',
                            telefone: data.telefone || '',
                            assunto: subjectText || '',
                            mensagem: data.mensagem || '',
                            _subject: `Novo contato pelo site - ${subjectText || 'Orçamento'}`,
                            _template: 'table',
                            _captcha: 'false'
                        })
                    });

                    if (response.ok) {
                        sent = true;
                        setStatus('Mensagem enviada com sucesso. O WhatsApp será aberto para agilizar o atendimento.', 'success');
                    }
                } catch (error) {
                    sent = false;
                }
            }

            if (!sent) {
                setStatus('Não foi possível enviar pelo formulário agora. O WhatsApp será aberto para concluir o contato.', 'error');
            }

            if (whatsapp) {
                window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(whatsappMessage)}`, '_blank', 'noopener');
            }

            form.reset();
        });

        form.querySelectorAll('[required]').forEach(input => {
            input.addEventListener('input', function() {
                clearError(this);
                if (status && !status.classList.contains('success')) {
                    setStatus('');
                }
            });
        });
    });

    document.body.style.visibility = 'visible';
});

if ('loading' in HTMLImageElement.prototype) {
    document.querySelectorAll('img[loading="lazy"]').forEach(img => {
        img.loading = 'lazy';
    });
}


// ===== FADE-IN ON SCROLL =====
(function() {
    const fadeEls = document.querySelectorAll('.fade-in');
    if (!fadeEls.length) return;

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry, i) {
            if (entry.isIntersecting) {
                setTimeout(function() {
                    entry.target.classList.add('visible');
                }, i * 80);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    fadeEls.forEach(function(el) { observer.observe(el); });
})();

// ===== COUNTER ANIMATION =====
(function() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const target = parseInt(el.dataset.count, 10);
            const suffix = el.dataset.suffix || '';
            let start = 0;
            const duration = 1500;
            const step = target / (duration / 16);
            const timer = setInterval(function() {
                start += step;
                if (start >= target) {
                    el.textContent = target + suffix;
                    clearInterval(timer);
                } else {
                    el.textContent = Math.floor(start) + suffix;
                }
            }, 16);
            observer.unobserve(el);
        });
    }, { threshold: 0.5 });

    counters.forEach(function(el) { observer.observe(el); });
})();
