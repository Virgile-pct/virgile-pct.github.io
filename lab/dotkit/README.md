# DOTKIT (copie embarquée)

> **Source canonique : [github.com/Virgile-pct/dotkit](https://github.com/Virgile-pct/dotkit)** —
> ce dossier est la copie « vendored » que le portfolio charge. Pour toute
> évolution, modifier le repo dotkit puis resynchroniser cette copie.

Micro-bibliothèque UX brutaliste, zéro dépendance. **Démo : [virgile-pct.github.io/lab/dotkit/demo.html](https://virgile-pct.github.io/lab/dotkit/demo.html)**

Née d'une étude de trois sources : le langage visuel de **Nothing** (rôles
typographiques stricts, naming technique, identité concentrée), les mécaniques
cultes des portfolios primés et de **Codrops** (magnetic buttons, traînées de
curseur, scramble), et les patterns d'API des bibliothèques les mieux notées
de GitHub (**AOS** pour le déclaratif data-attributes, GSAP/Lenis/vanilla-tilt
pour le catalogue d'effets).

## Le parti pris : quantized motion

Toutes les bibliothèques du marché visent la fluidité. DOTKIT prend le
contre-pied : **chaque valeur de mouvement est arrondie à un cran**
(`Math.round(v/pas)*pas`). L'aimantation saute par crans de 4 px, le tilt par
paliers de 1,5°, la traînée de points s'aligne sur une grille de 12 px, les
transitions CSS sont en `steps()`. Le mouvement est mécanique, jamais soyeux.

## Installation

```html
<link rel="stylesheet" href="dotkit.css">
<script src="dotkit.js" data-dk-cursor data-dk-trail></script>
```

Auto-init au chargement. `data-dk-cursor` et `data-dk-trail` activent les
modules globaux. Init manuelle : `<script src="dotkit.js" data-dk-manual>`
puis `DotKit.init({cursor: true, trail: true})`.

## Modules

| Module | Usage | Options |
|---|---|---|
| reveal | `data-dk="reveal"` | `data-dk-variant="rise\|fade\|wipe"`, `data-dk-delay`, `data-dk-stagger` (cascade des enfants) |
| split | `data-dk="split"` | — (lettre par lettre, aria-label auto) |
| scramble | `data-dk="scramble"` | `data-dk-trigger="visible\|hover"` |
| counter | `data-dk="counter"` | `data-dk-to`, `data-dk-duration` |
| marquee | `data-dk="marquee"` | `data-dk-speed` (px/s), `data-dk-reverse` |
| magnetic | `data-dk="magnetic"` | `data-dk-strength` (px, défaut 14) |
| tilt | `data-dk="tilt"` | `data-dk-max` (degrés, défaut 6) |
| parallax | `data-dk="parallax"` | `data-dk-speed` (défaut 0.2, borné ±60 px) |
| grid | `data-dk="grid"` | `data-dk-step` (pas de la trame, défaut 22) |
| progress | `data-dk="progress"` | — (barre de lecture, largeur en %) |
| clock | `data-dk="clock"` | `data-dk-zone="local\|utc"` |
| cursor | script `data-dk-cursor` | `data-dk-cursor-label="MOT"` sur un élément |
| trail | script `data-dk-trail` | — |

Plusieurs modules peuvent se combiner : `data-dk="reveal tilt"`.

## API

```js
DotKit.init(opts)      // {cursor, trail} — auto-appelée sauf data-dk-manual
DotKit.scan(root)      // initialise le contenu injecté dynamiquement
DotKit.cursor()        // active le curseur-viseur
DotKit.trail()         // active la traînée de points
DotKit.destroy()       // retire listeners globaux, canvas, timers
DotKit.quantize(v, s)  // l'arrondi au cran, exposé
```

## Garde-fous (non négociables)

- **`prefers-reduced-motion`** : états finaux immédiats, aucun mouvement décoratif.
- **Pointeur tactile** : cursor, trail, magnetic, tilt et grid interactif désactivés.
- **Sans JavaScript** : le contenu reste entièrement visible (les états cachés n'existent que sous `html.dk-js`).
- Un seul `IntersectionObserver` mutualisé ; canvas animés uniquement quand visibles ; ~30 fps suffisent.

## Poids

~19 Ko de JS + ~4 Ko de CSS, non minifiés, non compressés, commentaires
inclus. Aucune dépendance.
