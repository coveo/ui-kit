# @coveo/atomic-legacy

> ⚠️ **Internal Package**: This package is used internally by `@coveo/atomic` for components using legacy Stencil technologies. **It should not be used directly in your projects.**

## Overview

`@coveo/atomic-legacy` provides legacy Stencil-based components that are consumed by the main `@coveo/atomic` package. This package exists to support backward compatibility during the migration from Stencil to Lit components.

## Purpose

This package is part of Coveo's ongoing modernization effort to migrate from Stencil to Lit for better performance, smaller bundle sizes, and improved maintainability. Components in this package use the legacy Stencil architecture and are gradually being migrated to the main `@coveo/atomic` package as Lit components.

## Components

### atomic-suggestion-renderer

An internal component used to render individual search box suggestions. It handles rendering of suggestion content that can be either Stencil VNodes or native DOM Elements, providing compatibility between legacy Stencil components and modern Lit implementations.

**Key features:**
- Renders suggestion content for search box autocomplete
- Supports both Stencil VNode and native Element content
- Handles accessibility attributes (ARIA labels, keyboard navigation)
- Provides visual states (selected, hover)
- Supports internationalization via i18next

## Entry Points

The package exposes a single entry point:

- `@coveo/atomic-legacy/atomic-suggestion-renderer`: Direct access to the suggestion renderer component with types and implementation

## Usage

This package is consumed automatically by `@coveo/atomic` and should not be installed or imported directly in application code.

**Do not use:**
```typescript
// ❌ Don't import from atomic-legacy in your projects
import { AtomicSuggestionRenderer } from '@coveo/atomic-legacy';
```

**Instead, use:**
```typescript
// ✅ Use the main @coveo/atomic package
import { defineCustomElements } from '@coveo/atomic/loader';
```

## Development

### Building

From the monorepo root:

```sh
pnpm turbo run build --filter=@coveo/atomic-legacy
```

### Dependencies

- **@stencil/core**: Stencil framework for web components
- **i18next**: Internationalization framework (dev dependency)

## Migration

Components in this package are candidates for migration to Lit. If you're contributing to the migration effort:

1. Refer to the [Atomic contribution guidelines](../atomic/CONTRIBUTING.md)
2. Follow the [Stencil → Lit migration instructions](../../.github/instructions/atomic.instructions.md)
3. Use the migration prompts in `.github/prompts/`

## Related Packages

- [`@coveo/atomic`](../atomic/README.md) - Main Atomic web components library
- [`@coveo/headless`](../headless/README.md) - Headless search library powering Atomic

## License

Apache-2.0. See [LICENSE](../../LICENSE.md) for details.
