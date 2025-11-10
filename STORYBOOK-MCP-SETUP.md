# Storybook MCP Setup - Summary

## What Was Completed

The Storybook MCP (Model Context Protocol) addon has been successfully set up for the Atomic package. This enables AI agents to programmatically interact with Storybook component stories.

## Changes Made

### 1. Package Installation
- **Package**: `@storybook/addon-mcp@0.1.3`
- **Location**: `packages/atomic/package.json` (devDependencies)
- **Compatible with**: Storybook 10.0.5 (Vite-based setup)

### 2. Configuration Update
- **File**: `packages/atomic/.storybook/main.ts`
- **Change**: Added `'@storybook/addon-mcp'` to the `addons` array

### 3. Documentation Created
- **File**: `packages/atomic/.storybook/README-MCP.md`
  - Explains what MCP is and its benefits
  - Usage instructions for running and connecting to MCP
  - Connection examples for AI agents
  - Requirements and troubleshooting guide

- **File**: `packages/atomic/README.md`
  - Added "Storybook" section with development instructions
  - Included "Storybook MCP" subsection
  - Links to detailed MCP documentation

## How to Test Locally

### Starting Storybook with MCP

From the repository root:
```bash
pnpm dev:atomic
```

Or from the `packages/atomic` directory:
```bash
pnpm start
```

Storybook will start at `http://localhost:6006` and the MCP server will be available at `http://localhost:6006/mcp`.

### Verifying MCP is Active

Once Storybook is running, you can verify the MCP endpoint is accessible by checking:
```bash
curl http://localhost:6006/mcp
```

You should receive a response indicating the MCP server is running.

### Connecting an AI Agent

Example with Claude Code (if available):
```bash
claude mcp add storybook-mcp --transport http http://localhost:6006/mcp --scope project
```

The AI agent can then:
- Read component stories and documentation
- Understand component APIs and usage patterns
- Create new stories programmatically
- Interact with component examples

## Next Steps for Human Developer

### 1. Local Testing (Recommended)
- [ ] Start Storybook with `pnpm dev:atomic`
- [ ] Verify the MCP endpoint is accessible at `http://localhost:6006/mcp`
- [ ] Test with an AI agent if available (e.g., Claude, GitHub Copilot)
- [ ] Explore MCP capabilities with component stories

### 2. Repository MCP Configuration (Optional)
If the repository has a central MCP configuration file:
- [ ] Add the Storybook MCP server to the repository's MCP configuration
- [ ] Document any repository-specific setup instructions
- [ ] Update team documentation about MCP availability

### 3. Team Communication
- [ ] Share documentation with the team
- [ ] Provide examples of using MCP with Storybook
- [ ] Gather feedback on the integration

## Technical Details

### Requirements Met
- ✅ Vite-based Storybook setup (using `@storybook/web-components-vite`)
- ✅ Node.js version compatible (20.9.0+ or 22.11.0+)
- ✅ Storybook version 10.0.5+

### Files Modified
1. `packages/atomic/.storybook/main.ts` - Added MCP addon
2. `packages/atomic/package.json` - Added dependency
3. `pnpm-lock.yaml` - Updated lock file
4. `packages/atomic/.storybook/README-MCP.md` - Created documentation
5. `packages/atomic/README.md` - Updated with Storybook section

### Lint & Format
All changes pass:
- ✅ Biome linting
- ✅ CSpell checking
- ✅ Pre-commit hooks

## Resources

- [Storybook MCP Addon Documentation](https://storybook.js.org/addons/@storybook/addon-mcp)
- [MCP Protocol Specification](https://github.com/storybookjs/mcp)
- [Local Documentation](./.storybook/README-MCP.md)

## Notes

- The MCP server only runs when Storybook is in development mode
- The endpoint is not available in the production build
- MCP is designed for AI-assisted development workflows
- No code changes were needed - only configuration and documentation

---

**Setup completed by**: GitHub Copilot Agent
**Date**: 2025-11-10
**Status**: ✅ Ready for local testing and tryout
