# Skill Authoring Best Practices

> Adapted from the [Agent Skills Best Practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices.md)

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

Skills follow the [open standard](https://agentskills.io) for agent capabilities, making them **portable across multiple AI agents**:

**Supported platforms:**
- VS Code Copilot (via `.github/skills/`)
- GitHub Copilot CLI
- Claude Desktop
- Other agents implementing the Agent Skills standard

**What portability means:**
- Same skill can be used across different AI coding assistants
- Agents discover skills based on `description` field
- Skills load when relevant to agent's current task
- No platform-specific code or configuration needed

**VS Code Integration:**
- Skills stored in `.github/skills/` for workspace-level access
- Or in user profile directory for personal skills
- Automatically discovered by VS Code Copilot agents
- See [VS Code Agent Skills docs](https://code.visualstudio.com/docs/copilot/customization/agent-skills)

**Key benefits:**
- Write once, use across multiple platforms
- Share skills across teams and projects
- Not locked into single AI platform
- Future-proof as more agents adopt the standard

This portability is what differentiates skills from VS Code-specific artifacts like instructions, prompts, and agents.
