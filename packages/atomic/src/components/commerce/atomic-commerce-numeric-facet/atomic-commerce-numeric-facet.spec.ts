import {
  buildContext,
  type Context,
  type NumericFacet,
  type Summary,
} from '@coveo/headless/commerce';
import {html, LitElement} from 'lit';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type MockInstance,
  vi,
} from 'vitest';
import {page, userEvent} from 'vitest/browser';
import {renderInAtomicCommerceInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-commerce-interface-fixture';
import {buildFakeContext} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/context-controller';
import {buildFakeCommerceEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/engine';
import {buildFakeNumericFacet} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/numeric-facet-controller';
import {buildFakeSummary} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/summary-subcontroller';
import type {AtomicCommerceNumericFacet} from './atomic-commerce-numeric-facet';
import './atomic-commerce-numeric-facet';

vi.mock('@coveo/headless/commerce', {spy: true});

describe('atomic-commerce-numeric-facet', () => {
  let mockedSummary: Summary;
  let mockedFacet: NumericFacet;
  let mockedContext: Context;
  let mockedConsoleError: MockInstance;

  beforeEach(() => {
    mockedConsoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    mockedContext = buildFakeContext({});
    mockedSummary = buildFakeSummary({});
    mockedFacet = buildFakeNumericFacet({
      implementation: {
        toggleSelect: vi.fn(),
        setRanges: vi.fn(),
        deselectAll: vi.fn(),
        showMoreValues: vi.fn(),
        showLessValues: vi.fn(),
      },
    });
  });

  afterEach(() => {
    mockedConsoleError.mockRestore();
  });

  const setupElement = async ({isCollapsed} = {isCollapsed: false}) => {
    vi.mocked(buildContext).mockReturnValue(mockedContext);
    const {element} =
      await renderInAtomicCommerceInterface<AtomicCommerceNumericFacet>({
        template: html`<atomic-commerce-numeric-facet
          .facet=${mockedFacet}
          .summary=${mockedSummary}
          ?is-collapsed=${isCollapsed}
          field="ec_price"
        ></atomic-commerce-numeric-facet>`,
        selector: 'atomic-commerce-numeric-facet',
        bindings: (bindings) => {
          bindings.store.getUniqueIDFromEngine = vi.fn().mockReturnValue('123');
          bindings.engine = buildFakeCommerceEngine({});
          return bindings;
        },
      });

    return {
      element,
      get title() {
        return page.getByText('some-display-name', {exact: true});
      },
      getFacetValueByPosition(valuePosition: number) {
        return page.getByRole('listitem').nth(valuePosition);
      },
      getFacetValueButtonByPosition(valuePosition: number) {
        return page.getByRole('checkbox').nth(valuePosition);
      },
      get componentError() {
        return page.getByText(
          'Look at the developer console for more information'
        );
      },
      get clearFilter() {
        return page.getByRole('button', {name: /clear filter/i});
      },
      get inputs() {
        return element.shadowRoot!.querySelector(
          'atomic-commerce-facet-number-input'
        )!;
      },
      get inputMinimum() {
        return element.shadowRoot!.querySelector('[part~=input-start]')!;
      },
      get inputMaximum() {
        return element.shadowRoot!.querySelector('[part~=input-end]')!;
      },
      get inputApply() {
        return page.getByRole('button', {name: /apply/i});
      },
      get facet() {
        return element.shadowRoot!.querySelector('[part~=facet]')!;
      },
      get labelButton() {
        return element.shadowRoot!.querySelector('[part~=label-button]')!;
      },
      get labelButtonIcon() {
        return element.shadowRoot!.querySelector('[part~=label-button-icon]')!;
      },
      get clearButton() {
        return element.shadowRoot!.querySelector('[part~=clear-button]')!;
      },
      get clearButtonIcon() {
        return element.shadowRoot!.querySelector('[part~=clear-button-icon]')!;
      },
      get valueLabel() {
        return element.shadowRoot!.querySelectorAll('[part~=value-label]');
      },
      get valueCount() {
        return element.shadowRoot!.querySelectorAll('[part~=value-count]');
      },
      get valueCheckbox() {
        return element.shadowRoot!.querySelectorAll('[part~=value-checkbox]');
      },
      get valueCheckboxChecked() {
        return element.shadowRoot!.querySelectorAll(
          '[part~=value-checkbox-checked]'
        );
      },
      get valueCheckboxLabel() {
        return element.shadowRoot!.querySelectorAll(
          '[part~=value-checkbox-label]'
        );
      },
      get valueCheckboxIcon() {
        return element.shadowRoot!.querySelectorAll(
          '[part~=value-checkbox-icon]'
        );
      },
    };
  };

  it('should render the title', async () => {
    const {title} = await setupElement();
    await expect.element(title).toBeVisible();
  });

  it('should render "no-label" when displayName is falsy', async () => {
    mockedFacet = buildFakeNumericFacet({
      state: {
        displayName: '',
      },
    });

    const {labelButton} = await setupElement();
    await expect.element(labelButton).toHaveTextContent('No label');
  });

  it('should render "No label" when displayName is undefined', async () => {
    mockedFacet = buildFakeNumericFacet({
      state: {
        displayName: undefined,
      },
    });

    const {labelButton} = await setupElement();
    await expect.element(labelButton).toHaveTextContent('No label');
  });

  it('should render the first facet value', async () => {
    const {getFacetValueByPosition} = await setupElement();
    const facetValue = getFacetValueByPosition(0);
    await expect.element(facetValue).toBeVisible();
  });

  it('should render the first facet value button', async () => {
    const {getFacetValueButtonByPosition} = await setupElement();
    const facetValueButton = getFacetValueButtonByPosition(0);
    await expect.element(facetValueButton).toBeVisible();
  });

  it('should render the first facet value label', async () => {
    const {getFacetValueByPosition} = await setupElement();
    const facetValue = getFacetValueByPosition(0);
    await expect.element(facetValue).toHaveTextContent('$1.00 to $9.00 (15)');
  });

  it('should render the first facet value count', async () => {
    const {valueCount} = await setupElement();
    await expect.element(valueCount[0]).toBeInTheDocument();
  });

  it('should render the first value checkbox label part', async () => {
    const {valueCheckboxLabel} = await setupElement();
    await expect.element(valueCheckboxLabel[0]).toBeInTheDocument();
  });

  it('should render the first value checkbox icon part', async () => {
    const {valueCheckboxIcon} = await setupElement();
    await expect.element(valueCheckboxIcon[0]).toBeInTheDocument();
  });

  it('should render multiple facet values when available', async () => {
    const {getFacetValueByPosition} = await setupElement();
    const firstFacetValue = getFacetValueByPosition(0);
    const secondFacetValue = getFacetValueByPosition(1);

    await expect.element(firstFacetValue).toBeVisible();
    await expect.element(secondFacetValue).toBeVisible();
  });

  it('should render the clear button when there are selected values', async () => {
    mockedFacet = buildFakeNumericFacet({
      state: {
        values: [
          {
            start: 0,
            end: 100,
            endInclusive: true,
            state: 'selected',
            numberOfResults: 10,
            moreValuesAvailable: false,
            isAutoSelected: false,
            isSuggested: false,
          },
        ],
      },
    });
    const {clearButton, clearButtonIcon} = await setupElement();

    await expect.element(clearButton).toBeVisible();
    await expect.element(clearButton).toHaveTextContent('Clear filter');
    await expect.element(clearButtonIcon).toBeVisible();
  });

  it('should not render the clear button when there are no selected values', async () => {
    mockedFacet = buildFakeNumericFacet({
      state: {
        values: [
          {
            start: 0,
            end: 100,
            endInclusive: true,
            state: 'idle',
            numberOfResults: 10,
            moreValuesAvailable: false,
            isAutoSelected: false,
            isSuggested: false,
          },
        ],
      },
    });
    const {clearButton} = await setupElement();
    await expect.element(clearButton).not.toBeInTheDocument();
  });

  it('should call facet.deselectAll when the clear button is clicked', async () => {
    mockedFacet = buildFakeNumericFacet({
      implementation: {
        deselectAll: vi.fn(),
      },
      state: {
        values: [
          {
            start: 0,
            end: 100,
            endInclusive: true,
            state: 'selected',
            numberOfResults: 10,
            moreValuesAvailable: false,
            isAutoSelected: false,
            isSuggested: false,
          },
        ],
      },
    });

    const {clearButton} = await setupElement();

    await userEvent.click(clearButton);
    expect(mockedFacet.deselectAll).toHaveBeenCalled();
  });

  it('should render and display an error when the facet is undefined', async () => {
    // @ts-expect-error: mocking facet to be undefined
    mockedFacet = undefined;
    const {componentError} = await setupElement();

    expect(componentError).toBeVisible();
    expect(mockedConsoleError).toHaveBeenCalledWith(
      new Error(
        'The "facet" property is required for <atomic-commerce-facet>.'
      ),
      expect.anything()
    );
  });

  it('should render facet values when available', async () => {
    mockedFacet = buildFakeNumericFacet({});

    const {valueLabel} = await setupElement();

    expect(valueLabel.length).toBe(2);
    await expect.element(valueLabel[0]).toHaveTextContent('$1.00 to $9.00');
    await expect.element(valueLabel[1]).toHaveTextContent('$10.00 to $100.00');
  });

  describe('when a value is selected', () => {
    beforeEach(() => {
      mockedFacet = buildFakeNumericFacet({
        state: {
          values: [
            {
              start: 0,
              end: 100,
              isAutoSelected: false,
              isSuggested: false,
              endInclusive: true,
              state: 'selected',
              numberOfResults: 10,
              moreValuesAvailable: false,
            },
          ],
          hasActiveValues: true,
        },
      });
    });

    it('should show the selected facet value as checked', async () => {
      const {valueLabel, valueCheckboxChecked} = await setupElement();

      expect(valueCheckboxChecked?.length).toBe(1);
      await expect.element(valueLabel[0]).toHaveTextContent('$0.00 to $100.00');
    });

    it('should render the clear button when there are selected values', async () => {
      const {clearButton} = await setupElement();
      await expect.element(clearButton).toBeInTheDocument();
    });

    it('should add a bold class to the selected value label', async () => {
      const {valueLabel} = await setupElement();

      await expect.element(valueLabel[0]).toHaveClass('font-bold');
    });
  });

  it('should not render the clear button when there are no selected values', async () => {
    mockedFacet = buildFakeNumericFacet({
      state: {
        values: [
          {
            start: 0,
            end: 100,
            endInclusive: true,
            state: 'idle',
            numberOfResults: 10,
            moreValuesAvailable: false,
            isAutoSelected: false,
            isSuggested: false,
          },
        ],
        hasActiveValues: false,
      },
    });
    const {clearButton} = await setupElement();
    await expect.element(clearButton).not.toBeInTheDocument();
  });

  it('should toggle collapse when the header is clicked', async () => {
    const {element, labelButton} = await setupElement({isCollapsed: true});

    await userEvent.click(labelButton);

    expect(element.isCollapsed).toBe(false);
  });

  it('should call facet.toggleSelect when a value is clicked', async () => {
    mockedFacet = buildFakeNumericFacet({
      implementation: {
        toggleSelect: vi.fn(),
      },
      state: {
        values: [
          {
            end: 100,
            endInclusive: true,
            isAutoSelected: false,
            isSuggested: false,
            moreValuesAvailable: false,
            numberOfResults: 10,
            start: 0,
            state: 'idle',
          },
        ],
      },
    });

    const {valueLabel} = await setupElement();

    await userEvent.click(valueLabel[0]);

    expect(mockedFacet.toggleSelect).toHaveBeenCalledWith({
      start: 0,
      end: 100,
      endInclusive: true,
      state: 'idle',
      isAutoSelected: false,
      isSuggested: false,
      moreValuesAvailable: false,
      numberOfResults: 10,
    });
  });

  describe('with manual range input', () => {
    beforeEach(() => {
      mockedFacet = buildFakeNumericFacet({
        state: {
          manualRange: {
            start: 50,
            end: 150,
            endInclusive: true,
            state: 'selected',
          },
        },
      });
    });

    it('should render input controls when manual range is set', async () => {
      const {inputMinimum, inputMaximum, inputApply} = await setupElement();

      await expect.element(inputMinimum).toBeInTheDocument();
      await expect.element(inputMaximum).toBeInTheDocument();
      await expect.element(inputApply).toBeInTheDocument();
    });

    it('should display the manual range values in inputs', async () => {
      const {inputMinimum, inputMaximum} = await setupElement();

      expect(inputMinimum).toHaveValue(50);
      expect(inputMaximum).toHaveValue(150);
    });

    it('should call facet.setRanges when apply button is clicked', async () => {
      mockedFacet = buildFakeNumericFacet({
        implementation: {
          setRanges: vi.fn(),
        },
      });

      const {inputs} = await setupElement();

      const customEvent = new CustomEvent('atomic-number-input-apply', {
        detail: {
          start: 12,
          end: 13,
        },
        bubbles: true,
        composed: true,
      });
      inputs.dispatchEvent(customEvent);

      expect(mockedFacet.setRanges).toHaveBeenCalledWith([
        {
          start: 12,
          end: 13,
          endInclusive: true,
          state: 'selected',
        },
      ]);
    });
  });

  describe('#initialize', () => {
    it('should call all initialization methods in the correct order', async () => {
      const {element} = await setupElement();

      // @ts-expect-error: accessing private methods for testing
      const validateFacetSpy = vi.spyOn(element, 'validateFacet');

      element.initialize();

      expect(validateFacetSpy).toHaveBeenCalled();
    });
  });

  describe('#disconnectedCallback', () => {
    it('should call super.disconnectedCallback()', async () => {
      const {element} = await setupElement();
      const superSpy = vi.spyOn(LitElement.prototype, 'disconnectedCallback');

      element.disconnectedCallback();

      expect(superSpy).toHaveBeenCalledOnce();
    });
  });
});
