"""PROTOTYPE - fits the ADR 0001 mobile measurements to  ready_s = a_page + b*KB + c*files.

The ratio c/b (KB per file) is the exchange rate the solver uses between a request and a kilobyte.
Data: the two mobile tables of docs/adr/0001-group-shared-modules-in-one-cdn-chunk.md. Options E and F
come from the 7-load table and are shifted by that table's C10 offset so every point shares one baseline.
"""
import json, sys
import numpy as np

pages = ["search-box", "typical", "rich", "commerce"]
# option: {page: (ready_s, files, gz_kb)}
first = {
    "A":   [(2.91, 65, 130.0), (4.21, 162, 209.4), (5.27, 225, 301.2), (6.09, 196, 244.2)],
    "B":   [(2.53, 15, 112.5), (4.05, 50, 267.8), (5.59, 92, 491.5), (5.89, 67, 326.1)],
    "C5":  [(2.77, 23, 154.7), (3.60, 50, 188.4), (4.55, 97, 266.5), (5.42, 78, 212.6)],
    "C10": [(2.68, 30, 132.4), (3.66, 76, 180.6), (4.66, 134, 270.6), (5.54, 108, 214.7)],
    "C20": [(2.66, 34, 123.6), (3.85, 106, 190.2), (4.86, 168, 281.7), (5.76, 142, 226.8)],
}
second_c10 = [2.66, 3.65, 4.62, 5.52]
second = {
    "E": [(2.64, 28, 130.2), (3.63, 74, 180.1), (4.63, 132, 270.1), (5.50, 105, 212.0)],
    "F": [(2.62, 28, 125.3), (3.63, 75, 179.5), (4.63, 134, 271.4), (5.50, 107, 213.3)],
}
rows, y = [], []
def add(opt, pts, shift):
    for i, (t, files, kb) in enumerate(pts):
        row = [0.0] * len(pages); row[i] = 1.0
        rows.append(row + [kb, files]); y.append(t + shift[i])
for opt, pts in first.items(): add(opt, pts, [0, 0, 0, 0])
for opt, pts in second.items(): add(opt, pts, [first["C10"][i][0] - second_c10[i] for i in range(4)])

X, y = np.array(rows), np.array(y)
coef, *_ = np.linalg.lstsq(X, y, rcond=None)
pred = X @ coef
ss_res = float(((y - pred) ** 2).sum()); ss_tot = float(((y - y.mean()) ** 2).sum())
b, c = float(coef[4]), float(coef[5])
out = {"b_s_per_kb": b, "c_s_per_file": c, "lambda_kb_per_file": c / b, "r2": 1 - ss_res / ss_tot,
       "points": len(y), "max_abs_residual_s": float(np.abs(y - pred).max())}
print(json.dumps(out, indent=2))
# without option B (its duplicated modules are a different regime)
mask = np.array([not (6 <= i < 10) for i in range(len(y))])  # rows 4..7 are option B
coef2, *_ = np.linalg.lstsq(X[mask], y[mask], rcond=None)
out["without_B"] = {"b_s_per_kb": float(coef2[4]), "c_s_per_file": float(coef2[5]), "lambda_kb_per_file": float(coef2[5] / coef2[4])}
print("without option B:", json.dumps(out["without_B"]))
if len(sys.argv) > 1:
    json.dump(out, open(sys.argv[1], "w"), indent=2)
