function voltarPagina() {
    if (document.referrer && document.referrer.includes(window.location.host)) {
        window.history.back();
    } else {
        window.location.href = 'index.html';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.glow-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);

            const rx = (e.clientY - rect.top) / rect.height;
            const ry = (e.clientX - rect.left) / rect.width;
            card.style.setProperty('--tilt-x', `${(rx - 0.5) * -9}`);
            card.style.setProperty('--tilt-y', `${(ry - 0.5) * 9}`);
        });

        card.addEventListener('mouseleave', () => {
            card.style.setProperty('--tilt-x', '0');
            card.style.setProperty('--tilt-y', '0');
        });
    });

    criarNeonParticles();
    criarSakura();
    initSlider();
    initEntrance();
    initPpeTable();
});

// Partículas neon flutuantes em toda a página (brasas AoT)
function criarNeonParticles() {
    const canvas = document.createElement('canvas');
    canvas.id = 'neon-particles';
    canvas.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:90;';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let w = 0;
    let h = 0;
    let particles = [];

    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const colors = ['217,198,160', '232,180,90', '168,161,141', '224,87,74'];

    function spawn(y) {
        return {
            x: Math.random() * w,
            y: y !== undefined ? y : h + 12,
            r: Math.random() * 1.8 + 0.5,
            vy: -(Math.random() * 0.35 + 0.1),
            vx: (Math.random() - 0.5) * 0.2,
            c: colors[Math.floor(Math.random() * colors.length)]
        };
    }

    const count = Math.max(24, Math.min(60, Math.floor((w * h) / 22000)));

    for (let i = 0; i < count; i++) {
        particles.push(spawn(Math.random() * h));
    }

    function tick() {
        ctx.clearRect(0, 0, w, h);

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.y += p.vy;
            p.x += p.vx;

            if (p.y < -12) {
                particles[i] = spawn();
                continue;
            }
            p.x = (p.x + w) % w;

            const fade = Math.min(1, (h - p.y) / h);

            ctx.strokeStyle = `rgba(${p.c},${(0.1 + fade * 0.14).toFixed(3)})`;
            ctx.lineWidth = p.r;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x - p.vx * 16, p.y - p.vy * 16);
            ctx.stroke();

            ctx.fillStyle = `rgba(${p.c},${(0.22 + fade * 0.3).toFixed(3)})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
        }

        requestAnimationFrame(tick);
    }

    tick();
}

// Pétalas de sakura (mantidas caso alguma página antiga ainda use o canvas #petals)
function criarSakura() {
    const canvas = document.getElementById('petals');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const wrap = canvas.parentElement;
    let w = 0;
    let h = 0;

    function resize() {
        w = canvas.width = wrap.clientWidth;
        h = canvas.height = wrap.clientHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const colors = ['#e3d3f2', '#c9aee6', '#f3e2ec', '#efe7f7', '#d9b8e2'];
    const petals = [];
    const count = Math.min(90, Math.max(45, Math.floor((w + h) / 38)));

    function spawn(anywhere) {
        return {
            x: Math.random() * w,
            y: anywhere ? Math.random() * h : -20,
            r: Math.random() * 7 + 4,
            vy: Math.random() * 1.1 + 0.5,
            sway: Math.random() * 1.5 + 0.4,
            off: Math.random() * Math.PI * 2,
            rot: Math.random() * Math.PI * 2,
            vr: (Math.random() - 0.5) * 0.05,
            c: colors[(Math.random() * colors.length) | 0]
        };
    }

    for (let i = 0; i < count; i++) {
        petals.push(spawn(true));
    }

    function tick() {
        ctx.clearRect(0, 0, w, h);

        for (let i = 0; i < petals.length; i++) {
            const p = petals[i];
            p.y += p.vy;
            p.x += Math.sin((p.y + p.off) / 60) * p.sway * 1.4;
            p.rot += p.vr;

            if (p.y > h + 24) {
                petals[i] = spawn();
                continue;
            }

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);
            ctx.scale(1, 0.6);
            ctx.beginPath();
            ctx.ellipse(0, 0, p.r, p.r * 0.62, 0, 0, Math.PI * 2);
            ctx.fillStyle = p.c;
            ctx.fill();
            ctx.restore();
        }

        requestAnimationFrame(tick);
    }

    tick();
}

// ============================================================
// TRANSIÇÃO DE PÁGINA — ZOOM (navegação em página única)
// ============================================================
function initSlider() {
    const viewport = document.querySelector('.slider-viewport');
    if (!viewport) return;

    const slides = Array.from(viewport.querySelectorAll('.aot-slide'));
    if (!slides.length) return;

    const navBtns = Array.from(document.querySelectorAll('[data-slide]'));
    const prevBtn = document.querySelector('[data-nav="prev"]');
    const nextBtn = document.querySelector('[data-nav="next"]');
    const dotsWrap = document.getElementById('aotDots');
    const sweep = document.getElementById('sweepOverlay');

    const HASH_MAP = { 'inicio': 0, 'historia': 1, 'projeto-de-vida': 2, 'ppe': 3, 'consideracoes': 4 };

    // Fluxo entre páginas: após as considerações finais seguimos para as áreas
    // de atividades e, em seguida, para os anexos.
    const PAGE_NEXT = { 4: 'areas.html' };

    let current = 0;
    let transitioning = false;

    // Cria os pontos indicadores
    const dots = [];
    if (dotsWrap) {
        slides.forEach((_, i) => {
            const d = document.createElement('button');
            d.type = 'button';
            d.className = 'dot';
            d.setAttribute('aria-label', `Ir para a seção ${i + 1}`);
            d.addEventListener('click', () => goTo(i));
            dotsWrap.appendChild(d);
            dots.push(d);
        });
    }

    function replaySlideAnim(el) {
        const items = el.querySelectorAll('[data-anim-slide]');
        items.forEach((item, j) => {
            item.classList.remove('in');
            item.style.transitionDelay = `${Math.min(540, j * 100)}ms`;
            void item.offsetWidth;
            item.classList.add('in');
        });
    }

    // Rajada radial de zoom na troca de seção
    function burst() {
        if (!sweep) return;
        sweep.classList.remove('on');
        void sweep.offsetWidth;
        sweep.classList.add('on');
        window.setTimeout(() => sweep.classList.remove('on'), 700);
    }

    function activateSlide(index, anim) {
        const target = Math.max(0, Math.min(slides.length - 1, index));
        current = target;

        slides.forEach((s, i) => s.classList.toggle('active', i === current));

        if (anim !== false) replaySlideAnim(slides[current]);

        navBtns.forEach(btn => {
            const t = parseInt(btn.dataset.slide, 10);
            btn.classList.toggle('active', t === current);
        });

        dots.forEach((d, i) => d.classList.toggle('on', i === current));

        if (prevBtn) prevBtn.disabled = current === 0;
        if (nextBtn) nextBtn.disabled = current === slides.length - 1;
    }

    function goTo(index, animate) {
        const target = Math.max(0, Math.min(slides.length - 1, index));
        if (target === current || transitioning) return;

        transitioning = true;
        if (animate !== false) burst();
        activateSlide(target, animate === false ? false : true);
        window.setTimeout(() => { transitioning = false; }, 720);
    }

    // Navbar — clique troca a seção com zoom
    navBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const idx = parseInt(btn.dataset.slide, 10);
            if (!isNaN(idx)) goTo(idx);
        });
    });

    // Botões dentro dos slides ("data-goto")
    document.querySelectorAll('[data-goto]').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.dataset.goto, 10);
            if (!isNaN(idx)) goTo(idx);
        });
    });

    // Avança para o próximo slide ou, no fim da jornada, para a página seguinte
    function goNext() {
        if (PAGE_NEXT.hasOwnProperty(current)) { window.location.href = PAGE_NEXT[current]; return; }
        goTo(current + 1);
    }

    // Volta para o slide anterior
    function goPrev() {
        goTo(current - 1);
    }

    if (prevBtn) prevBtn.addEventListener('click', goPrev);
    if (nextBtn) nextBtn.addEventListener('click', goNext);

    // Navegação por teclado (setas)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') { e.preventDefault(); goNext(); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); }
    });

    // Restaura a seção a partir da URL (#historia, #slide-2, ...)
    let startIndex = 0;
    if (window.location.hash) {
        const clean = window.location.hash.replace('#', '');
        if (/^slide-(\d+)$/.test(clean)) {
            startIndex = parseInt(clean.split('-')[1], 10);
        } else if (HASH_MAP.hasOwnProperty(clean)) {
            startIndex = HASH_MAP[clean];
        }
    }
    startIndex = Math.max(0, Math.min(slides.length - 1, startIndex));

    requestAnimationFrame(() => {
        activateSlide(startIndex);
    });
}

// Entrada dos blocos ao rolar (formato antigo / outras páginas)
function initEntrance() {
    const elements = document.querySelectorAll('[data-anim]');
    if (!elements.length) return;

    if (!('IntersectionObserver' in window)) {
        return;
    }

    elements.forEach(el => {
        el.classList.add('will-anim');
        if (el.dataset.delay) {
            el.style.transitionDelay = `${el.dataset.delay}ms`;
        }
    });

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('in');
                observer.unobserve(entry.target);
            });
        },
        { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
    );

    elements.forEach(el => observer.observe(el));
}

// PPE: marcação do dia da semana e impressão
function initPpeTable() {
    const table = document.querySelector('.ppe-table');
    if (!table) return;

    const btnPrint = document.getElementById('btnPrint');
    if (btnPrint) {
        btnPrint.addEventListener('click', () => window.print());
    }

    const headers = table.querySelectorAll('thead tr:first-child th');
    const STORAGE_KEY = 'ppe_selected_day';

    function clearMark() {
        table.querySelectorAll('.day-active').forEach(el => el.classList.remove('day-active'));
    }

    function applyMark(index) {
        clearMark();
        const th = headers[index];
        if (!th) return;
        th.classList.add('day-active');
        table.querySelectorAll(`tbody tr td:nth-child(${index + 1})`).forEach(td => td.classList.add('day-active'));
    }

    headers.forEach((th, i) => {
        if (i === 0) return;
        th.addEventListener('click', () => {
            const wasActive = th.classList.contains('day-active');
            clearMark();
            if (!wasActive) {
                applyMark(i);
                localStorage.setItem(STORAGE_KEY, String(i));
            } else {
                localStorage.removeItem(STORAGE_KEY);
            }
        });
    });

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
        applyMark(parseInt(saved, 10));
    }
}