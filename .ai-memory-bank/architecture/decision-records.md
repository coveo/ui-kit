# Decision Records

This directory tracks important architectural and technical decisions made in the UI Kit project. Each decision record follows the Architectural Decision Record (ADR) format.

## Format

Each decision record should include:

- **Date**: When the decision was made
- **Status**: proposed, accepted, deprecated, superseded
- **Context**: The situation that prompted the decision
- **Decision**: What was decided
- **Consequences**: The implications of the decision

## Existing Decision Records

### Quantic Decisions

- [Testing Strategy for Quantic](../../packages/quantic/decisions/0001-testing-strategy.md)

## How to Add New Decision Records

1. Create a new file in the appropriate package's `decisions/` directory
2. Use the format: `NNNN-title-in-kebab-case.md`
3. Follow the template structure
4. Update this index when adding new records

## Template

```markdown
# Decision Record: [Title]

- **Date**: YYYY-MM-DD
- **Status**: [proposed/accepted/deprecated/superseded]

## Context

[Describe the situation that prompted this decision]

## Decision

[Describe what was decided]

## Consequences

[Describe the implications of this decision]
```
