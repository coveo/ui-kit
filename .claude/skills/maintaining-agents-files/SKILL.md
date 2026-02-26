---
name: maintaining-agents-files
description: Audits AGENTS.md files in the monorepo for accuracy by verifying Commands, Structure, Technology, Principles, and Boundaries sections against reality (filesystem, package.json). Use when asked to maintain, audit, verify, or update AGENTS.md files, or when checking if agent documentation is stale or out-of-date.
license: Apache-2.0
metadata:
  author: coveo
  version: "1.0"
---

# Maintaining AGENTS.md Files

## Process

### Step 1: Gather Facts

Run the script to collect ground-truth data for each AGENTS.md:

```bash
node .claude/skills/maintaining-agents-files/scripts/validate_agents_files.mjs
```

The script outputs, for each AGENTS.md:
- All `package.json` scripts
- All directories on disk (top-level, and packages/ for root)
- All dependency names and version specifiers
- Engine constraints and package manager version
- The full AGENTS.md content

Use `--json` for structured output.

### Step 2: Verify Each Section

For each AGENTS.md, compare the script output against the documented content. Check every section described below.

### Step 3: Report Findings

Present findings grouped by file and section. For each finding:

1. State the **fact** (what the AGENTS.md says vs. what reality shows)
2. Suggest a **minimal correction** (do not rewrite entire sections)
3. Flag **uncertainty** — if something may be intentionally omitted, say so

### Step 4: Wait for Human Decision

Do not apply changes. Present the report and wait for the human to decide.

---

## Expected Sections

### Root AGENTS.md

Must have: **Commands**, **Structure**, **Technology**, **Principles**, **Boundaries**.

### Package AGENTS.md

Must have: **Commands**, **Structure**, **Technology**, **Boundaries**.

Section headings in package files are prefixed with the package name (e.g., `## Atomic Package Commands`). Package-level Technology and Boundaries sections should reference the root file:
> "In addition to the {section} listed in the root `AGENTS.md` file..."

---

## Section Verification Rules

### Commands

**Format:** Bullet list. Each item: `- **Description**: \`command\``

**Check against script output:**
- Each documented command still exists in `package.json` scripts
- Command syntax is correct (`pnpm run X`, `npx X`, `pnpm turbo X --filter=...`)
- Essential scripts (`build`, `test`, `dev`, `lint:check`, `lint:fix`, `e2e`) present in `package.json` but missing from the section warrant a mention

**Not expected:** Listing every script. Only the most essential/frequently used.

### Structure

**Format:** Fenced code block containing an indented tree diagram with `├──`, `└──` connectors. Each entry has a brief `# comment` description.

**Check against script output:**
- Each listed directory actually exists on disk
- No listed directory has been renamed or removed
- Significant directories present on disk but absent from the tree — mention them, but they may be intentionally omitted
- Descriptions still match the directory's actual purpose (e.g., a description saying "Stencil components" for a package that migrated to Lit)

**Not expected:** Listing every directory. Only the most important for quick orientation, 1–2 levels deep.

### Technology

**Format:** Bullet list. Each item: `- **Category**: ToolName vN` where N is the **major** version only.

**Check against script output:**
- Each listed tool/library appears in `dependencies` or `devDependencies`
- Major version matches (compare `vN` against the version specifier in `package.json`)
- Runtime items (Node, pnpm) are checked against `engines` / `packageManager` fields instead
- Versions are fully resolved (including `catalog:` and `workspace:*`) — compare directly

**Not expected:** Listing every dependency. Only core/defining technology. No minor/patch versions.

### Principles

**Format:** Two labeled groups: **Favor** (bullet list) and **Avoid** (bullet list), separated by `---`.

**Check:** Section exists, both groups present. Do not evaluate whether principles are "correct" — they are human-authored values.

### Boundaries

**Format:** Three labeled groups: **You must ALWAYS**, **You must ASK BEFORE**, **You must NEVER**, separated by `---`.

**Check against script output:**
- All three groups present
- File paths referenced in rules actually exist on disk (e.g., `packages/atomic/rollup.config.js`)
- No obviously stale file references

**Not expected:** Evaluating whether boundaries are reasonable.

---

## General Constraints

- Each AGENTS.md should be **under 200 lines**
- Written for AI agents — concise, scannable, not prose
- Package files reference the root for shared context, not duplicate it

## Scripts

| Script | Purpose |
|--------|---------|
| `validate_agents_files.mjs` | Gathers ground-truth data (scripts, dirs, deps, content) for each AGENTS.md |
