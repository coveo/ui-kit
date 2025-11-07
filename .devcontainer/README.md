# Devcontainer Configuration

This directory contains the configuration for GitHub Codespaces and VS Code Dev Containers.

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

## What's Included

### Pre-installed Tools
- Node.js 22
- pnpm (via corepack)
- GitHub CLI
- All dependencies installed (`pnpm install --frozen-lockfile`)
- Full project build completed (`pnpm run build`)

### VS Code Extensions
The following extensions are automatically installed:
- Biome (formatter and linter)
- Code Spell Checker
- GitHub Copilot
- Lit Plugin
- Playwright Test Runner
- Tailwind CSS IntelliSense
- Vitest Explorer

### VS Code Settings
- Default formatter: Biome
- Format on save: Enabled
- Auto-organize imports: Enabled
- LF line endings enforced

## Lifecycle Commands

The devcontainer uses an optimized lifecycle for GitHub Codespaces prebuilds:

1. **`updateContentCommand`** - Runs during prebuild (slow operations)
   - Enables pnpm via corepack
   - Installs all dependencies with frozen lockfile
   - Builds all packages
   
2. **`postCreateCommand`** - Runs after prebuild (fast operations)
   - Ensures pnpm is enabled
   
3. **`postStartCommand`** - Runs every time the codespace starts
   - Displays a welcome message

This separation ensures that expensive operations (install & build) are cached in the prebuild,
while codespace creation and startup remain fast.

## GitHub Codespaces Prebuilds

Prebuilds must be configured in the repository settings:

1. Go to repository **Settings** → **Codespaces**
2. Click **Set up prebuild**
3. Configure:
   - **Configuration**: Select `.devcontainer/devcontainer.json`
   - **Region**: Choose regions where developers are located
   - **Trigger**: On push to main branch
4. Click **Create**

Once configured, prebuilds will be created automatically:
- On every push to `main` branch
- On schedule (configurable, recommended: daily or weekly)
- When devcontainer configuration or dependencies change

### Benefits of Prebuilds
- Reduces codespace creation from ~5 minutes to ~30 seconds
- Pre-installs all dependencies (1.6GB of node_modules)
- Pre-builds all 36 packages in the monorepo
- Ensures consistent developer environment

## Customization

To customize the devcontainer:
1. Edit `devcontainer.json`
2. Test locally with VS Code Dev Containers
3. Commit and push to trigger a new prebuild

## Benefits

### Before Optimization
- Codespace creation: ~5 minutes
- Manual dependency installation and build
- No pre-configured VS Code extensions
- Inconsistent developer environment

### After Optimization
- Codespace creation: ~30 seconds (with prebuild)
- Dependencies and build pre-cached
- All recommended extensions auto-installed
- Consistent, production-ready environment

## Troubleshooting

### Codespace takes a long time to start
- Check if prebuilds are enabled in repository settings
- Verify the prebuild workflow ran successfully
- Consider manually triggering the prebuild workflow

### Build failures in prebuild
- Check the workflow logs in `.github/workflows/codespaces-prebuild.yml`
- Ensure `pnpm install --frozen-lockfile` and `pnpm run build` work locally
- Verify all dependencies are correctly specified in `pnpm-lock.yaml`

### Extensions not installing
- Check VS Code output panel for extension installation logs
- Verify extension IDs in `devcontainer.json` are correct
- Some extensions may require additional configuration

## Resources

- [GitHub Codespaces Documentation](https://docs.github.com/en/codespaces)
- [Dev Containers Specification](https://containers.dev/)
- [Prebuild Configuration Guide](https://docs.github.com/en/codespaces/prebuilding-your-codespaces/configuring-prebuilds)
