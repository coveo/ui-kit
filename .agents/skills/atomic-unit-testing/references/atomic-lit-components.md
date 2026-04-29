# Atomic Lit Components

Testing patterns for Lit web components (classes decorated with `@customElement`) in `packages/atomic`.

## Fixture Selection

- **Most components** — integrate with Headless controllers. Fixture: `renderInAtomic*Interface`
- **Result templates** — get data from parent result context. Fixture: `renderInAtomicResult`
- **Product templates** — get data from parent product context. Fixture: `renderInAtomicProduct`

## Mocking Headless

**Spy mock (most common)** — keeps real implementation, lets you assert on calls and override returns:

```typescript
vi.mock('@coveo/headless', {spy: true});
```

**Partial mock with `vi.importActual`** — replaces specific non-function exports:

```typescript
vi.mock('@coveo/headless', async () => {
  const actual =
    await vi.importActual<typeof import('@coveo/headless')>('@coveo/headless');
  return {
    ...actual,
    ResultTemplatesHelpers: {getResultProperty: vi.fn(() => 1024)},
  };
});
```

## Render Helper

### Controller-based components

```typescript
describe('atomic-timeframe-facet', () => {
  let mockedConsole: ReturnType<typeof mockConsole>;

  beforeEach(() => {
    mockedConsole = mockConsole();
    vi.mocked(buildSearchStatus).mockReturnValue(
      buildFakeSearchStatus({firstSearchExecuted: true})
    );
  });

  const setupElement = async (
    props?: Partial<{field: string; label: string}>
  ) => {
    const {element} = await renderInAtomicSearchInterface<AtomicTimeframeFacet>(
      {
        template: html`<atomic-timeframe-facet
          field=${props?.field ?? 'date'}
          label=${props?.label ?? 'Date'}
          .tabsIncluded=${props?.tabsIncluded || []}
          ?is-collapsed=${props?.isCollapsed}
        ></atomic-timeframe-facet>`,
        selector: 'atomic-timeframe-facet',
        bindings: (bindings) => ({
          ...bindings,
          store: {...bindings.store, registerFacet: vi.fn()},
        }),
      }
    );

    const qs = (part: string) =>
      element.shadowRoot?.querySelector(`[part~="${part}"]`);

    return {
      element,
      locators: {
        get facet() {
          return qs('facet');
        },
        get placeholder() {
          return qs('placeholder');
        },
      },
    };
  };
});
```

### Result template pattern

```typescript
const renderResultNumber = async ({
  props = {},
  slottedContent,
  result = {},
}: {
  props?: Partial<{field: string}>;
  slottedContent?: TemplateResult;
  result?: Partial<Result>;
} = {}) => {
  const {element, atomicResult} =
    await renderInAtomicResult<AtomicResultNumber>({
      template: html`<atomic-result-number field=${ifDefined(props.field)}
        >${ifDefined(slottedContent)}</atomic-result-number
      >`,
      selector: 'atomic-result-number',
      result: result as Result,
      bindings: (bindings) => {
        bindings.engine = mockedEngine;
        return bindings;
      },
    });
  return {element, atomicResult};
};
```

### Use case variants

- **Search** — `renderInAtomicSearchInterface` / `buildFakeSearchEngine`
- **Commerce** — `renderInAtomicCommerceInterface` / `buildFakeCommerceEngine`
- **Insight** — `renderInAtomicInsightInterface` / `buildFakeInsightEngine`
- **Recommendation** — `renderInAtomicRecommendationInterface` / `buildFakeRecommendationEngine`

## Inline Controller Mocks

When no `buildFake*` fixture exists, build mocks inline:

```typescript
mockedDateFacet = {
  get state() {
    return dateFacetState;
  },
  subscribe: vi.fn((cb) => {
    cb();
    return vi.fn();
  }),
  toggleSingleSelect: vi.fn(),
  deselectAll: vi.fn(),
} as unknown as DateFacet;

vi.mocked(buildDateFacet).mockReturnValue(mockedDateFacet);
```

Key requirements:

- `get state()` getter (live-updatable)
- `subscribe` calls callback immediately, returns unsubscribe `vi.fn()`
- Cast with `as unknown as ControllerType`

## Test Coverage

### Controller initialization

```typescript
it('should build search status with engine', async () => {
  const {element} = await setupElement();
  expect(buildSearchStatus).toHaveBeenCalledWith(element.bindings.engine);
});
```

