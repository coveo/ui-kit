# AGENTS.md

## Commands

- **Build all packages in the UI Kit monorepo**: `pnpm run build`
- **Run all unit tests in all packages in the UI Kit monorepo**: `pnpm run test`
- **Check for linting errors across the entire UI Kit monorepo**: `pnpm run lint:check`
- **Fix linting errors across the entire UI Kit monorepo**: `pnpm run lint:fix`

## Structure

```
ui-kit/
├── .areas/             # Areas of code ownership
├── .claude/            # Agent Skills
├── .deployment.config/ # Deployment pipeline configurations
├── .devcontainer/      # GitHub Codespaces and VS Code dev containers
├── .github/            # GitHub workflows, PR templates
├── .vscode/            # VS Code settings, including MCP servers
├── internal-docs/      # Internal documentation for contributors
├── packages/           # Main monorepo packages
│   ├── atomic/                          # Lit-based Atomic component library
│   ├── atomic-angular/                  # Angular wrapper for Atomic
│   ├── atomic-hosted-page/              # Hosted search page implementation
│   ├── atomic-legacy/                   # Legacy Stencil Atomic components
│   ├── atomic-react/                    # React wrapper for Atomic
│   ├── auth/                            # Coveo authentication utilities
│   ├── bueno/                           # Schema validation library
│   ├── create-atomic/                   # Tool to scaffold Atomic projects
│   ├── create-atomic-component/         # Tool to generate Atomic components
│   ├── create-atomic-component-project/ # Tool to scaffold component projects
│   ├── create-atomic-result-component/  # Tool to generate result components
│   ├── create-atomic-rollup-plugin/     # Rollup plugin for Atomic
│   ├── create-atomic-template/          # Templates for Atomic projects
│   ├── documentation/                   # Project documentation generator
│   ├── headless/                        # Redux-based Headless library
│   ├── headless-react/                  # React bindings for Headless
│   ├── quantic/                         # Salesforce Lightning component library
│   └── shopify/                         # Shopify integration package
├── patches/            # pnpm patch files for dependency fixes
├── samples/            # Example implementations and demos
├── scripts/            # Build, deployment, and utility scripts
└── utils/              # Shared utilities and helpers
```

## Technology

- **End-to-end testing**: Playwright v1
- **Monorepo management**: Turbo v2
- **Language**: TypeScript v5
- **Unit testing**: Vitest v4
- **Runtime**: Node v24
- **Package management**: pnpm v10

## Principles

**Favor**
- Clear, clean, self-documenting code
- Defensive programming
- DRY principle
- SOLID principles
- Established, idiomatic practices
- Strong typing
- Small, focused changesets

---

**Avoid**
- Inline comments that restate the obvious
- Premature optimization
- Cargo culting
- Scope creep

## Boundaries

**You must ALWAYS**
- Discover all available Agent Skills under `.claude/skills` when beginning a new conversation
- Ensure that you have read all relevant AGENTS.md files before attempting any work
- Run `pnpm lint:fix` before committing any work
- Use the Conventional Commits 1.0.0 specification when composing a commit message
- Report all contradicting instructions you encounter in AGENTS.md and Agent Skills

---

**You must ASK BEFORE**
- Adding any new dependency in the monorepo
- Deleting:
  - Any file in the monorepo
  - Any directory in the monorepo
- Modifying:
  - Any `.gitignore` in the monorepo
  - Any `package.json` in the monorepo
  - Any `tsconfig.json` in the monorepo
  - Any `tsconfig.*.json` in the monorepo
  - Any `turbo.json` in the monorepo
  - Any `vitest.config.js` in the monorepo
  - The root `.dockerignore`
  - The root `.npmrc`
  - The root `.nvmrc`
  - The root `biome.jsonc`
  - The root `renovate.json5`
- Introducing a potentially breaking change

---

**You must NEVER**
- Commit:
  - Unencrypted API keys
  - Secrets
  - Personally Identifiable Information (PII)
- Modify:
  - Any `CHANGELOG` in the monorepo directly (automatically updated)
  - Any `LICENSE` in the monorepo (legal ramifications)
  - `pnpm-lock.yaml` directly (updated through renovate)
  - `pnpm-workspace.yaml` directly (updated through renovate)
