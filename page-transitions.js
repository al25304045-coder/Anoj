// page-transitions.js — fixed version
(function () {
  const DURATION = 420; // match CSS timings if any

  // small helper to test internal HTML links
  function isInternalHTMLLink(a) {
    if (!a || a.target === '_blank') return false;
    const href = (a.getAttribute('href') || '').trim();
    if (!href || href.startsWith('#')) return false;
    if (/^https?:/i.test(href) && !href.startsWith(location.origin)) return false;
    return href.endsWith('.html') || /^[^:?#]+$/.test(href);
  }

  // ---------- Prefetch next page on hover ----------
  const prefetched = new Set();
  function prefetch(href) {
    if (!href || prefetched.has(href)) return;
    try {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = href;
      link.as = 'document';
      link.fetchPriority = 'low';
      link.onload = () => prefetched.add(href);
      document.head.appendChild(link);
    } catch (err) {
      // not critical
      console.warn('prefetch failed', err);
    }
  }
  document.addEventListener('mouseover', (e) => {
    const a = e.target.closest ? e.target.closest('a') : null;
    if (a && isInternalHTMLLink(a)) prefetch(a.href || a.getAttribute('href'));
  }, { passive: true });

  // ---------- Veil helpers ----------
  const VEIL_ID = 'page-veil';
  function withVeil(fn) {
    const veil = document.getElementById(VEIL_ID);
    if (!veil) return null;
    fn(veil);
    return veil;
  }

  // ---------- Click handler (navigate with transition) ----------
  function handleClick(e) {
    const a = e.target.closest ? e.target.closest('a') : null;
    if (!a || !isInternalHTMLLink(a)) return;
    const href = a.href || a.getAttribute('href');
    if (!href) return;

    e.preventDefault();

    // start leave animation from click point
    withVeil((veil) => {
      veil.style.setProperty('--fx-x', (e.clientX || window.innerWidth/2) + 'px');
      veil.style.setProperty('--fx-y', (e.clientY || window.innerHeight/2) + 'px');
      veil.classList.remove('enter');
      veil.classList.add('exit', 'show');
    });

    // navigate after animation
    setTimeout(() => { window.location.href = href; }, DURATION);
  }

  // ---------- On-load reveal (enter animation) ----------
  function onLoad() {
    withVeil((veil) => {
      // small reveal on page load
      requestAnimationFrame(() => {
        veil.classList.remove('exit');
        veil.classList.add('enter', 'show');
        setTimeout(() => veil.classList.remove('enter', 'show'), DURATION + 80);
      });
    });
  }

  // Wire handlers
  document.addEventListener('DOMContentLoaded', onLoad);
  document.addEventListener('click', handleClick, true);

  // ---------- Lightbox (kept but safe) ----------
  (function(){
    const overlay = document.getElementById('lb');
    if (!overlay) return;

    const imgEl = overlay.querySelector('img');
    const captionEl = overlay.querySelector('.lightbox-caption');
    const prevBtn = overlay.querySelector('.lightbox-prev');
    const nextBtn = overlay.querySelector('.lightbox-next');
    const closeBtn = overlay.querySelector('.lightbox-close');

    const items = Array.from(document.querySelectorAll(
        '.card img, .festival-card img, .wrapper-images .line, [data-lightbox]'
    ));

    function getSrc(el){
      if (!el) return '';
      const bg = getComputedStyle(el).backgroundImage;
      if (el.tagName === 'IMG') return el.currentSrc || el.src;
      if (bg && bg !== 'none') {
        const m = bg.match(/url\\(["']?(.*?)["']?\\)/);
        return m ? m[1] : '';
      }
      return el.getAttribute('data-src') || el.getAttribute('href') || '';
    }
    function getCaption(el){
      return el.getAttribute('alt') || el.getAttribute('data-caption') || '';
    }

    let index = -1;
    function openAt(i){
      if (i < 0 || i >= items.length) return;
      index = i;
      const el = items[index];
      const src = getSrc(el);
      imgEl.src = src;
      captionEl.textContent = getCaption(el);
      overlay.classList.add('active');
    }
    function close(){ overlay.classList.remove('active'); }
    function prev(){ openAt((index - 1 + items.length) % items.length); }
    function next(){ openAt((index + 1) % items.length); }

    document.addEventListener('click', (e)=>{
      const img = e.target.closest('.card img, .festival-card img, .wrapper-images .line, [data-lightbox]');
      if (!img) return;
      const i = items.indexOf(img);
      if (i !== -1) { e.preventDefault(); openAt(i); }
    });

    overlay.addEventListener('click', (e)=>{ if (e.target === overlay) close(); });
    closeBtn?.addEventListener('click', close);
    prevBtn?.addEventListener('click', prev);
    nextBtn?.addEventListener('click', next);

    document.addEventListener('keydown', (e)=>{
      if (!overlay.classList.contains('active')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    });
  })();

  // =========================
  // NZ map interactions (unchanged section from your file)
  // (keeps the original logic but wrapped safely)
  (function () {
    const nzmap = document.getElementById('nzmap');
    const description = document.getElementById('description');
    if (!nzmap || !description) return; // only on Places to go page

    const ni = document.getElementById('ni');
    const si = document.getElementById('si');
    let prevLoc = '';

    function pathTravel(travelPath, pathDist, extra) {
      if (!travelPath) return;
      try {
        travelPath.animate(
          [{ strokeDashoffset: pathDist }, { strokeDashoffset: 0 }],
          { duration: Math.max(600, pathDist * 5), fill: 'forwards' }
        ).onfinish = function () {
          if (extra && si) { pathTravel(si, si.pathLength.baseVal); }
        };
      } catch (err) { /* ignore animation errors */ }
    }

    function fillDesc(locName, desc) {
      const imageURL = "https://s3-us-west-2.amazonaws.com/s.cdpn.io/4273/";
      const fileBase = (locName || '').split('.')[0].toLowerCase();
      const longDesc =
        `<img src="${imageURL + fileBase}.jpg" srcset="${imageURL + fileBase}.jpg 2x" alt>` +
        `<h1>${locName}</h1>` +
        `<p>${desc}</p>`;
      return longDesc;
    }

    nzmap.addEventListener('click', function (e) {
      const link = e.target.closest('a');
      if (!link) return;
      e.preventDefault();

      const desc = link.querySelector('desc')?.textContent || '';
      const locName = link.querySelector('text')?.textContent || '';

      if (!locName || locName === prevLoc) return;

      if (locName === 'Taranaki' && ni) {
        pathTravel(ni, ni.pathLength.baseVal);
      }
      if (locName === 'Fiordland' && si && ni) {
        if (prevLoc === 'Taranaki') {
          pathTravel(si, si.pathLength.baseVal);
        } else {
          pathTravel(ni, ni.pathLength.baseVal, true);
        }
      }

      description.classList.remove('active');
      description.innerHTML = '';
      prevLoc = locName;
      description.insertAdjacentHTML('afterbegin', fillDesc(locName, desc));
      description.classList.add('active');
    });

    function showHide() {
      const locs = nzmap.getElementsByTagName('text');
      const descs = nzmap.getElementsByTagName('desc');
      description.innerHTML = '';
      for (let i = 0; i < locs.length; i++) {
        description.insertAdjacentHTML('beforeend',
          `<div>${fillDesc(locs[i].textContent, descs[i].textContent)}</div>`);
      }
    }

    const screencheck = window.matchMedia('(max-width: 790px)');
    window.addEventListener('load', function () { if (screencheck.matches) showHide(); });
  })();

})();
