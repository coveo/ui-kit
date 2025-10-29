# Custom Agents Integration Plan for UI-KIT

This document describes the integration of GitHub Copilot Custom Agents into the UI-KIT repository.

## Background

GitHub Copilot Custom Agents allow organizations to specialize their Copilot coding experience through:
- **Instructions**: Coding standards that apply to specific file patterns
- **Chatmodes**: Specialized AI personas for different tasks
- **Agents**: Custom agents that integrate with MCP servers

Reference: https://github.blog/changelog/2025-10-28-custom-agents-for-github-copilot/

## Integration Strategy

### Phase 1: Instructions (✅ Completed)

We've added three new instruction files that complement our existing instructions:

#### New Instructions

1. **a11y.instructions.md**
   - **Purpose**: Accessibility guidelines for WCAG 2.2 Level AA compliance
   - **Applies to**: All files (`**`)
   - **Why**: Critical for our UI component library (Atomic)
   - **Key features**:
     - Keyboard navigation requirements
     - Screen reader support
     - ARIA attributes
     - Inclusive language guidelines

2. **playwright-typescript.instructions.md**
   - **Purpose**: Playwright E2E test writing guidelines
   - **Applies to**: All files (`**`)
   - **Why**: Repository uses Playwright extensively for E2E testing
   - **Key features**:
     - User-facing locator patterns
     - Auto-retrying assertions
     - Test structure conventions
     - Accessibility tree snapshots

3. **typescript-5-es2022.instructions.md**
   - **Purpose**: TypeScript 5.x development guidelines
   - **Applies to**: TypeScript files (`**/*.ts`)
   - **Why**: Repository uses TypeScript 5.8.3 targeting ES2022
   - **Key features**:
     - Type system best practices
     - Async/await patterns
     - Security practices
     - ES module conventions

#### Existing Instructions (Preserved)

- **general.instructions.md**: Core development principles
- **atomic.instructions.md**: Atomic component structure and conventions
- **tests-atomic.instructions.md**: Vitest testing conventions for Atomic

### Phase 2: Chatmodes (✅ Completed)

We've added five chatmodes for specialized development tasks:

1. **accessibility.chatmode.md**
   - **Purpose**: Accessibility-focused development
   - **Use case**: Ensuring WCAG 2.1 compliance
   - **Tools**: Code editing, testing, browser preview
   - **Best for**: Reviewing/improving component accessibility

2. **typescript-mcp-expert.chatmode.md**
   - **Purpose**: TypeScript MCP server development expert
   - **Use case**: Building Model Context Protocol servers
   - **Best for**: Advanced TypeScript patterns and MCP integration

3. **refine-issue.chatmode.md**
   - **Purpose**: Issue refinement and enrichment
   - **Use case**: Adding acceptance criteria and technical details to issues
   - **Tools**: GitHub issue management
   - **Best for**: Grooming backlog items

4. **research-technical-spike.chatmode.md**
   - **Purpose**: Systematic technical investigation
   - **Use case**: Researching new features or technical approaches
   - **Tools**: Search, code analysis, documentation
   - **Best for**: Technical spike documentation and validation

5. **task-researcher.chatmode.md**
   - **Purpose**: Deep task analysis and research
   - **Use case**: Comprehensive project analysis
   - **Tools**: All available research tools
   - **Best for**: Understanding complex codebases or planning major changes

### Phase 3: Agents (✅ Completed)

Created `.github/agents/` directory with custom agent definitions:

1. **sprint-planning.agent.md**
   - **Purpose**: Sprint and iteration planning specialist with automated execution
   - **Use case**: Analyzing GitHub Projects, validating issues, and executing approved plans
   - **Tools**: GitHub issue management, GitHub Projects API, search, codebase analysis
   - **Best for**: Validating sprint readiness and executing sprint plans automatically
   - **Key features**:
     - Strategic context gathering from GitHub Projects and milestones
     - Issue readiness validation with comprehensive quality gates
     - Dependency analysis and risk assessment
     - **Automated execution**: Moves issues in GitHub Projects after approval
     - **Iteration protection**: Cannot modify current/ongoing sprints
     - Coordination between developers and specialized agents
     - Human review and approval before execution

The agents directory is ready for future additions:
- Custom MCP-powered agents specific to UI-KIT
- Integration with external services (e.g., Neon, PagerDuty)
- Additional repository-specific automation agents

## Repository Context

### Technology Stack

- **Language**: TypeScript 5.8.3
- **Target**: ES2022
- **UI Frameworks**: Lit (preferred), Stencil (legacy)
- **Testing**: 
  - Unit: Vitest 3.2.4
  - E2E: Playwright 1.56.1
- **Package Manager**: pnpm 10.18.1
- **Node Version**: 22.14.0
- **Monorepo**: Turbo-based workspace

### Key Packages

- `atomic`: UI component library (Lit/Stencil)
- `headless`: Headless UI library
- `quantic`: Salesforce Lightning Web Components
- `headless-react`: React bindings

### Existing Conventions

The repository already has strong conventions:
- Atomic Chemistry naming (Atoms, Molecules, Ions, Enzymes)
- Comprehensive test coverage requirements
- Accessibility-first approach for UI components
- Structured file naming (kebab-case)

