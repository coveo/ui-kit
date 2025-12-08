# Atomic 

Atomic is a component library for building Coveo interfaces. It provides pre-built web components that can be used across different frameworks and platforms.

The @coveo/atomic package is built on [Lit](https://lit.dev/), a modern web components framework that provides fast, lightweight, and reactive components with excellent developer experience and performance.

## Table of Contents

- [Creating a Component](#creating-a-component)
- [Component Files Overview](#component-files-overview)
  - [Main Component File (.ts)](#main-component-file-ts)
  - [Storybook Stories (.new.stories.tsx)](#storybook-stories-newstoriestsx)
  - [Documentation (.mdx)](#documentation-mdx)
  - [Unit Tests (.spec.ts)](#unit-tests-spects)
  - [End-to-End Tests (e2e/)](#end-to-end-tests-e2e)
- [Project Structure](#project-structure)

## Creating a Component

To create a new Atomic component, use the component generation script:

```bash
node scripts/generate-component.mjs atomic-test-component src/components/search
```

**Important:** Should be run from the `packages/atomic` directory.

This command will:
1. Create a new component directory with all required files
2. Generate the component scaffolding based on the Lit template
3. Set up the proper file structure and naming conventions


## Component Files Overview

Each Atomic component follows a standardized file structure. Here's what each file type contains:

### Main Component File (.ts)

The primary component implementation using Lit web components.

**Key characteristics:**
- Uses `@customElement('atomic-component-name')` decorator
- Implements reactive properties with `@property()` decorator and state with `@state()` decorator
- Multi-word properties use kebab-case attributes: `@property({attribute: 'my-attribute'})`
- Uses `@bindings()` decorator (without parameters) for components requiring Headless controller bindings
- Uses `@withTailwindStyles` decorator for styling integration
- Uses `@bindStateToController()` decorator to bind Headless controller state to component state
- Implements `InitializableComponent<T>` interface for components that need initialization
- Uses `@bindingGuard()` and `@errorGuard()` decorators in the render method for robust error handling

**Development tip:** You can use the `/migrate-to-stencil` prompt in GitHub Copilot Chat to help convert existing Stencil components to Lit format when migrating components.

**Example structure:**
```typescript
import {LitElement, html} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {bindStateToController} from '@/src/decorators/bind-state';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import commonStyles from '../../common/component/common.tw.css';

@customElement('atomic-my-component')
@bindings()
@withTailwindStyles
export class AtomicMyComponent 
  extends LitElement 
  implements InitializableComponent<CommerceBindings> {
  
  static styles: CssResultGroup = [
    commonStyles,
    css`
    @reference '../../../utils/tailwind.global.tw.css';
    [part~="active-parent"] {
      @apply pl-9;
    }`,
  ]
  
  @state() bindings!: CommerceBindings;
  @state() error!: Error;

  @bindStateToController('myController')
  @state()
  public myControllerState!: MyControllerState;

  @property({type: String, attribute: 'my-attribute'}) 
  myAttribute = '';

  public myController!: MyHeadlessController;

  public initialize() {
    // Component initialization logic
    this.myController = buildMyController(this.bindings.engine);
  }

  @bindingGuard()
  @errorGuard()
  render() {
    return html`<div>${this.myAttribute}</div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-my-component': AtomicMyComponent;
  }
}
```

### Storybook Stories (.new.stories.tsx)

Interactive component demonstrations for development and testing.

**Key principles:**
- **Isolate the component** - showcase specific functionality without external dependencies
- **Focus on the component alone** - avoid "In a page" examples with multiple components  
- Each story demonstrates one specific aspect or variation of the component
- **Always include a Default story** - shows the component with default settings and no customization
- **Title structure** - The `title` property determines where stories appear in the Storybook sidebar and must follow the strict standard: `{use_case}/My Component` where the component name excludes the `atomic-` prefix and uses proper title case (e.g., `Commerce/Product List`, `Search/Facet Manager`)

**Example structure:**
```typescript
import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@/storybook-utils/common/render-component';

const {decorator, play} = wrapInCommerceInterface();

const meta: Meta = {
  component: 'atomic-my-component',
  title: 'Commerce/My Component',
  id: 'atomic-my-component',
  render: renderComponent,
  decorators: [decorator],
  parameters,
  play,
};

export default meta;

export const Default: Story = {};

export const WithCustomIcons: Story = {
  name: 'With custom icons',
  args: {
    'attributes-previous-button-icon': '...',
    'attributes-next-button-icon': '...',
  },
};
```

### Documentation (.mdx)

Comprehensive component documentation with examples and usage instructions.

**Key structure:**
- **Must use the `AtomicDocTemplate` Storybook block** - This provides consistent documentation structure and integrates with Storybook stories
- **Usage section as children** - Component-specific usage instructions and examples are provided as children of the template
- The template automatically handles property/attribute reference, event documentation, and API integration

**Example structure:**
```typescript
import { Meta } from '@storybook/addons-docs/blocks';
import * as AtomicMyComponentStories from './atomic-my-component.new.stories';
import { AtomicDocTemplate } from '@/storybook-utils/documentation/atomic-doc-template';

<Meta of={AtomicMyComponentStories} />

<AtomicDocTemplate
  stories={AtomicMyComponentStories}
  githubPath="commerce/atomic-my-component/atomic-my-component.ts"
  tagName="atomic-my-component"
  className="AtomicMyComponent"
>
This component provides [component description and purpose].

**Note:** [Any important usage notes or constraints]

```html
<atomic-commerce-interface>
  ...
  <atomic-commerce-layout>
    ...
    <atomic-layout-section section="main">
      
      <atomic-my-component></atomic-my-component>

    </atomic-layout-section>
  </atomic-commerce-layout>
</atomic-commerce-interface>
```

</AtomicDocTemplate>
```

**Required content within the template for the Usage section:**
- Component description and purpose
- Basic usage examples with proper HTML structure
- Any important notes or constraints
- Integration context within the Atomic interface

### Unit Tests (.spec.ts)

Comprehensive unit testing for component logic and behavior.

**Testing principles:**
- Follow the [Atomic test conventions](https://coveord.atlassian.net/wiki/spaces/JSUI/pages/5221122259/Atomic+test+conventions)
- Wrap all tests under a single `describe` with the component name
- Use `it` function (not `test`) for individual test cases
- Start test descriptions with "should"

**Required test coverage:**
- **Test all possible functionalities** - Every prop and public method of the component must be tested
- **Test all condition paths** - Cover all if/else branches, switch cases, and conditional logic
- **Test all DOM attributes** - Validate proper rendering of ARIA labels, CSS parts, and other DOM properties
- **Test component states** - Verify component behavior in different states (loading, error, success, etc.)
- **Test user interactions** - Cover all click handlers, keyboard navigation, and event listeners
- **Test property/attribute binding** - Ensure all component properties correctly affect the rendered output

**Development tip:** You can use the `/generate-vitest-tests-atomic-lit-components ` prompt in GitHub Copilot Chat to help generate the tests for a new Lit component.

### End-to-End Tests (e2e/)

Integration testing that validates component behavior in real browser environments.

**Files in e2e/ directory:**
- `atomic-component-name.e2e.ts`: Main E2E test file
- `fixture.ts`: Test setup and configuration
- `page-object.ts`: Abstraction layer for component interactions

**Purpose:**
- Follow the [Atomic test conventions](https://coveord.atlassian.net/wiki/spaces/JSUI/pages/5221122259/Atomic+test+conventions)
- **Test the golden path** - Focus on the most common, successful user journey through the component
- **Keep it simple** - Usually should only include the default story and test a very simple golden path

**Example:** See [`atomic-product-children.e2e.ts`](src/components/commerce/atomic-product-children/e2e/atomic-product-children.e2e.ts) for a reference implementation.

### Project Structure

- **`src/components/commerce/`** - Commerce components
- **`src/components/common/`** - Shared functional components, utilities and CSS used across different interfaces
- **`src/components/search/`** - Search components
- **`src/components/insight/`** - Insight components 
- **`src/components/ipx/`** - IPX components
- **`src/components/recommendations/`** - Recommendation components
- **`storybook-utils/`** - Utilities and helpers for Storybook stories
- **`storybook-pages/`** - Utilities and helpers for Storybook stories
- **`playwright-utils/`** - Utilities and helpers for Playwright end-to-end tests
- **`vitest-utils/`** - Utilities and helpers for Vitest unit tests


