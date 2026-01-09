# OpenCode setup

This repo includes an `opencode.json` configuration for use with the OpenCode CLI.

## What is OpenCode?

[OpenCode](https://opencode.ai/) is a terminal-based coding assistant that can:

- Use repository-specific instructions.
- Run local tooling.
- Invoke configured agents (personas/models) and MCP servers.

In this repo, OpenCode is configured to:

- Load engineering instructions from `.github/instructions/*`.
- Use Biome as a formatter.
- Enable MCP servers for Atlassian and Playwright.
- Provide predefined agents (including `Sisyphus`).

The repo configuration lives in `opencode.json` at the repository root.

## Install OpenCode

Choose one of the official install options:

- Script: `curl -fsSL https://opencode.ai/install | bash`
- Homebrew: `brew install anomalyco/tap/opencode`
- npm/pnpm: `pnpm install -g opencode-ai` (or `npm install -g opencode-ai`)
- Docker: `docker run -it --rm ghcr.io/anomalyco/opencode`

See the official docs for the latest options:

- https://opencode.ai/docs/

## Authenticate (GitHub Copilot models)

This repository’s default agent models are configured under the `github-copilot/*` provider in `opencode.json`.

To use those models:

1. Run `opencode auth login`.
2. Choose the GitHub Copilot provider.
3. Follow the device login flow at `https://github.com/login/device`.
4. Verify OpenCode can see models with `opencode models`.

If you prefer using another provider (OpenAI/Anthropic/etc.), configure it in your personal OpenCode config and/or set provider-specific environment variables. Avoid committing secrets.

References:

- https://opencode.ai/docs/providers

## VS Code extension (optional)

If you use VS Code, install the OpenCode extension for a smoother workflow.

- https://opencode.ai/docs/

## Run OpenCode in this repo

From the repository root:

- Interactive TUI: `opencode`
- One-off prompt: `opencode run "<your prompt>"`

OpenCode will automatically pick up the repo’s `opencode.json` when you run it from within this repository.

## Repo configuration notes

The OpenCode configuration is committed as `opencode.json`.

Key parts used in this repo:

- `instructions`: points to `.github/instructions/general.instructions.md` and `.github/instructions/general.typescript.instructions.md`
- `formatter.biome`: formats supported files using `pnpm exec biome check --write`
- `mcp`: enables local MCP servers
  - Atlassian MCP via `npx -y mcp-remote https://mcp.atlassian.com/v1/sse`
  - Playwright MCP via `npx @playwright/mcp`
  - **Note:** The GitHub MCP is not currently supported in OpenCode
- `agent`: defines named agents and their models

## Sisyphus

Sisyphus is an advanced agent harness from [Oh My OpenCode](https://github.com/code-yeongyu/oh-my-opencode) that transforms OpenCode into a **multi-agent coding system**. Think of it as upgrading from a single assistant to an entire development team.

**What Sisyphus provides:**

- **Specialized teammate agents** - Oracle (design/debugging), Frontend Engineer (UI/UX), Librarian (docs/research), Explore (fast codebase search)
- **Background parallel execution** - Fire off multiple agents simultaneously while you continue working
- **Task persistence** - Won't quit halfway through complex tasks; enforces completion of TODO lists
- **Enhanced tooling** - Full LSP/AST support, curated MCPs (web search, official docs, GitHub code search)
- **Clean code discipline** - Removes excessive AI-generated comments to keep code human-like

**When to use:**

- **`Sisyphus`** (Claude Sonnet 4.5) - Complex implementation tasks requiring sustained focus and multi-step execution
- **`Planner-Sisyphus`** (GPT-5 Mini) - Fast planning, work breakdown, and task organization
- **Default agent** - Simple, isolated changes or exploratory questions

**The magic word: `ultrawork`** (or `ulw`)

Just include `ultrawork` in your prompt and Sisyphus automatically:
- Spawns parallel background agents for exploration
- Gathers deep context from docs and codebases
- Executes relentlessly until 100% task completion
- No need to read docs or plan manually—it figures everything out

Example: `ultrawork: migrate all components to TypeScript`

In this repo, Sisyphus agents are pre-configured in `opencode.json`:

- `Planner-Sisyphus` uses `github-copilot/gpt-5-mini`
- `Sisyphus` uses `github-copilot/claude-sonnet-4.5`

**Installation:**

```bash
bunx oh-my-opencode install
# Follow prompts to configure authentication
```

**Usage:**

- Switch agents in the TUI (usually `Tab` key)
- Invoke as subagent: `@Sisyphus <task>` or `@Planner-Sisyphus <task>`
- Include `ultrawork` or `ulw` in prompts for full autonomous mode

References:

- https://github.com/code-yeongyu/oh-my-opencode
- https://opencode.ai/docs/agents/

## Troubleshooting

- Model not found / unauthorized
  - Re-run `opencode auth login`.
  - Confirm `opencode models` lists `github-copilot/*` models.
- Repo config not applied
  - Ensure you are in the repository root (or a subdirectory) when running `opencode`.
  - Confirm `opencode.json` exists at the root of the repository.

## Security notes

- Do not commit API keys or tokens into `opencode.json`.
- Prefer provider-specific environment variables or OpenCode’s local credential storage.

## Related repository docs

- Devcontainer setup: `.devcontainer/README.md`
- Atomic Storybook MCP: `packages/atomic/README.md`
