# AI Audit Guide

The AI audit agent evaluates Storybook stories against 21 WCAG 2.2 criteria that axe-core cannot automate — visual layout, focus visibility, semantic text quality, colour contrast at scale, and more. It uses LLM vision analysis via the GitHub Models API.

## Prerequisites

- **Storybook running** at `http://localhost:6006` (start with `pnpm storybook` in `packages/atomic`)
- **`GITHUB_TOKEN`** environment variable — a GitHub PAT with `models` scope (Copilot access)

## Basic usage

```bash
# Audit all components and pages across all surfaces
node scripts/ai-wcag-audit.mjs

# Audit a specific surface
node scripts/ai-wcag-audit.mjs --surface search
node scripts/ai-wcag-audit.mjs --surface commerce

# Audit a single component
node scripts/ai-wcag-audit.mjs --component atomic-search-box

# Dry-run — show what would be audited without making LLM calls
node scripts/ai-wcag-audit.mjs --dry-run
node scripts/ai-wcag-audit.mjs --surface commerce --dry-run
```

## Auditing composite page stories

Page-level Storybook stories live in `packages/atomic/storybook-pages/` and represent fully assembled surfaces (search page, product listing page, etc.). The audit agent discovers and evaluates them alongside individual components.

Page story names follow the `{stem}-page` convention, matching the file stem of the story file.

### Available page stories

| Page name | Surface | Story file |
|---|---|---|
| `search-page` | `search` | `storybook-pages/search/search.new.stories.tsx` |
| `search-interaction-page` | `search` | `storybook-pages/search/search-interaction.new.stories.tsx` |
| `search-page` | `commerce` | `storybook-pages/commerce/search.new.stories.tsx` |
| `product-listing-page` | `commerce` | `storybook-pages/commerce/product-listing.new.stories.tsx` |
| `recommendation-page` | `commerce` | `storybook-pages/commerce/recommendation.new.stories.tsx` |
| `insight-page` | `insight` | `storybook-pages/insight/insight.new.stories.tsx` |
| `ipx-page` | `ipx` | `storybook-pages/ipx/ipx.new.stories.tsx` |
| `recommendations-page` | `recommendations` | `storybook-pages/recommendations/recommendations.new.stories.tsx` |

### Example commands

```bash
# Audit the Search surface page
node scripts/ai-wcag-audit.mjs --component search-page --surface search

# Audit the Commerce search page
# (--surface is required here — both search and commerce have a search-page)
node scripts/ai-wcag-audit.mjs --component search-page --surface commerce

# Audit the product listing page
node scripts/ai-wcag-audit.mjs --component product-listing-page --surface commerce

# Audit the search interaction page
node scripts/ai-wcag-audit.mjs --component search-interaction-page --surface search

# Audit all pages and components in the commerce surface
node scripts/ai-wcag-audit.mjs --surface commerce

# Dry-run first to confirm what will be audited
node scripts/ai-wcag-audit.mjs --component search-page --surface search --dry-run
```

> **Note**: Always use `--surface` when auditing `search-page` — both the `search` and `commerce` surfaces contain a story with that name. Without `--surface`, both will be audited.

## Options

| Option | Description | Default |
|---|---|---|
| `--surface <name>` | Surface to audit: `commerce`, `search`, `insight`, `ipx`, `recommendations`, `all` | `all` |
| `--component <name>` | Audit a single component or page by name (e.g., `atomic-commerce-facet`, `search-page`) | — |
| `--dry-run` | Show what would be audited without making LLM calls | — |
| `--resume` | Resume from a previous interrupted run | — |
| `--max-components <n>` | Maximum number of components/pages to audit | all |
| `--model <id>` | LLM model to use | `gpt-4o` |
| `--concurrency <n>` | Number of parallel LLM calls | `1` |
| `--log-steps` | Print detailed pipeline steps | — |
| `--save-captures` | Save screenshot captures to `a11y/reports/captures/` | — |
| `--verbose` | Print raw LLM responses (implies `--log-steps`) | — |

## Output

Delta files are written to `a11y/reports/deltas/`:

```
a11y/reports/deltas/delta-YYYY-MM-DD-ai-audit-<surface>.json
```

Each delta file contains the AI-evaluated WCAG results for all audited stories in that surface. To merge results into the main report:

```bash
# Validate a delta file
node scripts/manual-audit-delta.mjs validate a11y/reports/deltas/delta-2026-03-10-ai-audit-search.json

# Merge all deltas (dry-run first)
node scripts/manual-audit-delta.mjs merge --dry-run
node scripts/manual-audit-delta.mjs merge
```

## What gets evaluated

The AI agent evaluates 21 WCAG 2.2 criteria that axe-core cannot automate:

- Visual focus indicators (2.4.7, 2.4.11)
- Colour contrast for non-text elements (1.4.11)
- Target size (2.5.8)
- Consistent navigation and identification (3.2.3, 3.2.4)
- Semantic text quality — labels, instructions, error messages (1.3.5, 3.3.2, 3.3.3)
- Motion and animation (2.3.3)
- And more — see `src/audit/prompts.ts` for the full criteria list

Axe-core handles the remaining ~34 WCAG 2.2 AA criteria automatically via the Storybook reporter.
