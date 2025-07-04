import {renderInAtomicCommerceInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-commerce-interface-fixture';
import {buildFakeDateFacet} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/date-facet-subcontroller';
import {buildFakeCommerceDateFacetValue} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/date-facet-value';
import {buildFakeSummary} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/summary-subcontroller';
import {DateFacet, DateFacetValue, Summary} from '@coveo/headless/commerce';
import {page, userEvent} from '@vitest/browser/context';
import {html, LitElement} from 'lit';
import {
  describe,
  it,
  vi,
  expect,
  beforeEach,
  afterEach,
  MockInstance,
} from 'vitest';
import type {AtomicCommerceTimeframeFacet} from './atomic-commerce-timeframe-facet';
import './atomic-commerce-timeframe-facet';

vi.mock('@coveo/headless/commerce', {spy: true});

describe('AtomicCommerceTimeframeFacet', () => {
  let mockedSummary: Summary;
  let mockedFacet: DateFacet;
  let mockedConsoleError: MockInstance;

  beforeEach(() => {
    mockedConsoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    mockedSummary = buildFakeSummary({});
    mockedFacet = buildFakeDateFacet({
      implementation: {
        toggleSelect: vi.fn(),
        toggleExclude: vi.fn(),
        toggleSingleSelect: vi.fn(),
        deselectAll: vi.fn(),
        setRanges: vi.fn(),
      },
    });
  });

  afterEach(() => {
    mockedConsoleError.mockRestore();
  });

  const setupElement = async (
    props?: Partial<{isCollapsed: boolean; field: string}>
  ) => {
    const {element} =
      await renderInAtomicCommerceInterface<AtomicCommerceTimeframeFacet>({
        template: html`<atomic-commerce-timeframe-facet
          .facet=${mockedFacet}
          .summary=${mockedSummary}
          ?is-collapsed=${props?.isCollapsed || false}
          field=${props?.field || 'testField'}
        ></atomic-commerce-timeframe-facet>`,
        selector: 'atomic-commerce-timeframe-facet',
        bindings: (bindings) => {
          bindings.interfaceElement.type = 'product-listing';
          bindings.store.getUniqueIDFromEngine = vi.fn().mockReturnValue('123');
          bindings.store.onChange = vi.fn();
          return bindings;
        },
      });
    return {
      element,
      getFacetValueByPosition(valuePosition: number) {
        return page.getByRole('listitem').nth(valuePosition);
      },
      getFacetValueByLabel(value: string | RegExp) {
        return page.getByRole('listitem').filter({hasText: value});
      },
      getFacetValueButtonByLabel(value: string | RegExp) {
        return page.getByLabelText(`Inclusion filter on ${value}`);
      },
      get facet() {
        return element.shadowRoot!.querySelector('[part=facet]')!;
      },
      get title() {
        return page.getByText('some-display-name', {exact: true});
      },
      get componentError() {
        return page.getByText(
          'Look at the developer console for more information'
        );
      },
      get clearButton() {
        return element.shadowRoot!.querySelector(
          '[part=clear-button]'
        ) as HTMLButtonElement;
      },
      get labelButton() {
        return element.shadowRoot!.querySelector('[part=label-button]')!;
      },
      get labelButtonIcon() {
        return element.shadowRoot!.querySelector('[part=label-button-icon]')!;
      },
      get valueLabel() {
        return element.shadowRoot!.querySelectorAll('[part=value-label]');
      },
      get valueCount() {
        return element.shadowRoot!.querySelectorAll('[part=value-count]');
      },
      get valueLink() {
        return element.shadowRoot!.querySelectorAll('[part=value-link]');
      },
      get dateInput() {
        return element.shadowRoot!.querySelector('atomic-facet-date-input')!;
      },
      get inputStart() {
        return page.getByLabelText(
          'Enter a start date for the some-display-name facet'
        );
      },
      get inputEnd() {
        return page.getByLabelText(
          'Enter an end date for the some-display-name facet'
        );
      },
    };
  };

  it('should render the title', async () => {
    const {title} = await setupElement();
    await expect.element(title).toBeVisible();
  });

  it('should render the first facet value', async () => {
    const {getFacetValueByPosition} = await setupElement();
    const facetValue = getFacetValueByPosition(0);
    await expect.element(facetValue).toBeVisible();
  });

  it('should render the first facet value label', async () => {
    const {getFacetValueByLabel} = await setupElement();
    const facetValueLabel = getFacetValueByLabel('Past Month');
    await expect.element(facetValueLabel).toBeVisible();
  });

  it('should render the first facet value button label', async () => {
    const {getFacetValueButtonByLabel} = await setupElement();
    const facetValueButtonLabel = getFacetValueButtonByLabel('Past Month');
    await expect.element(facetValueButtonLabel).toBeVisible();
  });

  it('should render the label button part', async () => {
    const {labelButton} = await setupElement();
    await expect.element(labelButton).toBeInTheDocument();
  });

  it('should render the label button icon part', async () => {
    const {labelButtonIcon} = await setupElement();
    await expect.element(labelButtonIcon).toBeInTheDocument();
  });

  it('should render the first value count part', async () => {
    const {valueCount} = await setupElement();
    await expect.element(valueCount![0]).toBeInTheDocument();
  });

  it('should render the first value part', async () => {
    const {valueLink} = await setupElement();
    await expect.element(valueLink![0]).toBeInTheDocument();
  });

  it('should throw error when facet property is missing', async () => {
    // @ts-expect-error: mocking facet to be undefined
    mockedFacet = undefined;
    const {componentError} = await setupElement();

    expect(componentError).toBeVisible();
    expect(mockedConsoleError).toHaveBeenCalledWith(
      new Error(
        'The "facet" property is required for <atomic-commerce-timeframe-facet>.'
      ),
      expect.anything()
    );
  });

  describe('when facet has values', () => {
    const mockValues: DateFacetValue[] = [
      buildFakeCommerceDateFacetValue({
        start: 'past-1-month',
        end: 'now',
        numberOfResults: 10,
        state: 'idle',
      }),
      buildFakeCommerceDateFacetValue({
        start: 'past-1-year',
        end: 'now',
        numberOfResults: 5,
        state: 'selected',
      }),
    ];

    beforeEach(async () => {
      mockedFacet = buildFakeDateFacet({
        state: {
          values: mockValues,
        },
      });
    });

    it('should render facet values', async () => {
      const {valueLabel} = await setupElement();

      expect(valueLabel!.length).toBe(2);
      await expect.element(valueLabel![0]).toBeInTheDocument();
      await expect.element(valueLabel![1]).toBeInTheDocument();
    });
  });

  describe('when user interacts with facet values', () => {
    beforeEach(() => {
      mockedFacet = mockedFacet = buildFakeDateFacet({});
    });
    it('should handle value selection', async () => {
      const mockToggleSingleSelect = vi.fn();
      const mockValue = buildFakeCommerceDateFacetValue({
        start: 'past-1-month',
        end: 'now',
        numberOfResults: 10,
        state: 'idle',
      });

      mockedFacet = buildFakeDateFacet({
        implementation: {
          toggleSingleSelect: mockToggleSingleSelect,
        },
        state: {
          values: [mockValue],
        },
      });
      const {valueLink} = await setupElement();

      await userEvent.click(valueLink![0]);

      expect(mockToggleSingleSelect).toHaveBeenCalledWith(mockValue);
    });

    it('should handle clear filters', async () => {
      const mockDeselectAll = vi.fn();
      mockedFacet = buildFakeDateFacet({
        implementation: {
          deselectAll: mockDeselectAll,
        },
        state: {
          values: [
            buildFakeCommerceDateFacetValue({
              state: 'selected',
              numberOfResults: 5,
            }),
          ],
        },
      });

      const {clearButton} = await setupElement();

      await clearButton.click();

      expect(mockDeselectAll).toHaveBeenCalled();
    });
  });

  describe('when date input is shown', () => {
    it('should render date input when shouldRenderInput is true', async () => {
      mockedFacet = buildFakeDateFacet();

      const {dateInput} = await setupElement();
      await expect.element(dateInput).toBeInTheDocument();
    });

    it('should handle date input range application', async () => {
      const mockSetRanges = vi.fn();
      mockedFacet = await buildFakeDateFacet({
        implementation: {
          setRanges: mockSetRanges,
        },
      });

      const {dateInput, inputStart, inputEnd} = await setupElement();

      const dateRange = {
        start: '2023-01-01',
        end: '2023-12-31',
      };

      // Simulate date input application
      const customEvent = new CustomEvent('atomic-date-input-apply', {
        detail: dateRange,
        bubbles: true,
        composed: true,
      });

      await dateInput.dispatchEvent(customEvent);

      await expect.element(inputStart).toHaveValue('2023-01-01');
      await expect.element(inputEnd).toHaveValue('2023-12-31');
    });

    it.skip('should reset date range', async () => {
      const mockSetRanges = vi.fn();
      mockedFacet = buildFakeDateFacet({
        implementation: {
          setRanges: mockSetRanges,
        },
      });

      const {clearButton, dateInput} = await setupElement();

      const dateRange = {
        start: '2023-01-01',
        end: '2023-12-31',
      };

      // Simulate date input application
      const customEvent = new CustomEvent('atomic-date-input-apply', {
        detail: dateRange,
        bubbles: true,
        composed: true,
      });

      await dateInput.dispatchEvent(customEvent);

      // Clear the date input
      await userEvent.click(clearButton);

      // expect(element.inputRange).toBeUndefined();
      expect(mockSetRanges).toHaveBeenCalledWith([]);
    });
  });

  describe('when facet is collapsed', () => {
    it('should not render values when collapsed', async () => {
      const {dateInput} = await setupElement({
        isCollapsed: true,
      });

      expect(dateInput).not.toBeInTheDocument();
    });

    it('should toggle collapse state', async () => {
      const {element} = await setupElement({
        isCollapsed: false,
      });

      expect(element.isCollapsed).toBe(false);

      element.isCollapsed = !element.isCollapsed;
      expect(element.isCollapsed).toBe(true);
    });
  });

  describe('#shouldRenderFacet', () => {
    it('should render when values are available', async () => {
      const {facet} = await setupElement();

      expect(facet).not.toBeNull();
    });

    it('should not render when no values and no input range', async () => {
      mockedFacet = buildFakeDateFacet({
        state: {
          values: [],
        },
      });
      mockedSummary = buildFakeSummary({
        state: {
          hasProducts: false,
        },
      });

      const {facet} = await setupElement();

      expect(facet).toBeNull();
    });
  });

  describe('#focusTarget', () => {
    it('should handle focus after clear', async () => {
      const {element} = await setupElement();
      // @ts-expect-error: Accessing private property for testing
      const focusTarget = element.focusTarget;

      expect(focusTarget).toBeDefined();
      expect(typeof focusTarget.focusAfterSearch).toBe('function');
    });
  });

  describe('#initialize', () => {
    it('should validate facet on initialization', async () => {
      const {element} = await setupElement();
      expect(() => element.initialize()).not.toThrow();
    });

    it('should subscribe to facet state changes', async () => {
      const mockSubscribe = vi.fn(() => vi.fn());
      mockedFacet = buildFakeDateFacet({
        implementation: {
          subscribe: mockSubscribe,
        },
      });
      await setupElement();

      expect(mockSubscribe).toHaveBeenCalled();
    });
  });

  describe('#disconnectedCallback', () => {
    it('should call super.disconnectedCallback()', async () => {
      const mockUnsubscribe = vi.fn();
      const mockSubscribe = vi.fn(() => mockUnsubscribe);

      mockedFacet = buildFakeDateFacet({
        implementation: {
          subscribe: mockSubscribe,
        },
      });

      const {element} = await setupElement();
      const superSpy = vi.spyOn(LitElement.prototype, 'disconnectedCallback');

      element.disconnectedCallback();

      expect(superSpy).toHaveBeenCalledOnce();
    });
  });

  describe('when field property is set', () => {
    it('should use the specified field', async () => {
      const {element} = await setupElement({field: 'custom-date-field'});

      expect(element.field).toBe('custom-date-field');
    });
  });

  describe('when summary has error', () => {
    it('should not render facet when summary has error', async () => {
      mockedSummary = buildFakeSummary({
        state: {
          hasError: true,
          firstRequestExecuted: true,
        },
      });
      const {facet} = await setupElement();

      await expect.element(facet).toBeNull();
    });
  });

  describe('when no search executed', () => {
    it('should not render facet when first request not executed', async () => {
      mockedSummary = buildFakeSummary({
        state: {
          firstRequestExecuted: false,
          hasError: false,
        },
      });
      const {facet} = await setupElement();

      await expect.element(facet).toBeNull();
    });
  });
});
