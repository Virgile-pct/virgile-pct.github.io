---
title: Capteur VBT pour dips lestés
date: 2026
description: Capteur embarqué (ESP32 + IMU) qui mesure la vitesse de chaque répétition, pour piloter ma préparation au championnat de France de dips.
tags: ESP32, C, Python, Signal
---

# Capteur VBT pour dips lestés

> Velocity-Based Training : mesurer la vitesse d'exécution de chaque répétition
> pour ajuster la charge au jour le jour. Aucun capteur du marché n'est pensé
> pour la calisthénie lestée — alors je le construis. Mesures et résultats :
> [tableau de bord ↗](https://virgile-pct.github.io/capteur-dips/)

## Pourquoi

Je prépare le championnat de France amateur de dips lestés (catégorie -66 kg).
Le VBT est la méthode de référence en préparation de force : la vitesse de la
barre dit la vérité sur la fatigue du jour. Mais les capteurs existants visent
la barre de squat et coûtent 300 à 2 000 €, et les rares projets libres du
domaine sont abandonnés. Le créneau est vide.

## Architecture

- Un boîtier sur la ceinture lestée : **ESP32 + IMU MPU6050**, échantillonnage à 100 Hz.
- Firmware **C** : lecture des registres du capteur en direct (pas de bibliothèque toute faite), log CSV horodaté.
- Traitement **Python** : détection d'immobilité, calibration, suivi de la gravité par filtre complémentaire, intégration de l'accélération, découpage automatique des répétitions.

## Le vrai défi : la dérive

Intégrer une accélération pour obtenir une vitesse, ça dérive en quelques
secondes — c'est le problème classique des IMU. Réponse : **ZUPT**
(zero-velocity update) aux points morts du mouvement, plus une correction de
dérive linéaire à chaque répétition. Et un détail qui change tout : les bornes
d'une phase de mouvement ne se prennent pas au zéro strict de la vitesse, sinon
les plateaux de vitesse quasi nulle sont avalés et la vitesse moyenne se trouve
diluée d'un quart.

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
- Les verrouillages d'une série explosive ne durent que deux dixièmes de
  seconde. Les points d'ancrage de la vitesse ont dû devenir **ponctuels et
  contextuels** plutôt que d'accepter toute immobilité apparente — réglés par
  recherche sur grille contre trois jeux de données (simulation, série
  contrôlée, série explosive).

Résultat : dix dips mesurés à ±2 cm d'amplitude près, et un premier **profil
charge-vitesse à R² = 0,995** sur quatre paliers de lest — le niveau de
propreté d'un transducteur commercial, pour 40 €.

## Où ça en est

L'algorithme tourne désormais **à bord de l'ESP32** : la carte compte ses
répétitions elle-même, plus besoin d'un ordinateur à l'écoute. Le capteur
n'impose plus aucune pause, reconnaît seul l'exercice pratiqué (11 séries de
référence sur 11), écarte les mouvements parasites de la récupération sans
jamais perdre une répétition maximale, et se trompe de 1,8 % sur la vitesse
moyenne face à une vérité terrain. Le 1RM estimé sans maximum est tombé à
**+41 kg contre +40 kg réels**.

Suite : essais sur cinq athlètes de morphologies différentes, retour immédiat
par vibration au seuil de fatigue, circuit imprimé sur mesure — et une piste
plus ambitieuse, aider au jugement de la profondeur en compétition, aujourd'hui
laissé à l'appréciation humaine sur un geste qui dure une demi-seconde.

Le code source n'est plus public : la méthode est le fruit de plusieurs
semaines de mesures et le projet a une suite commerciale envisagée.
