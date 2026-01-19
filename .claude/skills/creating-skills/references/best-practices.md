# Skill Authoring Best Practices

> Adapted from multiple sources including the [Agent Skills open standard](https://agentskills.io), [Claude's Agent Skills documentation](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices.md), and [VS Code Copilot Skills documentation](https://code.visualstudio.com/docs/copilot/customization/agent-skills). These practices are tool-agnostic and apply to any AI agent implementing the Agent Skills standard.

## Core Principles

### Write for agents, not humans

Skills are primarily consumed by AI agents. Focus on clarity and actionability rather than prose.

### Match instruction detail to task complexity

| Situation | Guidance Level |
|-----------|----------------|
| Minefield with hidden hazards | High detail, explicit steps, exact sequence |
| Open field with no hazards | General direction, trust agent to find best route |

### Test with multiple models

Skills effectiveness depends on the underlying model:
- **Smaller/faster models**: Need more guidance
- **Balanced models**: Moderate detail works well
- **Larger/reasoning models**: Avoid over-explaining

## Naming Conventions

Use **gerund form** (verb + -ing) for skill names - this clearly describes the activity or capability.

**Good examples:**
- `processing-pdfs`
- `analyzing-spreadsheets`
- `managing-databases`
- `testing-code`
- `writing-documentation`

**Acceptable alternatives:**
- Noun phrases: `pdf-processing`, `spreadsheet-analysis`
- Action-oriented: `process-pdfs`, `analyze-spreadsheets`

**Avoid:**
- Vague names: `helper`, `utils`, `tools`
- Overly generic: `documents`, `data`, `files`
- Inconsistent patterns within your skill collection

## Writing Effective Descriptions

### Always write in third person

The description is injected into the system prompt. Inconsistent point-of-view causes discovery problems.

```yaml
# Good
description: Processes Excel files and generates reports

# Avoid
description: I can help you process Excel files
description: You can use this to process Excel files
```

### Include what AND when

Every description must explain:
1. **What** the skill does
2. **When** to use it (triggers, contexts, keywords)

```yaml
# Good
description: Extract text and tables from PDF files, fill forms, merge documents. Use when working with PDF files or when the user mentions PDFs, forms, or document extraction.

# Poor
description: Helps with documents
```

## Progressive Disclosure Patterns

### SKILL.md should contain only always-useful information

**Core principle:** If removing a section wouldn't hurt daily usage, move it to references.

**Keep in SKILL.md:**
- Critical constraints and gotchas (⚠️ warnings)
- High-level pattern overviews
- Essential best practices
- Links to references

**Move to references:**
- Full code examples → `references/examples.md` or `references/queries.md`
- Detailed step-by-step workflows → `references/workflows.md`
- Statistics, schemas, API docs → `references/schema.md` or `references/api.md`
- Real-world walkthroughs → `references/walkthrough-*.md`

**Example transformation:**

Before (bloated SKILL.md):
```markdown
## Pattern 1: Component Dependencies
[Full 20-line Cypher query example]

## Pattern 2: Action Flow
[Another full query example]

## Workflows
1. Find components
2. Query controllers
3. Aggregate results
[10 more detailed steps...]

## Statistics
- 7,799 nodes across 8 types
- 335 components...
```

After (lean SKILL.md):
```markdown
## Critical Constraints
⚠️ Always use PascalCase class names
⚠️ Break 3+ hop chains into sequential queries

## Query Patterns
- Component dependencies
- Action flow
- Test coverage

**Full examples:** See [queries.md](./references/queries.md)
**Workflows:** See [workflows.md](./references/workflows.md)
**Schema:** See [schema.md](./references/schema.md)
```

**Result:** SKILL.md reduced from ~200 lines to ~60 lines while maintaining effectiveness.

### Frontmatter vs Body separation

**Description frontmatter** = "what" and "when to use" (comprehensive triggers)
**SKILL.md body** = "how" and critical constraints
**No duplication** between them

```yaml
# Good
description: Query knowledge graph for component dependencies. Use when analyzing components, controllers, or when user asks "what uses X".
```

Body starts with HOW, not repeating WHAT/WHEN.

### Pattern 1: High-level guide with references

```markdown
# PDF Processing

## Quick start
[Basic usage here]

## Advanced features
**Form filling**: See [FORMS.md](FORMS.md) for complete guide
**API reference**: See [REFERENCE.md](REFERENCE.md) for all methods
```

### Pattern 2: Domain-specific organization

```
bigquery-skill/
├── SKILL.md (overview and navigation)
└── reference/
    ├── finance.md (revenue, billing)
    ├── sales.md (opportunities, pipeline)
    └── product.md (API usage, features)
```

### Pattern 3: Conditional details

```markdown
## Editing documents

For simple edits, modify the XML directly.

**For tracked changes**: See [REDLINING.md](REDLINING.md)
**For OOXML details**: See [OOXML.md](OOXML.md)
```

## Reference File Guidelines

### Keep references one level deep

Agents may partially read files referenced from other referenced files.

**Bad (too deep):**
```
SKILL.md → advanced.md → details.md → actual-info.md
```

**Good (one level):**
```
SKILL.md → advanced.md
SKILL.md → reference.md
SKILL.md → examples.md
```

### Structure longer files with TOC

For files over 100 lines, include a table of contents at the top:

```markdown
# API Reference

## Contents
- Authentication and setup
- Core methods (create, read, update, delete)
- Advanced features
- Error handling
- Code examples

## Authentication and setup
...
```

## Scripts Best Practices

### Make scripts solve problems

Write utility scripts rather than asking the agent to generate code:

```markdown
# Good
Run `scripts/analyze_form.mjs` to extract fields

# Avoid
Write a script to extract form fields...
```

### Clear execution intent

Distinguish between executing and reading:

```markdown
# Execute (most common)
Run `scripts/analyze_form.mjs` to extract fields

# Read as reference
See `scripts/analyze_form.mjs` for the extraction algorithm
```

### Document dependencies

If scripts require packages not in the project, document them:

```markdown
**Requirements**: `npm install pdf-parse`
```

```javascript
import pdfParse from 'pdf-parse';
```

## Verification Patterns

### Plan-validate-execute

For complex operations, add intermediate validation:

1. Analyze → Create plan file
2. Validate plan with script
3. Execute → Verify results

This catches errors before changes are applied.

### Make validation verbose

```markdown
# Bad
Error: Invalid field

# Good
Error: Field 'signature_date' not found. Available fields: customer_name, order_total, signature_date_signed
```

## Quality Checklist

### Core quality
- [ ] Description is specific with key terms
- [ ] Description includes what AND when
- [ ] SKILL.md body under 500 lines
- [ ] Additional details in separate files
- [ ] Consistent terminology throughout
- [ ] Examples are concrete, not abstract
- [ ] File references one level deep
- [ ] Workflows have clear steps

### Code and scripts
- [ ] Scripts solve problems (not punt to agent)
- [ ] Error handling is explicit and helpful
- [ ] Required packages listed and verified
- [ ] All paths use forward slashes
- [ ] Validation steps for critical operations

### Testing
- [ ] Tested with real usage scenarios
- [ ] Works across different models if needed

## Portability and Open Standard

Skills follow the [Agent Skills open standard](https://agentskills.io) for agent capabilities, making them **portable across multiple AI tools**:

**Example platforms that support Agent Skills:**
- GitHub Copilot (in VS Code and other editors)
- Claude Desktop and Claude Code
- OpenCode CLI
- Other tools implementing the Agent Skills standard

**What portability means:**
- Same skill works across different AI coding assistants
- Agents discover skills based on `description` field and trigger keywords
- Skills load automatically when relevant to the agent's current task
- No tool-specific code or configuration needed
- Skills are just directories with standard structure (SKILL.md + optional resources)

**Standard skill locations:**
- `.claude/skills/` - Workspace-level (recommended for local development)
- `.skills/` or `skills/` - Alternative workspace conventions
- `~/.claude/skills/` or `~/.skills/` - User-level (personal skills)
- Remote registries - For shared/public skills

**Discovery precedence** (implementation may vary by tool):
1. Workspace-level skills (project-specific)
2. Repository skills folders
3. User-level skills (personal)
4. Remote/registry skills (if supported)

**Key benefits:**
- Write once, use across multiple AI tools
- Share skills across teams and projects
- Not locked into a single AI platform or vendor
- Future-proof as more tools adopt the standard

**Platform-specific examples:**

*GitHub Copilot (VS Code)*: Typically uses `.github/skills/` for workspace-level discovery. See [VS Code Agent Skills docs](https://code.visualstudio.com/docs/copilot/customization/agent-skills).

*Claude Desktop*: Uses `.claude/skills/` convention. Skills portable with other Claude tools.

*OpenCode*: Supports `.claude/skills/` for maximum cross-tool compatibility.

This portability is what differentiates skills from tool-specific artifacts like IDE-specific instructions, prompts, or editor extensions.
