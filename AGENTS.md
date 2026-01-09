# AGENTS.md

Operational commands and conventions for coding agents working in the Coveo UI-Kit monorepo.

## About This Document

This guide is for AI coding agents working in this repository. Different tools may handle features like instructions differently, but all the commands and workflows here are universal.

Instructions (`.github/instructions/*.instructions.md`) use `applyTo` frontmatter to specify which files they apply to (e.g., `applyTo: '**/*.ts'`). Some tools auto-apply these, others require explicit reference.

## Quick Build & Test

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Test specific package
cd packages/atomic && pnpm test:lit
cd packages/headless && pnpm test

# E2E tests
cd packages/atomic && pnpm e2e

# Fix linting
pnpm lint:fix
```

## Repository Structure

```
ui-kit/
├── packages/
│   ├── atomic/          # UI components (Lit/Stencil)
│   ├── headless/        # Headless search library
│   ├── quantic/         # Salesforce Lightning components
│   └── headless-react/  # React bindings
└── .github/
    ├── instructions/    # Coding standards by file type (see Instructions System below)
    ├── agents/          # Custom agent definitions
    ├── prompts/         # Reusable task workflows
    └── skills/          # Agent capabilities
```

## Technology Stack

- **TypeScript** - Check `package.json` for current version
- **Build System** - Turbo (monorepo) + package-specific builds
- **Package Manager** - pnpm with workspaces
- **Testing** - Vitest (unit), Playwright (E2E)
- **UI Frameworks** - Lit (preferred), Stencil (legacy, migrating away)

## Instructions System

Coding standards are in `.github/instructions/*.instructions.md`. Each file has `applyTo` frontmatter specifying which files it covers (e.g., `applyTo: '**/*.ts'`).

**Reference the appropriate instruction file when working on:**
- Any file: `general.instructions.md` - Core development principles
- TypeScript files: `general.typescript.instructions.md` - TypeScript conventions
- Atomic package: `atomic.instructions.md` - Component patterns and structure
- Atomic tests: `tests-atomic.instructions.md` - Vitest testing patterns
- E2E tests: `playwright-typescript.instructions.md` - Playwright conventions
- Any UI work: `a11y.instructions.md` - WCAG 2.2 Level AA compliance
- API mocking: `msw-api-mocking.instructions.md` - MSW patterns

## Common Workflows

### Package-Specific Commands

```bash
# Atomic package
cd packages/atomic
pnpm build:stencil-lit   # Build
pnpm test:lit            # Unit tests (Lit components)
pnpm e2e                 # E2E tests
pnpm storybook           # Dev server

# Headless package
cd packages/headless
pnpm build
pnpm test
```

### Stencil → Lit Migrations

```bash
# Use the migration agent or prompts
# PR template: .github/PULL_REQUEST_TEMPLATE/atomic-stencil-lit-migration.md
# Follow: atomic.instructions.md conventions
# Generate tests with: generate-vitest-tests-atomic-lit-components.prompt.md
```

## PR Standards

**Title format:** `type(scope): description`
- Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`
- Prefix `WIP:` while in progress
- Example: `feat(atomic): add search box component`

**Description:**
- Include `Fixes #Issue_number` when addressing issues
- Use PR templates when available (e.g., Stencil → Lit migrations)

**Before committing:**
- Run `pnpm lint:fix` (required)
- Run `pnpm build` (required)
- Run `pnpm test` for affected packages

## Common Gotchas

- **Package names:** Check `packages/*/package.json` `name` field, not top-level package.json
- **Build failures:** If tests pass locally but fail in CI, check Turbo cache with `pnpm build --force`
- **Coding standards:** See `.github/instructions/*.instructions.md` for detailed rules (type safety, path aliases, testing, accessibility, resource cleanup, etc.)

## For Detailed Documentation

- **Human contributors:** See [README.md](../README.md) for project overview and contribution guidelines
- **Agents, prompts, skills:** Available in `.github/agents/`, `.github/prompts/`, and `.github/skills/`
- **Coding standards:** See `.github/instructions/*.instructions.md`

