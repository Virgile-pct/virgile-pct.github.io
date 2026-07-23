---
title: DOTKIT — quantized motion
date: 2026
description: Micro-bibliothèque UX née d'une étude de Nothing, des portfolios primés et des libs GitHub. Treize modules, zéro dépendance, mouvement cranté.
tags: JS vanilla, UX, Open source, Design system
---

# DOTKIT

> Une micro-bibliothèque UX de treize modules, zéro dépendance, avec un parti
> pris : le **mouvement quantifié**. Elle anime ce site — et vous pouvez
> l'essayer module par module dans la [démo interactive ↗](lab/dotkit/demo.html).

## D'où elle vient

Avant d'écrire une ligne, une étude en trois volets menée avec mes agents :
le site de **Nothing** (rôles typographiques stricts, naming technique
`phone ( 3 )`, identité concentrée dans peu d'éléments), les mécaniques des
**portfolios primés** et de Codrops (boutons magnétiques, traînées de curseur,
décodage de texte), et les bibliothèques les mieux notées de **GitHub** —
AOS pour son API déclarative en data-attributes, GSAP, Lenis et vanilla-tilt
pour le catalogue d'effets.

## Le parti pris

Toutes ces bibliothèques visent la fluidité. DOTKIT prend le contre-pied :
chaque valeur de mouvement est **arrondie à un cran** — l'aimantation saute
par pas de 4 px, l'inclinaison par paliers de 1,5°, la traînée de points
s'aligne sur une grille de 12 px, les transitions sont en `steps()`.
L'effet est emprunté, la sensation est signée.

## Les treize modules

Révélation au scroll (trois variantes, cascade), texte lettre par lettre,
décodage dot-matrix, compteur odomètre, ticker infini, bouton magnétique,
inclinaison mécanique, curseur-viseur avec label, traînée de points,
parallaxe bornée, trame de points interactive, barre de lecture, horloge.
Le tout en ~13 Ko de JavaScript lisible, API déclarative :

```html
<div data-dk="reveal tilt" data-dk-stagger="90">…</div>
```

## Les garde-fous

`prefers-reduced-motion` impose les états finaux sans mouvement, le tactile
désactive tous les effets souris, et sans JavaScript le contenu reste
entièrement visible. Un seul IntersectionObserver mutualisé, des canvas qui
ne calculent que visibles. La règle : l'effet est un bonus, jamais un péage.

[Essayer la démo ↗](lab/dotkit/demo.html) ·
[Lire le code ↗](https://github.com/Virgile-pct/virgile-pct.github.io/tree/main/lab/dotkit)
