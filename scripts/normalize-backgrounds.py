#!/usr/bin/env python3
"""Normalise product-shot backgrounds to the catalogue's pure black (0,0,0).

The generated shots land on slightly different dark greys every time (we've seen
(8,8,9), (21,21,22), (34,34,34) within a single product), while the existing
in-house photography sits on pure black. Prompting can't hit an exact hex
reliably, so we correct deterministically after the fact with a per-channel
black-point lift:

    out = (in - bp) * 255 / (255 - bp)

That maps the measured background to 0 while preserving the subject and its
reflection, instead of hard-thresholding (which would clip the reflection off).

Idempotent: an image already sitting on black is left untouched.
On-body `model.jpg` shots are skipped — they live on ivory silk by design.

Usage:
  python3 scripts/normalize-backgrounds.py [--check] [--dir public/images/products]
"""
import argparse, glob, os, sys
from PIL import Image

SKIP = {"model.jpg"}
TARGET_TOL = 2   # corner background at/below this is already "black enough"


def corner_px(im, k=28):
    w, h = im.size
    boxes = [(0, 0, k, k), (w - k, 0, w, k), (0, h - k, k, h), (w - k, h - k, w, h)]
    px = []
    for b in boxes:
        px += list(im.crop(b).convert("RGB").getdata())
    return px


def corner_bg(im, k=28):
    """Per-channel mean of the four corner patches — what a viewer reads as 'the background'."""
    px = corner_px(im, k)
    n = len(px)
    return tuple(sum(p[c] for p in px) // n for c in range(3))


def black_point(im, k=28, pct=0.90):
    """Per-channel high percentile of corner pixels.

    The sweep is vignetted, so the corner *mean* sits below the background's true
    ceiling and a mean-based lift leaves a residual grey. Taking a high percentile
    clamps essentially all of the background to 0; the subject and its reflection
    are far brighter and survive untouched.
    """
    px = corner_px(im, k)
    out = []
    for c in range(3):
        vals = sorted(p[c] for p in px)
        out.append(vals[min(len(vals) - 1, int(len(vals) * pct))])
    return tuple(out)


def normalise(path, dry=False):
    im = Image.open(path).convert("RGB")
    before = corner_bg(im)
    if max(before) <= TARGET_TOL:
        return None  # already on black

    bp = black_point(im)
    lut = []
    for c in range(3):
        b = bp[c]
        scale = 255.0 / max(1, (255 - b))
        lut += [max(0, min(255, int(round((v - b) * scale)))) for v in range(256)]

    out = im.point(lut)
    after = corner_bg(out)
    if not dry:
        out.save(path, "JPEG", quality=92, subsampling=1, optimize=True)
    return before, after


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true", help="report only; do not write")
    ap.add_argument("--dir", default="public/images/products")
    a = ap.parse_args()

    files = [f for f in sorted(glob.glob(os.path.join(a.dir, "*", "*.jpg")))
             if os.path.basename(f) not in SKIP]
    changed, offenders = 0, []
    for f in files:
        r = normalise(f, dry=a.check)
        if r is None:
            continue
        before, after = r
        rel = f.split("products/")[-1]
        offenders.append((rel, before, after))
        changed += 1
        print(f"{'would fix' if a.check else 'fixed'}  {rel:58} {str(before):>16} -> {str(after)}")

    print(f"\n{len(files)} product shots checked, {changed} off-black")
    if a.check and changed:
        print("run without --check to normalise")
        sys.exit(1)
    if not changed:
        print("all product shots sit on pure black")


if __name__ == "__main__":
    main()
