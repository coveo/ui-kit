# Atomic Chemistry 101

> **Source**: [Atomic Chemistry 101 - Confluence](https://coveord.atlassian.net/wiki/spaces/JSUI/pages/5120491561/Atomic+Chemistry+101)

This guide covers the foundational principles and best practices for developing Atomic components, following the "Chemistry" methodology that organizes components into distinct categories based on their complexity and responsibility.

## Overview

Atomic Chemistry is our approach to building consistent, reusable, and composable components in the Atomic package. Components are organized into four main categories, each with specific patterns and responsibilities:

### The Component Hierarchy

1. **🔬 Atoms** - The smallest, most basic components
2. **🧬 Molecules** - Combinations of atoms that form functional units
3. **⚗️ Enzymes** - Complex components that orchestrate behavior
4. **⚡ Ions** - Specialized components with specific roles

---

## 🔬 The Atoms

### When & How to Write an Atom

Atoms are the smallest building blocks of our UI system: simple, stateless, reusable pieces of UI, defined using Lit templates.

Writing them well — and knowing when to create one — ensures a clean, scalable, and efficient codebase.

#### 🔹 What Is an Atom?

An Atom is:

- A pure function that returns a Lit template
- Stateless (no properties, no controllers, no lifecycle)
- Headless-free (does not connect to state management)
- Reusable across Molecules (Custom Elements)

Its only role: present a small piece of UI based on inputs.

#### 🔧 How to Write an Atom

A well-written Atom:

- Is a simple exportable function
- Accepts only the inputs it needs (props/params)
- Returns a `TemplateResult` (Lit template)
- Delegates interaction (e.g., accepts click handlers)
- Does not store internal state or own business logic

**Example:**

```ts
import {html, TemplateResult} from 'lit';

export function renderButton(
  label: string,
  type: 'primary' | 'secondary',
  onClick?: () => void
): TemplateResult {
  return html`
    <button class="btn btn--${type}" @click=${onClick}>${label}</button>
  `;
}
```

#### 🧠 When You Should Write an Atom

Create a new Atom when:

| Situation                                                            | Why it makes sense                                |
| -------------------------------------------------------------------- | ------------------------------------------------- |
| You need a **small, reusable** visual fragment (button, badge, icon) | Encapsulates markup and avoids duplication        |
| The UI piece has **variable inputs** (e.g., label, type, icon)       | Atom parametrization enables reusability          |
| The same structure is **used across multiple Molecules**             | DRY principle — don't repeat layouts              |
| You want **simpler and faster unit tests**                           | Pure functions are easy to test in isolation      |
| You need **separation of concerns** between structure and logic      | Molecules stay clean, focused only on composition |

#### 🚫 When You Should Not Write an Atom

Avoid creating a new Atom when:

| Situation                                                               | Why it's a bad idea                                   |
| ----------------------------------------------------------------------- | ----------------------------------------------------- |
| The markup is **trivial and not reused**                                | Overhead of an extra file isn't worth it              |
| The component **requires internal state** (e.g., toggling)              | Belongs in a Molecule instead                         |
| The structure is **strongly coupled to Headless data**                  | Atoms should never know about state                   |
| The logic involves **dynamic DOM updates or side effects**              | Breaks purity; should stay in Molecules or Enzymes    |
| It's just **styling without real structure** (e.g., a single CSS class) | Better handled through stylesheets or utility classes |

#### 🏗 Should You Refactor to an Atom?

Consider creating an Atom if:

- You see 2+ Molecules repeating similar small structures
- You want to make small parts of the templates more readable
- You notice complex templates that could be **decomposed** into smaller pieces

✨ **Rule of Thumb:**  
_If you could explain it with a sentence like "This is a clickable card header" or "This is an action button" — it might be an Atom!_

#### 🛠 Quick Checklist

| Question                                                      | Yes | No  |
| ------------------------------------------------------------- | --- | --- |
| Is it stateless?                                              | ✅  | ❌  |
| Is it purely visual?                                          | ✅  | ❌  |
| Can it be reused?                                             | ✅  | ❌  |
| Does it require a controller or a store?                      | ❌  | ✅  |
| Does it handle events passed to it, or does it emit its own?  | ✅  | ❌  |
| Does it import all Molecules that it depends on/might render? | ✅  | ❌  |

#### 🍰 Template Boilerplate for Atoms

```ts
import {html, TemplateResult} from 'lit';

/**
 * Renders a [brief description here]
 */
export function renderThingName(
  requiredParam: string,
  optionalParam?: boolean,
  onClick?: () => void
): TemplateResult {
  return html`
    <div class="thing">
      <span>${requiredParam}</span>
      ${optionalParam ? html`<strong>Special!</strong>` : ''}
      <button @click=${onClick}>Click</button>
    </div>
  `;
}
```

### How to Test an Atom

Atoms in our Atomic Design System are pure UI render functions built using Lit templates. They are:

- Stateless
- Side-effect free
- Independent from Headless
- Focused solely on returning UI

Their simplicity makes them easy and fast to test — give them input, check the rendered output.

#### 🧪 What You Should Test

When testing an Atom, you want to:

- Confirm the expected HTML structure
- Assert the correct content and attributes
- Verify delegated interactions like `@click` when passed as props

Atoms do **not** manage state or side effects, so tests should remain **focused and declarative**.

#### 🔧 Example Atom

```ts
import {html, TemplateResult} from 'lit';

export interface ButtonProps {
  label: string;
  type: 'primary' | 'secondary';
  onClick?: () => void;
}

export function renderButton({
  label,
  type,
  onClick,
}: ButtonProps): TemplateResult {
  return html`
    <button class="btn btn--${type}" @click=${onClick}>${label}</button>
  `;
}
```

#### 🧪 Example Atom Test

```ts
import {fixture} from '@/vitest-utils/testing-helpers/fixture.js';
import {userEvent} from '@vitest/browser/context';
import {expect, it, vi} from 'vitest';
import {renderButton, ButtonProps} from './Button.js';

describe('#renderButton', async () => {
  // Setup render util function with default params
  const renderTestButton = (props: Partial<ButtonProps> = {}) =>
    fixture(
      renderButton({
        label: 'Default test button',
        type: 'primary',
        ...props,
      })
    );

  // Option A: Trawler test
  it('should render a button properly', async () => {
    const button = await renderTestButton();
    expect(button).toBeInTheDocument();
    expect(button).toMatchSnapshot();
  });

  // Option B: Spear test - class example
  it('should render a button with proper class', async () => {
    const button = await renderTestButton();
    expect(button).toHaveClass('btn--primary');
  });

  // Option B: Spear test - text content
  it('should render a button with proper label', async () => {
    const button = await renderTestButton({label: 'Click me'});
    expect(button).toHaveTextContent('Default test button');
  });

  // Option B: Spear test - accessibility
  it('should render a button with a label', async () => {
    const button = await renderTestButton({label: 'Click me'});
    expect(button).toHaveAccessibleName('Click me');
  });

  // Required: interaction/events
  it('should call the click handler when clicked', async () => {
    const onClick = vi.fn();
    const button = await renderTestButton({onClick});
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalled();
  });
});
```

#### 📊 Testing Summary

✅ **Do This:**

- Render the Atom using fixture utilities
- Use full browser rendering tools
- Assert on the DOM structure
- Pass handlers as parameters and test delegation
- Keep tests small, fast, and focused

❌ **Avoid This:**

- Asserting styles or animations
- Coupling Atom tests with Headless logic

---

## 🧬 The Molecules

### When & How to Write a Molecule

#### 🔸 Writing Molecules: When Structure Meets Behavior

Molecules are the composed, interactive building blocks of the Atomic design system. They're the custom elements (web components) that expose meaningful UI and connect to Headless controllers for state and logic.

#### 🔸 What Is a Molecule?

A Molecule is:

- A Custom Element (Web Component)
- Composed of Atoms and other internal helpers
- Responsible for connecting to Headless
- Exposes a reusable UI + behavior combo

> You can think of a Molecule as a **bridge**: it assembles visual rendering (via Atoms) & application logic (via Headless) in a customer-facing "package".

#### 🔧 How to Write a Molecule

**✅ Core Responsibilities**

A well-written Molecule:

- Extends `LitElement`
- Manages one or more Headless controllers
- Renders using Lit templates, often by composing Atoms
- Uses Enzymes or helpers for logic glue (e.g., analytics, accessibility)

**🧱 Molecule Anatomy**

```ts
@customElement('atomic-result-badge')
export class AtomicResultBadge extends AtomicComponent {
  private result!: Result;

  public initialize() {
    this.result = buildResult(this.engine); // Headless controller
  }

  public render() {
    return html`
      <div class="result-badge">
        ${renderIcon(this.result.icon)}
        <span>${this.result.title}</span>
      </div>
    `;
  }
}
```

#### 🧠 When You Should Write a Molecule

Create a Molecule when:

| Situation                                                                               | Why it makes sense                                                 |
| --------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| You need a **standalone, reusable component**                                           | Molecules are the public API of the design system                  |
| You're combining **multiple Atoms with behavior**                                       | Molecules own orchestration                                        |
| You need to **connect to Headless**                                                     | Molecules are responsible for wiring up state                      |
| You need a **custom element** consumers will use directly                               | Molecules = exported components                                    |
| You're defining **logics executed by user interaction** (e.g., click & hover listeners) | Molecules own the interaction model and delegate them to the Atoms |

#### 🚫 When You Should Not Write a Molecule

Avoid promoting to a Molecule when:

| Situation                                        | Why not                                    |
| ------------------------------------------------ | ------------------------------------------ |
| You just need a visual building block            | That's an Atom's job                       |
| You're managing minor logic tied to presentation | Use an **Enzyme** or **Ion** instead       |
| You're just building for internal reuse          | Prefer private helpers or render functions |

#### ⚠️ Warning Signs You're Over-Moleculing

- "This component renders one thing with no logic."
- "It has one prop, no state, and uses no Headless controller."
- "It's only used in one place."

> If any of these sound familiar, consider using an Atom + Enzyme instead.

### How to Test a Molecule

Molecules are the custom elements in the Atomic design system. They expose full UI components composed of Atoms, wired to Headless controllers for state and interaction logic.

Testing Molecules means verifying **behaviour + structure** together, while mocking **external dependencies** like state or upstream logic.

#### 🧠 What You're Testing

When testing a Molecule, validate:

- ✅ Correct composition of Atoms (without mocking them out)
- ✅ Proper binding to state (via mocked Headless controllers)
- ✅ Reaction to events (clicks, inputs, etc.)
- ✅ Rendering of different states (loading, empty, populated)

#### 🔄 Mocking Strategy: Mock **Up**, Not **Down**

📌 **TL;DR:**  
Mock external logic (**Headless**). Keep your rendering stack **real**.

| Layer               | Mock It?       | Why                                                       |
| ------------------- | -------------- | --------------------------------------------------------- |
| Headless Controller | ✅ Yes         | Molecule owns state binding — test with controlled inputs |
| Parent Molecule     | ✅ Optional    | Useful in nested component scenarios                      |
| Atom (rendered UI)  | ❌ Never       | Atoms are internal structure — test actual rendering      |
| Enzymes/Ions        | ❌ Usually not | Only mock if you're unit testing behavior helpers         |

#### 🛠 Tips for Testing Molecules

- ✅ **Use Helpers to Mock Headless**  
  e.g. `renderInAtomic*`, `mockSearchEngine()`
- ✅ **Don't snapshot the whole HTML**  
  Focus on expected nodes and content
- ✅ **Simulate Events at the UI Level**  
  Use Vitest's user-event APIs like `click`, `hover`
- ✅ **Render as the User Would See It**  
  Avoid shallow rendering or mocking child templates

#### 🧪 Example Molecule Test

```ts
import {renderInAtomicCommerceInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-commerce-interface-fixture';
import {buildFakeProductListing} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/product-listing-controller';
import {buildFakeSearch} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/search-controller';
import {buildFakeSort} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/sort-subcontroller';
import {buildProductListing, buildSearch} from '@coveo/headless/commerce';
import {page} from '@vitest/browser/context';
import {describe, it, beforeEach, expect, vi} from 'vitest';

vi.mock('@coveo/headless/commerce', {spy: true});

describe('atomic-commerce-sort-dropdown', () => {
  const mockedSort = vi.fn();

  const locators = {
    get label() {
      return page.getByText('Sort by');
    },
    get select() {
      return page.getByRole('combobox');
    },
    placeholder(element: HTMLElement) {
      return element.shadowRoot!.querySelector('[part="placeholder"]')!;
    },
  };

  const setupElement = async (
    {interfaceType} = {interfaceType: 'product-listing'}
  ) => {
    const {element} = await renderInAtomicCommerceInterface({
      template: html`<atomic-commerce-sort-dropdown></atomic-commerce-sort-dropdown>`,
      selector: 'atomic-commerce-sort-dropdown',
      bindings: (bindings) => {
        bindings.interfaceElement.type = interfaceType;
        return bindings;
      },
    });
    element.initialize();
    return element;
  };

  beforeEach(() => {
    mockedSort.mockReturnValue(buildFakeSort());
    vi.mocked(buildProductListing).mockReturnValue(
      buildFakeProductListing({
        implementation: {sort: mockedSort},
      })
    );
    vi.mocked(buildSearch).mockReturnValue(
      buildFakeSearch({
        implementation: {sort: mockedSort},
      })
    );
  });

  it('should render label correctly', async () => {
    await setupElement();
    await expect.element(locators.label).toBeInTheDocument();
  });

  it('should call sort.sortBy when select is changed', async () => {
    const mockedSortBy = vi.fn();
    mockedSort.mockReturnValue(
      buildFakeSort({implementation: {sortBy: mockedSortBy}})
    );
    await setupElement();
    await locators.select.selectOptions('bar');
    expect(mockedSortBy).toHaveBeenCalledWith({
      by: 'fields',
      fields: [{name: 'bar'}],
    });
  });
});
```

#### ✅ Do This / ❌ Avoid This

| ✅ Do This                      | ❌ Avoid This                        |
| ------------------------------- | ------------------------------------ |
| Mock Headless state/controllers | Mocking Atoms inside the render tree |
| Simulate real DOM events        | Triggering internal methods manually |
| Test DOM structure + behavior   | Snapshotting entire HTML trees       |

#### 📦 Molecule Testing Checklist

- [x] Are you using a real component instance?
- [x] Are Atoms rendered?
- [x] Are external dependencies & parent components mocked?
- [x] Can my tests run without Internet?
- [x] Are user interactions tested?

---

## ⚗️ The Enzymes

### When & How to Write an Enzyme

#### 🔬 Writing Enzymes: Extending Molecules with Reusable Logic

Enzymes are specialized units of behavior: small, reusable, logic-focused modules that can be attached to Molecules to enhance their functionality without bloating their core responsibilities.

Where Molecules assemble UI and state, Enzymes inject behavior — just like enzymes catalyze reactions in biology, they enable or simplify additional functionality in your components.

#### ✅ What Is an Enzyme?

An Enzyme is:

- A logic layer designed to be used within a Molecule (or sometimes an Atom)
- Composable, reusable, and context-independent
- A way to extend or enhance behavior without modifying the Molecule's core purpose
- Often implemented as a **Lit reactive controller**, a **mixin**, or a **decorator**

> Enzymes follow the single-responsibility principle: each should encapsulate one clear piece of logic.

#### 🧠 Why Enzymes?

Enzymes let you cleanly separate logic from UI by encapsulating reusable behaviors in modular units that attach to Lit components without bloating them.

**Benefits:**

- Avoid bloated components
- Reuse logic across Molecules
- Maintain separation of concerns
- Improve consistency, testability, and maintainability

**Typical use cases:**  
Event handling, analytics, accessibility, keyboard navigation, scroll detection, etc.

#### 🧪 How and When to Write an Enzyme

**Lit's Composition Philosophy**

Lit encourages **composition over inheritance**, especially for adding logic/behavior to custom elements.

| Type                    | When to Use                                                                      |
| ----------------------- | -------------------------------------------------------------------------------- |
| **Reactive Controller** | You need lifecycle access, DOM interaction, event wiring, or instance-tied logic |
| **Mixin**               | You need to add properties/lifecycle/hooks to multiple components                |
| **Decorator**           | You need to extend methods, register metadata, or add logic concisely            |

#### 🧪 Writing an Enzyme as a Reactive Controller

**Why:**

- Lit best practice
- Lifecycle-aware (`hostConnected`, `hostDisconnected`)
- Instance-scoped and configurable
- Easily testable in isolation

**Example: ScrollTracker**

```ts
import {ReactiveController, ReactiveControllerHost} from 'lit';

export class ScrollTracker implements ReactiveController {
  constructor(private host: ReactiveControllerHost & HTMLElement) {
    this.host.addController(this);
  }

  hostConnected() {
    this.host.addEventListener('scroll', this.onScroll);
  }

  hostDisconnected() {
    this.host.removeEventListener('scroll', this.onScroll);
  }

  private onScroll = () => {
    console.log('Scroll position:', this.host.scrollTop);
  };
}
```

**Usage in a Molecule:**

```ts
@customElement('atomic-scrollable-panel')
export class AtomicScrollablePanel extends LitElement {
  private scrollEnzyme = new ScrollTracker(this);

  render() {
    return html`<div class="scrollable"><slot /></div>`;
  }
}
```

#### 🧪 Writing an Enzyme as a Mixin

**Why:**

- Can "upgrade" a base class with methods, props, lifecycle logic
- Great for cross-cutting capabilities like i18n or keyboard navigation

**⚠️ Caveat**: Mixins are class-level — **not configurable per instance** and harder to compose.

#### 🧪 Writing an Enzyme as a Decorator

**Why:**

- Concise and readable
- Good for enforcing conventions, wrapping logic, or registering metadata
- Doesn't require lifecycle integration

**Example: `@bindStateToController`**

```ts
function bindStateToController(controllerProperty) {
  return (proto, stateProperty) => {
    const ctor = proto.constructor as typeof ReactiveElement;

    ctor.addInitializer((instance) => {
      const {disconnectedCallback, initialize} = instance;

      instance.initialize = function () {
        if (initialize) initialize.call(this);

        const controller = this[controllerProperty];

        const unsubscribe = controller.subscribe(() => {
          this[stateProperty] = controller.state;
        });

        instance.disconnectedCallback = function () {
          if (!this.isConnected) unsubscribe();
          if (disconnectedCallback) disconnectedCallback.call(this);
        };
      };
    });
  };
}
```

**Usage in a Component:**

```ts
class MyElement extends LitElement {
  public sort!: Sort;

  @bindStateToController('sort')
  public sortState!: SortState;
}
```

#### 🚫 When Not to Write an Enzyme

| Situation                                          | Why Not                                          |
| -------------------------------------------------- | ------------------------------------------------ |
| You're managing visual output                      | That belongs in **Atoms** or **Molecules**       |
| The logic is trivial and specific to one component | Keep it in the Molecule for now                  |
| You're just creating a render helper               | Use a render function (Atom) or a private method |

#### ✅ Rule of Thumb

- Start with a **Reactive Controller**
- Use **Mixins** when injecting class structure
- Use **Decorators** for logic wrappers and metadata

### How to Test an Enzyme

#### 🧠 What You're Testing

When testing an Enzyme, you want to validate:

- Lifecycle behavior (`hostConnected`, `hostDisconnected`, `hostUpdated`, etc.)
- Interaction with host component or DOM
- Expected side effects from state/event-based updates
- Enhanced behavior from decorated methods

#### 🔄 Mocking Strategy: Isolate the Logic

| Layer          | Mock It?    | Why                                                           |
| -------------- | ----------- | ------------------------------------------------------------- |
| Host Component | ✅ Minimal  | Use a stub `LitElement` to simulate lifecycle                 |
| DOM APIs       | ✅ Optional | Only if DOM observation is involved (e.g. `MutationObserver`) |
| Host Lifecycle | ❌ Never    | Test with real `LitElement` behavior                          |
| Dependencies   | ✅ Yes      | If Enzyme depends on injected services (e.g. analytics)       |

#### 🧪 Example: Testing a Reactive Controller

**`AriaLiveRegionController`**

```ts
export class AriaLiveRegionController implements ReactiveController {
  constructor(
    private host: ReactiveControllerHost,
    private region: string,
    private assertive: boolean
  ) {
    this.host.addController(this);
  }

  set message(value: string) {
    // dispatch message logic
  }

  hostConnected() {
    // register the region
  }
}
```

#### ✅ Do This / ❌ Avoid This

**✅ Do: Use a real host element**

```ts
@customElement('test-element')
class TestElement extends LitElement {
  region = new AriaLiveRegionController(this, 'region', true);

  render() {
    this.region.message = 'Hello';
    return html`<div>Hello</div>`;
  }
}
```

**✅ Do: Use `fixture()` to simulate lifecycle**

```ts
await fixture(html`<test-element></test-element>`);
```

Triggers `connectedCallback()` and validates behavior.

#### ✅ Example Test

```ts
describe('#AriaLiveRegionController', () => {
  let element: TestElement;
  let ariaLive: StubAriaLive;

  beforeEach(async () => {
    await fixture(
      html`<stub-aria-live></stub-aria-live><test-element></test-element>`
    );
    element = document.querySelector('test-element')!;
    ariaLive = document.querySelector('stub-aria-live')!;
  });

  it('should register the region on connect', () => {
    expect(ariaLive.registerRegion).toHaveBeenCalledWith('region', true);
  });

  it('should send message when set', () => {
    element.region.message = 'Updated';
    expect(ariaLive.updateMessage).toHaveBeenCalledWith(
      'region',
      'Updated',
      true
    );
  });
});
```

#### ❌ Avoid These Common Mistakes

**❌ Avoid: Instantiating the controller without a host**

```ts
const fakeHost = {} as ReactiveControllerHost;
const controller = new AriaLiveRegionController(fakeHost, 'region', true);
controller.message = 'Test'; // 🚫 Fails silently
```

**❌ Avoid: Manually calling lifecycle methods**

```ts
controller.hostConnected(); // 🚫 brittle and unrepresentative
```

**❌ Avoid: Asserting private internals**

```ts
expect(controller['_internalProperty']).toBe(true); // 🚫 breaks encapsulation
```

**❌ Avoid: Snapshotting or relying on rendered HTML**

```ts
expect(element.shadowRoot?.innerHTML).toMatchInlineSnapshot(); // 🚫 Enzymes aren't UI
```

#### 🧪 Testing Summary

| ✅ Do This                                     | ❌ Avoid This                           |
| ---------------------------------------------- | --------------------------------------- |
| Use real `LitElement` host                     | Instantiating controller without a host |
| Render using `fixture()` or real DOM           | Manually calling lifecycle methods      |
| Simulate usage via host interaction            | Triggering controller methods manually  |
| Use mocks/stubs for external dependencies      | Snapshot testing or DOM assertions      |
| Spy on behavior (e.g., `toHaveBeenCalledWith`) | Asserting internal/private state        |

---

## ⚡ The Ions

### When & How to Write an Ion

#### ⚡ Writing Ions: Small Utilities Supporting Atoms

An Ion is a small utility or helper used to support Atoms. It provides styling, layout logic, mappings, or constants — anything that helps Atoms stay clean and focused.

#### ✅ What Is an Ion?

An Ion is:

- A small utility or helper used to support Atoms
- Provides styling, layout logic, mappings, or constants
- Has Atom-level scope
- No UI rendering of its own
- Stateless and reusable
- Lightweight and focused

> Ions allow us to share low-level presentation logic across Atoms while keeping them simple and consistent.

#### 🧠 When You Should Write an Ion

Create an Ion when:

| Situation                                              | Why it makes sense                     |
| ------------------------------------------------------ | -------------------------------------- |
| You need **reusable guards** for Atoms                 | Centralizes validation logic           |
| You have **styling utilities** shared across Atoms     | Promotes consistency                   |
| You need **layout logic or constants**                 | Keeps Atoms focused on rendering       |
| You have **mapping functions** for data transformation | Separates data logic from presentation |

#### 🔧 How to Write an Ion

**✅ Core Characteristics:**

- Stateless and reusable
- No UI rendering of its own
- Atom-level scope
- Lightweight and focused

**Example Types:**

- Reusable guards
- Style utilities
- Data mappers
- Constants and configurations

**Example: Style Utility Ion**

```ts
// ion-button-styles.ts
export const getButtonClasses = (
  type: 'primary' | 'secondary',
  size: 'small' | 'large'
) => {
  const baseClasses = 'btn';
  const typeClass = `btn--${type}`;
  const sizeClass = `btn--${size}`;

  return `${baseClasses} ${typeClass} ${sizeClass}`;
};
```

**Example: Guard Ion**

```ts
// ion-validation.ts
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const hasMinLength = (text: string, min: number): boolean => {
  return text.length >= min;
};
```

**Usage in Atoms:**

```ts
import {getButtonClasses} from './ions/ion-button-styles';
import {isValidUrl} from './ions/ion-validation';

export function renderLinkButton(
  label: string,
  href: string,
  type: 'primary' | 'secondary' = 'primary'
): TemplateResult {
  if (!isValidUrl(href)) {
    return html`<span class="error">Invalid URL</span>`;
  }

  return html`
    <a href="${href}" class="${getButtonClasses(type, 'large')}"> ${label} </a>
  `;
}
```

#### 🚫 When You Should Not Write an Ion

Avoid creating an Ion when:

| Situation                                     | Why not                                 |
| --------------------------------------------- | --------------------------------------- |
| The utility **renders UI directly**           | That's an Atom's responsibility         |
| The logic is **complex or stateful**          | Belongs in an Enzyme or Molecule        |
| It's **specific to one Atom only**            | Keep it as a private helper in the Atom |
| It **connects to Headless or external state** | Ions should be stateless                |

#### ✅ Ion Guidelines

- Keep Ions **stateless and pure**
- Focus on **low-level utilities** that support Atoms
- Promote **consistency** across the design system
- Ensure **easy testing** through pure functions
- Maintain **atom-level scope** - don't overcomplicate

### How to Test an Ion

#### 🧪 What You're Testing

When testing an Ion, validate:

- **Pure function behavior** - Input/output relationships
- **Edge cases and validation** - Boundary conditions
- **Consistency** - Reliable outputs for same inputs
- **Error handling** - Graceful failures

#### 🧪 Testing Strategy: Simple and Direct

Since Ions are stateless utilities, testing is straightforward:

```ts
import {expect, it, describe} from 'vitest';
import {getButtonClasses, isValidUrl, hasMinLength} from './ion-utilities';

describe('Ion Utilities', () => {
  describe('#getButtonClasses', () => {
    it('should generate correct classes for primary large button', () => {
      expect(getButtonClasses('primary', 'large')).toBe(
        'btn btn--primary btn--large'
      );
    });

    it('should generate correct classes for secondary small button', () => {
      expect(getButtonClasses('secondary', 'small')).toBe(
        'btn btn--secondary btn--small'
      );
    });
  });

  describe('#isValidUrl', () => {
    it('should return true for valid URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://localhost:3000')).toBe(true);
    });

    it('should return false for invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('')).toBe(false);
    });
  });

  describe('#hasMinLength', () => {
    it('should validate minimum length correctly', () => {
      expect(hasMinLength('hello', 3)).toBe(true);
      expect(hasMinLength('hi', 3)).toBe(false);
    });
  });
});
```

#### ✅ Testing Best Practices for Ions

- **Test pure functions directly** - No complex setup needed
- **Cover edge cases** - Empty strings, null values, boundary conditions
- **Validate consistency** - Same input should always produce same output
- **Keep tests simple** - Ions are simple, tests should be too
- **Test error conditions** - How Ion handles invalid inputs

## Component Development Patterns

### 1. Component Structure

```typescript
// Standard component structure pattern
@Component({
  tag: 'atomic-component-name',
  styleUrl: 'atomic-component-name.pcss',
  shadow: true,
})
export class AtomicComponentName {
  // Props, state, methods follow consistent patterns
}
```

### 2. Styling Patterns

- Use PostCSS for styling
- Follow BEM-like naming conventions
- Implement proper CSS custom properties for theming
- Ensure responsive design patterns

### 3. Event Handling

- Clear event naming conventions
- Proper event bubbling and capture
- Integration with analytics and tracking

## Best Practices

### Performance

- Lazy loading for heavy components
- Efficient re-rendering strategies
- Proper use of Stencil lifecycle methods

### Accessibility

- ARIA attributes and roles
- Keyboard navigation support
- Screen reader compatibility
- Focus management

### Testing

- Unit tests for component logic
- E2E tests for user interactions
- Visual regression testing
- Accessibility testing

## Integration Guidelines

### With Headless

- Proper controller initialization
- State synchronization patterns
- Error handling and loading states

### With Analytics

- Consistent event tracking
- Custom action implementation
- Performance monitoring

## Common Patterns

### Loading States

```typescript
// Standard loading state pattern
@State() loading = false;

render() {
  if (this.loading) {
    return <atomic-loading-spinner />;
  }
  // ... component content
}
```

### Error Handling

```typescript
// Standard error handling pattern
@State() error?: Error;

private handleError(error: Error) {
  this.error = error;
  // Log error, emit event, etc.
}
```

### Internationalization

- Use i18n utilities consistently
- Support for RTL languages
- Proper text formatting

## Component Lifecycle

### Initialization

1. Props validation
2. Controller setup
3. Event listener registration
4. Initial state setting

### Updates

1. Prop changes handling
2. State updates
3. Re-rendering optimization
4. Side effect management

### Cleanup

1. Event listener removal
2. Controller cleanup
3. Resource disposal

## Styling Guidelines

### Design System Integration

- Use design tokens from the design system
- Consistent spacing and typography scales
- Proper color palette usage

### Responsive Design

- Mobile-first approach
- Breakpoint consistency
- Flexible layouts

### Theming

- CSS custom properties for customization
- Dark/light mode support
- Brand-specific theming capabilities

## Testing Strategies

### Unit Testing

- Component props and state testing
- Event emission testing
- Integration with headless controllers

### E2E Testing

- User interaction flows
- Cross-browser compatibility
- Performance testing

### Visual Testing

- Component appearance consistency
- Responsive design validation
- Theme variations testing

## Documentation Standards

### Component Documentation

- Clear prop descriptions
- Usage examples
- Integration guidelines
- Accessibility notes

### Storybook Integration

- Comprehensive stories for all variants
- Interactive controls
- Documentation pages

## Migration and Versioning

### Breaking Changes

- Deprecation warnings
- Migration guides
- Backward compatibility strategies

### Version Management

- Semantic versioning
- Change documentation
- Release notes

## Contributing Guidelines

### Code Review Process

- Chemistry compliance checks
- Performance considerations
- Accessibility validation
- Documentation updates

### Component Proposals

- Design review process
- Architecture decision records
- Community feedback integration

---

## Next Steps

To fully populate this guide with specific patterns and examples from the Confluence page, please provide key sections or concepts that should be included. This structure can be expanded with:

- Specific code examples from your Chemistry guide
- Detailed styling patterns and conventions
- Component interaction patterns
- Advanced composition techniques
- Performance optimization strategies

## Related Resources

- [Atomic Package Guide](./atomic.md)
- [Coding Standards](../best-practices/coding-standards.md)
- [Testing Patterns](../patterns/testing-patterns.md)
- [Confluence Chemistry Guide](https://coveord.atlassian.net/wiki/spaces/JSUI/pages/5120491561/Atomic+Chemistry+101)

---

## 🧭 The Complete Tour: Understanding the Component Hierarchy

This section provides a comprehensive overview of how all components work together in the Atomic Chemistry system.

### 📊 Component Summary Table

| Concept         | Role                       | Depends on Headless? | UI Rendering? | Enhances Others? |
| --------------- | -------------------------- | -------------------- | ------------- | ---------------- |
| 🔬 **Atom**     | Pure UI Function           | ❌                   | ✅            | ❌               |
| 🧬 **Molecule** | Custom Element             | ✅ (often)           | ✅            | ❌               |
| ⚡ **Ion**      | Atom Utility/Helper        | ❌                   | ❌            | ✅ (Atom)        |
| ⚗️ **Enzyme**   | Molecule Decorator/Utility | ✅ (can)             | ❌            | ✅ (Molecule)    |

### 🔄 How Components Interact

```
┌─────────────────────────────────────────────────────────────────┐
│                        🧬 Molecule                              │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐    │
│  │  ⚗️ Enzyme       │ │  🔬 Atom         │ │  🔬 Atom         │    │
│  │  (Analytics)    │ │  (Button)       │ │  (Icon)         │    │
│  └─────────────────┘ │  ┌─────────────┐ │ │  ┌─────────────┐ │    │
│                      │  │ ⚡ Ion       │ │ │  │ ⚡ Ion       │ │    │
│  ┌─────────────────┐ │  │ (Validation)│ │ │  │ (Styles)    │ │    │
│  │  ⚗️ Enzyme       │ │  └─────────────┘ │ │  └─────────────┘ │    │
│  │  (A11y)         │ └─────────────────┘ └─────────────────┘    │
│  └─────────────────┘                                           │
│                                                                 │
│  Connects to: 📡 Headless Controllers                          │
└─────────────────────────────────────────────────────────────────┘
```

### 🧠 Decision Flow: What Should I Build?

```
Start with a UI need
         │
         ▼
    Need UI rendering?
         │
    ┌────┴────┐
   YES        NO
    │          │
    ▼          ▼
Reusable?   Need to enhance
    │       existing component?
┌───┴───┐        │
YES    NO        ▼
 │      │    Enzyme/Ion
 ▼      │       │
Atom ───┘   ┌───┴───┐
 │         For     For
 ▼        Molecule? Atom?
Need state/     │      │
Headless?       ▼      ▼
 │           Enzyme   Ion
┌┴┐
YES NO
 │   │
 ▼   └─────┐
Molecule   │
           ▼
       Stay as Atom
```

### 🎯 Best Practices Summary

#### For All Components:

- **Single Responsibility** - Each component should have one clear purpose
- **Composition over Inheritance** - Prefer combining smaller pieces
- **Testability** - Write components that are easy to test in isolation
- **Documentation** - Include clear usage examples and guidelines

#### Component-Specific Guidelines:

- **Atoms**: Keep stateless, pure, and focused on UI
- **Molecules**: Own the connection to Headless, compose Atoms thoughtfully
- **Enzymes**: Enhance behavior without bloating the host component
- **Ions**: Provide low-level utilities that keep Atoms clean

### 🚀 Getting Started Checklist

When building a new component:

1. **Define the need** - What problem are you solving?
2. **Choose the right type** - Use the decision flow above
3. **Follow the patterns** - Use the templates and examples in this guide
4. **Write tests first** - Test-driven development ensures better design
5. **Document usage** - Include examples and integration notes
6. **Review and iterate** - Get feedback before finalizing

### 📚 Related Resources

- [Project Overview](../architecture/project-overview.md)
- [Testing Patterns](../patterns/testing-patterns.md)
- [Coding Standards](../best-practices/coding-standards.md)
- [Main Atomic Package Guide](./atomic.md)

---

_This guide is based on Atomic Chemistry methodology and represents the current best practices for the Coveo UI Kit Atomic package._
