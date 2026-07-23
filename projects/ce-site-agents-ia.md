---
title: Ce site — produit avec des agents IA
date: 2026
description: Le portfolio lui-même est une démo — direction artistique tenue, zéro framework, et une chaîne de production pilotée par agents IA. Code public.
tags: HTML/CSS, JS vanilla, Agents IA, GitHub Pages
---

# Ce site

> La page que vous lisez est un projet du portfolio. Je la produis avec des
> agents IA — et je l'assume : savoir diriger une IA vers un résultat
> d'exigence professionnelle est une compétence, pas un raccourci.

## Le concept

Un instrument qui s'allume. Direction artistique brutaliste — violet, noir,
blanc, trames de points inspirées de Nothing — et une règle tenue partout :
aucun mouvement fluide. Toutes les transitions sont crantées (`steps()`),
mécaniques, comme un appareil de mesure. Séquence de boot au chargement,
télémétrie vivante, curseur-viseur, portrait génératif qui réagit à la souris.

## Les choix techniques

- **Zéro framework, zéro build** : trois fichiers. Le HTML, un CSS, un JS. Pas de dépendance, rien à compiler, rien à maintenir.
- Un **mini-parseur markdown maison** (~150 lignes) : chaque fiche projet est un simple fichier `.md` avec un en-tête, rendu à la volée.
- **Progressive enhancement** : sans JavaScript, tout le contenu reste lisible ; les animations n'existent que si JS est là pour les mériter.
- **Accessibilité** : `prefers-reduced-motion` coupe tout le mouvement, focus clavier visible, gestion du focus dans les fiches, curseur custom désactivé au tactile.
- Le portrait en points ne calcule que lorsqu'il est visible à l'écran, à 30 images/seconde — le reste du temps, il dort.

## La chaîne de production

C'est là que les agents entrent en scène. Le dépôt est conçu pour être
opéré par un agent IA : ajouter un projet = déposer un fichier `.md` et une
ligne dans un manifeste, conventions documentées dans le README. Je décris
ce que je veux, l'agent produit, je tranche — direction artistique,
contenu, ce qui est publié et ce qui ne l'est pas. Push sur `main`,
GitHub Pages déploie. Pas d'étape manuelle.

## Pourquoi c'est dans le portfolio

Parce que le résultat est vérifiable : le code de cette page est public.
Ouvrez-le, lisez-le, jugez sur pièces.

[Voir le code source ↗](https://github.com/Virgile-pct/virgile-pct.github.io)
