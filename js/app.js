/* App du portfolio : boot séquencé, chargement des projets (manifest + .md),
   reveals au scroll, curseur custom, portrait génératif interactif, modal.
   Zéro dépendance. Chaque module est isolé : si l'un casse, les autres vivent. */

(function () {
  "use strict";

  /* Progressive enhancement : les styles d'animation ne s'appliquent
     que sous html.js — sans JS, tout le contenu est visible et statique. */
  document.documentElement.classList.remove("no-js");
  document.documentElement.classList.add("js");

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;

  function safe(name, fn) {
    try { fn(); } catch (err) {
      if (window.console) console.warn("[portfolio] module « " + name + " » : ", err);
    }
  }

  /* ---- Horloge du hero ---- */
  safe("horloge", function () {
    const clock = document.querySelector("[data-clock]");
    if (!clock) return;
    function tick() {
      clock.textContent = new Date().toLocaleTimeString("fr-FR", { hour12: false });
    }
    tick();
    setInterval(tick, 1000);
  });

  safe("année", function () {
    const el = document.querySelector("[data-year]");
    if (el) el.textContent = new Date().getFullYear();
  });

  /* ---- Séquence de boot : la ligne meta tape son texte, les titres
     se matérialisent depuis des glyphes de points. ---- */
  safe("boot", function () {
    const bootLine = document.querySelector("[data-boot-line]");
    if (bootLine && !reduceMotion) {
      const finalText = bootLine.textContent;
      const steps = ["[ BOOT ]", "[ BOOT ] ●", "[ BOOT ] ● ●", "[ OK ]", finalText];
      bootLine.textContent = "";
      steps.forEach(function (txt, i) {
        setTimeout(function () { bootLine.textContent = txt; }, 140 * i + 80);
      });
    }

    const GLYPHS = "·:●○/\\_";
    document.querySelectorAll("[data-scramble]").forEach(function (el, lineIndex) {
      if (reduceMotion) return;
      const target = el.textContent;
      const frames = 14;
      let frame = 0;
      const start = 220 + lineIndex * 120;
      setTimeout(function () {
        const timer = setInterval(function () {
          frame++;
          /* De gauche à droite, les lettres se fixent ; le reste bruite. */
          const fixed = Math.floor((frame / frames) * target.length);
          let out = "";
          for (let i = 0; i < target.length; i++) {
            out += i < fixed
              ? target[i]
              : GLYPHS[(Math.random() * GLYPHS.length) | 0];
          }
          el.textContent = out;
          if (frame >= frames) {
            el.textContent = target;
            clearInterval(timer);
          }
        }, 46);
      }, start);
    });
  });

  /* ---- Burger mobile ---- */
  safe("burger", function () {
    const burger = document.querySelector("[data-burger]");
    const navLinks = document.querySelector(".nav__links");
    if (!burger || !navLinks) return;
    burger.addEventListener("click", function () {
      navLinks.classList.toggle("is-open");
    });
    navLinks.addEventListener("click", function () {
      navLinks.classList.remove("is-open");
    });
  });

  /* ---- Barre de progression de lecture ---- */
  safe("progress", function () {
    const bar = document.querySelector("[data-scroll-progress]");
    if (!bar) return;
    let raf = null;
    function update() {
      raf = null;
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      bar.style.width = max > 0 ? (100 * doc.scrollTop / max).toFixed(1) + "%" : "0";
    }
    window.addEventListener("scroll", function () {
      if (!raf) raf = requestAnimationFrame(update);
    }, { passive: true });
    update();
  });

  /* ---- Révélation au scroll (une seule fois par élément) ---- */
  const observeReveal = (function () {
    if (!("IntersectionObserver" in window)) {
      return function (el) { el.classList.add("is-in"); };
    }
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    return function (el) { io.observe(el); };
  })();

  safe("reveals", function () {
    document.querySelectorAll(".reveal").forEach(observeReveal);
  });

  /* ---- Curseur custom : un point, qui devient viseur sur l'interactif.
     Pointeur fin uniquement, jamais en reduced-motion. ---- */
  safe("curseur", function () {
    const cursor = document.querySelector("[data-cursor]");
    if (!cursor || !finePointer || reduceMotion) return;
    document.documentElement.classList.add("has-cursor");

    let x = -100, y = -100, cx = -100, cy = -100, raf = null;
    function render() {
      /* Traîne souple : le point glisse derrière le pointeur. */
      cx += (x - cx) * 0.16;
      cy += (y - cy) * 0.16;
      cursor.style.transform = "translate3d(" + cx + "px," + cy + "px,0)";
      raf = (Math.abs(x - cx) + Math.abs(y - cy) > 0.2) ? requestAnimationFrame(render) : null;
    }
    window.addEventListener("mousemove", function (e) {
      x = e.clientX; y = e.clientY;
      if (!raf) raf = requestAnimationFrame(render);
    }, { passive: true });

    const LOCK = "a, button, [data-cursor-hover], input, textarea, select";
    document.addEventListener("mouseover", function (e) {
      if (e.target.closest(LOCK)) cursor.classList.add("is-locked");
    });
    document.addEventListener("mouseout", function (e) {
      if (e.target.closest(LOCK)) cursor.classList.remove("is-locked");
    });
    document.addEventListener("mousedown", function () { cursor.classList.add("is-down"); });
    document.addEventListener("mouseup", function () { cursor.classList.remove("is-down"); });
    document.addEventListener("mouseleave", function () {
      cursor.style.opacity = "0";
    });
    document.addEventListener("mouseenter", function () {
      cursor.style.opacity = "1";
    });
  });

  /* ---- Aimantation fluide : l'élément suit doucement le pointeur,
     et revient en place avec l'élan de sa transition CSS. ---- */
  safe("magnetic", function () {
    if (!finePointer || reduceMotion) return;
    document.querySelectorAll("[data-magnetic]").forEach(function (el) {
      const strength = parseFloat(el.getAttribute("data-magnetic")) || 14;
      el.style.transition = "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)";
      el.addEventListener("mousemove", function (e) {
        const r = el.getBoundingClientRect();
        if (!r.width || !r.height) return;
        const dx = (e.clientX - r.left - r.width / 2) / (r.width / 2);
        const dy = (e.clientY - r.top - r.height / 2) / (r.height / 2);
        el.style.transition = "transform 0.12s ease-out";
        el.style.transform = "translate(" +
          (Math.max(-1, Math.min(1, dx)) * strength).toFixed(1) + "px," +
          (Math.max(-1, Math.min(1, dy)) * strength).toFixed(1) + "px)";
      });
      el.addEventListener("mouseleave", function () {
        el.style.transition = "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)";
        el.style.transform = "";
      });
    });
  });

  /* ---- Traînée de points : des bulles naissent sous le pointeur puis
     s'estompent en rétrécissant. Fluide, jamais figé. ---- */
  safe("trail", function () {
    if (!finePointer || reduceMotion) return;
    const canvas = document.createElement("canvas");
    canvas.style.cssText = "position:fixed;inset:0;z-index:9999;pointer-events:none";
    canvas.setAttribute("aria-hidden", "true");
    document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    let dots = [], raf = null, lastX = -1e4, lastY = -1e4;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    function loop(now) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      dots = dots.filter(function (d) { return now - d.born < 550; });
      dots.forEach(function (d) {
        const life = 1 - (now - d.born) / 550;      /* 1 → 0 */
        const eased = life * life;                   /* extinction douce */
        ctx.globalAlpha = eased;
        ctx.fillStyle = d.violet ? "#7b5cff" : "rgba(244,242,239,0.75)";
        ctx.beginPath();
        ctx.arc(d.x, d.y, 4.5 * eased + 0.4, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      raf = dots.length ? requestAnimationFrame(loop) : null;
    }
    document.addEventListener("mousemove", function (e) {
      /* Une bulle tous les ~18 px parcourus, à la position exacte. */
      if (Math.hypot(e.clientX - lastX, e.clientY - lastY) < 18) return;
      lastX = e.clientX; lastY = e.clientY;
      dots.push({
        x: e.clientX,
        y: e.clientY,
        born: performance.now(),
        violet: dots.length % 3 === 0
      });
      if (dots.length > 36) dots.shift();
      if (!raf) raf = requestAnimationFrame(loop);
    }, { passive: true });
  });

  /* ---- Vague de points : l'identité (les points) mise en courbe (le
     mouvement). Deux sinus superposés, amplifiés autour du pointeur. ---- */
  safe("vague", function () {
    const canvas = document.querySelector("[data-dot-wave]");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w = 0, h = 150, mx = null, running = false, raf = null;

    function draw(t) {
      ctx.clearRect(0, 0, w, h);
      for (let x = 12; x < w; x += 22) {
        let amp = 24;
        if (mx !== null) {
          const d = Math.abs(x - mx);
          amp += Math.exp(-(d * d) / (2 * 110 * 110)) * 36;
        }
        const y = h / 2 + Math.sin(x * 0.016 + t * 0.0014) * amp
                        + Math.sin(x * 0.004 - t * 0.0009) * 10;
        const r = 2.6 + Math.sin(x * 0.05 + t * 0.002) * 1.1;
        ctx.beginPath();
        ctx.arc(x, y, Math.max(0.8, r), 0, Math.PI * 2);
        ctx.fillStyle = ((x / 22) | 0) % 5 === 0
          ? "#7b5cff"
          : "rgba(244,242,239,0.5)";
        ctx.fill();
      }
    }

    function loop(t) {
      raf = null;
      if (!running) return;
      if (!w) resize(); /* viewport nul au chargement (onglet en fond) */
      draw(t);
      raf = requestAnimationFrame(loop);
    }

    function resize() {
      w = canvas.width = canvas.offsetWidth || window.innerWidth;
      h = canvas.height = 150;
      draw(0);
    }
    resize();
    window.addEventListener("resize", resize);
    if (reduceMotion) return;

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        running = entries[0].isIntersecting;
        if (running && !raf) raf = requestAnimationFrame(loop);
      }, { threshold: 0.05 }).observe(canvas);
    } else {
      running = true;
      raf = requestAnimationFrame(loop);
    }

    canvas.parentElement.addEventListener("mousemove", function (e) {
      mx = e.clientX - canvas.getBoundingClientRect().left;
    });
    canvas.parentElement.addEventListener("mouseleave", function () { mx = null; });
  });

  /* ---- Portrait en pointillés : visage génératif abstrait, onde lente +
     répulsion sous la souris. ---- */
  safe("portrait", function () {
    const canvas = document.querySelector("[data-dot-portrait]");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const label = document.querySelector("[data-portrait-label]");
    const size = 640;
    let dots = null;   /* [[x, y, rayon, violet], …] à l'échelle 640 */
    let mouseX = null, mouseY = null;
    let running = false, raf = null, last = 0;

    function generative() {
      const out = [];
      const step = 32;
      for (let gy = step / 2; gy < size; gy += step) {
        for (let gx = step / 2; gx < size; gx += step) {
          const cx = gx - size / 2;
          const cy = gy - size / 2;
          const d = Math.sqrt(cx * cx + cy * cy) / (size / 2);
          if (d > 1) continue;
          const r = Math.max(2, 12 * (1 - d) + Math.sin(gx * 0.04) * Math.cos(gy * 0.04) * 6);
          out.push([gx, gy, r, d < 0.45 ? 1 : 0]);
        }
      }
      return out;
    }

    function draw(t) {
      ctx.clearRect(0, 0, size, size);
      if (!dots) return;
      for (let i = 0; i < dots.length; i++) {
        const p = dots[i];
        let r = p[2];
        let ox = 0, oy = 0;

        /* Onde de respiration, très lente, qui traverse le visage. */
        r += Math.sin(t / 900 + (p[0] + p[1]) / 130) * 0.5;

        /* Répulsion autour du pointeur : les points s'écartent. */
        if (mouseX !== null) {
          const dx = p[0] - mouseX;
          const dy = p[1] - mouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140 && dist > 0.01) {
            const force = (1 - dist / 140) * 20;
            ox = (dx / dist) * force;
            oy = (dy / dist) * force;
            r += (1 - dist / 140) * 3;
          }
        }

        ctx.beginPath();
        ctx.arc(p[0] + ox, p[1] + oy, Math.max(0.4, Math.abs(r)), 0, Math.PI * 2);
        ctx.fillStyle = p[3] ? "#7b5cff" : "rgba(244,242,239,0.85)";
        ctx.fill();
      }
    }

    function loop(t) {
      raf = null;
      if (!running) return;
      /* Plein régime : 60 fps pour un mouvement soyeux. */
      if (t - last > 15) { last = t; draw(t); }
      raf = requestAnimationFrame(loop);
    }

    dots = generative();
    draw(0);

    if (reduceMotion) return;

    /* Anime seulement quand le portrait est à l'écran. */
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        running = entries[0].isIntersecting;
        if (running && !raf) raf = requestAnimationFrame(loop);
      }, { threshold: 0.1 }).observe(canvas);
    } else {
      running = true;
      raf = requestAnimationFrame(loop);
    }

    canvas.parentElement.addEventListener("mousemove", function (e) {
      const rect = canvas.getBoundingClientRect();
      mouseX = (e.clientX - rect.left) * (size / rect.width);
      mouseY = (e.clientY - rect.top) * (size / rect.height);
      if (label) label.textContent = "[ PORTRAIT.RAW — TRACKING ]";
    });
    canvas.parentElement.addEventListener("mouseleave", function () {
      mouseX = null; mouseY = null;
      if (label) label.textContent = "[ PORTRAIT.RAW — IDLE ]";
    });
  });

  /* ---- Modal : ouverture/fermeture + gestion du focus (clavier). ---- */
  const modalApi = (function () {
    const modal = document.querySelector("[data-modal]");
    const modalBody = document.querySelector("[data-modal-body]");
    const modalKicker = document.querySelector("[data-modal-kicker]");
    const closeBtn = modal ? modal.querySelector(".modal__close") : null;
    let lastTrigger = null;

    function open(kicker, html, trigger) {
      if (!modal) return;
      lastTrigger = trigger || null;
      modalKicker.textContent = kicker;
      modalBody.innerHTML = html;
      modal.hidden = false;
      document.body.style.overflow = "hidden";
      modalBody.scrollTop = 0;
      if (closeBtn) closeBtn.focus();
    }
    function close() {
      if (!modal || modal.hidden) return;
      modal.hidden = true;
      document.body.style.overflow = "";
      if (lastTrigger) lastTrigger.focus();
    }
    if (modal) {
      modal.querySelectorAll("[data-modal-close]").forEach(function (el) {
        el.addEventListener("click", close);
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") close();
      });
    }
    return { open: open, close: close };
  })();

  /* ---- Chargement des projets ---- */
  function pad(n) { return String(n + 1).padStart(2, "0"); }

  function makeCard(project, index) {
    const card = document.createElement("button");
    card.className = "project-card reveal";
    card.type = "button";
    card.setAttribute("data-num", pad(index));
    card.style.setProperty("--i", index % 3);

    const tags = (project.meta.tags || [])
      .map(function (t) { return "<span>" + t + "</span>"; })
      .join("");

    card.innerHTML =
      '<div class="project-card__top">' +
        '<span class="project-card__num">' + pad(index) + "</span>" +
        "<span>" + (project.meta.date || "----") + "</span>" +
      "</div>" +
      '<h3 class="project-card__title">' + (project.meta.title || project.slug) + "</h3>" +
      '<p class="project-card__desc">' + (project.meta.description || "") + "</p>" +
      '<div class="project-card__tags">' + tags + "</div>" +
      '<span class="project-card__open">OUVRIR ⌁</span>';

    card.addEventListener("click", function () {
      modalApi.open("PROJET — " + pad(index), MiniMD.render(project.body), card);
    });
    return card;
  }

  function makePlaceholder(index) {
    const card = document.createElement("div");
    card.className = "project-card project-card--placeholder reveal";
    card.style.setProperty("--i", index % 3);
    card.innerHTML =
      '<div class="project-card__top">' +
        '<span class="project-card__num">' + pad(index) + "</span>" +
        "<span>----</span>" +
      "</div>" +
      '<h3 class="project-card__title">SLOT LIBRE</h3>' +
      '<p class="project-card__desc">Un prochain projet viendra remplir cet emplacement.</p>' +
      '<div class="project-card__tags"><span>À VENIR</span></div>';
    return card;
  }

  /* Le compteur de la nav « tick » de 00 jusqu'au vrai total. */
  function tickCounter(el, total) {
    if (!el) return;
    if (reduceMotion) { el.textContent = String(total).padStart(2, "0"); return; }
    let n = 0;
    const timer = setInterval(function () {
      n++;
      el.textContent = String(n).padStart(2, "0");
      if (n >= total) clearInterval(timer);
    }, 120);
  }

  safe("projets", function () {
    const grid = document.querySelector("[data-projects-grid]");
    const emptyMsg = document.querySelector("[data-projects-empty]");
    const countEl = document.querySelector("[data-project-count]");
    if (!grid) return;

    (async function loadProjects() {
      let manifest;
      try {
        const res = await fetch("projects/manifest.json", { cache: "no-store" });
        manifest = await res.json();
      } catch (err) {
        emptyMsg.hidden = false;
        emptyMsg.textContent =
          "[ IMPOSSIBLE DE CHARGER /PROJECTS — SERVEZ LE SITE VIA HTTP (ex: python -m http.server) ]";
        return;
      }

      const slugs = manifest.projects || [];
      const results = await Promise.all(
        slugs.map(async function (slug) {
          try {
            const res = await fetch("projects/" + slug + ".md", { cache: "no-store" });
            if (!res.ok) return null;
            const raw = await res.text();
            const parsed = MiniMD.parseFrontmatter(raw);
            return { slug: slug, meta: parsed.meta, body: parsed.body };
          } catch (err) {
            return null;
          }
        })
      );

      const projects = results.filter(Boolean);
      tickCounter(countEl, projects.length);

      if (!projects.length) {
        emptyMsg.hidden = false;
        return;
      }

      projects.forEach(function (p, i) {
        const card = makeCard(p, i);
        grid.appendChild(card);
        observeReveal(card);
      });

      /* Complète la grille avec des slots vides jusqu'à un multiple de 3 */
      const remainder = projects.length % 3;
      if (remainder !== 0) {
        for (let i = 0; i < 3 - remainder; i++) {
          const ph = makePlaceholder(projects.length + i);
          grid.appendChild(ph);
          observeReveal(ph);
        }
      }
    })();
  });
})();
