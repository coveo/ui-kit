"""PROTOTYPE - heuristics on solve.py's objective, for comparison with CP-SAT.
usage: greedy.py <model.json> <cost.json> [--train-families a,b] [--cpsat <solution.json>] [--out <out.json>]
"""
import json, sys, time
from collections import defaultdict

args = sys.argv[1:]
model_path, cost_path = args[:2]
opt = {args[i]: args[i + 1] for i in range(2, len(args), 2)}
M = json.load(open(model_path)); C = json.load(open(cost_path))
alpha, beta = M["fit"]["alpha"], M["fit"]["beta"]
FILE = alpha + C["lambda_kb_per_file"] * 1024
B, F = C["b_s_per_kb"], C["c_s_per_file"]
train_families = opt["--train-families"].split(",") if "--train-families" in opt else None
pages = M["pages"]; groups = M["groups"]
train = [i for i, p in enumerate(pages) if train_families is None or p["family"] in train_families]
G = [g for g in groups if any(i in train for i in g["pages"])]
n = len(G)
gz = [max(1, round(g["rawSize"] * beta)) for g in G]
uses = {p: {gi for gi, g in enumerate(G) if p in g["pages"]} for p in train}
users = {g: [p for p in train if g in uses[p]] for g in range(n)}

def objective(chunk_of):
    size = defaultdict(int)
    for g, c in chunk_of.items(): size[c] += gz[g]
    return sum(FILE + size[c] for p in train for c in {chunk_of[g] for g in uses[p]})

def lpt_balance(K):
    size = [0] * K; chunk_of = {}
    for g in sorted(range(n), key=lambda g: -gz[g]):
        k = min(range(K), key=lambda k: size[k]); chunk_of[g] = k; size[k] += gz[g]
    return chunk_of

def greedy_marginal(order):
    chunk_of, size, nchunks = {}, defaultdict(int), 0
    loads = {p: defaultdict(int) for p in train}
    for g in order:
        best = None
        for k in range(nchunks + 1):
            d = sum(FILE + size[k] for p in users[g] if loads[p][k] == 0)
            d += sum(gz[g] for p in train if loads[p][k] > 0 and g not in uses[p])
            if best is None or d < best[0]: best = (d, k)
        k = best[1]
        if k == nchunks: nchunks += 1
        chunk_of[g] = k; size[k] += gz[g]
        for p in users[g]: loads[p][k] += 1
    return chunk_of

def agglomerative(start):
    chunk_of = dict(start)
    while True:
        size, members = defaultdict(int), defaultdict(list)
        for g, c in chunk_of.items(): size[c] += gz[g]; members[c].append(g)
        loads = {p: {chunk_of[g] for g in uses[p]} for p in train}
        ids = sorted(members); best = None
        for i, a in enumerate(ids):
            for b in ids[i + 1:]:
                d = 0
                for p in train:
                    la, lb = a in loads[p], b in loads[p]
                    if la and lb: d -= FILE
                    elif la: d += size[b]
                    elif lb: d += size[a]
                if d < 0 and (best is None or d < best[0]): best = (d, a, b)
        if best is None: return chunk_of
        for g in members[best[2]]: chunk_of[g] = best[1]

sizes = M["moduleSizes"]; mpages = M["modulePages"]; base = M["baseline"]
def module_map(chunk_of):
    mp = dict(base)
    for gi, g in enumerate(G):
        for mod in g["modules"]: mp[mod] = f"c{chunk_of[gi]}"
    return mp
def evaluate(mp, ids):
    raw = defaultdict(int)
    for mod, ch in mp.items(): raw[ch] += sizes[mod]
    loaded = defaultdict(set)
    for mod, ps in mpages.items():
        for p in ps: loaded[p].add(mp[mod])
    files = kb = 0.0
    for p in ids:
        ch = loaded[p]; files += len(ch); kb += sum(alpha + beta * raw[c] for c in ch) / 1024
    files /= len(ids); kb /= len(ids)
    return files, kb, files * F + kb * B
