#!/usr/bin/env python3
"""Wire the existing img/ renders into public/images/products/<slug>/.

img/ is not one library — it holds three distinct looks:
  * pure-black product shots (tennis bracelets, some solitaires)  <- usable as-is
  * light-grey product shots (studs)                              <- wrong background
  * lifestyle shots in a branded box with props                   <- not a clean tile

Only the black product shots are wired as cover/angle shots. Lifestyle "with
Model" frames are wired as model.jpg, where an on-body/scene look is expected.
Anything else is left for generation.

Slots per product: cover.jpg, angle-1.jpg, angle-2.jpg, model.jpg
The inventory's own gold type decides which metal is the cover.

Usage: python3 scripts/wire-existing-imagery.py [--check]
"""
import argparse, glob, os, re, shutil, sys
from collections import defaultdict
from PIL import Image
import pandas as pd

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "images", "products")


def corner(im, k=34):
    w, h = im.size
    px = []
    for b in [(0, 0, k, k), (w - k, 0, w, k), (0, h - k, k, h), (w - k, h - k, w, h)]:
        px += list(im.crop(b).convert("RGB").getdata())
    n = len(px)
    return tuple(sum(p[c] for p in px) // n for c in range(3))


def variance(im, k=34):
    w, h = im.size
    vals = []
    for b in [(0, 0, k, k), (w - k, 0, w, k), (0, h - k, k, h), (w - k, h - k, w, h)]:
        px = list(im.crop(b).convert("L").getdata())
        vals.append(sum(px) / len(px))
    return max(vals) - min(vals)


def classify(path):
    im = Image.open(path)
    if variance(im) > 42:
        return "lifestyle"
    lum = sum(corner(im)) / 3
    return "black" if lum < 26 else "light" if lum > 150 else "mid"


CUT_TAGS = {"rd": "Round", "oval": "Oval", "em": "Emerald", "pe": "Pear",
            "mq": "Marquise", "rad": "Radiant", "cu": "Cushion"}


def meta(fn):
    n = os.path.basename(fn).lower()
    ct = (re.match(r"^([0-9.]+)ct", n) or [None, None])[1]
    fam = ("tennis-bracelet" if "bracelate" in n or "bracelet" in n
           else "stud" if "stud" in n
           else "solitaire" if "soliter" in n or "solitaire" in n else None)
    metal = ("White" if re.search(r"\bwg\b", n) else "Yellow" if re.search(r"\byg\b", n)
             else "Rose" if re.search(r"\brg\b", n) else None)
    view = ("model" if "model" in n else "close-up" if "close-up" in n
            else "45" if "45" in n else "front" if "front" in n
            else "side" if "side" in n else None)
    # The img/ solitaires are a per-cut sampler (2ct emerald, 3ct pear, 5ct
    # marquise...) while the inventory sheet calls the whole SR line Oval. Carry
    # the cut so we never dress an "Oval" product in an emerald-cut render.
    cut = next((v for k, v in CUT_TAGS.items() if re.search(rf"\b{k}\b", n)), None)
    return ct, fam, metal, view, cut


FAM_OF = {"ST": "stud", "TB": "tennis-bracelet", "TN": "tennis-necklace", "SR": "solitaire"}


def save(src, dst, dry):
    """PNG -> JPG, background lifted to exact black, 1600px long edge."""
    if dry:
        return
    im = Image.open(src).convert("RGB")
    bg = corner(im)
    if max(bg) > 2:  # black-point lift, same maths as normalize-backgrounds.py
        px = []
        w, h = im.size
        k = 34
        for b in [(0, 0, k, k), (w - k, 0, w, k), (0, h - k, k, h), (w - k, h - k, w, h)]:
            px += list(im.crop(b).convert("RGB").getdata())
        lut = []
        for c in range(3):
            vals = sorted(p[c] for p in px)
            bp = vals[min(len(vals) - 1, int(len(vals) * 0.90))]
            scale = 255.0 / max(1, 255 - bp)
            lut += [max(0, min(255, int(round((v - bp) * scale)))) for v in range(256)]
        im = im.point(lut)
    im.thumbnail((1600, 1600), Image.LANCZOS)
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    im.save(dst, "JPEG", quality=90, subsampling=1, optimize=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true")
    a = ap.parse_args()

    inv = pd.read_excel(os.path.join(ROOT, "JEWELSTONE_Inventory_US_Sizes (1).xlsx"))
    src = open(os.path.join(ROOT, "data", "products.ts")).read()
    slug_of = dict(re.findall(r'labGrown\(\{[^}]*?sku: "([^"]+)"[^}]*?slug: "([^"]+)"', src, re.S))

    pool = defaultdict(list)
    for f in glob.glob(os.path.join(ROOT, "img", "*.png")):
        ct, fam, metal, view, cut = meta(f)
        if not (ct and fam):
            continue
        pool[(fam, ct)].append((classify(f), metal, view, f, cut))

    wired = partial = skipped = 0
    for _, r in inv.iterrows():
        sku = str(r["SKU"])
        pref = re.match(r"^[A-Z]+", sku).group(0)
        fam = FAM_OF.get(pref)
        slug = slug_of.get(sku)
        if not (fam and slug):
            continue
        ct = f'{r["Total Carat"]:g}'
        cand = pool.get((fam, ct), [])
        # Drop renders whose cut contradicts the inventory sheet (the sheet is
        # the client's authoritative spec; the img/ solitaires are a sampler).
        want_cut = str(r["Center Stone"]).strip()
        cand = [c for c in cand if not c[4] or c[4] == want_cut]
        if not cand:
            skipped += 1
            continue

        want_metal = "White" if "White" in str(r["Gold Type"]) else "Yellow" if "Yellow" in str(r["Gold Type"]) else "Rose"
        black = [c for c in cand if c[0] == "black"]
        life = [c for c in cand if c[0] == "lifestyle"]

        def pick(views, metals):
            for m in metals:
                for v in views:
                    for c in black:
                        if c[2] == v and c[1] == m:
                            return c
            return None

        metals = [want_metal, "White", "Yellow", "Rose"]
        cover = pick(["front", "45", "close-up"], metals)
        a1 = pick(["45", "front", "close-up"], metals)
        a2 = pick(["close-up", "side", "45"], metals)
        model = next((c for c in life + black if c[2] == "model"), None)

        chosen = {"cover.jpg": cover, "angle-1.jpg": a1, "angle-2.jpg": a2, "model.jpg": model}
        # de-dupe: never use the same file for two slots
        seen = set()
        for k in list(chosen):
            c = chosen[k]
            if c and c[3] in seen:
                chosen[k] = None
            elif c:
                seen.add(c[3])

        have = sum(1 for v in chosen.values() if v)
        if not have:
            skipped += 1
            continue
        for slot, c in chosen.items():
            if c:
                save(c[3], os.path.join(OUT, slug, slot), a.check)
        status = "wired" if have == 4 else f"partial {have}/4"
        if have == 4: wired += 1
        else: partial += 1
        print(f"{'would ' if a.check else ''}{status:11} {sku:6} {slug:32} " +
              ", ".join(f"{k.split('.')[0]}={os.path.basename(c[3])[:26]}" for k, c in chosen.items() if c))

    print(f"\n{wired} fully wired, {partial} partial, {skipped} have no usable renders (need generation)")


if __name__ == "__main__":
    main()
