# AGENTS.md

Operational commands and conventions for coding agents working in the Coveo UI-Kit monorepo.

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

## Navigation Tips

```bash
# Find package location (faster than ls/cd)
pnpm dlx turbo run where atomic
pnpm dlx turbo run where headless

# List all packages
ls packages/

# Check package name (use this, not top-level package.json)
cat packages/atomic/package.json | grep '"name"'
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
    ├── instructions/    # Auto-applied coding standards (see below)
    ├── agents/          # Custom VS Code Copilot agents (auto-discovered)
    ├── prompts/         # Reusable task workflows (auto-discovered)
    └── skills/          # Agent Skills (auto-discovered)
```

## Technology Stack

- **TypeScript** - Check `package.json` for current version
- **Build System** - Turbo (monorepo) + package-specific builds
- **Package Manager** - pnpm with workspaces
- **Testing** - Vitest (unit), Playwright (E2E)
- **UI Frameworks** - Lit (preferred), Stencil (legacy, migrating away)

## Instructions System

All code changes follow `.github/instructions/*.instructions.md` patterns. These **auto-apply** based on file paths—no need to reference manually.

Key instructions:
- `general.instructions.md` - Core development principles
- `general.typescript.instructions.md` - TypeScript conventions
- `atomic.instructions.md` - Atomic package patterns
- `a11y.instructions.md` - WCAG 2.2 Level AA compliance
- `tests-atomic.instructions.md` - Vitest testing patterns
- `playwright-typescript.instructions.md` - E2E test patterns

## Common Workflows

### Generate New Component

```bash
cd packages/atomic
node scripts/generate-component.mjs component-name src/components/common
```

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

### Debugging Tests

```bash
# Verbose test output
cd packages/atomic
pnpm test -- <test-file> --reporter=verbose

# Interactive E2E debugging
pnpm e2e -- --debug --headed

# Run single test by name
pnpm test -- -t "test name pattern"
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
- Verify type safety (no `any` without justification)

## Common Gotchas

- **Path aliases:** Use path aliases for imports (configured in `tsconfig.json`)
- **Package names:** Check `packages/*/package.json` `name` field, not top-level
- **Test isolation:** Each test should verify one behavior
- **Resource cleanup:** Always clean up in `disconnectedCallback` (Lit) or `disconnectedCallback` (Stencil)
- **Accessibility:** Follow WCAG 2.2 Level AA (see `a11y.instructions.md`)
- **Build failures:** If tests pass locally but fail in CI, check Turbo cache with `pnpm build --force`

## For Detailed Documentation

- **Human contributors:** See [README.md](../README.md) for project overview and contribution guidelines
- **Agents, prompts, skills:** Auto-discovered by VS Code Copilot (no catalog needed)
- **Coding standards:** See `.github/instructions/*.instructions.md` (auto-applied)

