# Output Patterns

When a skill needs consistent output formatting, use one of these patterns.

## Pattern 1: Template

Define the expected structure. Use `[placeholder]` for variable content.

<example name="strict-template">
ALWAYS use this structure for test files:

  import {describe, it, expect} from 'vitest';

  describe('[component-name]', () => {
    it('should [behavior] when [condition]', async () => {
      // Test implementation
    });
  });
</example>

<example name="flexible-template">
Use this structure, adapting sections as needed:

  # [Title]
  ## Summary - [brief overview]
  ## Details - [expand based on findings]
  ## Recommendations - [actionable next steps]
</example>

**When to use:** Code generation, reports, structured documents.

## Pattern 2: Input/Output Examples

Show transformation pairs. Include 2-3 examples covering common variations.

<example name="naming-convention">
INPUT: Test that clicking the button opens the modal
OUTPUT: it('should open modal when button is clicked', ...)

INPUT: Test that empty results show the no-results message  
OUTPUT: it('should display no-results message when results are empty', ...)

INPUT: Test keyboard navigation
OUTPUT: it('should focus next item when ArrowDown is pressed', ...)

Pattern: should [behavior] when [condition]
</example>

**When to use:** Naming conventions, text transformations, format conversions.

## Pattern 3: Structured Data

Define a schema for machine-readable output.

<example name="json-schema">
Output JSON with this structure:

  {
    "component": "string - component name",
    "status": "completed | in-progress | blocked",
    "files": {
      "created": ["list of new files"],
      "modified": ["list of changed files"],
      "deleted": ["list of removed files"]
    },
    "issues": [
      {"severity": "error | warning", "message": "description", "file": "path"}
    ]
  }
</example>

**When to use:** Reports consumed by scripts, CI integration, cross-tool communication.

## Choosing a Pattern

| Output Type | Pattern | Example Use |
|-------------|---------|-------------|
| Code files | Template | Component scaffolding |
| Text conventions | Input/Output | Naming, commit messages |
| Machine-readable | Structured Data | Migration reports, audits |
| Mixed/flexible | Template + examples | Documentation generation |
