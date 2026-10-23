# Eval results

Run with `pnpm eval` (`evals/run.mjs`): ten page-building prompts, three contexts, three runs each, `claude-sonnet-5-5`. A run passes when the usage-snippet lint accepts the `index.html` the agent wrote and Chromium renders items from the mocked platform API without an `atomic-component-error`.

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
