# Project Overview

## Repository Structure

This is a **monorepo** containing multiple interconnected packages for building Coveo search experiences.

### Core Architecture

```
ui-kit/
├── packages/
│   ├── headless/          # Core stateful logic (Redux-based)
│   ├── atomic/            # Web Components (Stencil-based)
│   ├── quantic/           # Salesforce LWC Components
│   ├── atomic-react/      # React bindings for Atomic
│   ├── atomic-angular/    # Angular bindings for Atomic
│   ├── headless-react/    # React hooks for Headless
│   ├── bueno/             # Schema validation library
│   ├── auth/              # Authentication utilities
│   └── samples/           # Usage examples and demos
```

### Package Dependencies

```
Headless (Core Logic)
    ↓
Atomic/Quantic (UI Components)
    ↓
Framework Bindings (React/Angular)
    ↓
Sample Applications
```

**Note**: For detailed development patterns in each package, see:

- [Headless Package Guide](../package-specific/headless.md)
- [Atomic Chemistry Guide](../package-specific/atomic-chemistry.md)
- [Quantic Package Guide](../package-specific/quantic.md)

## Key Concepts

### Headless-First Architecture

- **Headless**: Provides stateful controllers and business logic
- **UI Libraries**: Consume Headless controllers to build components
- **Framework Bindings**: Wrap UI libraries for specific frameworks

### Bundle Strategy

- Multiple specialized bundles for different use cases (search, recommendation, case-assist, insight, commerce, ssr)
- Bundles are optimized to include only necessary code for each use case
- CDN and NPM distribution strategies
- See [Build & Release Guide](../workflows/build-and-release.md) for technical details

### Build System

- **Nx**: Workspace management and build orchestration
- **ESBuild**: Fast JavaScript bundling
- **TypeScript**: Primary language with custom transformers
- **Stencil**: Web component compilation (Atomic)

## Use Cases Supported

1. **Search**: Full-text search interfaces
2. **Recommendations**: Product/content recommendation widgets
3. **Case Assist**: Customer service case management
4. **Insight**: Analytics and reporting dashboards
5. **Commerce**: E-commerce search and product discovery

## Platform Integration

- **Coveo Platform**: Primary backend service
- **Salesforce**: Native LWC integration (Quantic)
- **Web Standards**: Framework-agnostic web components
- **React/Angular**: Framework-specific bindings
