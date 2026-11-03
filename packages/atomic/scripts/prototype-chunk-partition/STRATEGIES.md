# Strategy check (2026-11-03)

Question: before measuring the solver build with the ADR harness, could another algorithm (LPT or otherwise) gain more?
Answer: no. Every sensible heuristic reaches the same value as CP-SAT, and the one-file floor leaves at most 0.09 s for any strategy on this model. The remaining gap is in the inputs (which pages the partition is trained on), not the algorithm.

Scripts (same cost model and evaluation as `solve.py`):

- `greedy.py <model.json> <cost.json> [--train-families a,b] [--cpsat solution.json] [--fast 1] [--out out.json]`: LPT size balancing, greedy marginal-cost assignment (largest first, smallest first, most pages first), agglomerative merging, the CP-SAT solution and the floor.
- `solve-variants.py`: `solve.py` plus `--hint solution.json` (warm start), `--max-chunks K`, `--workers N`, `--weight-family fam=w`.
- `gen-pages.py <pages.json> <out.json> --mode synth|singles|adr`: synthetic sub-pages of the training pages, one page per component, or the ADR harness's four pages (`--adr-dir .../chunk-sweep/pages`).
- `eval-map.py <model.json> <cost.json> --families a,b name=chunk-map.json ...`: scores chunk maps on the base model's pages of those families.

## Same objective, 42 training pages (model level)

| Strategy | Chunks | Objective vs CP-SAT 150 s | Files | KB gz | Modelled s |
|---|---|---|---|---|---|
| Signature groups, no merging | 127 | +27.7 % | 50.3 | 165.8 | 1.062 |
| LPT size balancing, 37 chunks | 37 | +53.5 % | 25.1 | 231.2 | 1.276 |
| LPT size balancing, 14 chunks | 14 | +95.0 % | 12.4 | 311.4 | 1.621 |
| Greedy marginal cost, largest first (LPT order) | 32 | −0.2 % | 7.9 | 158.0 | 0.830 |
| Greedy marginal cost, most pages first | 31 | −0.2 % | 7.7 | 158.2 | 0.830 |
| Agglomerative merging from signature groups | 36 | −0.2 % | 9.4 | 156.6 | 0.830 |
| CP-SAT, 150 s | 37 | 0 | 9.6 | 156.8 | 0.832 |
| CP-SAT, 900 s, warm start | 33 | −0.3 % | 8.2 | 157.5 | 0.829 |
| CP-SAT lower bound | | −7.8 % | | | |
| Floor: one file per page, no waste | | | 1.0 | 145.5 | 0.736 |

The built CP-SAT partition measures 14.0 files and 0.87 s; the model says 9.6 and 0.83 s for it, the difference being modules the build keeps outside the map.

## Held-out: 30 sample pages never seen in training (model level)

| Training set | Files | KB gz | Modelled s |
|---|---|---|---|
| Baseline, ADR N = 10 | 80.3 | 187.3 | 1.307 |
| 12 pages (storybook, cdn-smoke, adr), cap 48, 300 s | 13.1 | 189.8 | 1.013 |
| 12 pages + 48 random sub-pages of them (weight 0.5) | 16.7 | 182.1 | 0.991 |
| 12 pages + 206 one-component pages (weight 0.1) | 17.7 | 207.2 | 1.121 |
| All 42 pages (in-sample), 900 s | 7.7 | 156.5 | 0.821 |

## The ADR harness's four pages on the real builds (`measure.mjs`)

| Build | Search box | Typical search | Rich search | Commerce |
|---|---|---|---|---|
| Pre-ADR split-by-module, files | 65 | 162 | 225 | 196 |
| ADR N = 10, files | 29 | 73 | 131 | 107 |
| Solver (42 pages), files | 9 | 15 | 29 | 16 |
| ADR N = 10, modelled s | 0.79 | 1.21 | 1.91 | 1.53 |
| Solver (42 pages), modelled s | 0.66 | 0.89 | 1.28 | 0.95 |

The solver row comes from the 2026-10-31 build, whose map still grouped the externals; `MEASUREMENT.md` has the corrected builds and what the harness measured. The pre-ADR row reproduces the ADR's option A file counts exactly; the ADR measured 30/76/134/108 files for N = 10 on an earlier commit. Three of the four pages were not in the training set.
