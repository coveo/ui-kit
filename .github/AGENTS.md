# GitHub Copilot Agents Configuration

This repository uses GitHub Copilot custom agents to enhance the development experience with specialized instructions, chatmodes, and prompts.

## Instructions

Instructions are automatically applied based on file patterns and provide coding standards and best practices:

### General Instructions

- **general.instructions.md** - Core development principles
  - Applies to: All files
  - Focus: Correctness, code quality, defensive programming

### Package-Specific Instructions

- **atomic.instructions.md** - Atomic package conventions
  - Applies to: `packages/atomic/**/**`
  - Focus: Lit/Stencil components, Atomic Chemistry naming, file structure

- **tests-atomic.instructions.md** - Atomic testing patterns
  - Applies to: `**/atomic/**/*.spec.ts`
  - Focus: Vitest unit tests, test structure, mocking

### Technology-Specific Instructions

- **a11y.instructions.md** - Accessibility (WCAG 2.2 Level AA)
  - Applies to: All files
  - Focus: Keyboard navigation, ARIA, screen reader support, inclusive language

- **playwright-typescript.instructions.md** - Playwright E2E testing
  - Applies to: Test files (`**/*.e2e.ts`, `**/*.spec.ts`)
  - Focus: User-facing locators, auto-retrying assertions, test structure

## Chatmodes

Chatmodes provide specialized AI personas for specific development tasks:

- **accessibility.chatmode.md** - WCAG compliance review and testing
- **typescript-mcp-expert.chatmode.md** - TypeScript MCP server development
- **refine-issue.chatmode.md** - Issue refinement with acceptance criteria
- **research-technical-spike.chatmode.md** - Technical investigation and documentation
- **task-researcher.chatmode.md** - Deep codebase analysis and research

## Prompts

Task-specific prompts for common development workflows:

- Component generation and migration prompts
- Test generation prompts
- Documentation generation prompts

## Repository Context

### Technology Stack

- TypeScript 5.8.3 targeting ES2022
- UI Frameworks: Lit (preferred), Stencil (legacy)
- Testing: Vitest (unit), Playwright (E2E)
- Package Manager: pnpm
- Monorepo: Turbo workspace

### Key Packages

- **atomic**: UI component library
- **headless**: Headless UI library
- **quantic**: Salesforce Lightning components
- **headless-react**: React bindings

## Usage

Instructions are automatically applied by GitHub Copilot based on file patterns. Chatmodes can be invoked in VS Code Copilot Chat for specialized assistance.

For more details, see the individual instruction and chatmode files in `.github/instructions/` and `.github/chatmodes/`.
