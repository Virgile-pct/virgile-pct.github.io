/*! DOTKIT v1.0.1 — micro-bibliothèque UX brutaliste, zéro dépendance.
    Concept : « quantized motion » — tout mouvement est arrondi à un cran,
    jamais fluide. Inspirations : le langage visuel de Nothing (dot-matrix,
    télémétrie mono), les mécaniques cultes de Codrops (magnetic, trail,
    scramble), l'API déclarative d'AOS (data-attributes, auto-init).
    Garde-fous natifs : prefers-reduced-motion → états finaux immédiats ;
    pointeur tactile → aucun effet souris ; sans JS → contenu intact.
    https://github.com/Virgile-pct/dotkit — licence MIT */

(function (global) {
  "use strict";

  const doc = document;
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(pointer: fine)").matches;

  /* La signature DOTKIT : arrondir toute valeur à un cran. */
  function quantize(v, step) { return Math.round(v / step) * step; }
  function clamp(v, min, max) { return Math.min(max, Math.max(min, v)); }
  function attr(el, name, fallback) {
    const v = el.getAttribute("data-dk-" + name);
    return v === null || v === "" ? fallback : v;
  }
  function num(el, name, fallback) {
    const v = parseFloat(attr(el, name, ""));
    return isNaN(v) ? fallback : v;
  }

  const GLYPHS = "·:●○/\\_";
  const cleanups = [];   /* destroy() rejoue tout ça. */
  let inited = false;

  /* ==== OBSERVER MUTUALISÉ ================================================
     Un seul IntersectionObserver pour reveal, split, scramble, counter.
     Chaque module enregistre un callback « à l'entrée à l'écran ». */
  const onEnter = new WeakMap();
  const io = "IntersectionObserver" in global
    ? new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          io.unobserve(e.target);
          const fn = onEnter.get(e.target);
          if (fn) fn(e.target);
        });
      }, { threshold: 0.12 })
    : null;

  function whenVisible(el, fn) {
    if (reduceMotion || !io) { fn(el); return; }
    onEnter.set(el, fn);
    io.observe(el);
  }

  /* ==== 1. REVEAL ========================================================
     <div data-dk="reveal" data-dk-variant="rise|fade|wipe"
          data-dk-delay="120" data-dk-stagger="70">
     data-dk-stagger anime les enfants directs en cascade. */
  function initReveal(el) {
    const variant = attr(el, "variant", "rise");
    const stagger = num(el, "stagger", 0);
    const targets = stagger > 0 ? Array.from(el.children) : [el];
    targets.forEach(function (t, i) {
      t.classList.add("dk-reveal", "dk-reveal--" + variant);
      t.style.setProperty("--dk-delay", (num(el, "delay", 0) + i * stagger) + "ms");
    });
    whenVisible(el, function () {
      targets.forEach(function (t) { t.classList.add("dk-in"); });
    });
  }

  /* ==== 2. SPLIT =========================================================
     <h2 data-dk="split">TITRE</h2> — chaque lettre monte, en cascade crantée.
     Préserve le texte pour lecteurs d'écran via aria-label. */
  function initSplit(el) {
    const text = el.textContent;
    el.setAttribute("aria-label", text);
    el.classList.add("dk-split");
    el.textContent = "";
    Array.from(text).forEach(function (ch, i) {
      const span = doc.createElement("span");
      span.className = "dk-char";
      span.setAttribute("aria-hidden", "true");
      span.style.setProperty("--ci", i);
      span.textContent = ch === " " ? " " : ch;
      el.appendChild(span);
    });
    whenVisible(el, function () { el.classList.add("dk-in"); });
  }

  /* ==== 3. SCRAMBLE ======================================================
     <span data-dk="scramble">TEXTE</span> — décodage dot-matrix, de gauche
     à droite. data-dk-trigger="hover" pour rejouer au survol. */
  function scrambleOnce(el, target) {
    if (el.dkScrambling) return;
    el.dkScrambling = true;
    const frames = clamp(Math.round(target.length * 1.6), 8, 26);
    let frame = 0;
    const timer = setInterval(function () {
      frame++;
      const fixed = Math.floor((frame / frames) * target.length);
      let out = "";
      for (let i = 0; i < target.length; i++) {
        out += i < fixed ? target[i] : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      el.textContent = out;
      if (frame >= frames) {
        el.textContent = target;
        el.dkScrambling = false;
        clearInterval(timer);
      }
    }, 42);
  }
  function initScramble(el) {
    const target = el.textContent;
    el.setAttribute("aria-label", target);
    if (reduceMotion) return;
    if (attr(el, "trigger", "visible") === "hover") {
      el.addEventListener("mouseenter", function () { scrambleOnce(el, target); });
    } else {
      whenVisible(el, function () { scrambleOnce(el, target); });
    }
  }

  /* ==== 4. COUNTER =======================================================
     <span data-dk="counter" data-dk-to="1327" data-dk-duration="900"></span>
     Odomètre cranté : ~24 ticks, chiffres tabulaires conseillés en CSS. */
  function initCounter(el) {
    const to = num(el, "to", parseFloat(el.textContent) || 0);
    const duration = num(el, "duration", 900);
    const decimals = (String(attr(el, "to", "")).split(".")[1] || "").length;
    function set(v) { el.textContent = v.toFixed(decimals); }
    if (reduceMotion) { set(to); return; }
    set(0);
    whenVisible(el, function () {
      const ticks = 24;
      let t = 0;
      const timer = setInterval(function () {
        t++;
        set(to * t / ticks);
        if (t >= ticks) clearInterval(timer);
      }, duration / ticks);
    });
  }

  /* ==== 5. MARQUEE =======================================================
     <div data-dk="marquee" data-dk-speed="60" data-dk-reverse>CONTENU</div>
     Duplique le contenu jusqu'à couvrir 2× la largeur. Pause au survol. */
  function initMarquee(el) {
    const inner = doc.createElement("div");
    inner.className = "dk-marquee__inner";
    inner.setAttribute("aria-hidden", "true");
    const chunk = doc.createElement("span");
    chunk.innerHTML = el.innerHTML;
    el.setAttribute("aria-label", el.textContent.trim());
    el.textContent = "";
    inner.appendChild(chunk);
    el.classList.add("dk-marquee");
    if (attr(el, "reverse", null) !== null) el.classList.add("dk-marquee--reverse");
    el.appendChild(inner);
    if (reduceMotion) return;
    /* Assez de copies pour boucler sans couture. */
    requestAnimationFrame(function () {
      const need = Math.max(2, Math.ceil((el.offsetWidth * 2) / Math.max(1, chunk.offsetWidth)));
      for (let i = 1; i < need; i++) inner.appendChild(chunk.cloneNode(true));
      const speed = num(el, "speed", 60); /* px par seconde */
      inner.style.setProperty("--dk-marquee-duration", (chunk.offsetWidth / speed).toFixed(2) + "s");
      el.classList.add("dk-marquee--on");
    });
  }

  /* ==== 6. MAGNETIC ======================================================
     <a data-dk="magnetic" data-dk-strength="14">LIEN</a>
     L'élément est attiré par le curseur — par crans de 4 px, retour sec. */
  function initMagnetic(el) {
    if (!finePointer || reduceMotion) return;
    const strength = num(el, "strength", 14);
    el.classList.add("dk-magnetic");
    el.addEventListener("mousemove", function (e) {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width / 2) / (r.width / 2);
      const dy = (e.clientY - r.top - r.height / 2) / (r.height / 2);
      const tx = quantize(clamp(dx, -1, 1) * strength, 4);
      const ty = quantize(clamp(dy, -1, 1) * strength, 4);
      el.style.transform = "translate(" + tx + "px," + ty + "px)";
    });
    el.addEventListener("mouseleave", function () {
      el.style.transform = "";
    });
  }

  /* ==== 7. TILT ==========================================================
     <div data-dk="tilt" data-dk-max="6">CARTE</div>
     Rotation 3D par paliers de 1,5° : le « mechanical tilt ». */
  function initTilt(el) {
    if (!finePointer || reduceMotion) return;
    const max = num(el, "max", 6);
    el.classList.add("dk-tilt");
    el.addEventListener("mousemove", function (e) {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - r.left) / r.width - 0.5;
      const dy = (e.clientY - r.top) / r.height - 0.5;
      const rx = quantize(clamp(-dy * 2, -1, 1) * max, 1.5);
      const ry = quantize(clamp(dx * 2, -1, 1) * max, 1.5);
      el.style.transform =
        "perspective(700px) rotateX(" + rx + "deg) rotateY(" + ry + "deg)";
    });
    el.addEventListener("mouseleave", function () {
      el.style.transform = "";
    });
  }

  /* ==== 8. CURSOR ========================================================
     DotKit.cursor() ou <script data-dk-cursor> : point → viseur carré sur
     l'interactif. data-dk-cursor-label="OUVRIR" affiche un mot à côté. */
  function initCursor() {
    if (!finePointer || reduceMotion) return;
    const cur = doc.createElement("div");
    cur.className = "dk-cursor";
    cur.setAttribute("aria-hidden", "true");
    const label = doc.createElement("span");
    label.className = "dk-cursor__label";
    cur.appendChild(label);
    doc.body.appendChild(cur);
    doc.documentElement.classList.add("dk-has-cursor");

    let x = -100, y = -100, cx = -100, cy = -100, raf = null;
    function render() {
      cx += (x - cx) * 0.45;
      cy += (y - cy) * 0.45;
      cur.style.transform = "translate3d(" + cx + "px," + cy + "px,0)";
      raf = (Math.abs(x - cx) + Math.abs(y - cy) > 0.3)
        ? requestAnimationFrame(render) : null;
    }
    function move(e) {
      x = e.clientX; y = e.clientY;
      if (!raf) raf = requestAnimationFrame(render);
    }
    const HOT = "a, button, [data-dk-hot], input, textarea, select, summary";
    function over(e) {
      const hot = e.target.closest(HOT);
      cur.classList.toggle("is-locked", !!hot);
      const withLabel = e.target.closest("[data-dk-cursor-label]");
      label.textContent = withLabel ? withLabel.getAttribute("data-dk-cursor-label") : "";
    }
    doc.addEventListener("mousemove", move, { passive: true });
    doc.addEventListener("mouseover", over);
    cleanups.push(function () {
      doc.removeEventListener("mousemove", move);
      doc.removeEventListener("mouseover", over);
      cur.remove();
      doc.documentElement.classList.remove("dk-has-cursor");
    });
  }

  /* ==== 9. TRAIL =========================================================
     DotKit.trail() : traînée de points derrière le curseur. Chaque point
     naît aligné sur une grille de 12 px puis s'éteint par paliers. */
  function initTrail() {
    if (!finePointer || reduceMotion) return;
    const canvas = doc.createElement("canvas");
    canvas.className = "dk-trail";
    canvas.setAttribute("aria-hidden", "true");
    doc.body.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    let dots = [], raf = null, lastX = -1e4, lastY = -1e4;

    function resize() {
      canvas.width = innerWidth;
      canvas.height = innerHeight;
    }
    resize();
    addEventListener("resize", resize);

    function loop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      dots = dots.filter(function (d) { return d.life > 0; });
      dots.forEach(function (d) {
        d.life -= 1;
        /* Extinction par PALIERS : le rayon saute, ne glisse pas. */
        const r = Math.ceil(d.life / 4);
        ctx.fillStyle = d.violet ? "#7b5cff" : "rgba(244,242,239,0.7)";
        ctx.beginPath();
        ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
        ctx.fill();
      });
      raf = dots.length ? requestAnimationFrame(loop) : null;
    }
    function move(e) {
      /* Un point tous les ~24 px parcourus, posé sur la grille. */
      if (Math.hypot(e.clientX - lastX, e.clientY - lastY) < 24) return;
      lastX = e.clientX; lastY = e.clientY;
      dots.push({
        x: quantize(e.clientX, 12),
        y: quantize(e.clientY, 12),
        life: 16,
        violet: dots.length % 3 === 0
      });
      if (dots.length > 40) dots.shift();
      if (!raf) raf = requestAnimationFrame(loop);
    }
    doc.addEventListener("mousemove", move, { passive: true });
    cleanups.push(function () {
      doc.removeEventListener("mousemove", move);
      removeEventListener("resize", resize);
      canvas.remove();
    });
  }

  /* ==== 10. PARALLAX =====================================================
     <div data-dk="parallax" data-dk-speed="0.2"> — décalage vertical
     quantifié (crans de 8 px), borné à ±60 px. Jamais de scroll-hijacking. */
  const parallaxEls = [];
  function initParallax(el) {
    if (reduceMotion) return;
    parallaxEls.push({ el: el, speed: num(el, "speed", 0.2) });
    if (parallaxEls.length === 1) {
      let raf = null;
      function update() {
        raf = null;
        const vh = innerHeight;
        parallaxEls.forEach(function (p) {
          const r = p.el.getBoundingClientRect();
          if (r.bottom < 0 || r.top > vh) return;
          const centre = r.top + r.height / 2 - vh / 2;
          const ty = clamp(quantize(-centre * p.speed, 8), -60, 60);
          p.el.style.transform = "translateY(" + ty + "px)";
        });
      }
      function onScroll() { if (!raf) raf = requestAnimationFrame(update); }
      addEventListener("scroll", onScroll, { passive: true });
      cleanups.push(function () { removeEventListener("scroll", onScroll); });
      update();
    }
  }

  /* ==== 11. GRID =========================================================
     <div data-dk="grid"> — trame de points en fond du conteneur, les points
     s'écartent sous le curseur. Statique si tactile ou reduced-motion. */
  function initGrid(el) {
    const canvas = doc.createElement("canvas");
    canvas.className = "dk-grid";
    canvas.setAttribute("aria-hidden", "true");
    el.classList.add("dk-grid-host");
    el.insertBefore(canvas, el.firstChild);
    const ctx = canvas.getContext("2d");
    const step = num(el, "step", 22);
    let mx = null, my = null, running = false, raf = null, last = 0;

    function resize() {
      canvas.width = el.clientWidth;
      canvas.height = el.clientHeight;
      draw();
    }
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let y = step / 2; y < canvas.height; y += step) {
        for (let x = step / 2; x < canvas.width; x += step) {
          let ox = 0, oy = 0, r = 1.1;
          if (mx !== null) {
            const dx = x - mx, dy = y - my;
            const dist = Math.hypot(dx, dy);
            if (dist < 90 && dist > 0.01) {
              const f = (1 - dist / 90) * 12;
              ox = (dx / dist) * f;
              oy = (dy / dist) * f;
              r = 1.1 + (1 - dist / 90) * 1.6;
            }
          }
          ctx.fillStyle = "rgba(244,242,239,0.22)";
          ctx.beginPath();
          ctx.arc(x + ox, y + oy, r / 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    function loop(t) {
      raf = null;
      if (!running) return;
      if (t - last > 33) { last = t; draw(); }
      raf = requestAnimationFrame(loop);
    }
    resize();
    addEventListener("resize", resize);
    cleanups.push(function () { removeEventListener("resize", resize); });
    if (!finePointer || reduceMotion) return;
    el.addEventListener("mousemove", function (e) {
      const r = canvas.getBoundingClientRect();
      mx = e.clientX - r.left;
      my = e.clientY - r.top;
      if (!running) { running = true; if (!raf) raf = requestAnimationFrame(loop); }
    });
    el.addEventListener("mouseleave", function () {
      mx = null; my = null; running = false; draw();
    });
  }

  /* ==== 12. PROGRESS =====================================================
     <div data-dk="progress"></div> — se remplit avec la lecture (width %). */
  function initProgress(el) {
    el.classList.add("dk-progress");
    let raf = null;
    function update() {
      raf = null;
      const d = doc.documentElement;
      const max = d.scrollHeight - d.clientHeight;
      el.style.width = max > 0 ? (100 * d.scrollTop / max).toFixed(1) + "%" : "0";
    }
    function onScroll() { if (!raf) raf = requestAnimationFrame(update); }
    addEventListener("scroll", onScroll, { passive: true });
    cleanups.push(function () { removeEventListener("scroll", onScroll); });
    update();
  }

  /* ==== 13. CLOCK ========================================================
     <span data-dk="clock"></span> — hh:mm:ss locale ; data-dk-zone="utc". */
  function initClock(el) {
    const utc = attr(el, "zone", "local") === "utc";
    function tick() {
      const d = new Date();
      el.textContent = utc
        ? d.toISOString().slice(11, 19) + " UTC"
        : d.toLocaleTimeString("fr-FR", { hour12: false });
    }
    tick();
    const timer = setInterval(tick, 1000);
    cleanups.push(function () { clearInterval(timer); });
  }

  /* ==== REGISTRE + INIT =================================================== */
  const MODULES = {
    reveal: initReveal,
    split: initSplit,
    scramble: initScramble,
    counter: initCounter,
    marquee: initMarquee,
    magnetic: initMagnetic,
    tilt: initTilt,
    parallax: initParallax,
    grid: initGrid,
    progress: initProgress,
    clock: initClock
  };

  /* Scanne un sous-arbre : utile pour le contenu injecté dynamiquement. */
  function scan(root) {
    (root || doc).querySelectorAll("[data-dk]:not([data-dk-ready])").forEach(function (el) {
      el.setAttribute("data-dk-ready", "");
      el.getAttribute("data-dk").split(/\s+/).forEach(function (name) {
        const fn = MODULES[name];
        if (fn) {
          try { fn(el); } catch (err) {
            if (global.console) console.warn("[dotkit] " + name + " :", err);
          }
        }
      });
    });
  }

  function init(opts) {
    opts = opts || {};
    if (inited) return api;
    inited = true;
    doc.documentElement.classList.add("dk-js");
    scan(doc);
    if (opts.cursor) initCursor();
    if (opts.trail) initTrail();
    return api;
  }

  function destroy() {
    cleanups.splice(0).forEach(function (fn) { fn(); });
    inited = false;
  }

  const api = {
    version: "1.0.1",
    init: init,
    scan: scan,
    cursor: initCursor,
    trail: initTrail,
    destroy: destroy,
    quantize: quantize
  };
  global.DotKit = api;

  /* Auto-init (désactivable : <script src="dotkit.js" data-dk-manual>) */
  const me = doc.currentScript;
  if (!me || me.getAttribute("data-dk-manual") === null) {
    if (doc.readyState === "loading") {
      doc.addEventListener("DOMContentLoaded", function () {
        init({
          cursor: me && me.getAttribute("data-dk-cursor") !== null,
          trail: me && me.getAttribute("data-dk-trail") !== null
        });
      });
    } else {
      init({
        cursor: me && me.getAttribute("data-dk-cursor") !== null,
        trail: me && me.getAttribute("data-dk-trail") !== null
      });
    }
  }
})(window);
