# Coding Standards

## General Principles

### TypeScript First

- All new code must be written in TypeScript
- Use strict TypeScript configuration
- JSDoc is **mandatory** for all public symbols that users will interact with
- Private symbols that are not exported do not require documentation

### Code Organization

#### Source Folder Structure (Headless)

- `/src` base should only contain exports
- `/app` - Redux store, root reducer, middlewares
- `/state` - Application state interfaces
- `/features` - Feature-specific Redux slices (following "ducks pattern")
- `/controllers` - Headless controllers exported to users
- `/utils` - Common utilities
- `/api` - API calls and related logic
- `/test` - Test mocks and utilities

#### Package Structure

- Each package should have a clear single responsibility
- Use workspace dependencies for internal packages
- Export strategy should be deliberate and minimal

## Script Naming Conventions

Follow these rules for `package.json` scripts:

### Nesting with Colons

Scripts may be nested using `:` symbol for either:

1. **Fragments** - nested script is part of parent

   ```json
   {
     "build": "npm run build:bundles && npm run build:definitions",
     "build:bundles": "...",
     "build:definitions": "..."
   }
   ```

2. **Alternatives** - nested script is alternative configuration
   ```json
   {
     "e2e": "cypress run --browser chrome",
     "e2e:firefox": "cypress run --browser firefox",
     "e2e:watch": "cypress open --browser chrome --e2e"
   }
   ```

### Required Scripts

- **`build`** - Generates all files needed for dependent projects
- **`dev`** - Development mode with hot reloading
- **`test`** - Run unit tests
- **`e2e`** - Run end-to-end tests
- **`lint:check`** - Check linting without fixing
- **`lint:fix`** - Fix linting issues

## Testing Strategy

### Unit Tests (Jest)

- Focus on isolated component behavior
- Mock external dependencies (especially Headless controllers)
- Test HTML rendering based on state and props
- Cover edge cases and error conditions
- Validate property updates from user interactions

### E2E Tests (Playwright/Cypress)

- Test complete user workflows
- Validate integration with external systems
- Test real API interactions
- Browser-specific behavior testing
- Cross-component integration testing

## Import/Export Patterns

### Barrel Exports

- Use index.ts files for clean public APIs
- Don't export everything - be selective
- Group related exports logically

### Internal Imports

- Use relative imports within packages
- Use workspace imports between packages
- Avoid deep imports into other package internals

## Error Handling

### User-Facing Errors

- Always provide meaningful error messages
- Include context about what the user can do
- Log technical details separately for debugging

### API Integration

- Handle network failures gracefully
- Provide fallback behavior when possible
- Validate API responses before use

## Performance Considerations

### Bundle Size

- Monitor bundle size in CI
- Use dynamic imports for optional features
- Analyze bundle content with esbuild analyzer
- Remove dead code aggressively

### Runtime Performance

- Minimize re-renders in React components
- Use memoization judiciously
- Optimize large list rendering
- Profile performance-critical paths
