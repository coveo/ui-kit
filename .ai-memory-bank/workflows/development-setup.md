# Development Setup

## Initial Setup

### Prerequisites

- Node.js 20.9.0+ or 22.11.0+
- npm (comes with Node.js)
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/coveo/ui-kit.git
cd ui-kit

# Install all dependencies and link packages
npm i

# This automatically runs:
# - husky install (git hooks)
# - patch-package (applies patches)
# - playwright install (E2E testing)
```

## Development Workflows

### Basic Development

```bash
# Build all packages
npm run build

# Run tests for all packages
npm test

# Run E2E tests
npm run e2e

# Lint check (without fixing)
npm run lint:check

# Lint and fix issues
npm run lint:fix
```

### Package-Specific Development

#### Atomic + Headless (Recommended)

```bash
# Start both Atomic and Headless in development mode
npx nx run atomic:dev

# With Stencil changes
npx nx run atomic:dev --stencil
```

#### Individual Package Development

```bash
# Build a specific package
npx nx run atomic:build

# Start a specific package in dev mode
npx nx run quantic:dev

# Run tests for a specific package
npx nx run headless:test
```

## Workspace Management

### Adding Dependencies

```bash
# Add to specific workspace
npm i lodash -w @coveo/headless-react-samples

# Add dev dependency
npm i -D jest -w @coveo/atomic
```

### Dependency Issues

```bash
# Reset package-lock and reinstall
npm run reset:install

# Clean everything and reinstall
npm run clean:install

# Use the custom reinstall task
npx nx run shell:reinstall-dependencies
```

## Testing Workflows

### Unit Testing

```bash
# Run all unit tests
npm test

# Watch mode for specific package
npx nx run atomic:test:watch

# Run tests with coverage
npx nx run headless:test --coverage
```

### E2E Testing

```bash
# Run all E2E tests
npm run e2e

# Package-specific E2E
npx nx run atomic:e2e
npx nx run quantic:e2e:playwright

# Browser-specific testing
npx nx run atomic:e2e:firefox
```

### Visual Testing (Atomic)

```bash
# Run visual regression tests
npm run e2e:snapshots

# Update snapshots
npm run e2e:snapshots:watch
```

## Debugging

### Build Issues

1. Check if dependencies are built first: `npm run build`
2. Verify TypeScript configuration
3. Check for circular dependencies
4. Use build with specific config: `npx nx run atomic:build`

### Runtime Issues

1. Check browser console for errors
2. Verify controller subscriptions
3. Check network requests to Coveo APIs
4. Use Redux DevTools for Headless state inspection

### Bundle Analysis

```bash
# Build with metafiles (automatic)
npm run build

# Analyze bundle content
# Open esbuild.github.io/analyze/
# Upload metafiles from dist/ folder
```

## VS Code Integration

### Recommended Extensions

- TypeScript and JavaScript Language Features
- ESLint
- Prettier
- Thunder Client (for API testing)

### Workspace Settings

The repository includes `.vscode/` configuration for:

- Debugger configurations
- Task definitions
- Extension recommendations

### Available Tasks

- `shell: reinstall dependencies`
- `shell: build`
- `shell: discard package-lock.json changes`

## Git Workflow

### Commits

```bash
# Use conventional commits
npm run commit

# Pre-commit hooks run automatically
# - lint-staged
# - type checking
# - test execution
```

### Branch Management

- Main branch: `master`
- Release branch: Auto-managed by CI
- Feature branches: `feature/description`
- Bug fixes: `fix/description`

## Environment Variables

### Common Variables

- `DEPLOYMENT_ENVIRONMENT`: 'CDN' or undefined
- `IS_NIGHTLY`: 'true' for nightly builds
- `NODE_ENV`: 'development' or 'production'

### Package-Specific

- Quantic: Salesforce DX environment variables
- Translation GPT: `COVEO_AZURE_OPEN_AI_ENDPOINT`, `COVEO_AZURE_OPEN_AI_KEY`

## Troubleshooting Common Issues

### "Module not found" errors

1. Run `npm run build` to ensure dependencies are built
2. Check if workspace dependencies are properly linked
3. Clear node_modules and reinstall

### TypeScript compilation errors

1. Check which tsconfig.json is being used
2. Verify all dependencies are built
3. Check for version mismatches between packages

### E2E test failures

1. Ensure development server is running
2. Check if Coveo API credentials are configured
3. Verify browser automation setup
