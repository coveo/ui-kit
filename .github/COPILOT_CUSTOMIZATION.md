# GitHub Copilot Customization

This repository uses GitHub Copilot custom agents to enhance the development experience. These customizations include instructions, chatmodes, and custom agents that help developers follow best practices and maintain consistency.

## Overview

The `.github` directory contains several types of Copilot customizations:

- **Instructions** (`.github/instructions/`): Provide coding standards and best practices that apply to specific file patterns
- **Chatmodes** (`.github/chatmodes/`): Specialized AI personas for different development tasks
- **Prompts** (`.github/prompts/`): Task-specific prompts for generating code and documentation
- **Agents** (`.github/agents/`): Custom agents that integrate with MCP servers (future use)

## Instructions

Instructions are automatically applied based on file patterns. These provide context-aware guidance:

### General Instructions

- **general.instructions.md** - Core development principles and best practices
  - Applies to: `**` (all files)
  - Focus: Correctness, code quality, performance, and communication

### Package-Specific Instructions

- **atomic.instructions.md** - Atomic package structure and conventions
  - Applies to: `**packages/atomic/**/**`
  - Focus: Lit components, file structure, naming conventions, Atomic Chemistry

- **tests-atomic.instructions.md** - Testing conventions for Atomic package
  - Applies to: `**/atomic/**/*.spec.{ts}`
  - Focus: Vitest test patterns, test structure, best practices

### Technology-Specific Instructions

- **a11y.instructions.md** - Accessibility guidelines (WCAG 2.2 Level AA)
  - Applies to: `**` (all files)
  - Focus: Accessible code generation, keyboard navigation, screen reader support

- **playwright-typescript.instructions.md** - Playwright E2E test writing
  - Applies to: `**` (all files)
  - Focus: Test structure, locators, assertions, best practices

- **typescript-5-es2022.instructions.md** - TypeScript 5.x development guidelines
  - Applies to: `**/*.ts`
  - Focus: Type safety, ES2022 features, naming conventions, architecture

## Chatmodes

Chatmodes provide specialized AI personas for specific tasks. To use a chatmode in VS Code:

1. Open GitHub Copilot Chat
2. Reference the chatmode using `@chatmode` or by selecting it from the UI

Available chatmodes:

### Development Chatmodes

- **accessibility.chatmode.md** - Accessibility-focused development mode
  - Focus: WCAG 2.1 compliance, testing with pa11y and axe-core
  - Tools: Code editing, testing, browser preview

- **typescript-mcp-expert.chatmode.md** - TypeScript MCP server expert
  - Focus: Model Context Protocol server development
  - Best for: Building MCP servers, TypeScript patterns

### Project Management Chatmodes

- **refine-issue.chatmode.md** - Issue refinement and enrichment
  - Focus: Adding acceptance criteria, technical considerations, edge cases
  - Tools: GitHub issue management

- **research-technical-spike.chatmode.md** - Technical spike research
  - Focus: Systematic investigation, documentation research, experimental validation
  - Tools: Search, code analysis, documentation

- **task-researcher.chatmode.md** - Deep task analysis and research
  - Focus: Comprehensive project analysis, alternative evaluation
  - Tools: All available tools for research

## Prompts

The prompts directory contains reusable prompts for common tasks:

- **generate-vitest-tests-atomic-lit-components.prompt.md** - Generate Vitest tests for Lit components
- **migrate-stencil-to-lit.prompt.md** - Migrate Stencil components to Lit
- **generate-vitest-tests-atomic-utils.prompt.md** - Generate tests for utility files

## How to Use

### Using Instructions

Instructions are automatically applied by GitHub Copilot based on the file you're editing. No action required!

### Using Chatmodes

In VS Code with GitHub Copilot:

1. Open Copilot Chat (Ctrl/Cmd + Shift + I)
2. Type `/` to see available commands
3. Select or reference a chatmode for specialized assistance

### Using Prompts

Prompts can be referenced in Copilot Chat or used as templates for common tasks.

## Repository-Specific Guidelines

This UI-KIT repository has specific patterns and conventions:

### Monorepo Structure

- Uses pnpm workspaces with multiple packages
- Main packages: `atomic`, `headless`, `quantic`, `headless-react`
- Build system: Turbo for task orchestration

### Technology Stack

- **Language**: TypeScript 5.8.3 targeting ES2022
- **UI Frameworks**: Lit (preferred), Stencil (legacy)
- **Testing**: Vitest (unit), Playwright (E2E)
- **Package Manager**: pnpm 10.18.1
- **Node Version**: 22.14.0

### Key Conventions

- **Atomic Components**: Follow the "Chemistry" naming (Atoms, Molecules, Ions, Enzymes)
- **File Naming**: Use kebab-case for files, PascalCase for classes
- **Testing**: Comprehensive unit and E2E test coverage
- **Accessibility**: WCAG 2.2 Level AA compliance for UI components

## Contributing

When adding new customizations:

1. Follow the patterns established in existing files
2. Include proper frontmatter with `description` and `applyTo` fields
3. Test the customization to ensure it provides value
4. Document the customization in this file

## Resources

- [GitHub Copilot Documentation](https://docs.github.com/en/copilot)
- [Custom Instructions](https://code.visualstudio.com/docs/copilot/customization/custom-instructions)
- [Awesome Copilot Repository](https://github.com/github/awesome-copilot)
- [WCAG 2.2 Guidelines](https://www.w3.org/TR/WCAG22/)
