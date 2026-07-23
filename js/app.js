/* App du portfolio : charge projects/manifest.json, récupère chaque .md,
   affiche les cartes et la fiche projet en modal. */

(function () {
  "use strict";

  const grid = document.querySelector("[data-projects-grid]");
  const emptyMsg = document.querySelector("[data-projects-empty]");
  const countEl = document.querySelector("[data-project-count]");
  const modal = document.querySelector("[data-modal]");
  const modalBody = document.querySelector("[data-modal-body]");
  const modalKicker = document.querySelector("[data-modal-kicker]");

  /* ---- Horloge du hero ---- */
  const clock = document.querySelector("[data-clock]");
  function tick() {
    clock.textContent = new Date().toLocaleTimeString("fr-FR", { hour12: false });
  }
  tick();
  setInterval(tick, 1000);

  document.querySelector("[data-year]").textContent = new Date().getFullYear();

  /* ---- Burger mobile ---- */
  const burger = document.querySelector("[data-burger]");
  const navLinks = document.querySelector(".nav__links");
  burger.addEventListener("click", function () {
    navLinks.classList.toggle("is-open");
  });
  navLinks.addEventListener("click", function () {
    navLinks.classList.remove("is-open");
  });

  /* ---- Portrait en pointillés (placeholder génératif) ---- */
  const canvas = document.querySelector("[data-dot-portrait]");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    const size = 320;
    const step = 16;
    ctx.clearRect(0, 0, size, size);
    for (let y = step / 2; y < size; y += step) {
      for (let x = step / 2; x < size; x += step) {
        const cx = x - size / 2;
        const cy = y - size / 2;
        const d = Math.sqrt(cx * cx + cy * cy) / (size / 2);
        if (d > 1) continue;
        const r = Math.max(1, 6 * (1 - d) + Math.sin(x * 0.08) * Math.cos(y * 0.08) * 3);
        ctx.beginPath();
        ctx.arc(x, y, Math.abs(r), 0, Math.PI * 2);
        ctx.fillStyle = d < 0.45 ? "#7b5cff" : "rgba(244,242,239,0.8)";
        ctx.fill();
      }
    }
  }

  /* ---- Modal ---- */
  function openModal(kicker, html) {
    modalKicker.textContent = kicker;
    modalBody.innerHTML = html;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
  }
  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = "";
  }
  modal.querySelectorAll("[data-modal-close]").forEach(function (el) {
    el.addEventListener("click", closeModal);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !modal.hidden) closeModal();
  });

  /* ---- Chargement des projets ---- */
  function pad(n) { return String(n + 1).padStart(2, "0"); }

  function makeCard(project, index) {
    const card = document.createElement("button");
    card.className = "project-card";
    card.type = "button";

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
      openModal("PROJET — " + pad(index), MiniMD.render(project.body));
    });
    return card;
  }

  function makePlaceholder(index) {
    const card = document.createElement("div");
    card.className = "project-card project-card--placeholder";
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

  async function loadProjects() {
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
    countEl.textContent = String(projects.length).padStart(2, "0");

    if (!projects.length) {
      emptyMsg.hidden = false;
      return;
    }

    projects.forEach(function (p, i) { grid.appendChild(makeCard(p, i)); });

    /* Complète la grille avec des slots vides jusqu'à un multiple de 3 */
    const remainder = projects.length % 3;
    if (remainder !== 0) {
      for (let i = 0; i < 3 - remainder; i++) {
        grid.appendChild(makePlaceholder(projects.length + i));
      }
    }
  }

  loadProjects();
})();
