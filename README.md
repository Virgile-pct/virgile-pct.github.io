# virgile-pct.github.io

Portfolio de Virgile Pourchet — en ligne sur **https://virgile-pct.github.io**

DA : brutaliste, violet / noir / blanc, pointillés (inspiration Nothing).
Zéro framework, zéro build : HTML + CSS + JS vanilla. Hébergé sur GitHub Pages.

## Lancer en local

Le site charge les projets via `fetch()`, il faut donc le servir en HTTP
(pas d'ouverture directe du fichier) :

```bash
python -m http.server 8000
# → http://localhost:8000
```

## Ajouter un projet (conventions, y compris pour l'agent Claude)

1. Déposer un fichier `projects/<slug>.md` (slug en kebab-case, sans accent).
2. Ajouter le slug dans `projects/manifest.json` (l'ordre du tableau = ordre d'affichage).

Chaque fichier `.md` commence par un frontmatter :

```markdown
---
title: Nom Du Projet
date: 2026
description: Une phrase courte affichée sur la carte.
tags: Python, Web, Automation
---

# Nom Du Projet

Contenu markdown libre : titres, listes, liens, images, code, citations,
tableaux. Rendu dans la fiche projet (modal).
```

Champs du frontmatter : `title` (obligatoire), `date`, `description`, `tags`
(séparés par des virgules, affichés en badges).

Les images vont dans `projects/assets/` et se référencent en relatif :
`![alt](projects/assets/img.png)`.

## Structure

```
├── index.html          # Page unique (hero, projets, à propos, contact)
├── css/style.css       # Toute la DA (variables en tête de fichier)
├── js/markdown.js      # Mini parseur markdown + frontmatter
├── js/app.js           # Chargement du manifest, cartes, modal
├── .nojekyll           # Désactive le build Jekyll de GitHub Pages
├── lab/
│   └── dotkit/         # DOTKIT — micro-bibliothèque UX maison (js, css, démo, README)
└── projects/
    ├── manifest.json   # Liste ordonnée des slugs à afficher
    └── *.md            # Une fiche par projet
```

## Déploiement

Poussé sur `main` → GitHub Pages publie automatiquement (repo user-site).
