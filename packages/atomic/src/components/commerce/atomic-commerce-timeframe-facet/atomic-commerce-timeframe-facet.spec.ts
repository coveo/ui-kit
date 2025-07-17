/** biome-ignore-all lint/style/noNonNullAssertion: For testing, locators should always exist */
import {shouldDisplayInputForFacetRange} from '@/src/components/common/facets/facet-common';
import {FocusTargetController} from '@/src/utils/accessibility-utils';
import {renderInAtomicCommerceInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-commerce-interface-fixture';
import {buildFakeDateFacet} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/date-facet-subcontroller';
import {buildFakeCommerceDateFacetValue} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/date-facet-value';
import {buildFakeSummary} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/summary-subcontroller';
import type {DateFacet, Summary} from '@coveo/headless/commerce';
import {page, userEvent} from '@vitest/browser/context';
import {html} from 'lit';
import {
  describe,
  it,
  vi,
  expect,
  beforeEach,
  afterEach,
  type MockInstance,
} from 'vitest';
import type {AtomicCommerceTimeframeFacet} from './atomic-commerce-timeframe-facet';
import './atomic-commerce-timeframe-facet';

vi.mock('@coveo/headless/commerce', {spy: true});
vi.mock('@/src/components/common/facets/facet-common', {spy: true});

describe('atomic-commerce-timeframe-facet', () => {
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
      get noLabelTitle() {
        return page.getByText('No label', {exact: true});
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
      get values() {
        return element.shadowRoot!.querySelector('[part=values]')!;
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
      get inputApplyButton() {
        return element.shadowRoot!.querySelector('[part=input-apply-button]')!;
      },
      get dateInput() {
        return element.shadowRoot!.querySelector('atomic-facet-date-input')!;
      },
      get inputStart() {
        return element.shadowRoot!.querySelector('[part=input-start]')!;
      },
      get inputEnd() {
        return element.shadowRoot!.querySelector('[part=input-end]')!;
      },
    };
  };

  it('should render the title', async () => {
    const {title} = await setupElement();
    await expect.element(title).toBeVisible();
  });

  it('should render the facet', async () => {
    const {facet} = await setupElement();
    await expect.element(facet).toBeVisible();
  });

  it('should render the first facet value', async () => {
    const {getFacetValueByPosition} = await setupElement();
    const facetValue = getFacetValueByPosition(0);
    await expect.element(facetValue).toBeVisible();
  });

  it('should render facet values', async () => {
    const {valueLabel} = await setupElement();

    expect(valueLabel).toHaveLength(2);
    await expect.element(valueLabel[0]).toBeInTheDocument();
    await expect.element(valueLabel[1]).toBeInTheDocument();
  });

  it('should render values', async () => {
    const {values} = await setupElement();
    await expect.element(values).toBeInTheDocument();
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

  it('should render input start', async () => {
    const {inputStart} = await setupElement();
    await expect.element(inputStart).toBeInTheDocument();
  });

  it('should render input end', async () => {
    const {inputEnd} = await setupElement();
    await expect.element(inputEnd).toBeInTheDocument();
  });

  it('should render date input when #shouldDisplayInputForFacetRange is true', async () => {
    vi.mocked(shouldDisplayInputForFacetRange).mockReturnValue(true);
    const {dateInput} = await setupElement();
    await expect.element(dateInput).toBeInTheDocument();
  });

  it('should not render date input when #shouldDisplayInputForFacetRange is false', async () => {
    vi.mocked(shouldDisplayInputForFacetRange).mockReturnValue(false);
    const {dateInput} = await setupElement();
    await expect.element(dateInput).not.toBeInTheDocument();
  });

  it('should not render values when numberOfResults is 0 and state is idle', async () => {
    const mockValue = buildFakeCommerceDateFacetValue({
      start: 'past-1-month',
      end: 'now',
      numberOfResults: 0,
      state: 'idle',
    });

    mockedFacet = buildFakeDateFacet({
      state: {
        values: [mockValue],
      },
    });

    const {values} = await setupElement();
    await expect.element(values).not.toBeInTheDocument();
  });

  it('should not render values there are already a valid input range', async () => {
    const {dateInput, values} = await setupElement();

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

    await expect.element(values).not.toBeInTheDocument();
  });

  it('should not render facet when there are no values', async () => {
    mockedFacet = buildFakeDateFacet({
      state: {
        values: [],
      },
    });

    const {facet} = await setupElement();

    expect(facet).not.toBeInTheDocument();
  });

  it('should not render values when collapsed', async () => {
    const {dateInput, values} = await setupElement({
      isCollapsed: true,
    });

    await expect.element(dateInput).not.toBeInTheDocument();
    await expect.element(values).not.toBeInTheDocument();
  });

  it('should not render facet when summary has error', async () => {
    mockedSummary = buildFakeSummary({
      state: {
        hasError: true,
      },
    });
    const {facet} = await setupElement();

    await expect.element(facet).not.toBeInTheDocument();
  });

  it('should not render facet when first request not executed', async () => {
    mockedSummary = buildFakeSummary({
      state: {
        firstRequestExecuted: false,
      },
    });
    const {facet} = await setupElement();
    await expect.element(facet).not.toBeInTheDocument();
  });

  it('should render no-label when facet has no display name', async () => {
    mockedFacet = buildFakeDateFacet({
      state: {
        displayName: '',
      },
    });
    const {noLabelTitle} = await setupElement();
    await expect.element(noLabelTitle).toBeInTheDocument();
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

  it('should call #shouldDisplayInputForFacetRange with the correct values', async () => {
    const mockedShouldDisplayInput = vi.mocked(shouldDisplayInputForFacetRange);
    const mockValue = buildFakeCommerceDateFacetValue({
      start: 'past-1-month',
      end: 'now',
      numberOfResults: 10,
      state: 'idle',
    });

    mockedFacet = buildFakeDateFacet({
      state: {
        values: [mockValue],
      },
    });

    await setupElement();

    expect(mockedShouldDisplayInput).toHaveBeenCalledWith(
      expect.objectContaining({
        facetValues: [expect.objectContaining(mockValue)],
        hasInputRange: false, // TODO: one test for that
      })
    );
  });

  it('should call #toggleSingleSelect with correct values when value is selected', async () => {
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

  it('should call #deselectAll when clear button is clicked', async () => {
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

  it('should call #focusAfterSearch when clear button is clicked', async () => {
    const focusAfterSearchSpy = vi.spyOn(
      FocusTargetController.prototype,
      'focusAfterSearch'
    );
    mockedFacet = buildFakeDateFacet({
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

    expect(focusAfterSearchSpy).toHaveBeenCalled();
  });

  it('should call #mockSetRanges with correct values when range is applied', async () => {
    const mockSetRanges = vi.fn();
    mockedFacet = await buildFakeDateFacet({
      implementation: {
        setRanges: mockSetRanges,
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

    const {inputStart, inputEnd, inputApplyButton, clearButton} =
      await setupElement();

    const {start, end} = {
      start: '2023{ArrowRight}01{ArrowRight}01',
      end: '2023{ArrowRight}12{ArrowRight}31',
    };

    // Simulate date input application
    await userEvent.type(inputStart, start);
    await userEvent.type(inputEnd, end);
    await userEvent.click(inputApplyButton);

    // Verify facet has been set with the correct date range
    expect(mockSetRanges).toHaveBeenCalledWith([
      {
        end: '2023/12/31@23:59:59',
        endInclusive: false,
        start: '2023/01/01@00:00:00',
        state: 'selected',
      },
    ]);

    // Clear the date input
    await clearButton.click();

    // Verify that the input range is cleared
    expect(mockSetRanges).toHaveBeenCalledWith([]);
  });

  it('should limit the start date to the selected end date', async () => {
    const mockSetRanges = vi.fn();
    mockedFacet = await buildFakeDateFacet({
      implementation: {
        setRanges: mockSetRanges,
      },
    });

    const {inputStart, inputEnd, inputApplyButton} = await setupElement();

    await userEvent.type(inputStart, '2023{ArrowRight}01{ArrowRight}01');
    await userEvent.type(inputEnd, '1999{ArrowRight}01{ArrowRight}01');
    await userEvent.click(inputApplyButton);

    expect(mockSetRanges).not.toHaveBeenCalled();
  });

  it('should toggle collapse state', async () => {
    const {element, labelButton} = await setupElement({
      isCollapsed: true,
    });

    await userEvent.click(labelButton);
    expect(element.isCollapsed).toBe(false);

    await userEvent.click(labelButton);
    expect(element.isCollapsed).toBe(true);
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

  it('should validate facet on initialization', async () => {
    const {element} = await setupElement();
    expect(() => element.initialize()).not.toThrow();
  });

  // TODO: also check if we need to tests for the initializePopover call

  // TODO:  not sure we need to test this. depends if we keep the subscribe method in the component
  // it('should subscribe to facet state changes', async () => {
  //   const mockSubscribe = vi.fn(() => vi.fn());
  //   mockedFacet = buildFakeDateFacet({
  //     implementation: {
  //       subscribe: mockSubscribe,
  //     },
  //   });
  //   await setupElement();

  //   expect(mockSubscribe).toHaveBeenCalled();
  // });

  // TODO: unsure
  // describe('#disconnectedCallback', () => {
  //   // TODO: remove only if we don't need to manually unsubscribe
  //   it('should call super.disconnectedCallback()', async () => {
  //     const mockUnsubscribe = vi.fn();
  //     const mockSubscribe = vi.fn(() => mockUnsubscribe);

  //     mockedFacet = buildFakeDateFacet({
  //       implementation: {
  //         subscribe: mockSubscribe,
  //       },
  //     });

  //     const {element} = await setupElement();
  //     const superSpy = vi.spyOn(LitElement.prototype, 'disconnectedCallback');

  //     element.disconnectedCallback();

  //     expect(superSpy).toHaveBeenCalledOnce();
  //   });
  // });
});

/**
## when selecting a start date

- should limit the end date to the selected start date

## when selecting an end date

- should limit the start date to the selected end date
*/
