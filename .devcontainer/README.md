# Devcontainer Configuration

This directory contains the configuration for GitHub Codespaces and VS Code Dev Containers, optimized for pnpm monorepo development.

## Quick Start

### Using GitHub Codespaces

1. Click the "Code" button on the GitHub repository
2. Select "Codespaces" tab
3. Click "Create codespace on main"

With prebuilds enabled, your codespace will be ready in ~30 seconds instead of 5+ minutes!

### Using VS Code Dev Containers

1. Install the [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
2. Open the repository in VS Code
3. Press `F1` and select "Dev Containers: Reopen in Container"

## Architecture

### Custom Dockerfile

Following [pnpm Docker best practices](https://pnpm.io/docker), we use a custom Dockerfile that:

- Uses Node.js 22 LTS (jod) via the `node:jod-bookworm` image
- Enables pnpm 10.24.0 via corepack (matching `packageManager` in `package.json`)
- Runs as the `node` user to avoid permission issues
- Includes git and essential development tools

### pnpm Store Caching

The devcontainer uses a Docker volume (`ui-kit-pnpm-store`) to persist the pnpm store across container rebuilds. This significantly speeds up dependency installation:

- First install: Downloads all dependencies
- Subsequent installs: Reuses cached packages from the volume

### Turbo Cache

A separate Docker volume (`ui-kit-turbo-cache`) persists turbo's build cache across container rebuilds. Combined with the prebuild running `pnpm run build`:

- First build: Compiles all packages
- Subsequent builds: Skips unchanged packages using cached outputs

### Optimized Lifecycle

The devcontainer uses GitHub Codespaces prebuild lifecycle:

1. **`updateContentCommand`** - Runs during prebuild (slow operations)
   - Installs all dependencies with frozen lockfile
   - Builds all packages in the monorepo

2. **`postStartCommand`** - Runs every time the codespace starts
   - Displays a welcome message with quick start commands

This separation ensures expensive operations are cached in the prebuild, while codespace startup remains fast.

## What's Included

### Pre-installed Tools
- Node.js 22.x
- pnpm 10.24.0
- turbo 2.5.5
- git
- GitHub CLI

### VS Code Extensions
The following extensions are automatically installed:
- Biome (formatter and linter)
- Code Spell Checker
- GitHub Copilot & Copilot Chat
- Lit Plugin
- MDX Language Support
- Playwright Test Runner
- Tailwind CSS IntelliSense
- Vitest Explorer

### VS Code Settings
- Default formatter: Biome
- Format on save: Enabled
- Auto-organize imports: Enabled
- LF line endings enforced

## GitHub Codespaces Prebuilds

Prebuilds must be configured in the repository settings:

1. Go to repository **Settings** → **Codespaces**
2. Click **Set up prebuild**
3. Configure:
   - **Configuration**: Select `.devcontainer/devcontainer.json`
   - **Region**: Choose regions where developers are located
   - **Trigger**: On push to main branch
4. Click **Create**

### Benefits of Prebuilds
- Reduces codespace creation from ~5 minutes to ~30 seconds
- Pre-installs all dependencies
- Pre-builds all packages in the monorepo
- Ensures consistent developer environment

## Development Workflow

Once your codespace is ready:

```bash
# Start development with hot reload
pnpm run dev:atomic

# Run tests
pnpm test

# Run linting
pnpm run lint:check

# Build all packages
pnpm run build
```

## Troubleshooting

### Codespace takes a long time to start
- Check if prebuilds are enabled in repository settings
- Verify the prebuild workflow ran successfully
- Consider manually triggering a new prebuild

### pnpm install fails
- Ensure `pnpm-lock.yaml` is up to date
- Try deleting the pnpm store volume: `docker volume rm ui-kit-pnpm-store`
- Rebuild the container: "Dev Containers: Rebuild Container"

### Permission errors
- The container runs as the `node` user (UID 1000, GID 1000)
- If you see permission errors, ensure your host files are accessible
- On Linux, you may need to adjust file ownership

### Extensions not installing
- Check VS Code output panel for extension installation logs
- Verify extension IDs in `devcontainer.json` are correct
- Some extensions may require additional configuration

## Resources

- [pnpm Docker Guide](https://pnpm.io/docker)
- [GitHub Codespaces Documentation](https://docs.github.com/en/codespaces)
- [Dev Containers Specification](https://containers.dev/)
- [Prebuild Configuration Guide](https://docs.github.com/en/codespaces/prebuilding-your-codespaces/configuring-prebuilds)
