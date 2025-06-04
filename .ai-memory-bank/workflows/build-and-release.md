# Build and Release Process

## Build System Overview

### Build Tools

- **Nx**: Workspace management and task orchestration
- **ESBuild**: Fast JavaScript bundling with custom plugins
- **TypeScript**: Compilation with custom transformers
- **Stencil**: Web component compilation (Atomic only)

### Build Dependencies

Builds must follow dependency order:

```
Bueno → Headless → Atomic/Quantic → Framework Bindings → Samples
```

## Development Builds

### Quick Development

```bash
# Build all packages
npm run build

# Build with Nx (parallelized)
nx run-many --target=build

# Build specific package
npx nx run atomic:build
```

### Package-Specific Build Details

#### Headless

- Multiple bundle outputs for different use cases
- ESBuild with custom transformers (analytics, version)
- Generates metafiles for bundle analysis
- Supports both CDN and NPM distribution

#### Atomic

- Stencil compilation to web components
- Lit component generation
- CSS processing and optimization
- Multiple TypeScript configurations
- Custom elements manifest generation

#### Quantic

- Babel transformation of Headless for Salesforce
- Static resource bundling (Bueno, Headless, DOMPurify, Marked)
- JSDoc generation for documentation
- Salesforce package creation

## Release Process

### Two-Phase Release System

#### 1. Pre-Release Process

- **Trigger**: Every commit to master
- **Purpose**: Frequent testing and early access
- **Characteristics**:
  - Does not modify master branch
  - Creates pre-release versions
  - Allows rapid iteration
  - Tests release pipeline

#### 2. Scheduled Release Process

- **Trigger**: Manual or scheduled
- **Purpose**: Official stable releases
- **Characteristics**:
  - Modifies master branch
  - Creates official version tags
  - Updates changelogs
  - Publishes to npm/CDN

### Release Phases

#### Phase 0: Pre-flight Checks

- Verify all builds pass
- Check dependency compatibility
- Validate test suites

#### Phase 1: Version Bumping

```bash
npm run release:phase1
# - Bumps package versions
# - Updates changelogs
# - Builds packages
```

#### Phase 2: Tag Creation

- Creates git tags for each package
- Pushes tags to repository

#### Phase 3: Publishing

```bash
npm run release:phase3
# - Publishes to npm
# - Uploads to CDN
# - Notifies documentation team
```

#### Phase 4: Documentation Update

- Updates docs.coveo.com
- Generates API documentation
- Updates sample code

#### Phase 5: Post-Release

- Cleanup temporary files
- Update release notes
- Notify stakeholders

## CI/CD Pipeline

### GitHub Actions Workflow

1. **Trigger**: Push to master or PR
2. **Build**: All packages in dependency order
3. **Test**: Unit tests, E2E tests, linting
4. **Security**: Dependency scanning, license checking
5. **Release**: Automated release process (if master)

### Branch Protection

- Master branch locked during releases
- Only release bot can push during release process
- Requires passing CI checks
- Requires code review approval

## Distribution Strategies

### NPM Distribution

- Individual packages published separately
- Workspace dependencies managed automatically
- Semantic versioning across all packages
- Pre-release versions for testing

### CDN Distribution

- Minified bundles for browser consumption
- Multiple entry points for different use cases
- Nightly builds for latest features
- Version-specific URLs for cache busting

### Salesforce Distribution (Quantic)

- SFDX package creation
- Managed package promotion
- Scratch org testing
- AppExchange distribution

## Build Configuration

### Environment Variables

```bash
# CDN builds
DEPLOYMENT_ENVIRONMENT=CDN

# Nightly builds
IS_NIGHTLY=true

# Node environment
NODE_ENV=production
```

### TypeScript Configurations

- `tsconfig.json` - Main configuration
- `tsconfig.stencil.json` - Stencil-specific settings
- `tsconfig.lit.json` - Lit component compilation
- `tsconfig.cdn.json` - CDN build optimization

### ESBuild Plugins

- **UMD Wrapper**: Creates UMD bundles for browser usage
- **Alias Plugin**: Handles module aliasing
- **Version Transformer**: Injects version information
- **Analytics Transformer**: Handles analytics configuration
- **SVG Transformer**: Processes SVG assets

## Bundle Optimization

### Tree Shaking

- Aggressive dead code elimination
- Use case-specific bundles
- Dynamic imports for optional features

### Bundle Analysis

```bash
# Generate metafiles (automatic during build)
npm run build

# Analyze bundles
# 1. Go to esbuild.github.io/analyze/
# 2. Upload metafiles from dist/ folder
# 3. Investigate large or unexpected dependencies
```

### Size Monitoring

- Bundle size tracked in CI
- Regression detection
- Performance budgets enforced

## Troubleshooting Build Issues

### Common Build Failures

1. **Dependency order**: Ensure dependencies are built first
2. **TypeScript errors**: Check all tsconfig files
3. **Missing environment variables**: Verify required env vars
4. **Stencil compilation**: Use correct TypeScript config

### Debug Build Process

```bash
# Verbose build output
DEBUG=* npm run build

# Build single package with details
npx nx run atomic:build --verbose

# Check dependency graph
nx graph --file=topology.json
```

### Cache Issues

```bash
# Clear Nx cache
nx reset

# Clear node_modules
npm run clean:install

# Clear build outputs
rm -rf packages/*/dist packages/*/cdn
```

## Release Hotfixes

### Emergency Release Process

1. Create hotfix branch from master
2. Apply minimal fix
3. Run abbreviated release process
4. Merge back to master

### Rollback Procedure

1. Identify problematic version
2. Revert release commits
3. Re-run release with previous version
4. Update documentation

## Quality Gates

### Pre-Release Checks

- All tests passing
- No linting errors
- Bundle size within limits
- No security vulnerabilities

### Post-Release Validation

- Verify npm package availability
- Test CDN bundle loading
- Validate documentation updates
- Monitor error reporting
