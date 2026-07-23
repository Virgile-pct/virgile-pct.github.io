---
title: Predict Bot — forecasting calibré
date: 2026
description: Un agent IA qui prédit des événements réels et se fait noter publiquement. Plus précis que la foule sur ses 17 premières prédictions résolues.
tags: Python, IA, API, Probabilités
---

# Predict Bot

> Un agent autonome qui estime la probabilité d'événements réels — géopolitique,
> crypto, tech — et journalise chaque prédiction **avant** la résolution, sur
> Manifold Markets (marché de prédiction en monnaie virtuelle).

## Le principe

Prédire, c'est facile après coup. Le bot fait l'inverse du commentateur : pour
chaque question, il fait ses recherches, produit une probabilité chiffrée, la
publie avant de connaître le résultat — puis se fait noter au **Brier score**,
la métrique de référence du forecasting. Battre le Brier du marché signifie
que ses probabilités contiennent de l'information que la foule n'a pas.

## Résultats — 17 premières prédictions résolues

- **82 %** de bonnes directions (14/17).
- Brier score **0,090** contre 0,117 pour le marché : plus précis que la foule.
- Calibration propre : quand il annonce 0–20 % de chances, l'événement ne s'est produit dans aucun des 7 cas ; quand il annonce 80–100 %, il s'est produit à chaque fois.
- Track record public et vérifiable de façon indépendante : [manifold.markets/Virgile](https://manifold.markets/Virgile)

## Sous le capot

Python, API Manifold, recherche automatisée par LLM, publication automatique
du track record. Tourne sur mon VPS Linux depuis mai 2026.

## Pourquoi ce projet

C'est mon terrain d'entraînement au raisonnement probabiliste : calibration,
scoring, humilité statistique — 17 résolutions, c'est un début de signal, pas
une preuve définitive, et le bot continue d'accumuler l'échantillon.
