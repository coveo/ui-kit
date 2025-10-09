import {
  buildProductListing,
  buildSearch,
  type Pagination,
  type PaginationState,
  type ProductListingSummaryState,
  type SearchSummaryState,
  type Summary,
} from '@coveo/headless/commerce';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {userEvent} from 'storybook/test';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {
  convertChoicesToNumbers,
  validateInitialChoice,
} from '@/src/components/common/items-per-page/validate';
import {renderInAtomicCommerceInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-commerce-interface-fixture';
import {buildFakeCommerceEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/engine';
import {buildFakePager} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/pager-subcontroller';
import {buildFakeProductListing} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/product-listing-controller';
import {buildFakeSearch} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/search-controller';
import {buildFakeSummary} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/summary-subcontroller';
import type {AtomicCommerceProductsPerPage} from './atomic-commerce-products-per-page';
import './atomic-commerce-products-per-page';

vi.mock('@coveo/headless/commerce', {spy: true});
vi.mock('@/src/components/common/items-per-page/validate.js', {spy: true});

describe('atomic-commerce-products-per-page', () => {
  const mockedEngine = buildFakeCommerceEngine();
  const mockedFocusOnFirstResultAfterNextSearch = vi.fn(() =>
    Promise.resolve()
  );
  const mockedFocusOnNextNewResult = vi.fn();
  let mockedSummary: Summary;
  let mockedPager: Pagination;

  const renderProductsPerPage = async ({
    interfaceElementType = 'search',
    paginationState = {},
    summaryState = {},
    props = {},
  }: {
    interfaceElementType?: 'product-listing' | 'search';
    paginationState?: Partial<PaginationState>;
    summaryState?: Partial<SearchSummaryState | ProductListingSummaryState>;
    props?: {
      choicesDisplayed?: string;
      initialChoice?: number;
    };
  } = {}) => {
    mockedSummary = buildFakeSummary({state: summaryState});

    mockedPager = buildFakePager({
      state: paginationState,
    });

    vi.mocked(buildProductListing).mockReturnValue(
      buildFakeProductListing({
        implementation: {
          pagination: () => mockedPager,
          summary: () => mockedSummary,
        },
      })
    );
    vi.mocked(buildSearch).mockReturnValue(
      buildFakeSearch({
        implementation: {
          pagination: () => mockedPager,
          summary: () => mockedSummary as Summary<SearchSummaryState>,
        },
      })
    );

    const {element} =
      await renderInAtomicCommerceInterface<AtomicCommerceProductsPerPage>({
        template: html`<atomic-commerce-products-per-page
          choices-displayed=${ifDefined(props.choicesDisplayed)}
          initial-choice=${ifDefined(props.initialChoice)}
        ></atomic-commerce-products-per-page>`,
        selector: 'atomic-commerce-products-per-page',
        bindings: (bindings) => {
          bindings.interfaceElement.type = interfaceElementType;
          bindings.engine = mockedEngine;
          bindings.store.state.resultList = {
            focusOnFirstResultAfterNextSearch:
              mockedFocusOnFirstResultAfterNextSearch,
            focusOnNextNewResult: mockedFocusOnNextNewResult,
          };
          return bindings;
        },
      });

    return {
      element,
      get legend() {
        return element.shadowRoot!.querySelector('legend');
      },
      get label() {
        return element.shadowRoot!.querySelector('span[part="label"]');
      },
      get buttonList() {
        return element.shadowRoot!.querySelector('div[part="buttons"]');
      },
      get buttons() {
        return element.shadowRoot!.querySelectorAll('input[part*="button"]');
      },
      get activeButton() {
        return element.shadowRoot!.querySelector(
          'input[part*="active-button"]'
        );
      },
    };
  };

  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should call convertChoicesToNumbers with the choicesDisplayed prop', async () => {
    const choicesDisplayed = '10,25,50,100';
    await renderProductsPerPage({
      props: {choicesDisplayed},
    });

    expect(convertChoicesToNumbers).toHaveBeenCalledWith(choicesDisplayed);
  });

  it('should call validateInitialChoice with the initialChoice prop and the choices', async () => {
    const choicesDisplayed = '10,25,50,100';
    const initialChoice = 50;
    await renderProductsPerPage({
      props: {choicesDisplayed, initialChoice},
    });

    expect(validateInitialChoice).toHaveBeenCalledWith(
      initialChoice,
      [10, 25, 50, 100]
    );
  });

  it('should call buildSearch when interfaceElement type is "search"', async () => {
    await renderProductsPerPage({
      interfaceElementType: 'search',
    });

    expect(buildSearch).toHaveBeenCalledWith(mockedEngine);
  });

  it('should call buildProductListing when interfaceElement type is "product-listing"', async () => {
    await renderProductsPerPage({
      interfaceElementType: 'product-listing',
    });

    expect(buildProductListing).toHaveBeenCalledWith(mockedEngine);
  });

  it("should set this.summary to the product listing or search controller's summary", async () => {
    const {element} = await renderProductsPerPage();

    expect(element.summary).toBe(mockedSummary);
  });

  it("should set this.pagination to the product listing or search controller's pagination", async () => {
    const {element} = await renderProductsPerPage();

    expect(element.pagination).toBe(mockedPager);
  });

  it('should render nothing if the summary has an error', async () => {
    const {element} = await renderProductsPerPage({
      summaryState: {hasError: true},
    });

    expect(element).toHaveTextContent('');
  });

  it('should render nothing if there are no products', async () => {
    const {element} = await renderProductsPerPage({
      summaryState: {hasProducts: false},
    });

    expect(element).toHaveTextContent('');
  });

  it('should render the label', async () => {
    const {label} = await renderProductsPerPage();

    expect(label).toHaveTextContent('Products per page');
  });

  it('should render the label as aria-hidden', async () => {
    const {label} = await renderProductsPerPage();

    expect(label).toHaveAttribute('aria-hidden', 'true');
  });

  it('should render the label with the correct part', async () => {
    const {label} = await renderProductsPerPage();
    expect(label).toHaveAttribute('part', 'label');
  });

  it('should render the legend with the label', async () => {
    const {legend} = await renderProductsPerPage();

    expect(legend).toHaveTextContent('Products per page');
  });

  it('should render the button list with the correct part', async () => {
    const {buttonList} = await renderProductsPerPage();

    expect(buttonList).toHaveAttribute('part', 'buttons');
  });

  it('should render the buttons list with the correct role', async () => {
    const {buttonList} = await renderProductsPerPage();

    expect(buttonList).toHaveAttribute('role', 'radiogroup');
  });

  it('should render the buttons list with the correct aria-label', async () => {
    const {buttonList} = await renderProductsPerPage();

    expect(buttonList).toHaveAttribute('aria-label', 'Products per page');
  });

  it('should render the right amount of buttons', async () => {
    const choicesDisplayed = '10,25,50,100,200';
    const {buttons} = await renderProductsPerPage({
      props: {choicesDisplayed},
    });

    expect(buttons.length).toBe(5);
  });

  it('should render the first button as checked if no initial choice is provided', async () => {
    const choicesDisplayed = '10,25,50,100';
    const {buttons} = await renderProductsPerPage({
      props: {choicesDisplayed},
    });

    expect(buttons[0]).toHaveAttribute('checked');
  });

  it('should render the checked button with the correct part', async () => {
    const choicesDisplayed = '10,25,50,100';
    const initialChoice = 50;
    const {activeButton} = await renderProductsPerPage({
      props: {choicesDisplayed, initialChoice},
      paginationState: {pageSize: initialChoice},
    });

    expect(activeButton).toHaveAttribute('part', 'button active-button');
  });

  it('should render the initial choice as checked', async () => {
    const choicesDisplayed = '10,25,50,100';
    const initialChoice = 50;
    const {buttons} = await renderProductsPerPage({
      props: {choicesDisplayed, initialChoice},
      paginationState: {pageSize: initialChoice},
    });

    expect(buttons[2]).toHaveAttribute('checked');
  });

  it('should render the buttons with the correct part', async () => {
    const {buttons} = await renderProductsPerPage();

    buttons.forEach((button) => {
      const part = button.getAttribute('part');
      expect(part === 'button' || part === 'button active-button').toBe(true);
    });
  });

  it('should render the proper reflected value for each button', async () => {
    const choicesDisplayed = '10,25,50,100';
    const {buttons} = await renderProductsPerPage({
      props: {choicesDisplayed},
    });

    expect(buttons[0]).toHaveAttribute('value', '10');
    expect(buttons[1]).toHaveAttribute('value', '25');
    expect(buttons[2]).toHaveAttribute('value', '50');
    expect(buttons[3]).toHaveAttribute('value', '100');
  });

  it('should render the proper reflected aria-label for each button', async () => {
    const choicesDisplayed = '10,25,50,100';
    const {buttons} = await renderProductsPerPage({
      props: {choicesDisplayed},
    });

    expect(buttons[0]).toHaveAttribute('aria-label', '10');
    expect(buttons[1]).toHaveAttribute('aria-label', '25');
    expect(buttons[2]).toHaveAttribute('aria-label', '50');
    expect(buttons[3]).toHaveAttribute('aria-label', '100');
  });

  it('should render the buttons with the type "radio"', async () => {
    const {buttons} = await renderProductsPerPage();

    buttons.forEach((button) => {
      expect(button).toHaveAttribute('type', 'radio');
    });
  });

  it('should call setPageSize with the correct value when a button is checked', async () => {
    const {element, buttons} = await renderProductsPerPage();
    const paginationSpy = vi.spyOn(element.pagination, 'setPageSize');

    await userEvent.click(buttons[1]);
    expect(paginationSpy).toHaveBeenCalledWith(25);
  });

  it('should dispatch an atomic/scrollToTop event when a button is checked that is smaller than the currently checked button', async () => {
    const {element, buttons} = await renderProductsPerPage({
      props: {choicesDisplayed: '10,25,50,100'},
      paginationState: {pageSize: 50},
    });

    const scrollToTopSpy = vi.spyOn(element, 'dispatchEvent');

    await userEvent.click(buttons[0]);
    expect(scrollToTopSpy).toHaveBeenCalled();
  });

  it('should call focusOnFirstResultAfterNextSearch when a button is checked that is smaller than the currently checked button', async () => {
    const {buttons} = await renderProductsPerPage({
      props: {choicesDisplayed: '10,25,50,100'},
      paginationState: {pageSize: 50},
    });

    await userEvent.click(buttons[0]);
    expect(mockedFocusOnFirstResultAfterNextSearch).toHaveBeenCalled();
  });

  it('should call focusOnNextNewResult when a button is checked that is larger than the currently checked button', async () => {
    const {buttons} = await renderProductsPerPage({
      props: {choicesDisplayed: '10,25,50,100'},
      paginationState: {pageSize: 10},
    });

    await userEvent.click(buttons[3]);
    expect(mockedFocusOnNextNewResult).toHaveBeenCalled();
  });
});
