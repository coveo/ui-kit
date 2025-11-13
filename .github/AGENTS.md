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

All agents are located in `.github/agents/` with the `-v1.agent.md` suffix.

### Prompt Engineer Agent

**File:** `.github/agents/prompt-engineer-v1.agent.md`

Autonomous prompt engineering agent specializing in creating state-of-the-art prompts optimized for the ui-kit monorepo using advanced reasoning techniques.

**Capabilities:**
- Uses 8-stage workflow: Prompt Type Determination → Contextual Analysis → Tree-of-Thought Exploration → Chain-of-Thought Reasoning → Meta-Prompt Construction → Self-Validation → Iterative Refinement → Final Delivery
- Generates production-ready prompts, agents, and repeatable workflows
- Autonomous execution for GitHub issues/PRs
- Creates test scenarios for agents
- Provides comprehensive usage guidelines and validation criteria

**Use Cases:**
- Creating new prompts for common tasks
- Refining existing prompts for better results
- Building new agents with complete documentation
- Generating task templates for repetitive workflows
- Performing prompt quality audits

**Execution:** Assign to GitHub issues labeled with `prompt-engineering`

### Stencil-to-Lit Migration Agent

**File:** `.github/agents/stencil-to-lit-migration-v1.agent.md`

Specialized agent for Stencil → Lit migrations (components, functional components, utils).

**Capabilities:**
- Detects migration type and applies appropriate workflow
- For components: complete migrations including code, tests, Storybook stories, E2E tests, and MDX documentation
- For functional components: migration and unit test generation
- For utils: unit test generation only
- Uses dedicated prompts for each migration step
- Identifies and documents blocking dependencies

**Use Cases:**
- Migrating Stencil components to Lit
- Converting functional components
- Generating comprehensive test suites
- Creating Storybook documentation
- Analyzing migration blockers

### Accessibility Agent

**File:** `.github/agents/accessibility-v1.agent.md`

WCAG 2.2 Level AA compliance review and accessibility guidance agent.

**Capabilities:**
- WCAG 2.2 standards expertise
- Keyboard navigation patterns
- Screen reader compatibility
- ARIA attributes guidance
- Focus management
- Color contrast and visual design
- Form accessibility

**Use Cases:**
- Reviewing components for accessibility issues
- Implementing accessible UI patterns
- Fixing WCAG violations
- Guidance on ARIA attributes, keyboard navigation, or screen reader support

### Maintenance Agent

**File:** `.github/agents/maintenance-v1.agent.md`

Technical investigation assistant for diagnosing and responding to reported issues in the ui-kit repository. Provides systematic investigation support through hypothesis formation, verification, and response preparation.

**Capabilities:**
- Systematic issue investigation workflow (intake, hypothesis, investigation, determination)
- Pattern-based root cause analysis
- Minimal reproduction creation
- Bug identification and documentation (without implementing fixes)
- Targeted follow-up question generation
- Copy-ready response preparation for issue reporters
- Common issue pattern matching

**Use Cases:**
- Investigating technical issues reported by internal colleagues or partners
- Diagnosing component rendering, search behavior, or integration problems
- Triaging user errors vs. actual bugs
- Preparing clear, actionable responses for issue reporters
- Identifying version compatibility issues

**Primary Usage:** Local chatmode for issue investigation; may be assigned to public GitHub issues

### Multi-Agent Swarm Simulator

**File:** `.github/agents/multi-agent-swarm-simulator-v1.agent.md`

Multi-agent swarm simulation system with transparent execution trace and quality validation.

**Capabilities:**
- Simulates team of expert agents (@analyst, @planner, @executor, @validator, etc.)
- Transparent step-by-step execution log
- Quality validation with automatic refinement (3-attempt loop)
- Memory-based conversation context
- Visible reasoning at every stage

**Use Cases:**
- Structured problem-solving with visible reasoning steps
- Complex tasks requiring multiple expert perspectives
- Quality-validated outputs with automatic refinement
- Transparent decision-making processes

### Refine Issue Agent

