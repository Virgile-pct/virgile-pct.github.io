# -*- coding: utf-8 -*-
"""Convertit une photo en portrait dot-matrix pour le canvas du portfolio.
La PHOTO N'EST JAMAIS PUBLIÉE : seul le nuage de points (assets/portrait.json)
part dans le repo. Usage :
    python assets/generate_portrait.py <photo> [x0 y0 x1 y1]
Produit assets/portrait.json (grille 40x40, échelle canvas 640) et une
preview assets/portrait_preview.png pour juger du rendu.
"""
import json
import sys
from PIL import Image, ImageDraw, ImageOps

GRID = 48          # cellules par côté
SCALE = 640        # côté du canvas cible
CELL = SCALE / GRID
R_MAX = 5.4        # rayon max d'un point (px canvas)
SEUIL = 0.10       # luminosité sous laquelle on ne dessine rien (fond)
GAMMA = 1.35       # creuse les tons moyens (traits du visage en négatif)
ACCENT_TOP = 0.97  # fraction de luminosité au-delà de laquelle le point est violet

src = sys.argv[1]
img = Image.open(src).convert("L")

# Cadrage : carré visage+épaules, réglé pour la photo du 24/07 par défaut.
if len(sys.argv) == 6:
    box = tuple(int(v) for v in sys.argv[2:6])
else:
    box = (230, 400, 1330, 1500)
img = img.crop(box)

# Contraste : étire l'histogramme en ignorant 4 % de chaque extrémité.
img = ImageOps.autocontrast(img, cutoff=4)
small = img.resize((GRID, GRID), Image.LANCZOS)
px = small.load()

# Vignette elliptique : éteint les coins (la fenêtre du fond, le décor),
# centrée un peu au-dessus du centre (là où est le visage).
CX, CY, RADIUS = GRID / 2, GRID * 0.42, GRID * 0.62
def vignette(gx, gy):
    d = (((gx - CX) ** 2 + (gy - CY) ** 2) ** 0.5) / RADIUS
    if d <= 1:
        return 1.0
    return max(0.0, 1 - (d - 1) * 2.2)

dots = []
for gy in range(GRID):
    for gx in range(GRID):
        lum = px[gx, gy] / 255.0 * vignette(gx, gy)
        if lum < SEUIL:
            continue
        r = ((lum - SEUIL) / (1 - SEUIL)) ** GAMMA * R_MAX
        if r < 0.55:
            continue
        # Accent violet : réservé au débardeur (bas de l'image, très lumineux).
        violet = 1 if (gy > GRID * 0.80 and lum >= 0.82) else 0
        dots.append([
            round((gx + 0.5) * CELL, 1),
            round((gy + 0.5) * CELL, 1),
            round(r, 2),
            violet,
        ])

data = {"size": SCALE, "dots": dots}
with open("assets/portrait.json", "w", encoding="utf-8") as f:
    json.dump(data, f, separators=(",", ":"))

# Preview fidèle au rendu canvas.
prev = Image.new("RGB", (SCALE, SCALE), (10, 10, 10))
d = ImageDraw.Draw(prev)
for x, y, r, v in dots:
    color = (123, 92, 255) if v else (244, 242, 239)
    d.ellipse([x - r, y - r, x + r, y + r], fill=color)
prev.save("assets/portrait_preview.png")
print(f"{len(dots)} points -> assets/portrait.json ; preview ecrite")
