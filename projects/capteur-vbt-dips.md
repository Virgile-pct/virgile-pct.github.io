---
title: Capteur VBT pour dips lestés
date: 2026
description: Capteur embarqué (ESP32 + IMU) qui mesure la vitesse de chaque répétition, pour piloter ma préparation au championnat de France de dips.
tags: ESP32, C, Python, Signal
---

# Capteur VBT pour dips lestés

> Velocity-Based Training : mesurer la vitesse d'exécution de chaque répétition
> pour ajuster la charge au jour le jour. Aucun capteur du marché n'est pensé
> pour la calisthénie lestée — alors je le construis. Tout est open source :
> [github.com/Virgile-pct/capteur-dips ↗](https://github.com/Virgile-pct/capteur-dips)

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

## Premier contact avec le réel

Le capteur physique (≈40 € de composants) a mesuré ses premières vraies séries
en août 2026 — et le réel a donné trois leçons, chacune devenue du code :

- Mon exemplaire de MPU6050 cachait un **décalage d'usine de +1,25 m/s² sur
  l'axe Z**. Constant, donc invisible... jusqu'à ce que le boîtier tourne
  pendant le geste et projette l'erreur sur la verticale — des mètres de fausse
  amplitude. Réponse : une **calibration 6 faces** par exemplaire, comme en
  sortie d'usine des appareils pros.
- Détecter l'immobilité au **niveau** du gyroscope casse dès que son biais
  dérive en température : seule la **variance** est un critère honnête.
- Les verrouillages d'une série explosive ne durent que 0,2 s : les zéros de
  vitesse sont devenus des **ancres ponctuelles**, acceptées seulement si leur
  voisinage contient du mouvement franc — réglées par recherche sur grille
  contre trois jeux de données (simulation, série contrôlée, série explosive).

Résultat : dix dips mesurés à ±2 cm d'amplitude près, et un premier **profil
charge-vitesse à R² = 0,995** sur quatre paliers de lest — le niveau de
propreté d'un transducteur commercial, pour 40 €.

## Suite

Portage de l'algorithme en C++ sur l'ESP32 avec retour temps réel (BLE +
vibreur au seuil de perte de vitesse), tableau de bord de progression sur mon
VPS, puis version force avec cellule de charge dans la chaîne — compatible BLE
avec le protocole Tindeq Progressor pour s'intégrer à l'écosystème d'apps
existant.
