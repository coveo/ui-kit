# Turborepo Migration

This repository has been migrated from NX to Turborepo for better performance and simpler configuration.

## Key Changes

### Build System
- **Before**: NX with `project.json` files and complex target definitions
- **After**: Turborepo with centralized `turbo.json` configuration

### Commands
- **Before**: `nx build`, `nx test`, `nx run-many`
- **After**: `turbo build`, `turbo test`, `turbo build --filter=package`

### Configuration
- **Before**: Individual `project.json` files per package with complex input/output definitions
- **After**: Single `turbo.json` file with task definitions that automatically apply to all packages

### Package Scripts
- **Before**: Package.json scripts called `nx build`
- **After**: Package.json scripts contain actual build commands (e.g., `npm run build:bundles && npm run build:definitions`)

### Caching
- **Before**: NX caching with manual configuration of inputs/outputs per package
- **After**: Turborepo automatic caching with global configuration and smart defaults

## Benefits

1. **Simpler Configuration**: Single configuration file instead of many project.json files
2. **Better Performance**: Turborepo's faster task scheduling and caching
3. **Clearer Dependencies**: Explicit dependency management through `dependsOn`
4. **Less Boilerplate**: No need for NX executors and complex target definitions

## Common Tasks

### Building
```bash
# Build all packages
turbo build

# Build specific package
turbo build --filter=@coveo/headless

# Build package and dependencies
turbo build --filter=...@coveo/atomic
```

### Testing
```bash
# Run all tests
turbo test

# Run tests for specific package
turbo test --filter=@coveo/headless

# Run affected tests only
turbo test --affected
```

### Development
```bash
# Run dev mode for specific package
npm run dev --filter=@coveo/atomic

# Run multiple packages in dev mode
npm run dev:atomic  # Uses concurrently to run headless + atomic
```

## Migration Notes

- All existing functionality is preserved
- Build order and dependency resolution work the same way
- Caching behavior is equivalent or better
- CI/CD pipelines have been updated to use new commands
- Release process continues to work with the same phases