## Why These Customizations?

### Alignment with Repository Needs

1. **Accessibility (a11y.instructions.md + accessibility.chatmode.md)**
   - UI-KIT builds customer-facing UI components
   - WCAG compliance is critical
   - Existing codebase shows accessibility focus
   - These tools ensure consistency

2. **Playwright (playwright-typescript.instructions.md)**
   - Repository has extensive Playwright test suites
   - E2E testing is critical for UI components
   - Standardizes test writing approach

3. **TypeScript (typescript-5-es2022.instructions.md + typescript-mcp-expert.chatmode.md)**
   - Entire codebase is TypeScript
   - Using latest features (5.8.3)
   - Type safety is paramount for library code

4. **Research & Planning (research-technical-spike.chatmode.md, task-researcher.chatmode.md)**
   - Complex monorepo with multiple packages
   - Technical spikes are common for new features
   - Systematic research improves decision-making

5. **Issue Management (refine-issue.chatmode.md)**
   - Helps maintain high-quality issue descriptions
   - Ensures acceptance criteria are well-defined
   - Improves team collaboration

6. **Sprint Planning (sprint-planning.agent.md)**
   - Analyzes GitHub Projects for macro strategy and deadlines
   - Reviews issues and milestones for sprint readiness
   - Validates implementation approach and dependencies
   - **Executes approved plans** by moving issues in GitHub Projects
   - **Protects ongoing sprints** from unintended modifications
   - Coordinates between developers and specialized agents
   - Provides human review workflow with automated execution

## Files Added

```
.github/
├── COPILOT_CUSTOMIZATION.md          # User documentation
├── CUSTOM_AGENTS_INTEGRATION.md      # This file (integration plan)
├── agents/
│   ├── .gitkeep                      # Placeholder for future agents
│   └── sprint-planning.agent.md      # Sprint/iteration planning specialist
├── chatmodes/
│   ├── accessibility.chatmode.md
│   ├── refine-issue.chatmode.md
│   ├── research-technical-spike.chatmode.md
│   ├── task-researcher.chatmode.md
│   └── typescript-mcp-expert.chatmode.md
└── instructions/
    ├── a11y.instructions.md
    ├── playwright-typescript.instructions.md
    └── typescript-5-es2022.instructions.md
```

## Usage Guidelines

### For Developers

1. **Instructions are automatic**: When you edit a file, relevant instructions are applied
2. **Use chatmodes intentionally**: Reference them when working on specific tasks
3. **Provide feedback**: Let the team know which customizations are helpful

### For Contributors

When contributing to the repository:
- Follow the patterns in instructions files
- Use accessibility chatmode when working on UI components
- Use research chatmodes for technical spikes
- Reference TypeScript expert for complex TypeScript patterns

## Not Included (Evaluated and Rejected)

We evaluated but did not include these from awesome-copilot:

1. **copilot-thought-logging.instructions.md**
   - Reason: Too verbose, would slow down workflow
   - Creates unnecessary tracking files in workspace

2. **instructions.instructions.md**
   - Reason: Meta-instructions for creating instructions
   - Not needed for day-to-day development

3. **software-engineer-agent-v1.chatmode.md**
   - Reason: Too opinionated and prescriptive
   - Zero-confirmation policy conflicts with team collaboration
   - Better to use task-specific chatmodes

## Future Enhancements

Potential additions as needs arise:

1. **Additional Custom Agents**
   - Stencil-to-Lit migration agent
   - Component generation agent
   - Documentation generation agent
   - Release planning and changelog agent

2. **Additional Chatmodes**
   - Performance optimization mode
   - Bundle size analysis mode
   - Breaking change detection mode

3. **Package-Specific Instructions**
   - Headless package instructions
   - Quantic (Salesforce) specific guidelines
   - React bindings conventions

## Maintenance

### Keeping Instructions Current

- Review instructions quarterly
- Update when TypeScript/framework versions change
- Align with evolving repository conventions
- Remove outdated patterns

### Monitoring Effectiveness

Track:
- Developer feedback on usefulness
- Reduction in common code review comments
- Consistency improvements in PRs
- Time saved on common tasks

## References

- [GitHub Copilot Custom Agents](https://github.blog/changelog/2025-10-28-custom-agents-for-github-copilot/)
- [Awesome Copilot Repository](https://github.com/github/awesome-copilot)
- [WCAG 2.2 Guidelines](https://www.w3.org/TR/WCAG22/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [TypeScript 5.8 Release Notes](https://devblogs.microsoft.com/typescript/announcing-typescript-5-8/)

## Conclusion

This integration brings battle-tested Copilot customizations from the community into UI-KIT, aligned with our specific technology stack and development practices. The additions:

- ✅ Reinforce existing conventions (accessibility, TypeScript, testing)
- ✅ Fill gaps (Playwright patterns, modern TypeScript features)
- ✅ Provide specialized tools for common tasks (research, issue refinement)
- ✅ Set foundation for future custom agents
- ✅ Maintain minimal, coherent integration

By leveraging GitHub's Custom Agents feature, we can provide developers with context-aware assistance that improves code quality, consistency, and productivity.
