# Storybook MCP (Model Context Protocol) Setup

This Storybook instance has been configured with the MCP addon to enable AI agents to programmatically interact with component stories.

## What is MCP?

The Model Context Protocol (MCP) is an open protocol that standardizes how applications provide context to Large Language Models (LLMs). The Storybook MCP addon exposes your component stories through an MCP server, allowing AI agents to:

- Read component stories and documentation
- Understand component APIs and usage patterns
- Create new stories programmatically
- Interact with component examples

## Setup

The MCP addon has been installed and configured in this Storybook instance:

1. **Package installed**: `@storybook/addon-mcp@0.1.3` (added as a dev dependency)
2. **Configuration**: Added to `.storybook/main.ts` in the `addons` array

## Usage

### Running Storybook with MCP

When you run Storybook in development mode:

```bash
# From the atomic package directory
pnpm start

# Or from the repository root
pnpm dev:atomic
```

The MCP server will be available at:
- **Default URL**: `http://localhost:6006/mcp`

### Connecting AI Agents

To connect an AI agent (such as Claude or other MCP-compatible tools) to the Storybook MCP server:

1. Ensure Storybook is running locally
2. Configure your AI agent to connect to the MCP endpoint

For example, with Claude Code:
```bash
claude mcp add storybook-mcp --transport http http://localhost:6006/mcp --scope project
```

## Requirements

- **Vite-based Storybook**: This setup uses `@storybook/web-components-vite`
- **Node.js**: Version 20.9.0+ or 22.11.0+ (as specified in package.json)
- **Storybook 10.0.5+**: The MCP addon requires Storybook v10 or later

## References

- [Storybook MCP Addon Documentation](https://storybook.js.org/addons/@storybook/addon-mcp)
- [MCP Protocol Specification](https://github.com/storybookjs/mcp)
- [Storybook Documentation](https://storybook.js.org/docs)

## Troubleshooting

### MCP endpoint not accessible
- Ensure Storybook is running (`pnpm start` or `pnpm dev:atomic`)
- Check that the Storybook dev server is running on the expected port (default: 6006)
- Verify the MCP addon is properly listed in `.storybook/main.ts`

### Agent cannot connect
- Confirm the agent supports HTTP transport for MCP
- Check network connectivity to the Storybook dev server
- Verify firewall settings allow connections to port 6006