def floor(ids):
    kb = sum((alpha + beta * sum(sizes[mod] for mod, ps in mpages.items() if p in ps)) / 1024 for p in ids) / len(ids)
    return 1.0, kb, F + kb * B

all_pages = list(range(len(pages))); holdout = [p for p in all_pages if p not in train]
scopes = [("all", all_pages)] + ([("holdout", holdout)] if holdout else [])
by_pages = sorted(range(n), key=lambda g: (-len(users[g]), -gz[g]))
largest = sorted(range(n), key=lambda g: -gz[g]); smallest = largest[::-1]
cp = json.load(open(opt["--cpsat"])) if "--cpsat" in opt else None
FAST = opt.get("--fast") == "1"
Kc = cp["chunks"] if cp else 37
runs = []
def add(name, chunk_of, t0):
    runs.append((name, chunk_of, time.time() - t0))
t = time.time(); add("signature groups, no merging", {g: g for g in range(n)}, t)
if not FAST: t = time.time(); add(f"LPT balance, {Kc} chunks", lpt_balance(Kc), t)
if not FAST: t = time.time(); add("LPT balance, 14 chunks", lpt_balance(14), t)
t = time.time(); gl = greedy_marginal(largest); add("greedy marginal, largest first (LPT order)", gl, t)
t = time.time(); add("greedy marginal, smallest first", greedy_marginal(smallest), t)
t = time.time(); gp = greedy_marginal(by_pages); add("greedy marginal, most pages first", gp, t)
if not FAST: t = time.time(); add("agglomerative merging from signature groups", agglomerative({g: g for g in range(n)}), t)
t = time.time(); add("greedy largest first + agglomerative", agglomerative(gl), t)
t = time.time(); add("greedy most pages first + agglomerative", agglomerative(gp), t)
if cp:
    cog = {int(k): v for k, v in cp["chunk_of_group"].items()}
    if len(cog) == n: add("CP-SAT (150 s)", cog, time.time())
print(f"{len(train)} training pages, {n} groups, file cost {FILE:.0f} B-eq; seconds = files x {F*1000:.1f} ms + KB x {B*1000:.1f} ms")
head = f"{'strategy':<46}{'chunks':>7}{'objective':>12}{'vs CP-SAT':>10}"
for s, _ in scopes: head += f"{'  files':>9}{'KB gz':>8}{'s':>7}"
print(head)
ref = objective({int(k): v for k, v in cp["chunk_of_group"].items()}) if cp else None
out = []
for name, chunk_of, secs in runs:
    obj = objective(chunk_of); nch = len(set(chunk_of.values())); mp = module_map(chunk_of)
    line = f"{name:<46}{nch:>7}{obj:>12.0f}{(obj / ref - 1) * 100:>+9.1f}%" if ref else f"{name:<46}{nch:>7}{obj:>12.0f}{'':>10}"
    row = {"strategy": name, "chunks": nch, "objective_beq": obj, "seconds_to_run": secs}
    for s, ids in scopes:
        f, kb, sec = evaluate(mp, ids); line += f"{f:>9.1f}{kb:>8.1f}{sec:>7.3f}"; row[s] = {"files": f, "gz_kb": kb, "cost_s": sec}
    print(line); out.append(row)
if cp: print(f"{'CP-SAT lower bound':<46}{'':>7}{cp['bound_beq']:>12.0f}{(cp['bound_beq'] / ref - 1) * 100:>+9.1f}%")
line = f"{'floor: one file per page, no waste':<46}{'':>7}{'':>12}{'':>10}"
for s, ids in scopes:
    f, kb, sec = floor(ids); line += f"{f:>9.1f}{kb:>8.1f}{sec:>7.3f}"
print(line)
if "--out" in opt: json.dump({"train": len(train), "groups": n, "runs": out}, open(opt["--out"], "w"), indent=1)
