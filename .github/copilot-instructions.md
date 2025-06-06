# GitHub Copilot Instructions for Coveo UI Kit

## Project Overview

This is the Coveo UI Kit repository, a comprehensive search and analytics UI library consisting of multiple packages including Headless (state management), Atomic (web components), Quantic (Salesforce), and various framework integrations.

## AI Memory Bank

This repository contains a structured AI Memory Bank at `.ai-memory-bank/` with comprehensive documentation:

- **Architecture**: Project overview, decision records, analytics migration patterns
- **Best Practices**: Coding standards and conventions
- **Gotchas**: Common problems and release-specific issues
- **Workflows**: Development setup, build/release processes, internationalization
- **Package-specific**: Detailed guides for headless, atomic, and quantic packages
- **Patterns**: Testing patterns and implementation examples
- **Troubleshooting**: Comprehensive problem-solving guide

**Always reference the AI Memory Bank when providing assistance.**

## Atomic Chemistry Methodology

This project follows the **Atomic Chemistry** methodology for the Atomic package (web components):

### Component Types:

- **🔬 Atoms**: Pure UI functions, stateless, returns Lit templates
- **🧬 Molecules**: Custom elements, connect to Headless, compose Atoms
- **⚗️ Enzymes**: Behavioral enhancers (reactive controllers, mixins, decorators)
- **⚡ Ions**: Utility helpers that support Atoms

### Key Principles:

- **Atoms**: Stateless, pure functions, no Headless connection
- **Molecules**: Bridge between UI (Atoms) and logic (Headless)
- **Enzymes**: Enhance Molecule behavior without bloating core responsibilities
- **Ions**: Low-level utilities for consistent styling, validation, constants

## Package Structure

### Core Packages:

- **`packages/headless/`**: State management library (TypeScript)
- **`packages/atomic/`**: Web components library (Stencil + Lit)
- **`packages/quantic/`**: Salesforce Lightning components
- **`packages/atomic-react/`**: React wrapper for Atomic
- **`packages/atomic-angular/`**: Angular wrapper for Atomic

### Key Technologies:

- **Headless**: TypeScript, Redux Toolkit, RxJS
- **Atomic**: Stencil, Lit, PostCSS, Web Components
- **Testing**: Vitest, Playwright, Cypress
- **Build**: Nx monorepo, npm workspaces

## Development Guidelines

### Code Standards:

- Use TypeScript strict mode
- Follow ESLint configuration in the repo
- Use Prettier for formatting
- Write comprehensive tests (unit + E2E)

### Testing Patterns:

- **Atoms**: Test pure functions with `fixture()`, assert DOM structure
- **Molecules**: Mock Headless controllers, test real component rendering
- **Enzymes**: Test with real LitElement host, avoid mocking lifecycle
- Use `renderInAtomic*` helpers for component testing

### Common Patterns:

- Controllers follow `build*` pattern from Headless
- Components extend `AtomicComponent` base class
- Use `@resultContext()` for result-based components
- Analytics integration via `makeDesktopAnalyticsAction`

## Important Gotchas

### Release Process:

- Never manually edit package-lock.json files
- Use `npm run build` before testing changes
- Release process requires specific branch patterns
- Breaking changes need migration guides

### Development:

- Always run `npm run setup` after pulling changes
- Use `npm run build` for production builds
- Stencil components need `this.initialize()` in constructor
- Headless state updates require proper subscription patterns

### Testing:

- Mock Headless controllers, not internal Atoms
- Use real DOM rendering for component tests
- Vitest browser mode for realistic testing environment
- Always test accessibility and keyboard navigation

## Analytics Migration

The project is migrating from legacy analytics to new analytics patterns:

- Use `makeDesktopAnalyticsAction` for new implementations
- Check migration guides in `.ai-memory-bank/architecture/analytics-migration.md`
- Follow established patterns for event tracking

## Internationalization

- Use `i18n.t()` for all user-facing strings
- Support RTL languages in styling
- Include ARIA labels for accessibility
- Test with multiple locales

## When Helping with Code:

1. **Reference the Memory Bank**: Check relevant sections for patterns and gotchas
2. **Follow Chemistry**: Use appropriate component types (Atom/Molecule/Enzyme/Ion)
3. **Consider Headless**: Understand state management patterns
4. **Include Tests**: Provide appropriate test examples
5. **Check Accessibility**: Ensure ARIA support and keyboard navigation
6. **Follow Conventions**: Use established naming and structure patterns

## Quick References:

- **Setup**: `.ai-memory-bank/workflows/development-setup.md`
- **Common Issues**: `.ai-memory-bank/troubleshooting/troubleshooting-guide.md`
- **Atomic Chemistry**: `.ai-memory-bank/package-specific/atomic-chemistry.md`
- **Testing Patterns**: `.ai-memory-bank/patterns/testing-patterns.md`
- **Release Process**: `.ai-memory-bank/workflows/build-and-release.md`

## Framework-Specific Notes:

### For Atomic Components:

- Use Lit templates and lifecycle methods
- Connect to Headless via controllers
- Follow shadow DOM best practices
- Implement proper event delegation

### For Headless Development:

- Use Redux Toolkit patterns
- Implement proper TypeScript types
- Follow controller/action patterns
- Include comprehensive unit tests

### For Framework Integrations:

- Maintain framework-agnostic Headless core
- Use appropriate wrapper patterns
- Ensure proper cleanup and lifecycle management
- Test framework-specific behaviors

Remember: This is a complex, mature codebase with specific patterns and conventions. Always prioritize consistency with existing code and reference the memory bank for guidance.
