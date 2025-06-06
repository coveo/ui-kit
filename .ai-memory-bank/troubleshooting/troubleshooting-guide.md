# Troubleshooting Guide

## Quick Diagnostic Commands

### Environment Health Check

```bash
# Check Node.js version
node --version  # Should be 20.9.0+ or 22.11.0+

# Check npm version
npm --version

# Verify workspace setup
npm run lint:check

# Test build system
npm run build
```

### Dependency Issues

```bash
# Reset everything
npm run clean:install

# Reset package-lock only
npm run reset:install

# Use workspace reinstall task
npx nx run shell:reinstall-dependencies
```

## Common Error Patterns

### Build Failures

#### "Module not found" Errors

**Symptoms**:

```
Error: Cannot find module '@coveo/headless'
Module not found: Can't resolve '@coveo/bueno'
```

**Diagnosis**:

1. Check if dependencies are built: `npm run build`
2. Verify workspace linking: `npm ls @coveo/headless`
3. Check package.json dependencies

**Solutions**:

```bash
# Build dependencies first
npx nx run headless:build

# Rebuild everything
npm run build

# Reset workspace
npm run clean:install
```

#### TypeScript Compilation Errors

**Symptoms**:

```
TS2307: Cannot find module declaration
TS2322: Type mismatch errors
TS6059: File not found
```

**Diagnosis**:

1. Check which tsconfig.json is being used
2. Verify all workspace packages are built
3. Look for version mismatches

**Solutions**:

```bash
# Build with specific config
npx nx run atomic:build --config=tsconfig.stencil.json

# Check TypeScript version consistency
npm ls typescript

# Verify type definitions
npm run validate:definitions
```

### Runtime Issues

#### Controller Subscription Errors

**Symptoms**:

```
Error: Controller is not initialized
Uncaught TypeError: Cannot read property 'state' of undefined
```

**Diagnosis**:

1. Check controller initialization order
2. Verify engine configuration
3. Look for subscription cleanup issues

**Solutions**:

```typescript
// Proper subscription pattern
connectedCallback() {
  this.engine = buildSearchEngine(config);
  this.controller = buildController(this.engine);
  this.unsubscribe = this.controller.subscribe(() => {
    this.state = this.controller.state;
  });
}

disconnectedCallback() {
  this.unsubscribe?.();
}
```

#### API Connection Issues

**Symptoms**:

```
CORS errors
401 Unauthorized
Network timeout errors
```

**Diagnosis**:

1. Check Coveo platform configuration
2. Verify API key and organization ID
3. Test network connectivity

**Solutions**:

```typescript
// Proper engine configuration
const engine = buildSearchEngine({
  configuration: {
    organizationId: 'your-org-id',
    accessToken: 'your-api-key',
    environment: 'production', // or 'stg', 'dev'
  },
});
```

### Testing Issues

#### E2E Test Failures

**Symptoms**:

- Tests timeout waiting for elements
- Inconsistent test results
- Browser automation failures

**Diagnosis**:

1. Check if development server is running
2. Verify test environment setup
3. Look for timing issues

**Solutions**:

```bash
# Ensure dev server is running
npx nx run atomic:dev

# Run with specific browser
npx nx run atomic:e2e:firefox

# Debug mode
npx nx run atomic:e2e:watch
```

#### Unit Test Mocking Issues

**Symptoms**:

```
TypeError: Cannot read property of undefined
Mock function not called
State not updating in tests
```

**Solutions**:

```typescript
// Proper Headless controller mocking
const mockController = {
  state: {
    query: '',
    results: [],
  },
  subscribe: jest.fn(),
  executeSearch: jest.fn(),
};

// Mock the controller creation
jest.mock('@coveo/headless', () => ({
  buildSearchBox: () => mockController,
}));
```

## Package-Specific Issues

### Headless

#### Bundle Size Issues

**Problem**: Bundle larger than expected for specific use case

**Investigation**:

```bash
# Generate metafiles
npm run build

# Analyze at esbuild.github.io/analyze/
# Upload metafiles from packages/headless/dist/
```

**Common Causes**:

- Importing wrong entry point
- Circular dependencies
- Unused imports not tree-shaken

#### Redux DevTools Not Working

**Problem**: Cannot inspect Headless state in Redux DevTools

**Solution**:

```typescript
// Enable Redux DevTools in development
const engine = buildSearchEngine({
  configuration: {
    /* ... */
  },
  devTools: process.env.NODE_ENV === 'development',
});
```

