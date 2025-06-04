# Common Gotchas

> 💡 **Tip**: When encountering issues, also check the [Troubleshooting Guide](../troubleshooting/troubleshooting-guide.md) for step-by-step solutions.

## Build System Issues

### Bundle Pollution

**Problem**: Code intended for one use case (e.g., `search`) accidentally ends up in another bundle (e.g., `recommendation`).

**Symptoms**:

- Bundle size unexpectedly large
- Features available that shouldn't be
- Import chains pulling in unrelated code

**Solution**:

- Use esbuild analyzer to investigate bundle content
- Check metafiles in `dist` folder after build
- Analyze import chains that cause pollution
- Restructure imports to avoid cross-contamination

**Tools**: [esbuild analyzer](https://esbuild.github.io/analyze/)

### Dependency Resolution

**Problem**: Workspace dependencies not resolving correctly during development.

**Common Causes**:

- Not running build on dependencies first
- Package-lock.json out of sync
- Node modules cache issues

**Solutions**:

```bash
# Reset package-lock and reinstall
npm run reset:install

# Clean install from scratch
npm run clean:install

# Reinstall dependencies task
npx nx run shell:reinstall-dependencies
```

## Development Workflow Issues

### Stencil Development

**Problem**: Changes to Stencil components not reflecting in dev mode.

**Solution**:

- Use `--stencil` flag when developing Stencil components
- Stencil files require special build process
- Make sure both Atomic and Headless are running in dev mode

**Command**: `npx nx run atomic:dev --stencil`

### TypeScript Configuration

**Problem**: TypeScript compilation issues with multiple tsconfig files.

**Gotcha**: Different packages use different TypeScript configurations:

- `tsconfig.json` - Main config
- `tsconfig.stencil.json` - Stencil-specific
- `tsconfig.lit.json` - Lit component config
- `tsconfig.cdn.json` - CDN build config

**Solution**: Always specify the correct config for your build target.

## Testing Issues

### Mock Setup

**Problem**: Headless controllers not properly mocked in unit tests.

**Pattern**:

```typescript
// Mock the Headless controller before testing component
const mockController = {
  state: {
    /* mock state */
  },
  methods: {
    /* mock methods */
  },
};
```

### E2E Test Reliability

**Problem**: E2E tests failing inconsistently.

**Common Issues**:

- Not waiting for components to load
- Race conditions with API calls
- Browser-specific timing issues

**Solutions**:

- Use proper wait strategies
- Mock external API calls when possible
- Test with multiple browsers (Chrome, Firefox)

## API Integration

### Analytics Warnings

**Problem**: Controllers logging warnings about analytics mode.

**Context**: There's a transition from legacy to "next" analytics mode.
**Solution**: Check analytics configuration and use appropriate mode for your use case.

### Do Not Track (DNT)

**Gotcha**: DNT logic is deprecated and will be removed in V4.
**Impact**: Privacy logic should be handled by implementers, not the library.
**Reference**: See `src/utils/utils.ts` for current implementation.

## Package-Specific Issues

### Quantic (Salesforce LWC)

**Problem**: LWC-specific build and deployment issues.

**Key Points**:

- Requires Salesforce DX CLI
- Different scratch org configurations for LWS enabled/disabled
- Special handling for static resources (Bueno, Headless, DOMPurify, Marked)

**Commands**:

```bash
# Create scratch org
npm run scratch:create

# Deploy to scratch org
npm run deploy:main
```

### Atomic (Web Components)

**Problem**: Custom elements not registering or conflicting.

**Gotchas**:

- Custom elements must be defined only once per page
- Stencil proxy handling for development
- CSS-in-JS handling for different deployment targets

## Release Process

### Version Bumping

**Problem**: Automated release process failing.

**Common Issues**:

- Git branch protection rules
- Missing environment variables
- Package dependency version mismatches

**Recovery**: Check the release workflow documentation and verify all prerequisites.

### CDN vs NPM Builds

**Problem**: Different behavior between CDN and NPM builds.

**Cause**: Different environment variables and build configurations.
**Check**: `DEPLOYMENT_ENVIRONMENT` and `IS_NIGHTLY` environment variables.

## Performance Pitfalls

### Large Bundle Sizes

**Problem**: Production bundles larger than expected.

**Investigation Steps**:

1. Generate metafiles during build
2. Use esbuild analyzer to visualize bundle content
3. Check for unexpected imports
4. Verify tree shaking is working correctly

### Memory Leaks

**Problem**: Controllers not properly cleaned up.

**Prevention**:

- Always unsubscribe from controller state changes
- Dispose of controllers when components unmount
- Avoid circular references in controller subscriptions
