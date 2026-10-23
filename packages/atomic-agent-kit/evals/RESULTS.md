# Eval results

Run with `pnpm eval` (`evals/run.mjs`): ten page-building prompts, three contexts, three runs each, `claude-sonnet-5-5`. A run passes when the usage-snippet lint accepts the `index.html` the agent wrote and Chromium renders items from the mocked platform API without an `atomic-component-error`.

## 2026-10-22

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

The eval also corrected the kit: a first run of the skill context passed 77% because the commerce text omitted `analytics: {trackingId}`, which `atomic-commerce-interface` requires, and gave no example for the engine-only recommendation interface. Both were added before the run above.

The 90 runs cost about $14, around $0.15 per run.
