/* ===== Theme toggle (moved from inline scripts) ===== */
(function(){
    const btn = document.getElementById('toggle-theme');
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') document.body.classList.add('dark-mode');
    btn?.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('theme',
            document.body.classList.contains('dark-mode') ? 'dark' : 'light'
        );
    });
})();

/* ===== Bloody Night — stars + spirits only (dark mode) ===== */
(function () {
    const DARK = 'dark-mode';
    const inDark = () => document.body.classList.contains(DARK);
    const remove = (sel) => document.querySelector(sel)?.remove();

    // ----- Stars -----
    function ensureStars() {
        if (!inDark() || document.querySelector('.stars-layer')) return;
        const layer = document.createElement('div');
        layer.className = 'stars-layer';
        const COUNT = 140;
        for (let i = 0; i < COUNT; i++) {
            const st = document.createElement('i');
            st.className = 'star';
            const x = Math.random() * 100, y = Math.random() * 100;
            st.style.left = x.toFixed(2) + '%';
            st.style.top = y.toFixed(2) + '%';
            st.style.setProperty('--tw', (3.5 + Math.random() * 4).toFixed(2) + 's');
            st.style.setProperty('--delay', (Math.random() * 6).toFixed(2) + 's');
            if (Math.random() < 1 / 12) st.style.opacity = '.45';
            layer.appendChild(st);
        }
        document.body.appendChild(layer);
    }

    // ----- Spirits -----
    function ensureSpirits() {
        if (!inDark() || document.querySelector('.spirits-layer')) return;
        const layer = document.createElement('div');
        layer.className = 'spirits-layer';
        const COUNT = 8;
        for (let i = 0; i < COUNT; i++) {
            const s = document.createElement('i');
            s.className = 'spirit';
            const x = Math.random() * 100, y = Math.random() * 100;
            s.style.setProperty('--x', x.toFixed(2));
            s.style.setProperty('--y', y.toFixed(2));
            s.style.setProperty('--s', (14 + Math.random() * 12).toFixed(0) + 'px');
            s.style.setProperty('--float', (8 + Math.random() * 10).toFixed(0) + 'vh');
            s.style.setProperty('--t', (12 + Math.random() * 12).toFixed(2) + 's');
            layer.appendChild(s);
        }
        document.body.appendChild(layer);
    }

    // ----- Refresh on theme changes -----
    function refresh() {
        if (inDark()) {
            ensureStars();
            ensureSpirits();
        } else {
            remove('.stars-layer');
            remove('.spirits-layer');
        }
    }

    // run now & on theme changes
    const runSoon = () => setTimeout(refresh, 0);
    document.addEventListener('DOMContentLoaded', refresh);
    if (document.readyState !== 'loading') refresh();
    document.getElementById('toggle-theme')?.addEventListener('click', runSoon);
    new MutationObserver(runSoon).observe(document.body, { attributes: true, attributeFilter: ['class'] });
})();