### Reactive property changes

Mutate props on rendered element + `await element.updateComplete`:

```typescript
it('should set error when field is emptied', async () => {
  const {element} = await renderResultNumber({props: {field: 'size'}});
  element.field = '';
  await element.updateComplete;
  expect(element.error).toBeInstanceOf(Error);
});
```

### Prop validation with `it.each`

```typescript
it.each<{
  prop: string;
  validValue: string | number;
  invalidValue: string | number;
}>([
  {prop: 'sortCriteria', validValue: 'ascending', invalidValue: 'invalid'},
  {prop: 'headingLevel', validValue: 2, invalidValue: 7},
])(
  'should warn when #$prop is invalid',
  async ({prop, validValue, invalidValue}) => {
    const {element} = await setupElement({[prop]: validValue});
    (element as any)[prop] = invalidValue;
    await element.updateComplete;
    expect(mockedConsole.warn).toHaveBeenCalledWith(
      expect.stringContaining(prop),
      element
    );
  }
);
```

### Conditional rendering

```typescript
it('should render placeholder before first search', async () => {
  vi.mocked(buildSearchStatus).mockReturnValue(
    buildFakeSearchStatus({firstSearchExecuted: false})
  );
  const {locators} = await setupElement();
  expect(locators.placeholder).not.toBeNull();
  expect(locators.facet).toBeNull();
});
```

### Custom event dispatch

```typescript
it('should resolve result on custom event', async () => {
  const element = await renderResult({result});
  const mockCallback = vi.fn();
  const event = new CustomEvent('atomic/resolveResult', {
    detail: mockCallback,
    bubbles: true,
    cancelable: true,
  });
  element.dispatchEvent(event);
  expect(mockCallback).toHaveBeenCalledWith(result);
  expect(event.defaultPrevented).toBe(true);
});
```

### Slotted custom elements

Define inline LitElements in the spec file to test slot behavior:

```typescript
@customElement('test-formatter')
class TestFormatter extends LitElement {
  firstUpdated() {
    this.dispatchEvent(
      new CustomEvent('atomic/numberFormat', {
        detail: (value: number) => `000${value}000`,
        bubbles: true,
        cancelable: true,
      })
    );
  }
  render() {
    return html``;
  }
}
void TestFormatter;

it('should use slotted formatter', async () => {
  const {element} = await renderResultNumber({
    props: {field: 'price'},
    slottedContent: html`<test-formatter></test-formatter>`,
  });
  expect(element).toHaveTextContent('0001234.56000');
});
```

### Self-removing components

```typescript
it('should remove itself when value is null', async () => {
  vi.mocked(ResultTemplatesHelpers.getResultProperty).mockReturnValue(null);
  const {element} = await renderResultNumber({props: {field: 'missing'}});
  expect(element).not.toBeInTheDocument();
});
```

### Testing outside required parent

Render with `selector: undefined`, query the interface for the orphan:

```typescript
it('should error when not in a result template', async () => {
  const {atomicInterface} =
    await renderInAtomicSearchInterface<AtomicResultNumber>({
      template: html`<atomic-result-number
        field="size"
      ></atomic-result-number>`,
      selector: undefined,
    });
  const element = atomicInterface.querySelector<AtomicResultNumber>(
    'atomic-result-number'
  );
  expect(element!.error).toBeInstanceOf(Error);
});
```

### Lifecycle cleanup

```typescript
it('should remove event listeners on disconnect', async () => {
  const {element} = await setupElement();
  const spy = vi.spyOn(element, 'removeEventListener');
  element.remove();
  expect(spy).toHaveBeenCalledWith(
    'atomic-date-input-apply',
    expect.any(Function)
  );
});
```

## Console Mocking

The Controller-based example above shows top-level `mockConsole()` — use that for components that emit many warnings during normal operation (facets).

For targeted tests, scope to a `describe` block:

```typescript
describe('when props conflict', () => {
  beforeEach(() => {
    mockedConsole = mockConsole();
  });
  it('should warn', async () => {
    await setupElement({tabsIncluded: ['a'], tabsExcluded: ['b']});
    expect(mockedConsole.warn).toHaveBeenCalledWith(
      expect.stringContaining('tabs-included')
    );
  });
});
```

Scope as narrowly as possible — avoid silencing unexpected errors.
