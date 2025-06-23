---
applyTo: '**packages/atomic/**/**'
---

_All new atomic components should be lit components, not stencil components. This document describes the structure and conventions for atomic components in the UI Kit._

**Note: All commands in this document should be run from the `packages/atomic` directory.**

When generating new atomic component use the script like this:

```bash
node scripts/generate-component.mjs test-component src/components/common
```

This will create a new component in the `src/components/common` directory with the name `test-component`.

The generate-lit-exports.mjs script is used to generate the exports for the new component in the `src/components/index.ts` file.

## Structure

The atomic components are placed in the `src/components` directory. They are organized by use case, such as `commerce`, `common`, `search`, etc. Each (lit) component has its own directory containing the following files:

- `atomic-test-component.mdx`: The documentation file for the component.
- `atomic-test-component.new.stories.tsx`: The Storybook stories for the component.
- `atomic-test-component.ts`: The main component file.
- `atomic-test-component.spec.ts`: The test file for the component.
- `atomic-test-component.tw.css`: The CSS file for the component.
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

- **Unit Tests** (`.spec.ts`): Test component logic and behaviour
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

## Atomic Chemistry 101

To ensure consistency, clarity, and ease of contribution to our Atomic design system, we use a naming convention inspired by Atomic Design. This helps us better communicate component roles, organize code, and onboard new contributors.

### 🔹 Atom

**Definition:**
An Atom is a small, pure, stateless function that renders a piece of UI. It does not connect Headless.

**Characteristics:**

- Stateless and functional
- Has no dependencies on Headless
- Focused purely on presentation
- Simple, reusable, and easy to test

**Examples:**

- A function that renders a styled button
- A function that returns an icon, text label, or layout fragment

**Why it matters:**
Atoms allow us to build a clean visual language, isolate visual elements, and promote maximum component reuse.

### 🔸 Molecule

**Definition:**
A Molecule is a Custom Element that combines one or more Atoms and connects to Headless for behaviour and state management.

**Characteristics:**

- Composed of Atoms
- Connects to Headless controllers
- Exposed as part of the Atomic custom elements library
- Handles interactions and state

**Examples:**

- `<atomic-search-box>`: Renders input + button and handles search state
- `<atomic-result-list>`: Renders search results from Headless data

**Why it matters:**
Molecules are the interactive, declarative components we expose to consumers. They encapsulate structure and behaviour cleanly.

### ⚡ Ion

**Definition:**
An Ion is a small utility or helper used to support Atoms. It provides styling, layout logic, mappings, or constants — anything that helps Atoms stay clean and focused.

**Characteristics:**

- Atom-level scope
- No UI rendering of its own
- Stateless and reusable
- Lightweight and focused

**Examples:**

- Reusable guards
- Styling utilities
- Layout logic helpers
- Constants and mappings

**Why it matters:**
Ions allow us to share low-level presentation logic across Atoms while keeping them simple and consistent.

### ⚙️ Enzyme

**Definition:**
An Enzyme is a utility, decorator, or helper that enhances a Molecule's behaviour or binds logic to it. Like biological enzymes, they enable or accelerate functionality without being part of the core structure.

**Characteristics:**

- Provides logic "glue" or behaviour enhancements
- Often implemented as decorators, event hooks, or bindings
- Not responsible for rendering UI directly

**Examples:**

- A class decorator to load Tailwind CSS within the Shadow DOM of a Molecule
- A Mixin that sets up the atomic-\*-interface bindings within a Molecule
- A Reactive Controller that injects accessibility or styling enhancements

**Why it matters:**
Enzymes help keep Molecules clean, modular, and focused by isolating cross-cutting concerns into composable enhancements.

## Component Architecture Guidelines

When developing atomic components, follow these architectural principles:

1. **Atoms** should be pure presentation functions without business logic
2. **Molecules** should compose Atoms and handle state/interactions via Headless
3. **Ions** should provide reusable utilities that support Atoms
4. **Enzymes** should enhance Molecules with cross-cutting concerns

This architecture ensures a clear separation of concerns and promotes maintainable, testable code.
