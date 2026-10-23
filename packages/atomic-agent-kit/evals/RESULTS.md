# Eval results

Run with `pnpm eval` (`evals/run.mjs`): ten page-building prompts, three runs each per context, `claude-sonnet-5-5`. A run passes when the usage-snippet lint accepts the `index.html` the agent wrote and Chromium renders items from the mocked platform API without an `atomic-component-error`.

## 2026-10-23: discovery and reach

180 runs, six contexts, Claude Code 2.1.284, $24.47 in all. The project contexts install `@coveo/atomic` 3.64.0 from npm. `project`, `pointer` and `skill-cli` add the kit to that installed package, the way the POC ships it. Their prompts don't name Atomic or its CDN URLs; they only say to use the UI component library the project depends on. `web` uses the original prompts with web search and fetch allowed.

| Context                                                               | Pass             | Read the kit               | Read the type declarations | Median time | Median turns | Median cost |
| --------------------------------------------------------------------- | ---------------- | -------------------------- | -------------------------- | ----------- | ------------ | ----------- |
| `none`: empty folder, prompt names Atomic                             | **67%** (20/30)  | –                          | –                          | 14 s        | 2            | $0.08       |
| `web`: the same, web search and fetch allowed                         | **73%** (22/30)  | –                          | –                          | 13 s        | 2            | $0.08       |
| `project-today`: a project with the published package, neutral prompt | **93%** (28/30)  | –                          | 26/30                      | 24 s        | 10           | $0.16       |
| `project`: the same, with the kit inside the package                  | **90%** (27/30)  | 2/30                       | 24/30                      | 22 s        | 9            | $0.15       |
| `pointer`: the same, plus the `AGENTS.md` pointer                     | **100%** (30/30) | 30/30                      | 0/30                       | 18 s        | 6            | $0.16       |
| `skill-cli`: the same, with the kit installed by `npx skills add`     | **100%** (30/30) | 30/30, skill invoked 30/30 | 0/30                       | 18 s        | 7            | $0.15       |

| Prompt                   | none | web | project-today | project | pointer | skill-cli |
| ------------------------ | ---- | --- | ------------- | ------- | ------- | --------- |
| search-basic             | 3/3  | 3/3 | 3/3           | 3/3     | 3/3     | 3/3       |
| search-facets            | 3/3  | 3/3 | 3/3           | 2/3     | 3/3     | 3/3       |
| search-table             | 3/3  | 2/3 | 3/3           | 3/3     | 3/3     | 3/3       |
| search-conditional       | 3/3  | 3/3 | 3/3           | 3/3     | 3/3     | 3/3       |
| search-instant           | 3/3  | 3/3 | 3/3           | 3/3     | 3/3     | 3/3       |
| search-tabs              | 1/3  | 1/3 | 2/3           | 2/3     | 3/3     | 3/3       |
| commerce-search          | 1/3  | 3/3 | 3/3           | 3/3     | 3/3     | 3/3       |
| commerce-listing         | 2/3  | 3/3 | 3/3           | 3/3     | 3/3     | 3/3       |
| commerce-recommendations | 0/3  | 0/3 | 2/3           | 2/3     | 3/3     | 3/3       |
| recommendations          | 1/3  | 1/3 | 3/3           | 3/3     | 3/3     | 3/3       |

What the runs show:

- With web search and fetch allowed, the agent never used them: no search and no fetch in 30 runs. Its pass rate is not distinguishable from no context (p = 0.78). The prompts already named Atomic and its CDN URLs, which may be why it didn't look anything up.
- In a project, the agent reads the installed package before writing. With the package as published, it read the TypeScript declarations in 26 of 30 runs and passed 28 of 30. No agent in any context read `custom-elements.json`.
- The kit inside the package, with nothing pointing at it, was read in 2 of 30 runs and changed nothing (27 of 30 against 28 of 30).
- A pointer or a CLI-installed skill got the kit read in every run, even though the prompt didn't name Atomic. Together they passed 60 of 60, in fewer turns. That's ahead of the kit with no pointer (p = 0.035), but not distinguishable from the published package alone (p = 0.11).
- Four project pages without the kit loaded Atomic from `static.cdn.coveo.com`, a host that doesn't exist. The kit gives the real CDN URL.
- `none` scored 20 of 30 again, as on 2026-10-22.

