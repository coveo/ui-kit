# Atomic Functional Components

Testing patterns for functional components (functions named `render*` that return Lit `TemplateResult`) in `packages/atomic`.

## Rendering

Use `renderFunctionFixture` — not `renderInAtomicSearchInterface`. Top-level describe uses `'#renderFunctionName'` prefix.

```typescript
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {page} from 'vitest/browser'; // only when using page locators
```

## Render Helper

Build a `renderComponent` helper that merges partial overrides into required defaults. The function always wraps props in the `{props: {...}}` object that `FunctionalComponent<T>` expects:

### Props only

```typescript
const renderComponent = async (
  props: Partial<RadioButtonProps>
): Promise<HTMLElement> => {
  return renderFunctionFixture(
    html`${renderRadioButton({props: {...props, groupName: 'test-group'}})}`
  );
};
```

### With children (curried pattern)

Some functional components return a function that accepts children:

```typescript
const renderComponent = async (
  props: Partial<ButtonProps> = {},
  children = html`<span>Default</span>`
) => {
  const mergedProps = {...defaultProps, ...props};
  return renderFunctionFixture(
    html`${renderButton({props: mergedProps})(children)}`
  );
};
```

### With i18n

```typescript
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';

let i18n: Awaited<ReturnType<typeof createTestI18n>>;
beforeAll(async () => {
  i18n = await createTestI18n();
});

const renderComponent = async (props: Partial<FacetShowMoreProps> = {}) => {
  const defaultProps = {
    i18n,
    label: 'test',
    canShowLessValues: false,
    canShowMoreValues: false,
    onShowMore: vi.fn(),
    onShowLess: vi.fn(),
  };
  const mergedProps = {...defaultProps, ...props};
  return renderFunctionFixture(
    html`${renderFacetShowMoreLess({props: mergedProps})}`
  );
};
```

### Destructured return

Some render helpers destructure the fixture into named elements for convenience:

```typescript
const renderComponent = async (overrides: Partial<TextAreaProps> = {}) => {
  const mergedProps = {...defaultProps, ...overrides};
  const element = await renderFunctionFixture(
    html`${renderSearchTextArea({props: mergedProps})}`
  );
  return {
    element,
    get textarea() {
      return element.querySelector('textarea')!;
    },
    get clear() {
      return element.querySelector<HTMLButtonElement>('[part="clear"]');
    },
  };
};
```

## Querying Elements

**Page locators** (preferred for role-based / a11y-aware queries) or **direct DOM queries** (simpler for attribute checks) — use whichever fits:

```typescript
const locators = {
  get showMoreButton() {
    return page.getByRole('button', {
      name: 'Show more values for the test facet',
    });
  },
  get showMoreIcon() {
    return locators.showMoreButton.element().querySelector('atomic-icon');
  },
};
```

## Test Coverage

### Basic rendering

```typescript
it('should render the radio button with correct attributes', async () => {
  const element = await renderComponent({text: 'Option', checked: true});
  const input = element.querySelector(
    'input[type="radio"]'
  ) as HTMLInputElement;

  expect(input).toBeInTheDocument();
  expect(input.checked).toBe(true);
  expect(input.value).toBe('Option');
});
```

### Interactions

```typescript
it('should call onChecked when clicked', async () => {
  const onChecked = vi.fn();
  await renderComponent({onChecked});

  await locators.button.click();
  expect(onChecked).toHaveBeenCalled();
});
```

For keyboard navigation, direct DOM event dispatch is appropriate:

```typescript
it('should handle keyboard navigation', async () => {
  const element = await renderFunctionFixture(
    html`${renderRadioButton({props: {...props, text: 'radio-1'}})}
    ${renderRadioButton({props: {...props, text: 'radio-2'}})}`
  );
  const inputs = element.querySelectorAll(
    'input[type="radio"]'
  ) as NodeListOf<HTMLInputElement>;

  inputs[0].focus();
  inputs[0].dispatchEvent(
    new KeyboardEvent('keydown', {key: 'ArrowRight', bubbles: true})
  );
  expect(document.activeElement).toBe(inputs[1]);
});
```

### Conditional CSS classes

Test classes that **change based on props/state**. Skip static classes (covered by visual tests):

```typescript
it('should apply selected class when checked', async () => {
  const element = await renderComponent({checked: true});
  expect(element.querySelector('input')).toHaveClass('selected');
});

it('should not apply selected class when unchecked', async () => {
  const element = await renderComponent({checked: false});
  expect(element.querySelector('input')).not.toHaveClass('selected');
});
```

### Conditional rendering

```typescript
it('renders nothing when both flags are false', async () => {
  const container = await renderComponent();
  expect(container.textContent).toBe('');
});

it('renders only show more when canShowMoreValues is true', async () => {
  await renderComponent({canShowMoreValues: true});
  await expect.element(locators.showMoreButton).toBeInTheDocument();
  await expect.element(locators.showLessButton).not.toBeInTheDocument();
});
```

### Children (curried pattern)

```typescript
it('should render children content', async () => {
  const element = await renderComponent(
    {},
    html`<atomic-icon icon=${PlusIcon}></atomic-icon><span>Show more</span>`
  );
  expect(element.querySelector('atomic-icon')).toBeInTheDocument();
  expect(element).toHaveTextContent('Show more');
});
```

### Icon attributes

Icons are rendered as `<atomic-icon>` custom elements. Test via attributes:

```typescript
it('should render with the correct icon', async () => {
  await renderComponent({canShowMoreValues: true});
  const icon = locators.showMoreButton.element().querySelector('atomic-icon');
  await expect
    .element(icon)
    .toHaveAttribute('icon', expect.stringMatching(/<svg/));
});
```

### Ref callbacks

```typescript
it('should call ref with the element', async () => {
  const refMock = vi.fn();
  await renderComponent({ref: refMock});
  expect(refMock).toHaveBeenCalledWith(expect.any(HTMLButtonElement));
});
```

### i18n

```typescript
it('should render localized button label', async () => {
  await renderComponent({canShowMoreValues: true});
  await expect
    .element(locators.showMoreButton)
    .toHaveAttribute('aria-label', 'Show more values for the test facet');
});
```

## Spy Mocking for Delegation

When a functional component delegates to another module (e.g., calling `createRipple`), use `vi.mock` with `{spy: true}` to keep the real implementation but enable assertions:

```typescript
import {createRipple} from '@/src/utils/ripple-utils';

vi.mock('@/src/utils/ripple-utils', {spy: true});

it('should create a ripple on mousedown', async () => {
  const mockedRipple = vi.mocked(createRipple);
  const element = await renderComponent({style: 'primary'});
  const input = element.querySelector('input')!;

  input.dispatchEvent(new MouseEvent('mousedown', {bubbles: true}));
  expect(mockedRipple).toHaveBeenCalledWith(expect.anything(), {
    color: 'primary',
  });
});
```

Same pattern works for delegating to sibling functional components — spy-mock the module and assert on calls.

> **Tip:** In test helpers, pass plain class strings as props — avoid `tw`/`multiClassMap`.
