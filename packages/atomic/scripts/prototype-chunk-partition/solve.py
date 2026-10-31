"""PROTOTYPE - CP-SAT model: which usage groups share a chunk.

cost(page) = sum over loaded chunks of (alpha + lambda_bytes + beta * raw_bytes(chunk)), in gzipped-byte
equivalents: alpha/beta come from this build (gz ~= alpha + beta*raw per chunk), lambda from the ADR fit
(one request costs as much as lambda KB). Pages weigh 1 each unless --families restricts training.
usage: solve.py <model.json> <cost.json> <out-prefix> [--train-families storybook,cdn-smoke,adr] [--lambda KB] [--time S]
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
FILE = alpha + lam_kb * 1024                      # gz-byte equivalents per loaded chunk
train_families = opt.get("--train-families", "").split(",") if "--train-families" in opt else None
pages = M["pages"]; groups = M["groups"]
train = [i for i, p in enumerate(pages) if train_families is None or p["family"] in train_families]
G = [g for g in groups if any(i in train for i in g["pages"])]
n = len(G)
gz = [max(1, round(g["rawSize"] * beta)) for g in G]
uses = {p: {gi for gi, g in enumerate(G) if p in g["pages"]} for p in train}
print(f"{len(train)} training pages, {n} groups, file cost {FILE:.0f} B-eq (alpha {alpha:.0f} + lambda {lam_kb:.2f} KB)")

m = cp_model.CpModel()
x = {(g, k): m.NewBoolVar(f"x{g}_{k}") for g in range(n) for k in range(g + 1)}
for g in range(n):
    m.AddExactlyOne(x[g, k] for k in range(g + 1))
    for k in range(g):
        m.AddImplication(x[g, k], x[k, k])
y = {(p, k): m.NewBoolVar(f"y{p}_{k}") for p in train for k in range(n)}
w = {}
for p in train:
    for k in range(n):
        for g in uses[p]:
            if g >= k:
                m.AddImplication(x[g, k], y[p, k])
        others = [g for g in range(k, n) if g not in uses[p]]
        wmax = sum(gz[g] for g in others)
        w[p, k] = m.NewIntVar(0, wmax, f"w{p}_{k}")
        if others:
            m.Add(w[p, k] >= sum(gz[g] * x[g, k] for g in others) - wmax * (1 - y[p, k]))
const = sum(gz[g] for p in train for g in uses[p])
m.Minimize(sum(w[p, k] + int(FILE) * y[p, k] for p in train for k in range(n)))
for g in range(n):
    m.AddHint(x[g, g], 1)

solver = cp_model.CpSolver()
solver.parameters.max_time_in_seconds = float(opt.get("--time", 120))
solver.parameters.num_workers = 8
solver.parameters.log_search_progress = False
t0 = time.time(); status = solver.Solve(m)
print(f"status {solver.StatusName(status)} in {time.time()-t0:.0f} s; objective {solver.ObjectiveValue()+const:.0f} B-eq, bound {solver.BestObjectiveBound()+const:.0f} "
      f"(gap {(solver.ObjectiveValue()-solver.BestObjectiveBound())/(solver.ObjectiveValue()+const)*100:.1f}%)")
chunk_of_group = {gi: next(k for k in range(gi + 1) if solver.Value(x[gi, k])) for gi in range(n)}
used_chunks = sorted(set(chunk_of_group.values()))
print(f"{len(used_chunks)} chunks for {n} groups")

# --- module-level evaluation (same cost model), for any partition
sizes = M["moduleSizes"]; mpages = M["modulePages"]; base = M["baseline"]
def evaluate(chunk_of_module, page_ids):
    raw = defaultdict(int)
    for mod, ch in chunk_of_module.items(): raw[ch] += sizes[mod]
    loaded = defaultdict(set)
    for mod, ps in mpages.items():
        for p in ps: loaded[p].add(chunk_of_module[mod])
    rows = []
    for p in page_ids:
        ch = loaded[p]
        rows.append({"page": pages[p]["id"], "family": pages[p]["family"], "files": len(ch),
                     "gz_kb": sum(alpha + beta * raw[c] for c in ch) / 1024,
                     "cost": sum(FILE + beta * raw[c] for c in ch)})
    return rows
def summarize(name, rows):
    f = sum(r["files"] for r in rows) / len(rows); kb = sum(r["gz_kb"] for r in rows) / len(rows); c = sum(r["cost"] for r in rows) / len(rows)
    print(f"  {name:<22} mean {f:6.1f} files {kb:7.1f} KB gz  {c/1024:7.1f} KB-eq cost")
    return {"files": f, "gz_kb": kb, "cost_kbeq": c / 1024}

solver_map = dict(base)                            # unmapped modules keep their baseline chunk
signature_map = dict(base)
chunk_map = {}
for gi, g in enumerate(G):
    for mod in g["modules"]:
        solver_map[mod] = f"atomic-p{chunk_of_group[gi]}"; signature_map[mod] = f"sig{gi}"
        chunk_map[mod] = f"atomic-p{chunk_of_group[gi]}"
all_pages = list(range(len(pages))); holdout = [p for p in all_pages if p not in train]
result = {"lambda_kb": lam_kb, "file_cost_beq": FILE, "alpha": alpha, "beta": beta, "train_pages": len(train), "groups": n,
          "chunks": len(used_chunks), "status": solver.StatusName(status), "objective_beq": solver.ObjectiveValue() + const,
          "bound_beq": solver.BestObjectiveBound() + const, "eval": {}}
for scope, ids in [("train", train), ("holdout", holdout), ("all", all_pages)]:
    if not ids: continue
    print(f"model evaluation on {scope} ({len(ids)} pages):")
    result["eval"][scope] = {name: summarize(name, evaluate(mp, ids)) for name, mp in [("baseline (N=10)", base), ("signature groups", signature_map), ("solver", solver_map)]}
json.dump({"modules": chunk_map}, open(out_prefix + "-chunk-map.json", "w"))
json.dump({**result, "chunk_of_group": chunk_of_group, "group_sizes_gz": gz}, open(out_prefix + "-solution.json", "w"), indent=1)
sizes_by_chunk = defaultdict(float)
for gi in range(n): sizes_by_chunk[chunk_of_group[gi]] += gz[gi] / 1024
print("chunk sizes KB gz est:", " ".join(f"p{k}:{sizes_by_chunk[k]:.1f}" for k in used_chunks))
