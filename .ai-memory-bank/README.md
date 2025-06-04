# AI Memory Bank

This directory contains institutional knowledge, best practices, common gotchas, and development patterns for the Coveo UI Kit repository. This information is designed to help AI assistants provide better assistance to developers working on this codebase.

## Structure

- **`architecture/`** - High-level architecture decisions and patterns
- **`best-practices/`** - Coding standards, conventions, and recommended approaches
- **`gotchas/`** - Common problems, edge cases, and things to watch out for
- **`workflows/`** - Development workflows, processes, and procedures
- **`package-specific/`** - Knowledge specific to individual packages
- **`patterns/`** - Common implementation patterns and code examples
- **`troubleshooting/`** - Common issues and their solutions

## How to Use

When working on this repository:

1. **For AI Assistants**: Read through relevant sections to understand context and constraints
2. **For Developers**: Contribute new learnings by updating these files
3. **For Code Reviews**: Reference these guidelines when reviewing code

## Contributing to the Memory Bank

When you encounter:

- A tricky problem and its solution
- A pattern that should be followed or avoided
- Architecture decisions that aren't documented elsewhere
- Best practices that emerge from experience

Please update the relevant memory bank files or create new ones as needed.

## Current Priorities & Active Work

### 🔄 Analytics Migration (KIT-2859)

The codebase is undergoing migration from legacy analytics to new analytics patterns. See [Analytics Migration Guide](./architecture/analytics-migration.md) for details.

### 🧪 Atomic Chemistry Adoption

Ongoing effort to organize all Atomic components following the Chemistry methodology. See [Atomic Chemistry Guide](./package-specific/atomic-chemistry.md).

### 📦 Bundle Optimization

Active work on optimizing bundle sizes and ensuring clean separation between use cases (search, recommendation, case-assist, insight, commerce, ssr).

## Quick Reference

### 🎯 High Priority

- � [Analytics Migration](./architecture/analytics-migration.md) - **Active work in progress**
- 🧪 [Atomic Chemistry Guide](./package-specific/atomic-chemistry.md) - **Component organization methodology**
- ⚠️ [Common Gotchas](./gotchas/common-gotchas.md) - **Critical issues to avoid**

### 📋 Development Essentials

- �📋 [Project Overview](./architecture/project-overview.md)
- 🛠️ [Development Setup](./workflows/development-setup.md)
- 📖 [Coding Standards](./best-practices/coding-standards.md)
- 🧪 [Testing Patterns](./patterns/testing-patterns.md)

### 🔧 Workflows & Operations

- 🔧 [Build & Release](./workflows/build-and-release.md)
- 🌐 [Internationalization](./workflows/internationalization.md)
- � [Troubleshooting Guide](./troubleshooting/troubleshooting-guide.md)

### � Package-Specific

- 🎛️ [Headless Package](./package-specific/headless.md)
- ⚛️ [Atomic Package](./package-specific/atomic.md)
- ⚡ [Quantic Package](./package-specific/quantic.md)

### 🔄 Patterns & Examples

- 🔄 [Recent Queries/Results Patterns](./patterns/recent-queries-results.md)
