# Headless Package Guide

## Overview

Headless is the core package providing stateful controllers and business logic for Coveo search experiences. It's built with Redux and follows a controller pattern for state management.

## Architecture

### State Management

- **Redux Store**: Central state management
- **Feature Slices**: Following "ducks pattern" for organization
- **Controllers**: Public API layer abstracting Redux complexity
- **Middlewares**: Cross-cutting concerns (analytics, history, etc.)

### Bundle Strategy

Multiple specialized bundles for different use cases:

- `search` - Full search interface capabilities
- `recommendation` - Product/content recommendations
- `case-assist` - Customer support case management
- `insight` - Analytics and reporting
- `commerce` - E-commerce search and product discovery
- `ssr` - Server-side rendering utilities

## Development Patterns

### Adding a New Controller

1. **Design Document**: Create API design document and get team feedback
2. **Implementation**: Implement under `src/controllers/` directory
3. **Incremental Reviews**: Split into smaller code reviews
4. **Documentation**: JSDoc for all public symbols
5. **Unit Tests**: Comprehensive test coverage
6. **Export Strategy**: Export through appropriate index files and action loaders
7. **Code Samples**: Create samples in `samples` package
8. **Documentation Config**: Add to `headless/doc-parser/use-cases`

### Controller Pattern

```typescript
export interface ControllerDefinition {
  state: ControllerState;
  methods: ControllerMethods;
  subscribe: (listener: () => void) => Unsubscribe;
}
```

### State Organization

```
src/
├── app/                 # Redux store setup
├── state/              # State interfaces
├── features/           # Redux slices (ducks pattern)
│   ├── search/
│   ├── facets/
│   └── analytics/
├── controllers/        # Public controller API
└── utils/             # Shared utilities
```

## Build Configuration

### TypeScript Configurations

- `tsconfig.json` - Main configuration
- Multiple output formats (CJS, ESM, UMD)
- Custom transformers for version injection and analytics

### ESBuild Setup

- Multiple entry points for different use cases
- Bundle analysis with metafiles
- Environment-specific builds (CDN vs NPM)

### Custom Transformers

- **Version Transformer**: Injects package version
- **Analytics Transformer**: Handles analytics configuration

## Testing Strategy

### Unit Testing

- Controller behavior testing
- Redux state management testing
- Mock external dependencies
- Edge case coverage

### Integration Testing

- Full workflow testing
- API integration validation
- Cross-controller interaction testing

## Common Patterns

### Analytics Integration

- Controllers automatically send analytics events
- Configurable analytics middleware
- Support for both legacy and next analytics modes

### Error Handling

- Graceful degradation for API failures
- User-friendly error messages
- Detailed logging for debugging

### Performance Considerations

- Lazy loading of optional features
- Optimized bundle sizes per use case
- Efficient state updates

## Migration Guidelines

### Breaking Changes

- Follow semantic versioning
- Provide migration documentation
- Deprecation warnings before removal

### API Evolution

- Maintain backward compatibility when possible
- Use feature flags for experimental APIs
- Clear upgrade paths for major versions

## Development Workflow

### Local Development

```bash
# Start in development mode
npm run dev

# Build for testing
npm run build

# Run tests
npm test

# Watch tests
npm run test:watch
```

### Bundle Analysis

```bash
# Build generates metafiles automatically
npm run build

# Analyze bundle content at esbuild.github.io/analyze/
# Upload metafiles from dist/ folder
```

## Troubleshooting

### Bundle Size Issues

- Use bundle analyzer to identify large dependencies
- Check for circular dependencies
- Verify tree shaking is working
- Review import patterns

### Runtime Performance

- Profile Redux state updates
- Monitor controller subscription overhead
- Optimize frequent operations

### API Integration

- Validate Coveo platform configuration
- Check authentication setup
- Monitor network requests
- Handle rate limiting gracefully

## Best Practices

### Controller Design

- Single responsibility per controller
- Immutable state updates
- Clear method naming
- Comprehensive error handling

### Redux Usage

- Use Redux Toolkit for all new code
- Follow immutability patterns
- Normalize state structure
- Use selectors for derived state

### Documentation

- JSDoc for all public APIs
- Include usage examples
- Document edge cases and limitations
- Keep migration guides updated
