"""PROTOTYPE - evaluates chunk maps on the base model's pages of given families (module level, same cost model).
usage: eval-map.py <model.json> <cost.json> --families a,b name=chunk-map.json ..."""
import json, sys
from collections import defaultdict
args = sys.argv[1:]; M = json.load(open(args[0])); C = json.load(open(args[1]))
fams = args[3].split(","); maps = [a.split("=", 1) for a in args[4:]]
alpha, beta = M["fit"]["alpha"], M["fit"]["beta"]; B, F = C["b_s_per_kb"], C["c_s_per_file"]
sizes = M["moduleSizes"]; mpages = M["modulePages"]; base = M["baseline"]; pages = M["pages"]
ids = [i for i, p in enumerate(pages) if p["family"] in fams]
def evaluate(mp):
    raw = defaultdict(int)
    for mod, ch in mp.items(): raw[ch] += sizes[mod]
    loaded = defaultdict(set)
    for mod, ps in mpages.items():
        for p in ps: loaded[p].add(mp[mod])
    f = sum(len(loaded[p]) for p in ids) / len(ids)
    kb = sum(sum(alpha + beta * raw[c] for c in loaded[p]) for p in ids) / len(ids) / 1024
    return f, kb, f * F + kb * B
print(f"{len(ids)} pages of {fams}")
print(f"  {'baseline (N=10)':<34}{'files':>7}{'KB':>8}{'s':>7}".replace("files", "") , end="")
f, kb, s = evaluate(dict(base)); print(f"{f:>7.1f}{kb:>8.1f}{s:>7.3f}")
for name, path in maps:
    cm = json.load(open(path))["modules"]; mp = dict(base); mp.update({m: c for m, c in cm.items() if m in mp})
    f, kb, s = evaluate(mp); print(f"  {name:<34}{f:>7.1f}{kb:>8.1f}{s:>7.3f}   ({len(cm)} mapped modules)")
