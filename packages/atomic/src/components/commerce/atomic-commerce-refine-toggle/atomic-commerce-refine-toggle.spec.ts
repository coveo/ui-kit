import {
  buildProductListing,
  buildSearch,
  type ProductListingSummaryState,
  type SearchSummaryState,
  type Summary,
} from '@coveo/headless/commerce';
import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {userEvent} from 'vitest/browser';
import {renderInAtomicCommerceInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-commerce-interface-fixture';
import {buildFakeCommerceEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/engine';
import {buildFakeProductListing} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/product-listing-controller';
import {buildFakeSearch} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/search-controller';
import {buildFakeSummary} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/summary-subcontroller';
import type {AtomicCommerceRefineToggle} from './atomic-commerce-refine-toggle';
import './atomic-commerce-refine-toggle';

vi.mock('@coveo/headless/commerce', {spy: true});

describe('atomic-commerce-refine-toggle', () => {
  const mockedEngine = buildFakeCommerceEngine();
  let mockedSummary: Summary;

  interface renderRefineToggleOptions {
    interfaceType?: 'product-listing' | 'search';
    summaryState?:
      | Partial<SearchSummaryState>
      | Partial<ProductListingSummaryState>;
  }
  const renderRefineToggle = async ({
    interfaceType = 'product-listing',
    summaryState,
  }: renderRefineToggleOptions = {}) => {
    mockedSummary = buildFakeSummary({state: summaryState});

    vi.mocked(buildProductListing).mockReturnValue(
      buildFakeProductListing({
        implementation: {
          summary: () => mockedSummary,
        },
      })
    );
    vi.mocked(buildSearch).mockReturnValue(
      buildFakeSearch({
        implementation: {
          summary: () => mockedSummary as Summary<SearchSummaryState>,
        },
      })
    );
    const {element} =
      await renderInAtomicCommerceInterface<AtomicCommerceRefineToggle>({
        template: html`<atomic-commerce-refine-toggle></atomic-commerce-refine-toggle>`,
        selector: 'atomic-commerce-refine-toggle',
        bindings: (bindings) => {
          bindings.interfaceElement.type = interfaceType;
          bindings.engine = mockedEngine;
          return bindings;
        },
      });

    return {
      element,
      get placeholder() {
        return element.shadowRoot?.querySelector('[part="placeholder"]');
      },
      get button() {
        return element.shadowRoot?.querySelector('button');
      },
      get modal() {
        return (element.getRootNode() as Document | ShadowRoot)?.querySelector(
          'atomic-commerce-refine-modal'
        );
      },
    };
  };

  it('should call buildSearch if interfaceType is "search"', async () => {
    await renderRefineToggle({
      interfaceType: 'search',
    });

    expect(buildSearch).toHaveBeenCalledWith(mockedEngine);
  });

  it('should call buildProductListing if interfaceType is "product-listing"', async () => {
    await renderRefineToggle({
      interfaceType: 'product-listing',
    });

    expect(buildProductListing).toHaveBeenCalledWith(mockedEngine);
  });

  it('should set this.summary to the summary of the search or product listing', async () => {
    const {element} = await renderRefineToggle({
      interfaceType: 'product-listing',
    });

    expect(element.summary).toBe(mockedSummary);
  });

  it('should render nothing if there is an error', async () => {
    const {element} = await renderRefineToggle({
      summaryState: {
        hasError: true,
      },
    });

    expect(element).toBeEmptyDOMElement();
  });

  it('should render a placeholder if the first request has not been executed', async () => {
    const {placeholder} = await renderRefineToggle({
      summaryState: {
        firstRequestExecuted: false,
      },
    });

    expect(placeholder).toBeInTheDocument();
    expect(placeholder).toHaveAttribute('part', 'placeholder');
  });

  it('should render nothing if there are no items', async () => {
    const {element} = await renderRefineToggle({
      summaryState: {
        hasProducts: false,
      },
    });

    expect(element).toBeEmptyDOMElement();
  });

  it('should render the button with the correct text', async () => {
    const {button} = await renderRefineToggle();

    expect(button).toHaveTextContent('Sort & Filter');
  });

  it('should render the button with the correct part', async () => {
    const {button} = await renderRefineToggle();

    expect(button).toHaveAttribute('part', 'button');
  });

  it('should create the modal when rendered', async () => {
    const {modal} = await renderRefineToggle();

    expect(modal).toBeInTheDocument();
  });

  it('should set the openButton of the modal to the button', async () => {
    const {button, modal} = await renderRefineToggle();

    expect(modal?.openButton).toBe(button);
  });

  it('should open the modal when the button is clicked', async () => {
    const {button, modal} = await renderRefineToggle();

    await userEvent.click(button!);

    expect(modal?.isOpen).toBe(true);
  });
});
