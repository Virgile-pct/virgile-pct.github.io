---
title: Capteur VBT pour dips lestés
date: 2026
description: Capteur embarqué (ESP32 + IMU) qui mesure la vitesse de chaque répétition, pour piloter ma préparation au championnat de France de dips.
tags: ESP32, C, Python, Signal
---

# Capteur VBT pour dips lestés

> Velocity-Based Training : mesurer la vitesse d'exécution de chaque répétition
> pour ajuster la charge au jour le jour. Aucun capteur du marché n'est pensé
> pour la calisthénie lestée — alors je le construis.

## Pourquoi

Je prépare le championnat de France amateur de dips lestés (catégorie -66 kg).
Le VBT est la méthode de référence en préparation de force : la vitesse de la
barre dit la vérité sur la fatigue du jour. Mais les capteurs existants visent
la barre de squat et coûtent 300 à 2 000 €, et côté open source, plus rien
n'est maintenu. Le créneau est vide.

## Architecture

- Un boîtier sur la ceinture lestée : **ESP32 + IMU MPU6050**, échantillonnage à 100 Hz.
- Firmware **C** : lecture des registres du capteur en direct (pas de bibliothèque toute faite), log CSV horodaté.
- Traitement **Python** : détection d'immobilité, calibration, suivi de la gravité par filtre complémentaire, intégration de l'accélération, découpage automatique des répétitions.

## Le vrai défi : la dérive

Intégrer une accélération pour obtenir une vitesse, ça dérive en quelques
secondes — c'est le problème classique des IMU. Réponse : **ZUPT**
(zero-velocity update) aux points morts du mouvement, plus une correction de
dérive linéaire à chaque répétition. Et un détail qui change tout : borner les
phases de mouvement à 2,5 % du pic de vitesse plutôt qu'au zéro strict, sinon
la vitesse moyenne est diluée d'environ 25 %.

## Validation avant d'acheter quoi que ce soit

J'ai d'abord écrit un générateur de répétitions synthétiques pour tester
l'algorithme sur des données dont je connais la vérité : erreur d'environ 2 %
sur la vitesse moyenne, moins de 1 % sur la vitesse pic et l'amplitude. La
littérature scientifique valide l'approche IMU (r² ≈ 0,96–0,98 face à un
transducteur linéaire de référence).

## Suite

Prototype matériel (une vingtaine d'euros de composants), capture de vraies
séances, puis version force avec cellule de charge — compatible BLE avec le
protocole Tindeq Progressor pour s'intégrer à l'écosystème d'apps existant.
