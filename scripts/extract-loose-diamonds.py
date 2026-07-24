#!/usr/bin/env python3
"""Selects 500 IGI-certified + 500 non-certified loose diamonds from the Maitri
LGD stock sheet into data/loose-diamonds.json. Seeded so the build is stable."""
import openpyxl, json, random, os

SRC = "LGD Stock as of 04-23-2026 ~ Maitri Diamonds Inc. 💎.xlsx"
OUT = "data/loose-diamonds.json"
random.seed(4723)  # stable selection across runs

wb = openpyxl.load_workbook(SRC, data_only=True, read_only=True)
ws = wb["General Client Format 2"]
rows = ws.iter_rows(values_only=True)
hdr = [str(h).strip() if h else "" for h in next(rows)]
ix = {h: i for i, h in enumerate(hdr)}

def cell(r, name):
    v = r[ix[name]] if name in ix and ix[name] < len(r) else None
    return v

certified, uncertified = [], []
for r in rows:
    shape = cell(r, "Shape")
    cts = cell(r, "Cts")
    if not shape or not isinstance(cts, (int, float)):
        continue
    lab = (str(cell(r, "Lab")).strip() if cell(r, "Lab") else "NONE")
    cert_no = cell(r, "Certificate No.")
    memo = cell(r, "Memo Amount")
    price = round(memo) if isinstance(memo, (int, float)) and memo > 0 else None
    rec = {
        "id": str(cell(r, "Barcode") or f"{shape}-{cts}").strip(),
        "shape": str(shape).strip(),
        "carat": round(float(cts), 2),
        "color": str(cell(r, "Color") or "").strip(),
        "clarity": str(cell(r, "Clarity") or "").strip(),
        "cut": str(cell(r, "Cut") or "").strip().replace("-", ""),
        "polish": str(cell(r, "Polish") or "").strip(),
        "symmetry": str(cell(r, "Symm") or "").strip(),
        "lab": lab if lab != "NONE" else "",
        "price": price,
    }
    if lab != "NONE" and cert_no:
        certified.append(rec)
    else:
        uncertified.append(rec)

pick_c = random.sample(certified, 500)
pick_u = random.sample(uncertified, 500)
for rec in pick_c:
    rec["certified"] = True
for rec in pick_u:
    rec["certified"] = False

out = pick_c + pick_u
random.shuffle(out)
# drop stones with no price so the storefront never shows a blank
out = [d for d in out if d["price"]]

json.dump(out, open(OUT, "w"), indent=0)
wb.close()

from collections import Counter
print(f"wrote {len(out)} diamonds -> {OUT}")
print("certified:", sum(1 for d in out if d['certified']), "| non-certified:", sum(1 for d in out if not d['certified']))
print("shapes:", dict(Counter(d['shape'] for d in out).most_common()))
print("carat range:", min(d['carat'] for d in out), "-", max(d['carat'] for d in out))
print("price range: $", min(d['price'] for d in out), "- $", max(d['price'] for d in out))
