import {
  CommerceStore,
  ItemDisplayDensity,
  ItemDisplayImageSize,
  ItemDisplayLayout,
} from '@/src/components';
import {TailwindLitElement} from '@/src/utils/tailwind.element';
import {createTestI18n} from '@/vitest-utils/i18n-utils';
import * as headless from '@coveo/headless/commerce';
import {
  ProductListing,
  ProductListingState,
  Search,
  SearchState,
  SearchSummaryState,
  Summary,
} from '@coveo/headless/commerce';
import {CommerceEngine} from '@coveo/headless/ssr-commerce';
import '@vitest/browser/matchers.d.ts';
import {PropertyValues} from 'lit';
import {describe, test, expect, vi} from 'vitest';
import {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface';
import './atomic-commerce-product-list';
import {AtomicCommerceProductList} from './atomic-commerce-product-list';

const mockCoreSummary: Summary = {
  state: {
    firstProduct: expect.any(Number),
    firstRequestExecuted: expect.any(Boolean),
    hasError: expect.any(Boolean),
    isLoading: expect.any(Boolean),
    lastProduct: expect.any(Number),
    totalNumberOfProducts: expect.any(Number),
    hasProducts: expect.any(Boolean),
  },
  subscribe: vi.fn((_listener: () => void) => {
    return vi.fn(() => {});
  }),
};

const mockCoreController = {
  state: {
    error: null,
    isLoading: expect.any(Boolean),
    products: expect.any(Array<string>),
    responseId: expect.any(String),
  },
  breadcrumbManager: vi.fn(),
  facetGenerator: vi.fn(),
  interactiveProduct: vi.fn(),
  pagination: vi.fn(),
  parameterManager: vi.fn(),
  promoteChildToParent: vi.fn(),
  sort: vi.fn(),
  subscribe: vi.fn(),
  urlManager: vi.fn(),
};

const mockProductListingController: ProductListing = {
  ...mockCoreController,
  executeFirstRequest: vi.fn(),
  refresh: vi.fn(),
  summary: vi.fn(() => mockCoreSummary),
};
const mockSearchController: Search = {
  ...mockCoreController,
  didYouMean: vi.fn(),
  executeFirstSearch: vi.fn(),
  summary: vi.fn(() => ({
    ...mockCoreSummary,
    state: {
      ...mockCoreSummary.state,
      query: expect.any(String),
    },
  })),
};

vi.mock('@coveo/headless/commerce', () => {
  return {
    buildProductListing: vi.fn(() => mockProductListingController),
    buildSearch: vi.fn(() => mockSearchController),
    buildProductTemplatesManager: vi.fn(() => ({
      selectTemplate: vi.fn(),
      selectLinkTemplate: vi.fn(),
      registerTemplates: vi.fn(),
    })),
  };
});

describe('AtomicCommerceProductList', () => {
  let element: AtomicCommerceProductList;

  describe('#initialize', () => {
    beforeEach(async () => {
      element = await renderProductList({});
    });

    afterEach(() => {
      cleanBody();
    });

    test('does not throw with default props', () => {
      expect(() => element.initialize()).not.toThrow();
    });

    test('does not throw with valid props', () => {
      element.setAttribute('density', 'normal');
      element.setAttribute('display', 'grid');
      element.setAttribute('image-size', 'small');
      element.setAttribute('number-of-placeholders', '24');
      expect(() => element.initialize()).not.toThrow();

      element.setAttribute('density', 'compact');
      element.setAttribute('display', 'list');
      element.setAttribute('image-size', 'large');
      element.setAttribute('number-of-placeholders', '12');
      expect(() => element.initialize()).not.toThrow();

      element.setAttribute('display', 'table');
      element.setAttribute('image-size', 'icon');
      element.setAttribute('number-of-placeholders', '0');
      expect(() => element.initialize()).not.toThrow();

      element.setAttribute('image-size', 'none');
      expect(() => element.initialize()).not.toThrow();
    });

    test('throws with invalid #density prop', () => {
      element.setAttribute('density', 'invalid');
      expect(() => element.initialize()).toThrowError();
    });

    test('throws with invalid #display prop', () => {
      element.setAttribute('display', 'invalid');
      expect(() => element.initialize()).toThrowError();
    });

    test('throws with invalid #image-size prop', () => {
      element.setAttribute('image-size', 'invalid');
      expect(() => element.initialize()).toThrowError();
    });

    test('throws with invalid #number-of-placeholders prop', () => {
      element.setAttribute('number-of-placeholders', '-1');
      expect(() => element.initialize()).toThrowError();
    });

    test('sets #host to #this', () => {
      element.initialize();
      expect(element.host).toEqual(element);
    });

    describe('when #bindings.interfaceElement.type is "product-listing"', () => {
      beforeEach(() => {
        element.bindings.interfaceElement.type = 'product-listing';
        element.initialize();
      });

      test('sets #searchOrListing to #buildProductListing(#bindings.engine)', () => {
        expect(element.searchOrListing).toEqual(mockProductListingController);
      });

      test('sets #summary to #buildProductListing(#bindings.engine).summary()', () => {
        expect(element.summary).toEqual(mockProductListingController.summary());
      });
    });

    describe('when #bindings.interfaceElement.type is "search"', () => {
      beforeEach(() => {
        element.bindings.interfaceElement.type = 'search';
        element.initialize();
      });

      test('sets #searchOrListing to #buildSearch(#bindings.engine)', () => {
        expect(element.searchOrListing).toEqual(mockSearchController);
      });

      test('sets #summary to #buildSearch(#bindings.engine).summary()', () => {
        expect(element.summary).toEqual(mockSearchController.summary());
      });
    });

    test('adds "atomic/selectChildProduct" event listener', () => {
      const addEventListenerMock = vi.spyOn(element, 'addEventListener');

      element.initialize();

      expect(addEventListenerMock).toHaveBeenCalledWith(
        'atomic/selectChildProduct',
        expect.any(Function)
      );
    });
  });

  describe('#updated', () => {
    beforeEach(async () => {
      element = await renderProductList({});
      element.initialize();
    });

    afterEach(() => {
      cleanBody();
    });

    test('calls #super.updated()', () => {
      const superUpdatedMock = vi.spyOn(
        TailwindLitElement.prototype,
        'updated' as never
      );

      element.updated({} as PropertyValues);

      expect(superUpdatedMock).toHaveBeenCalled();
    });
  });

  describe('#disconnectedCallback', () => {
    beforeEach(async () => {
      element = await renderProductList({});
      element.initialize();
    });

    afterEach(() => {
      cleanBody();
    });

    test('calls #super.disconnectedCallback()', () => {
      const superDisconnectedCallbackMock = vi.spyOn(
        TailwindLitElement.prototype,
        'disconnectedCallback'
      );

      element.disconnectedCallback();

      expect(superDisconnectedCallbackMock).toHaveBeenCalled();
    });

    test('calls #unsubscribeSummary', () => {
      const unsubscribeSummaryMock = vi.spyOn(
        element,
        'unsubscribeSummary' as never
      );

      element.disconnectedCallback();

      expect(unsubscribeSummaryMock).toHaveBeenCalledOnce();
      expect(unsubscribeSummaryMock).toHaveBeenCalled();
    });

    test('removes "atomic/selectChildProduct" event listener', () => {
      const removeEventListenerMock = vi.spyOn(
        element.host,
        'removeEventListener'
      );

      element.disconnectedCallback();

      expect(removeEventListenerMock).toHaveBeenCalledOnce();
      expect(removeEventListenerMock).toHaveBeenCalledWith(
        'atomic/selectChildProduct',
        expect.any(Function)
      );
    });
  });
});

type ProductListProps = {
  density?: ItemDisplayDensity;
  display?: ItemDisplayLayout;
  imageSize?: ItemDisplayImageSize;
  numberOfPlaceholders?: number;
};

type InterfaceElementType = 'product-listing' | 'search';

async function renderProductList({
  interfaceElementType = 'search',
  props = {},
  mockedState = {error: null, isLoading: false, products: [], responseId: ''},
  mockedSummaryState = {
    firstProduct: 0,
    firstRequestExecuted: false,
    hasError: false,
    isLoading: false,
    lastProduct: 0,
    hasProducts: false,
    totalNumberOfProducts: 0,
  },
}: {
  interfaceElementType?: InterfaceElementType;
  props?: ProductListProps;
  mockedState?: ProductListingState | SearchState;
  mockedSummaryState?: headless.ProductListingSummaryState | SearchSummaryState;
}) {
  const productList = document.createElement(
    'atomic-commerce-product-list'
  ) as AtomicCommerceProductList;

  if (props !== undefined) {
    for (const [key, value] of Object.entries(props)) {
      productList.setAttribute(
        key.replace(/([A-Z])/g, '-$1').toLowerCase(),
        value.toString()
      );
    }
  }

  document.body.appendChild(productList);

  productList.searchOrListingState = mockedState;
  productList.summaryState = mockedSummaryState;

  await addMockedBindings(productList, interfaceElementType);

  return productList;
}

async function addMockedBindings(
  element: AtomicCommerceProductList,
  type: InterfaceElementType
) {
  const i18nTest = await createTestI18n();
  element.bindings = {
    engine: {} as Partial<CommerceEngine>,
    store: {
      setLoadingFlag: vi.fn(),
      getUniqueIDFromEngine: vi.fn(),
      get: vi.fn(),
      isMobile: vi.fn(),
      onChange: vi.fn(),
      set: vi.fn(),
      unsetLoadingFlag: vi.fn(),
      state: {
        activeProductChild: undefined,
        iconAssetsPath: '',
        loadingFlags: [],
        mobileBreakpoint: '',
        resultList: {
          focusOnFirstResultAfterNextSearch: vi.fn(),
          focusOnNextNewResult: vi.fn(),
        },
      },
    } as CommerceStore,
    i18n: i18nTest,
    interfaceElement: {
      type,
    } as HTMLAtomicCommerceInterfaceElement,
  } as CommerceBindings;
}

function cleanBody() {
  document.body.innerHTML = '';
}
