import {
  type BreadcrumbManager,
  type BreadcrumbManagerState,
  buildProductListing,
  buildSearch,
  type Product,
} from '@coveo/headless/commerce';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {describe, expect, it, vi} from 'vitest';
import {renderInAtomicProduct} from '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-product-fixture';
import {buildFakeBreadcrumbManager} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/breadcrumb-manager-subcontroller';
import {buildFakeCommerceEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/engine';
import {buildFakeProduct} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/product';
import {buildFakeProductListing} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/product-listing-controller';
import {buildFakeSearch} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/search-controller';
import {AtomicProductMultiValueText} from './atomic-product-multi-value-text';
import './atomic-product-multi-value-text';

vi.mock('@coveo/headless/commerce', {spy: true});

describe('atomic-product-multi-value-text', () => {
  const mockedEngine = buildFakeCommerceEngine();
  let mockedBreadcrumbManager: BreadcrumbManager;
  interface renderProductMultiValueTextProps {
    interfaceElementType?: 'product-listing' | 'search';
    productState?: Partial<Product>;
    field?: string;
    delimiter?: string;
    maxValuesToDisplay?: number;
    breadcrumbState?: Partial<BreadcrumbManagerState>;
  }

  const parts = (element: AtomicProductMultiValueText) => {
    const qs = (part: string) =>
      element.shadowRoot?.querySelector(`[part="${part}"]`);
    return {
      title: qs('product-multi-value-text-list'),
      closeButton: qs('product-multi-value-text-separator'),
      closeIcon: qs('product-multi-value-text-value'),
      footerContent: qs('product-multi-value-text-value-more'),
    };
  };

  const renderProductMultiValueText = async ({
    interfaceElementType = 'product-listing',
    field = 'cat_available_sizes',
    productState = {},
    delimiter,
    maxValuesToDisplay,
    breadcrumbState = {},
  }: renderProductMultiValueTextProps = {}) => {
    mockedBreadcrumbManager = buildFakeBreadcrumbManager({
      state: breadcrumbState,
    });

    vi.mocked(buildProductListing).mockReturnValue(
      buildFakeProductListing({
        implementation: {
          breadcrumbManager: () => mockedBreadcrumbManager,
        },
      })
    );
    vi.mocked(buildSearch).mockReturnValue(
      buildFakeSearch({
        implementation: {
          breadcrumbManager: () => mockedBreadcrumbManager,
        },
      })
    );
    const {element} = await renderInAtomicProduct<AtomicProductMultiValueText>({
      template: html`
        <atomic-product-multi-value-text
        field="${field}"
        delimiter="${ifDefined(delimiter)}"
        max-values-to-display="${ifDefined(maxValuesToDisplay)}"
        ></atomic-product-multi-value-text>
      `,
      selector: 'atomic-product-multi-value-text',
      product: buildFakeProduct(productState),
      bindings: (bindings) => {
        bindings.interfaceElement.type = interfaceElementType;
        bindings.engine = mockedEngine;
        return bindings;
      },
    });

    return {
      element,
      get individualValue() {
        return element.shadowRoot?.querySelector(
          '[part="product-multi-value-text-value"]'
        );
      },
      get list() {
        return element.shadowRoot?.querySelector(
          '[part="product-multi-value-text-list"]'
        );
      },
      get allValues() {
        return Array.from(
          element.shadowRoot?.querySelectorAll(
            '[part="product-multi-value-text-value"]'
          ) || []
        );
      },
      get allSeperators() {
        return Array.from(
          element.shadowRoot?.querySelectorAll(
            '[part="product-multi-value-text-separator"]'
          ) || []
        );
      },
      get more() {
        return element.shadowRoot?.querySelector(
          '[part="product-multi-value-text-value-more"]'
        );
      },
    };
  };

  it('should render the component', async () => {
    const {element} = await renderProductMultiValueText();
    expect(element).toBeInstanceOf(AtomicProductMultiValueText);
  });

  it('should call buildProductListing when the interfaceElement type is product-listing', async () => {
    await renderProductMultiValueText();
    expect(buildProductListing).toHaveBeenCalledWith(mockedEngine);
  });

  it('should call buildSearch when the interfaceElement type is search', async () => {
    await renderProductMultiValueText({interfaceElementType: 'search'});
    expect(buildSearch).toHaveBeenCalledWith(mockedEngine);
  });

  it('should call breadcrumbManager on this.breadcrumbManager', async () => {
    const {element} = await renderProductMultiValueText();
    expect(element.breadcrumbManager).toBe(mockedBreadcrumbManager);
  });

  it('should render nothing when the field is not in the product', async () => {
    const {element} = await renderProductMultiValueText({
      field: 'non_existent_field',
    });
    expect(element).toBeEmptyDOMElement();
  });

  it('should render nothing when the field is neither an array nor a string', async () => {
    const {element} = await renderProductMultiValueText({
      productState: {
        additionalFields: {
          cat_available_sizes: 123,
        },
      },
    });
    expect(element).toBeEmptyDOMElement();
  });

  it('should render the value of the field when it is a string, not an array and a delimiter is not given', async () => {
    const {individualValue} = await renderProductMultiValueText({
      productState: {
        additionalFields: {
          cat_available_sizes: 'XS S M L XL',
        },
      },
    });
    expect(individualValue).toHaveTextContent('XS S M L XL');
  });

  it('should render the value of the field as an array when it is a string with delimiters, not an array and a delimiter is given', async () => {
    const {allSeperators, allValues} = await renderProductMultiValueText({
      productState: {
        additionalFields: {
          cat_available_sizes: 'XS, S, M, L, XL',
        },
      },
      delimiter: ', ',
    });
    expect(allSeperators).toHaveLength(3);
    // Only three values because of the default value of maxValuesToDisplay.
    expect(allValues).toHaveLength(3);
    for (const value of allValues) {
      expect(value).toHaveTextContent(/XS|S|M|L|XL/);
    }
  });

  it('should display a label when maxValuesToDisplay higher than 0 and there are more values than maxValuesToDisplay', async () => {
    const {more} = await renderProductMultiValueText({
      productState: {
        additionalFields: {
          cat_available_sizes: 'XS, S, M, L, XL',
        },
      },
      delimiter: ', ',
      maxValuesToDisplay: 4,
    });
    expect(more).toHaveTextContent('1 more...');
  });

  it('should have a default value of maxValuesToDisplay of 3', async () => {
    const {more} = await renderProductMultiValueText({
      productState: {
        additionalFields: {
          cat_available_sizes: 'XS, S, M, L, XL',
        },
      },
      delimiter: ', ',
    });
    expect(more).toHaveTextContent('2 more...');
  });

  it('should render the values in the order they are selected in the breadcrumb', async () => {
    const {allValues} = await renderProductMultiValueText({
      breadcrumbState: {
        facetBreadcrumbs: [
          {
            facetId: 'cat_available_sizes',
            facetDisplayName: 'Available Sizes',
            field: 'cat_available_sizes',
            type: 'regular',
            values: [
              {
                value: {
                  value: 'M',
                  numberOfResults: 1,
                  state: 'selected',
                },
                deselect: vi.fn(),
              },
            ],
          },
        ],
      },
    });
    expect(allValues[0]).toHaveTextContent('M');
    expect(allValues[1]).toHaveTextContent('XS');
    expect(allValues[2]).toHaveTextContent('S');
  });

  it('should render every part', async () => {
    const {element} = await renderProductMultiValueText();
    Object.entries(parts(element)).forEach(([_key, el]) => {
      expect(el).toBeInTheDocument();
    });
  });
});
