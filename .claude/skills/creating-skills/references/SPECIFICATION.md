# Agent Skills Specification

> Source: [agentskills.io/specification](https://agentskills.io/specification)

This document defines the Agent Skills format - an open standard for extending AI agent capabilities.

## Directory Structure

A skill is a directory containing at minimum a `SKILL.md` file:

```
skill-name/
├── SKILL.md          # Required: YAML frontmatter + markdown instructions
├── scripts/          # Optional: Executable code agents can run
├── references/       # Optional: Additional documentation loaded on demand
└── assets/           # Optional: Static resources (templates, schemas)
```

## SKILL.md Format

### Frontmatter (Required)

```yaml
---
name: skill-name
description: A description of what this skill does and when to use it.
---
```

With optional fields:

```yaml
---
name: pdf-processing
description: Extract text and tables from PDF files, fill forms, merge documents. Use when working with PDF files or when the user mentions PDFs, forms, or document extraction.
license: Apache-2.0
compatibility: Requires git, docker, and network access
allowed-tools: Bash(git:*) Bash(jq:*) Read
metadata:
  author: example-org
  version: "1.0"
---
```

### Field Reference

| Field | Required | Constraints |
|-------|----------|-------------|
| `name` | Yes | Max 64 chars. Lowercase letters, numbers, hyphens only. Must not start/end with hyphen. No consecutive hyphens. Must match folder name. |
| `description` | Yes | Max 1024 chars. Non-empty. Describes what AND when to use. |
| `license` | No | License name or reference to bundled LICENSE file. |
| `compatibility` | No | Max 500 chars. Environment requirements (product, packages, network). |
| `allowed-tools` | No | Space-delimited list of pre-approved tools. (Experimental) |
| `metadata` | No | Arbitrary key-value mapping for additional context. |

### Name Field Rules

Valid examples:
```yaml
name: pdf-processing
name: data-analysis
name: code-review
```

Invalid examples:
```yaml
name: PDF-Processing    # uppercase not allowed
name: -pdf              # cannot start with hyphen
name: pdf--processing   # consecutive hyphens not allowed
name: pdf_processing    # underscores not allowed
```

### Description Field Guidelines

The description is critical for skill discovery. Agents use it to choose the right skill from potentially 100+ available skills.

**Must include:**
1. What the skill does
2. When to use it (triggers/contexts)

**Write in third person** - descriptions are injected into system prompts.

Good example:
```yaml
description: Extracts text and tables from PDF files, fills forms, and merges documents. Use when working with PDF files or when the user mentions PDFs, forms, or document extraction.
```

Poor examples:
```yaml
description: Helps with PDFs.                    # Too vague
description: I can help you process Excel files  # Wrong POV
description: You can use this to process files   # Wrong POV
```

### Body Content

The Markdown body after frontmatter contains skill instructions. No format restrictions - write whatever helps agents perform the task effectively.

Recommended sections:
- Step-by-step instructions
- Examples of inputs and outputs
- Common edge cases

## Optional Directories

### scripts/

Contains executable code that agents can run. Scripts should:
- Be self-contained or clearly document dependencies
- Include helpful error messages
- Handle edge cases gracefully

### references/

Contains additional documentation loaded on demand:
- `REFERENCE.md` - Detailed technical reference
- Domain-specific files (`finance.md`, `legal.md`, etc.)

Keep files focused. Agents load these on demand, so smaller files mean less context usage.

### assets/

Contains static resources:
- Templates (document templates, configuration templates)
- Images (diagrams, examples)
- Data files (lookup tables, schemas)

## Progressive Disclosure

Skills should be structured for efficient context usage:

1. **Metadata** (~100 tokens): `name` and `description` loaded at startup for all skills
2. **Instructions** (< 5000 tokens): Full `SKILL.md` body loaded when skill is activated
3. **Resources** (as needed): Files in `scripts/`, `references/`, `assets/` loaded only when required

**Keep `SKILL.md` under 500 lines.** Move detailed reference material to separate files.

## File References

When referencing other files, use relative paths from skill root:

```markdown
See [the reference guide](references/REFERENCE.md) for details.

Run the extraction script:
scripts/extract.py
```

**Keep file references one level deep from SKILL.md.** Avoid deeply nested reference chains.

## Validation

Validate skills using the skills-ref reference library:

```bash
skills-ref validate ./my-skill
```

Or use the built-in validation in this skill:

```bash
node <skills-dir>/creating-skills/scripts/quick_validate.mjs <skills-dir>/my-skill
```

---

*For the full specification and updates, see [agentskills.io](https://agentskills.io/llms.txt)*