**File:** `.github/agents/refine-issue-v1.agent.md`

Transform vague requirements into well-defined issues with acceptance criteria.

**Capabilities:**
- Reads and enhances existing issues
- Adds detailed context and background
- Defines testable acceptance criteria
- Documents technical considerations
- Identifies edge cases and risks
- Provides effort estimation guidance

**Use Cases:**
- Refining GitHub issues for clarity
- Adding acceptance criteria to requirements
- Identifying technical dependencies
- Documenting edge cases and NFRs
- Preparing issues for implementation

### Research Technical Spike Agent

**File:** `.github/agents/research-technical-spike-v1.agent.md`

Systematically research and validate technical spike documents through exhaustive investigation.

**Capabilities:**
- Obsessive tool usage (search, fetch, githubRepo)
- Recursive investigation (follow every lead)
- Real-time spike document updates
- Evidence-based findings
- Experimental validation (with permission)
- Todo-driven progress tracking

**Use Cases:**
- Validating technical assumptions
- Researching new technologies or approaches
- Creating proof of concepts
- Evidence-based technical decisions
- Comprehensive documentation of investigation

### Task Researcher Agent

**File:** `.github/agents/task-researcher-v1.agent.md`

Deep codebase analysis and research specialist for complex tasks.

**Capabilities:**
- Comprehensive codebase exploration
- Dependency mapping
- Pattern identification
- Documentation review
- Alternative analysis and evaluation
- Creates detailed research notes in `./.copilot-tracking/research/`

**Use Cases:**
- Planning major refactoring
- Investigating architectural patterns
- Understanding complex dependencies
- Analyzing alternative approaches
- Research-only analysis without code changes

### TypeScript MCP Expert Agent

**File:** `.github/agents/typescript-mcp-expert-v1.agent.md`

Expert assistant for developing Model Context Protocol (MCP) servers in TypeScript.

**Capabilities:**
- Complete mastery of @modelcontextprotocol/sdk
- TypeScript/Node.js expertise
- Schema validation with zod
- Transport configuration (HTTP and stdio)
- Tool, resource, and prompt design
- Testing and debugging guidance

**Use Cases:**
- Building MCP servers from scratch
- Implementing tools and resources
- Configuring transports correctly
- Debugging MCP protocol issues
- Migrating to current best practices

## Prompts (Task Templates)

Located in `.github/prompts/`:

### Component Migration
- **migrate-stencil-to-lit.prompt.md** - Complete Stencil component to Lit migration workflow
- **migrate-stencil-functional-component-to-lit.prompt.md** - Migrate Stencil functional components to Lit

### Test Generation
- **generate-vitest-tests-atomic-lit-components.prompt.md** - Generate unit tests for Lit components
- **generate-vitest-test-atomic-lit-functional-component.prompt.md** - Generate unit tests for Lit functional components
- **generate-vitest-tests-atomic-utils.prompt.md** - Generate unit tests for utility functions
- **generate-playwright-e2e-tests-atomic.prompt.md** - Generate E2E tests with Playwright

### Documentation
- **write-atomic-component-mdx-documentation.prompt.md** - Generate MDX documentation for Atomic components

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

## Prompts (Task Templates)

Located in `.github/prompts/`:

### Component Migration
- **migrate-stencil-to-lit.prompt.md** - Complete Stencil component to Lit migration workflow
- **migrate-stencil-functional-component-to-lit.prompt.md** - Migrate Stencil functional components to Lit

### Test Generation
- **generate-vitest-tests-atomic-lit-components.prompt.md** - Generate unit tests for Lit components
- **generate-vitest-test-atomic-lit-functional-component.prompt.md** - Generate unit tests for Lit functional components
- **generate-vitest-tests-atomic-utils.prompt.md** - Generate unit tests for utility functions
- **generate-playwright-e2e-tests-atomic.prompt.md** - Generate E2E tests with Playwright

### Documentation
- **write-atomic-component-mdx-documentation.prompt.md** - Generate MDX documentation for Atomic components

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
