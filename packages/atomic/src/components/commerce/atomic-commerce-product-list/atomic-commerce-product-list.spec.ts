import {createTestI18n} from '@/vitest-utils/i18n-utils';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import '@vitest/browser/matchers.d.ts';
import {html} from 'lit';
import {describe, test, vi} from 'vitest';
import './atomic-commerce-product-list';
import {AtomicCommerceProductList} from './atomic-commerce-product-list';

const mocks = vi.hoisted(() => {
  return {
    summaryState: {
      hasError: false,
      firstRequestExecuted: true,
      hasProducts: true,
    },
    searchOrListingState: {
      products: Array.from({length: 48}, (_, i) => i + 1),
    },
    summary: vi.fn(() => ({
      subscribe: vi.fn(),
    })),
    searchOrListing: vi.fn(() => ({
      promoteChildToParent: vi.fn(),
      interactiveProduct: vi.fn(),
      summary: vi.fn(() => ({
        subscribe: vi.fn(),
      })),
    })),
  };
});

vi.mock('@/src/components/common/interface/store', () => ({
  createAppLoadedListener: vi.fn(),
}));

vi.mock('@/src/decorators/error-guard', () => ({
  errorGuard: vi.fn(),
}));

vi.mock('@/src/decorators/binding-guard', () => ({
  bindingGuard: vi.fn(),
}));

vi.mock('@/src/decorators/bind-state', async () => {
  return {
    bindStateToController: vi.fn(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (proto: any, stateProperty: string) => {
        Object.defineProperty(proto, stateProperty, {
          get() {
            return mocks[stateProperty as keyof typeof mocks];
          },
        });
      };
    }),
  };
});

const i18n = await createTestI18n();
vi.mock('@/src/mixins/bindings-mixin', () => ({
  InitializeBindingsMixin: vi.fn().mockImplementation((superClass) => {
    return class extends superClass {
      constructor(...args: unknown[]) {
        super(...args);
        this.bindings = {
          store: {
            setLoadingFlag: vi.fn(),
            state: {
              resultList: {
                focusOnFirstResultAfterNextSearch: () => {},
              },
            },
            onChange: vi.fn(),
          },
          engine: {
            subscribe: vi.fn(),
          },
          interfaceElement: {
            type: 'product-listing',
          },
          i18n,
        };

        this.searchOrListing = mocks.searchOrListing;
        this.summary = mocks.summary;
      }
    };
  }),
  BindingController: class {},
}));

vi.mock(import('@coveo/headless/commerce'), async (importOriginal) => {
  const mod = await importOriginal();
  return {
    ...mod,
    buildProductListing: mocks.searchOrListing,
    buildSearch: mocks.searchOrListing,
  };
});

describe('AtomicCommerceProductList', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let element: AtomicCommerceProductList;

  const setupElement = async () => {
    const element = await fixture<AtomicCommerceProductList>(
      html`<atomic-commerce-product-list></atomic-commerce-product-list>`
    );

    //@ts-expect-error - manually setting up this private property since a mocked implementation of createAppLoadedListener created problems. Couldn't manage keeping it to true when I needed it.
    element.isAppLoaded = true;

    element.initialize();
    return element;
  };

  test('whenever this happens, you render it', async () => {
    await setupElement();
  });
});
