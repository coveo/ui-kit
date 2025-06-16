---
applyTo: '**packages/atomic/**/**'
---

_All new atomic components should be lit components, not stencil components. This document describes the structure and conventions for atomic components in the UI Kit._

## Atomic Design Principles

The atomic package follows [Atomic Design methodology](https://atomicdesign.bradfrost.com/) by Brad Frost. This methodology provides a hierarchical approach to building interface design systems:

### Design System Hierarchy

1. **Atoms**: Basic building blocks that can't be broken down further (e.g., buttons, inputs, labels, icons)
2. **Molecules**: Simple groups of UI elements functioning together as a unit (e.g., search forms, navigation items)
3. **Organisms**: Complex components composed of groups of molecules and/or atoms (e.g., headers, product grids, card layouts)
4. **Templates**: (Not used in Coveo Atomic) Page-level objects that place components into layouts and demonstrate content structure
5. **Pages**: (Not used in Coveo Atomic) Specific instances of templates with real representative content

### Component Development Guidelines

When creating atomic components, consider their role in the design hierarchy:

- **Single Responsibility**: Each component should do one thing well
- **Reusability**: Design for reuse across different contexts and interfaces
- **Composition**: Build complex interfaces by combining simpler components
- **Content Structure**: Separate content structure (templates) from final content (pages)
- **Modularity**: Components should work independently and in combination with others

### Naming and Organization

Components should be organized to reflect their atomic design level:

- Keep atoms simple and focused on individual UI elements
- Group related atoms into functional molecules
- Combine molecules into larger organisms that form interface sections
- Use templates to demonstrate layout and content structure relationships

When generating new atomic component use the script like this:

```bash
cd packages/atomic && node scripts/generate-component.mjs test-component src/components/common
```

This will create a new component in the `src/components/common` directory with the name `test-component`.

The generate-lit-exports.mjs script is used to generate the exports for the new component in the `src/components/index.ts` file.

## Structure

The atomic components are placed in the `src/components` directory. They are organized by use case, such as `commerce`, `common`, `search`, etc. Each (lit) component has its own directory containing the following files:

- `atomic-test-component.mdx`: The documentation file for the component.
- `atomic-test-component.new.stories.tsx`: The Storybook stories for the component.
- `atomic-test-component.ts`: The main component file.
- `atomic-test-component.spec.ts`: The test file for the component.
- `atomic-test-component.tw.css`: The CSS file for the component.c
- `e2e/atomic-test-component.e2e.ts`: The end-to-end test file.
- `e2e/fixture.ts`: The E2E test fixture.
- `e2e/page-object.ts`: The E2E page object.

Components not yet migrated to lit use stencil, and have the following files:

- `atomic-test-component.tsx`: The main component file (Stencil-based).
- `atomic-test-component.pcss`: The PostCSS file for the component.
- `atomic-test-component.new.stories.tsx`: The Storybook stories for the component.
- `atomic-test-component.spec.ts`: The test file for the component.
- `e2e/atomic-test-component.e2e.ts`: The end-to-end test file.
- `e2e/fixture.ts`: The E2E test fixture.
- `e2e/page-object.ts`: The E2E page object.

## Component Directories

Components are organized by use case in the following directories:

- `src/components/commerce/`: Commerce-related components (e.g., product lists, shopping cart features)
- `src/components/common/`: Shared/common components used across different interfaces
- `src/components/search/`: Search-related components (e.g., facets, search box, results)
- `src/components/insight/`: Insight interface components for analytics and reporting
- `src/components/ipx/`: IPX (In-Product Experience) components
- `src/components/recommendations/`: Recommendation components

## Key Differences Between Lit and Stencil Components

### Lit Components (New)

- Use TypeScript with `.ts` extension
- Use Tailwind CSS with `.tw.css` extension
- Modern Lit-based web components
- Preferred for new components

### Stencil Components (Legacy)

- Use TypeScript JSX with `.tsx` extension
- Use PostCSS with `.pcss` extension
- Stencil-based web components
- Being gradually migrated to Lit

## File Naming Conventions

All atomic components follow these naming conventions:

- Component names are prefixed with `atomic-`
- File names use kebab-case (e.g., `atomic-my-component`)
- Class names use PascalCase (e.g., `AtomicMyComponent`)
- All files in a component directory share the same base name

## Testing Structure

Each component includes comprehensive testing:

- **Unit Tests** (`.spec.ts`): Test component logic and behavior
- **End-to-End Tests** (`e2e/*.e2e.ts`): Test component integration and user interactions
- **Test Fixtures** (`e2e/fixture.ts`): Setup and configuration for E2E tests
- **Page Objects** (`e2e/page-object.ts`): Abstraction layer for E2E test interactions

## Documentation and Storybook

- **MDX Documentation** (`.mdx`): Component documentation with examples
- **Storybook Stories** (`.new.stories.tsx`): Interactive component demonstrations
- Stories include controls for testing different component configurations

## Lit components style guide

- All properties with more than one word should have their attribute value in kebab-case. Example: `@property({type: String, attribute: 'my-attribute'}) myAttribute: string;`
- Components that need bindings should use the `@bindings`decorator.
- In general, prefer decorators over mixins, and lit reactive controllers over decorators when it makes sense.
