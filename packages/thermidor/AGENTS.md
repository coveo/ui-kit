## Headless Future AGENTS.md

The thermidor package is private, under active development, and not used
outside of this monorepo.

Therefore some instructions from the root `AGENTS.md` don't apply when working
in this package. Namely, you do **NOT** have to:

- Add a changeset file when modifying the source code
- Use the Conventional Commits 1.0.0 specification when composing a commit message
- Ask before introducing a potentially breaking change

## Boundaries

**You must ALWAYS**:

- Ensure that any architectural changes you suggest or make satisfy the requirements of `thermidor/docs/internal/adr/ADR-000-architecture-decision-charter.md`.
