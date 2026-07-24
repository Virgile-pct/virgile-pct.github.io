# -*- coding: utf-8 -*-
"""Génère l'image Open Graph du portfolio (assets/og.png, 1200x630).
Police dot-matrix maison 5x7 dessinée en POINTS RONDS — la DA du site,
sans dépendre d'aucune police installée. Usage : python assets/generate_og.py
"""
from PIL import Image, ImageDraw

BLACK = (10, 10, 10)
WHITE = (244, 242, 239)
GREY = (58, 58, 58)
VIOLET = (123, 92, 255)

# Bitmap 5x7 : 1 = point. Lettres nécessaires au visuel uniquement.
FONT = {
    "V": ["10001","10001","10001","10001","01010","01010","00100"],
    "I": ["11111","00100","00100","00100","00100","00100","11111"],
    "R": ["11110","10001","10001","11110","10100","10010","10001"],
    "G": ["01110","10001","10000","10111","10001","10001","01110"],
    "L": ["10000","10000","10000","10000","10000","10000","11111"],
    "E": ["11111","10000","10000","11110","10000","10000","11111"],
    "P": ["11110","10001","10001","11110","10000","10000","10000"],
    "O": ["01110","10001","10001","10001","10001","10001","01110"],
    "U": ["10001","10001","10001","10001","10001","10001","01110"],
    "C": ["01110","10001","10000","10000","10000","10001","01110"],
    "H": ["10001","10001","10001","11111","10001","10001","10001"],
    "T": ["11111","00100","00100","00100","00100","00100","00100"],
    "B": ["11110","10001","10001","11110","10001","10001","11110"],
    ".": ["00000","00000","00000","00000","00000","01100","01100"],
    "-": ["00000","00000","00000","01110","00000","00000","00000"],
    " ": ["00000","00000","00000","00000","00000","00000","00000"],
}

def text_width(text, pitch):
    return len(text) * 6 * pitch - pitch  # 5 colonnes + 1 d'espacement

def draw_text(draw, text, x, y, pitch, radius, color):
    for ci, ch in enumerate(text):
        glyph = FONT.get(ch.upper())
        if not glyph:
            continue
        for row, bits in enumerate(glyph):
            for col, bit in enumerate(bits):
                if bit == "1":
                    cx = x + (ci * 6 + col) * pitch
                    cy = y + row * pitch
                    draw.ellipse([cx - radius, cy - radius, cx + radius, cy + radius], fill=color)

img = Image.new("RGB", (1200, 630), BLACK)
d = ImageDraw.Draw(img)

# Trame de fond : points ronds discrets, pas de 30 px.
for gy in range(15, 630, 30):
    for gx in range(15, 1200, 30):
        d.ellipse([gx - 1.5, gy - 1.5, gx + 1.5, gy + 1.5], fill=(26, 26, 26))

# Titre sur deux lignes, centré.
P, R = 15, 5.6  # pas de grille, rayon des points
for line, color, y in (("VIRGILE", WHITE, 150), ("POURCHET", VIOLET, 300)):
    x = (1200 - text_width(line, P)) // 2
    draw_text(d, line, x, y, P, R, color)

# Séparateur pointillé violet.
for gx in range(180, 1021, 20):
    d.ellipse([gx - 3, 462 - 3, gx + 3, 462 + 3], fill=VIOLET)

# URL en bas, petite grille.
p2, r2 = 5, 1.9
url = "VIRGILE-PCT.GITHUB.IO"
x = (1200 - text_width(url, p2)) // 2
draw_text(d, url, x, 520, p2, r2, (138, 138, 138))

img.save("assets/og.png", optimize=True)
print("assets/og.png :", img.size)
