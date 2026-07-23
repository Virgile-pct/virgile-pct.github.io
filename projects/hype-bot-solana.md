---
title: Hype Bot — trading algorithmique on-chain
date: 2026
description: Bot autonome qui détecte, note et trade les nouveaux tokens Solana en temps réel. En production sur VPS Linux, avec sa propre supervision.
tags: Python, Solana, WebSocket, Linux
---

# Hype Bot

> Bot de trading autonome sur Solana : détection des nouveaux tokens en temps réel,
> scoring, exécution, supervision. Il tourne sans moi.

## Le problème

Sur Solana, des tokens sont créés en continu, à la chaîne. Les rares fenêtres
intéressantes durent quelques minutes. À la main, aucune chance : il faut voir
le flux à la seconde, décider en millisecondes, et surtout refuser 99 % de ce
qui passe.

## Architecture

- Flux **WebSocket temps réel** : créations de tokens et flux d'achats vus à la seconde, sans polling.
- **Scoring « hype »** : chaque token est noté (momentum, acheteurs uniques, dynamique du carnet) et le bot n'entre que sur une minorité stricte.
- **Exécution** : priority fees dynamiques, contrôle du slippage — et le refus d'un slippage trop haut est un signal, pas juste une protection.
- Trois instances isolées sous **systemd** : le témoin en paper trading, l'instance live, et un détecteur « shadow » en observation pure pour collecter de la donnée.

## La partie dont je suis le plus fier : la méthode

- **Supervision autonome** : timers systemd, health check toutes les 15 minutes, rapports par mail, kill switch d'urgence. Le bot me prévient, pas l'inverse.
- **Les données décident** : chaque idée d'amélioration passe par une analyse avant d'être codée. Deux stratégies d'entrée « évidentes » ont été testées sur ~27 000 tokens — les données ont montré une espérance négative, les deux pistes ont été refermées. Ne pas coder une mauvaise idée, c'est aussi du travail.
- **Réconciliation on-chain** : le P&L est recalculé depuis les transactions réellement passées sur la blockchain, jamais depuis ce que le bot « croit » avoir fait.

## État

En production réelle depuis juillet 2026, après des mois de paper trading et
plusieurs campagnes de backtests. Le témoin continue de tourner en parallèle
pour comparer le réel au simulé.

*(Code privé — il gère de vraies positions.)*
