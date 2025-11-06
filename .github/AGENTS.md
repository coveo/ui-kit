# AGENTS.md - Coding Agent Instructions

This file provides specialized instructions for AI coding agents working in the Coveo UI-Kit repository.

## Quick Start

### Building
```bash
pnpm install
pnpm build
```

### Testing
```bash
# Run all tests
pnpm test

# Run E2E tests
pnpm e2e

# Run tests for specific package
cd packages/atomic
pnpm test
pnpm e2e
```

### Linting
```bash
pnpm lint:check  # Check for issues
pnpm lint:fix    # Auto-fix issues
```

## Repository Structure

```
ui-kit/
├── packages/
│   ├── atomic/          # UI component library (Lit/Stencil)
│   ├── headless/        # Headless UI library
│   ├── quantic/         # Salesforce Lightning components
│   └── headless-react/  # React bindings
├── .github/
│   ├── instructions/    # Coding standards and conventions
│   ├── agents/          # Custom agent definitions
│   ├── chatmodes/       # Specialized AI personas
│   └── prompts/         # Task-specific workflows
└── samples/             # Example implementations
```

## Coding Standards

### Instructions System

All code changes MUST follow the conventions defined in `.github/instructions/`:

- **general.instructions.md** - Core development principles (all files)
- **general.typescript.instructions.md** - TypeScript conventions (all .ts/.tsx files)
- **atomic.instructions.md** - Atomic package conventions (`packages/atomic/**`)
- **tests-atomic.instructions.md** - Atomic testing patterns (`**/atomic/**/*.spec.ts`)
- **playwright-typescript.instructions.md** - E2E testing patterns (`**/*.e2e.ts`)
- **a11y.instructions.md** - Accessibility standards (all files)
- **msw-api-mocking.instructions.md** - API mocking for Storybook

These instructions are automatically applied by GitHub Copilot based on file patterns.

### Technology Stack

- **TypeScript**: Check `package.json` for current version
- **Build System**: Turbo (monorepo orchestration) + package-specific builds
- **Package Manager**: pnpm with workspaces
- **Testing**: Vitest (unit), Playwright (E2E)
- **UI Frameworks**: Lit (preferred), Stencil (legacy)

## PR Standards

- **Title**: Semantic commit format (e.g., `feat:`, `fix:`, `refactor:`)
  - Prefix with `WIP:` while work is in progress
- **Description**: Include `Fixes #Issue_number` when addressing a specific issue
- **Template**: For Stencil → Lit migrations, use `.github/PULL_REQUEST_TEMPLATE/atomic-stencil-lit-migration.md`
- **Commits**: Use clear, descriptive messages

## Custom Agents

- **coding-agent.md** - Instruction-aware coding with iterative test fixing
  - Location: `.github/agents/coding-agent.md`
  - Applies all instruction files automatically
  - Enforces test verification before commits

## Chatmodes (VS Code Copilot)

- **accessibility.chatmode.md** - WCAG compliance review
- **typescript-mcp-expert.chatmode.md** - TypeScript MCP server development
- **refine-issue.chatmode.md** - Issue refinement with acceptance criteria
- **research-technical-spike.chatmode.md** - Technical investigation
- **task-researcher.chatmode.md** - Deep codebase analysis

## Prompts (Task Templates)

Located in `.github/prompts/`:
- Component generation and migration
- Test generation (Vitest, Playwright)
- Documentation generation

## Common Workflows

### Creating a New Component
```bash
cd packages/atomic
node scripts/generate-component.mjs component-name src/components/common
```

### Running Specific Package Commands
```bash
# Atomic package
cd packages/atomic
pnpm build:stencil-lit  # Build
pnpm test:lit           # Test Lit components
pnpm e2e                # E2E tests

# Headless package
cd packages/headless
pnpm build
pnpm test
```

### Debugging Test Failures
```bash
cd packages/atomic
pnpm test -- <test-file> --reporter=verbose
pnpm e2e <test-file> --debug --headed
```

## Quality Checklist

Before committing:
- [ ] Read relevant `.github/instructions/` files
- [ ] Tests pass consistently (unit and/or E2E)
- [ ] Linting passes: `pnpm lint:fix`
- [ ] Builds succeed: `pnpm build`
- [ ] Used path aliases for imports
- [ ] Type safety maintained (no `any` without justification)
- [ ] Resources cleaned up in lifecycle methods
- [ ] Changes are minimal and surgical
- [ ] PR follows semantic commit format
- [ ] PR description includes `Fixes #Issue_number` if applicable

## For Human Contributors

For general contribution guidelines, project overview, and getting started information, see the main [README.md](../README.md).

This file is optimized for AI coding agents and contains detailed build steps, test commands, and conventions that complement the human-focused README.
