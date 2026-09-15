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
- Document every symbol that is part of the package's public API with JSDoc. "Public" means anything re-exported from the entry point (`src/index.ts`) — functions, classes, interfaces, and types — **including symbols that are declared under `internal/` but re-exported through the public surface** (e.g. `Engine`, the generative `Turn`/`AgentResponse`/… types, `GenerativeUnifiedInterface`). Document their members too (methods, and non-trivial fields). Symbols that are *not* re-exported (internal-only) do not require JSDoc.