### Atomic

#### Stencil Compilation Issues

**Problem**: Changes to .tsx files not reflecting in browser

**Solution**:

```bash
# Use Stencil flag for .tsx changes
npx nx run atomic:dev --stencil

# Or rebuild Stencil components
npm run build:stencil
```

#### Component Registration Conflicts

**Problem**: Custom elements already defined error

**Cause**: Multiple component library registrations

**Solution**:

```typescript
// Check if already defined
if (!customElements.get('atomic-search-box')) {
  defineCustomElements();
}
```

#### CSS Variables Not Working

**Problem**: Theming not applying correctly

**Investigation**:

```css
/* Check CSS variable inheritance */
:host {
  --atomic-primary: var(--my-primary, #1372ec);
}

/* Verify in browser DevTools */
```

### Quantic

#### Salesforce Deployment Issues

**Problem**: Components not deploying to scratch org

**Diagnosis**:

```bash
# Check org status
sf org list

# Verify authentication
sf org display --target-org your-alias

# Check deployment status
sf project deploy report
```

**Solutions**:

```bash
# Re-authenticate
sf org login web --alias your-alias

# Force deploy
sf project deploy start --source-dir force-app --ignore-conflicts
```

#### LWS Compatibility Issues

**Problem**: Components not working with Lightning Web Security

**Common Issues**:

- Dynamic script loading blocked
- CSP violations
- API access restrictions

**Solutions**:

- Use static resources for dependencies
- Follow LWS-compatible patterns
- Test in both LWS enabled/disabled environments

#### Static Resource Size Limits

**Problem**: Static resource exceeds 5MB Salesforce limit

**Solutions**:

```bash
# Check bundle sizes
npm run build
ls -la force-app/main/default/staticresources/

# Optimize bundles
# - Remove unnecessary dependencies
# - Use minified versions
# - Split large resources
```

## Performance Issues

### Memory Leaks

**Symptoms**:

- Browser memory usage grows over time
- Page becomes unresponsive
- Controller subscriptions not cleaned up

**Investigation**:

```typescript
// Add cleanup logging
disconnectedCallback() {
  console.log('Cleaning up subscriptions');
  this.unsubscribe?.();
}
```

### Large Bundle Sizes

**Investigation Tools**:

```bash
# Bundle analyzer
npm run build
# Upload metafiles to esbuild.github.io/analyze/

# Package size analysis
npm run package-compatibility
```

**Optimization Strategies**:

- Use specific imports: `import { buildSearchBox } from '@coveo/headless'`
- Lazy load optional features
- Check for duplicate dependencies

### Slow Build Times

**Investigation**:

```bash
# Profile build
DEBUG=* npm run build

# Check dependency graph
nx graph --file=topology.json
```

**Solutions**:

- Use Nx caching
- Parallelize builds
- Optimize TypeScript configuration

## Debug Strategies

### Browser DevTools

```javascript
// Debug Headless state
window.coveoHeadless = engine;
console.log(engine.state);

// Debug component state
const component = document.querySelector('atomic-search-box');
console.log(component.state);
```

### Network Debugging

```javascript
// Monitor Coveo API calls
window.addEventListener('beforeunload', () => {
  console.log(
    'Pending requests:',
    performance.getEntries().filter((entry) => entry.name.includes('coveo'))
  );
});
```

### Logging Configuration

```typescript
// Enable verbose logging
const engine = buildSearchEngine({
  configuration: {
    /* ... */
  },
  logLevel: 'debug',
});
```

## Recovery Procedures

### Complete Reset

```bash
# Nuclear option - reset everything
git clean -xfd
npm run clean:install
npm run build
```

### Partial Reset

```bash
# Reset specific package
rm -rf packages/atomic/dist packages/atomic/node_modules
npm run build
```

### Cache Issues

```bash
# Clear Nx cache
nx reset

# Clear npm cache
npm cache clean --force

# Clear browser cache and reload
```

## When to Escalate

### File a Bug Report When:

- Reproducible error across different environments
- Behavior differs from documented API
- Performance regression in new version
- Security vulnerability discovered

### Seek Help When:

- Complex integration issues
- Architecture decision needed
- Performance optimization required
- Breaking change impact assessment

### Include in Reports:

- Environment details (Node.js, browser, OS)
- Minimal reproduction steps
- Error messages and stack traces
- Expected vs actual behavior
- Workarounds attempted
