# Prompt Execution Summaries

This directory contains execution summaries that are automatically generated when workspace prompts complete. These summaries help optimize and improve our workspace prompt files over time.

## Purpose

Execution summaries provide structured feedback about:
- What worked well during prompt execution
- What didn't work as expected
- Opportunities for prompt optimization

This feedback is used by the "Prompt Engineer" agent to iteratively improve prompt quality.

## File Format

Files follow this naming convention:
```
[prompt-name]-[timestamp].prompt-execution.md
```

**Example:**
```
generate-vitest-tests-atomic-utils-2025-10-14T14-30-00.prompt-execution.md
```

## Workflow

### 1. Automatic Generation
When a workspace prompt completes, an execution summary is automatically created in this directory.

### 2. Developer Action
**Commit and push** the generated execution summary file to share feedback with the team.

### 3. Review & Optimization
Periodically, a DX UI team maintainer will:
1. Review accumulated execution summaries
2. Feed each summary to the Prompt Engineer agent
3. Ask the Prompt Engineer to evaluate whether prompt improvements are needed
4. Apply suggested optimizations to the original prompt files

### 4. Cleanup
Once processed, the maintainer deletes the execution summary file.

## Benefits

- **Continuous improvement** of workspace prompts based on real usage
- **Data-driven optimization** using actual execution outcomes
- **Knowledge sharing** across the team about what works well
