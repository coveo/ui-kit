"""PROTOTYPE - solve.py plus a warm start, page weights, a chunk cap and a worker count.
usage: solve-variants.py <model.json> <cost.json> <out-prefix> [--train-families a,b] [--lambda KB] [--time S]
       [--hint <solution.json>] [--max-chunks K] [--workers N] [--weight-family fam=w,fam=w]
"""
import json, sys, time
from collections import defaultdict
from ortools.sat.python import cp_model

args = sys.argv[1:]
model_path, cost_path, out_prefix = args[:3]
opt = {args[i]: args[i + 1] for i in range(3, len(args), 2)}
M = json.load(open(model_path)); C = json.load(open(cost_path))
alpha, beta = M["fit"]["alpha"], M["fit"]["beta"]
lam_kb = float(opt.get("--lambda", C["lambda_kb_per_file"]))
FILE = alpha + lam_kb * 1024
B, F = C["b_s_per_kb"], C["c_s_per_file"]
train_families = opt["--train-families"].split(",") if "--train-families" in opt else None
fam_w = {s.split("=")[0]: float(s.split("=")[1]) for s in opt.get("--weight-family", "").split(",") if "=" in s}
pages = M["pages"]; groups = M["groups"]
train = [i for i, p in enumerate(pages) if train_families is None or p["family"] in train_families]
SCALE = 100
wgt = {p: int(round(SCALE * fam_w.get(pages[p]["family"], pages[p].get("weight", 1)))) for p in train}
G = [g for g in groups if any(i in train for i in g["pages"])]
n = len(G)
K = min(n, int(opt.get("--max-chunks", n)))
gz = [max(1, round(g["rawSize"] * beta)) for g in G]
uses = {p: {gi for gi, g in enumerate(G) if p in g["pages"]} for p in train}
print(f"{len(train)} training pages, {n} groups, cap {K} chunks, file cost {FILE:.0f} B-eq, weights {sorted(set(w / SCALE for w in wgt.values()))}", flush=True)

def slots(g): return range(min(g, K - 1) + 1)
t_build = time.time()
m = cp_model.CpModel()
x = {(g, k): m.NewBoolVar(f"x{g}_{k}") for g in range(n) for k in slots(g)}
for g in range(n):
    m.AddExactlyOne(x[g, k] for k in slots(g))
    for k in slots(g):
        if k < g: m.AddImplication(x[g, k], x[k, k])
y = {(p, k): m.NewBoolVar(f"y{p}_{k}") for p in train for k in range(K)}
w = {}
for p in train:
    for k in range(K):
        for g in uses[p]:
            if (g, k) in x: m.AddImplication(x[g, k], y[p, k])
        others = [g for g in range(k, n) if g not in uses[p]]
        wmax = sum(gz[g] for g in others)
        w[p, k] = m.NewIntVar(0, wmax, f"w{p}_{k}")
        if others:
            m.Add(w[p, k] >= sum(gz[g] * x[g, k] for g in others) - wmax * (1 - y[p, k]))
const = sum(wgt[p] * gz[g] for p in train for g in uses[p])
m.Minimize(sum(wgt[p] * (w[p, k] + int(FILE) * y[p, k]) for p in train for k in range(K)))

hint = opt.get("--hint")
if hint:
    Hs = json.load(open(hint)); cog = {int(k): v for k, v in Hs["chunk_of_group"].items()}
    if len(cog) == n and all((g, cog[g]) in x for g in range(n)):
        for g in range(n): m.AddHint(x[g, cog[g]], 1)
        for p in train:
            for k in range(K): m.AddHint(y[p, k], int(any(cog[g] == k for g in uses[p])))
        print(f"warm start from {hint}", flush=True)
    else:
        print("hint ignored (different groups or chunk cap)", flush=True)
else:
    for g in range(n): m.AddHint(x[g, min(g, K - 1)], 1)
print(f"model built in {time.time() - t_build:.0f} s: {len(x)} x, {len(y)} y, {len(w)} w", flush=True)

solver = cp_model.CpSolver()
solver.parameters.max_time_in_seconds = float(opt.get("--time", 120))
solver.parameters.num_workers = int(opt.get("--workers", 8))
solver.parameters.log_search_progress = False
t0 = time.time(); status = solver.Solve(m)
obj = (solver.ObjectiveValue() + const) / SCALE; bound = (solver.BestObjectiveBound() + const) / SCALE
print(f"status {solver.StatusName(status)} in {time.time() - t0:.0f} s; objective {obj:.0f} B-eq, bound {bound:.0f} (gap {(obj - bound) / obj * 100:.1f}%)", flush=True)
chunk_of_group = {gi: next(k for k in slots(gi) if solver.Value(x[gi, k])) for gi in range(n)}
used_chunks = sorted(set(chunk_of_group.values()))
print(f"{len(used_chunks)} chunks for {n} groups")

sizes = M["moduleSizes"]; mpages = M["modulePages"]; base = M["baseline"]
def evaluate(chunk_of_module, page_ids):
    raw = defaultdict(int)
    for mod, ch in chunk_of_module.items(): raw[ch] += sizes[mod]
    loaded = defaultdict(set)
    for mod, ps in mpages.items():
        for p in ps: loaded[p].add(chunk_of_module[mod])
    rows = []
    for p in page_ids:
        ch = loaded[p]; kb = sum(alpha + beta * raw[c] for c in ch) / 1024
        rows.append({"page": pages[p]["id"], "family": pages[p]["family"], "files": len(ch), "gz_kb": kb, "cost_s": len(ch) * F + kb * B})
    return rows
def summarize(name, rows):
    f = sum(r["files"] for r in rows) / len(rows); kb = sum(r["gz_kb"] for r in rows) / len(rows); s = sum(r["cost_s"] for r in rows) / len(rows)
    print(f"  {name:<22} mean {f:6.1f} files {kb:7.1f} KB gz  {s:6.3f} s")
    return {"files": f, "gz_kb": kb, "cost_s": s}

solver_map = dict(base); chunk_map = {}
for gi, g in enumerate(G):
    for mod in g["modules"]:
        solver_map[mod] = f"atomic-p{chunk_of_group[gi]}"; chunk_map[mod] = f"atomic-p{chunk_of_group[gi]}"
all_pages = list(range(len(pages))); holdout = [p for p in all_pages if p not in train]
real = [p for p in all_pages if pages[p]["family"] not in ("synthetic", "single")]
result = {"args": args, "lambda_kb": lam_kb, "file_cost_beq": FILE, "train_pages": len(train), "groups": n, "cap": K, "chunks": len(used_chunks),
          "status": solver.StatusName(status), "objective_beq": obj, "bound_beq": bound, "eval": {}}
for scope, ids in [("train", train), ("holdout", holdout), ("real", real)]:
    if not ids: continue
    print(f"model evaluation on {scope} ({len(ids)} pages):")
    result["eval"][scope] = {name: summarize(name, evaluate(mp, ids)) for name, mp in [("baseline (N=10)", base), ("solver", solver_map)]}
json.dump({"modules": chunk_map}, open(out_prefix + "-chunk-map.json", "w"))
json.dump({**result, "chunk_of_group": chunk_of_group, "group_sizes_gz": gz}, open(out_prefix + "-solution.json", "w"), indent=1)
