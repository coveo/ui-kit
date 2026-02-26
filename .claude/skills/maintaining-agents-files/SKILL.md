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

### Step 1: Discover AGENTS.md Files

```bash
find . -name AGENTS.md -not -path '*/node_modules/*'
```

### Step 2: Gather Facts for Each File

For each AGENTS.md, collect ground-truth data from the sources below. Only fetch what you need per section — no need to gather everything upfront.

#### Data Sources

| What you need | How to get it |
|---|---|
| Scripts in package.json | Read the `scripts` keys from `package.json` in the same directory |
| Directories on disk | List `ls` the directory (ignore `node_modules`, `dist`, `.git`, `.turbo`, `coverage`) |
| Packages in monorepo | `ls packages/` from the repo root |
| Dependency versions (resolved) | `pnpm list --depth=0 --json` in the package directory (resolves `catalog:` and `workspace:*`) |
| Node/pnpm version constraints | Read `engines` and `packageManager` fields from `package.json` |
| File existence (for Boundaries) | Check if referenced paths exist on disk |

### Step 3: Verify Each Section

For each AGENTS.md, compare gathered facts against the documented content. Check every section using the rules below.

### Step 4: Report Findings

Present findings grouped by file and section. For each finding:

1. State the **fact** (what the AGENTS.md says vs. what reality shows)
2. Suggest a **minimal correction** (do not rewrite entire sections)
3. Flag **uncertainty** — if something may be intentionally omitted, say so

### Step 5: Wait for Human Decision

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

**Verify:**
- Each documented command still exists in `package.json` scripts
- Command syntax is correct (`pnpm run X`, `npx X`, `pnpm turbo X --filter=...`)
- Essential scripts (`build`, `test`, `dev`, `lint:check`, `lint:fix`, `e2e`) present in `package.json` but missing from the section warrant a mention

**Not expected:** Listing every script. Only the most essential/frequently used.

### Structure

**Format:** Fenced code block containing an indented tree diagram with `├──`, `└──` connectors. Each entry has a brief `# comment` description.

**Verify:**
- Each listed directory actually exists on disk
- No listed directory has been renamed or removed
- Significant directories present on disk but absent from the tree — mention them, but they may be intentionally omitted
- Descriptions still match the directory's actual purpose (e.g., a description saying "Stencil components" for a package that migrated to Lit)

**Not expected:** Listing every directory. Only the most important for quick orientation, 1–2 levels deep.

### Technology

**Format:** Bullet list. Each item: `- **Category**: ToolName vN` where N is the **major** version only.

**Verify:**
- Each listed tool/library appears in `dependencies` or `devDependencies`
- Major version matches (use `pnpm list --depth=0 --json` for fully resolved versions including `catalog:` and `workspace:*`)
- Runtime items (Node, pnpm) are checked against `engines` / `packageManager` fields instead

**Not expected:** Listing every dependency. Only core/defining technology. No minor/patch versions.

### Principles

**Format:** Two labeled groups: **Favor** (bullet list) and **Avoid** (bullet list), separated by `---`.

**Verify:** Section exists, both groups present. Do not evaluate whether principles are "correct" — they are human-authored values.

### Boundaries

**Format:** Three labeled groups: **You must ALWAYS**, **You must ASK BEFORE**, **You must NEVER**, separated by `---`.

**Verify:**
- All three groups present
- File paths referenced in rules actually exist on disk
- No obviously stale file references

**Not expected:** Evaluating whether boundaries are reasonable.

---

## General Constraints

- Each AGENTS.md should be **under 200 lines**
- Written for AI agents — concise, scannable, not prose
- Package files reference the root for shared context, not duplicate it