Limits: one agent and one model, 30 runs per context. The neutral prompts still use Coveo terms (organization id, commerce context). The kit comes from this branch, while the installed package is 3.64.0. The pointer wording is ours. A six-run smoke test before the run cost $1.24.

## 2026-10-22

The `none` row comes from a first run, reused unchanged. The `skill` and `index` rows come from a second run, made after the kit fix described in [Between the two runs](#between-the-two-runs).

| Context                                                          | Lint | Render | Pass     | Skill or docs used | Median cost | Median time | Median turns |
| ---------------------------------------------------------------- | ---- | ------ | -------- | ------------------ | ----------- | ----------- | ------------ |
| none: the model and the prompt                                   | 80%  | 83%    | **67%**  | –                  | $0.08       | 14 s        | 2            |
| skill: the kit as a project skill                                | 100% | 100%   | **100%** | 100%               | $0.16       | 16 s        | 7            |
| index: an `AGENTS.md` docs index pointing at the reference pages | 97%  | 100%   | **97%**  | 100%               | $0.23       | 20 s        | 10           |

| Prompt                   | none | skill | index |
| ------------------------ | ---- | ----- | ----- |
| search-basic             | 3/3  | 3/3   | 3/3   |
| search-facets            | 3/3  | 3/3   | 3/3   |
| search-table             | 3/3  | 3/3   | 3/3   |
| search-conditional       | 3/3  | 3/3   | 3/3   |
| search-instant           | 3/3  | 3/3   | 3/3   |
| search-tabs              | 1/3  | 3/3   | 2/3   |
| commerce-search          | 2/3  | 3/3   | 3/3   |
| commerce-listing         | 1/3  | 3/3   | 3/3   |
| commerce-recommendations | 0/3  | 3/3   | 3/3   |
| recommendations          | 1/3  | 3/3   | 3/3   |

Without context, the model invents attributes (`is-active` on `atomic-tab`, `property` on `atomic-product-image`, `recommendation` on `atomic-recs-interface`), uses the deprecated `language` attribute of the commerce interface, calls `initialize()` on `atomic-commerce-recommendation-interface`, which has none, and sets `number-of-recommendations-per-page` above its maximum of 4. The one `index` failure put a `section="tabs"` on `atomic-layout-section`.

### Between the two runs

The first run scored 20/30 for `none`, 23/30 for `skill` and 11/30 for `index`. Its three `search-basic` run-1 results come from a smoke test started just before, with the same kit. The account's session limit cut the `index` context short, so that context was discarded.

- Six of the seven `skill` failures were `commerce-search` and `commerce-listing` pages without the `analytics.trackingId` that `atomic-commerce-interface` requires, because the kit's commerce text left it out. The seventh imported `getOrganizationEndpoints`, which the Headless CDN bundle doesn't export.
- The fix added `analytics: {trackingId}`, marked as required, to `SKILL.md` and the commerce page, and a worked example of the engine-only `atomic-commerce-recommendation-interface`.
- The second run re-ran `skill` and `index` from scratch. The 30 `none` results were copied into its output folder, and the harness skips any run that already has a `result.json`. That context never sees the kit.

The fix came from failures on the same prompts that then measured it, so read the 100% as "after fixing what this eval found".

### Cost

The 90 runs in the table cost $13.83: `none` $2.43, `skill` $4.65 and `index` $6.74, each rounded. The whole experiment cost $20.52: $9.13 for the first run, smoke test included, and $11.39 for the 60 new runs of the second. These are the CLI's estimates at API list prices; the runs used a subscription.
