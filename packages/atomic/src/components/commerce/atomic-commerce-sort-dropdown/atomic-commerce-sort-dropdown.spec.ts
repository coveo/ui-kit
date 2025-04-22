import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {buildProductListing, buildSearch} from '@coveo/headless/commerce';
import {page} from '@vitest/browser/context';
import '@vitest/browser/matchers.d.ts';
import {html} from 'lit';
import {expect, vi} from 'vitest';
import {AtomicCommerceSortDropdown} from './atomic-commerce-sort-dropdown';
import './atomic-commerce-sort-dropdown';

const mocks = vi.hoisted(() => {
  return {
    // controller states
    searchOrListingState: {
      responseId: 'some-id',
      products: [{}],
      isLoading: false,
      error: null,
    },
    sortState: {
      availableSorts: [
        {by: 'fields', fields: [{name: 'foo'}]},
        {by: 'fields', fields: [{name: 'bar'}]},
      ],
    },
    // controllers
    sort: {
      isSortedBy: vi.fn(),
      sortBy: vi.fn(),
    },
    listing: vi.fn(() => ({
      sort: vi.fn(),
    })),
    search: vi.fn(() => ({
      sort: vi.fn(),
    })),
    bindingsType: 'product-listing',
  };
});

vi.mock('@coveo/headless/commerce', () => {
  return {
    buildProductListing: mocks.listing,
    buildSearch: mocks.search,
  };
});

vi.mock('@/src/mixins/bindings-mixin', () => ({
  InitializeBindingsMixin: vi.fn().mockImplementation((superClass) => {
    return class extends superClass {
      constructor(...args: unknown[]) {
        super(...args);

        const baseBindings = {
          store: {
            state: {
              iconAssetsPath: './assets',
            },
          },
          interfaceElement: {
            type: mocks.bindingsType,
          } as HTMLAtomicCommerceInterfaceElement,
        };

        this.searchOrListing = mocks.listing;
        this.sort = mocks.sort;

        createTestI18n().then((i18n) => {
          this.bindings = {...baseBindings, i18n};
        });
      }
    };
  }),
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

describe('AtomicCommerceSortDropdown', () => {
  const locators = {
    get label() {
      return page.getByText('Sort by');
    },
    get select() {
      return page.getByRole('combobox');
    },
    placeholder(element: HTMLElement) {
      return element.shadowRoot!.querySelector('[part="placeholder"]')!;
    },
  };

  const setupElement = async () => {
    const element = await fixture<AtomicCommerceSortDropdown>(
      html`<atomic-commerce-sort-dropdown></atomic-commerce-sort-dropdown>`
    );

    element.initialize();

    return element;
  };

  it('is defined', () => {
    const el = document.createElement('atomic-commerce-sort-dropdown');
    expect(el).toBeInstanceOf(AtomicCommerceSortDropdown);
  });

  it('renders label correctly', async () => {
    const element = await setupElement();
    await element.updateComplete;

    await expect.element(locators.label).toBeInTheDocument();
  });

  it('renders dropdown select correctly', async () => {
    const element = await setupElement();
    await element.updateComplete;

    await expect.element(locators.select).toBeInTheDocument();
  });

  it('renders nothing when there is an error', async () => {
    const element = await setupElement();
    element.error = new Error('Test error');
    await element.updateComplete;

    await expect.element(locators.label).not.toBeInTheDocument();
    await expect.element(locators.select).not.toBeInTheDocument();
  });

  it('renders nothing when there are no products', async () => {
    mocks.searchOrListingState.products = [];
    await setupElement();

    await expect.element(locators.label).not.toBeInTheDocument();
    await expect.element(locators.select).not.toBeInTheDocument();
  });

  it('renders nothing when there are no available sorts', async () => {
    mocks.sortState.availableSorts = [];
    await setupElement();

    await expect.element(locators.label).not.toBeInTheDocument();
    await expect.element(locators.select).not.toBeInTheDocument();
  });

  it('renders placeholder when responseId is undefined', async () => {
    mocks.searchOrListingState.responseId = '';
    const element = await setupElement();

    const placeholder = () => locators.placeholder(element);
    await vi.waitUntil(placeholder);

    await expect.element(placeholder()).toBeInTheDocument();
    await expect.element(locators.select).not.toBeInTheDocument();
  });

  it('should call buildProductListing when interfaceElement is product-listing', async () => {
    const element = await setupElement();
    await element.updateComplete;

    expect(buildProductListing).toHaveBeenCalledWith(element.bindings.engine);
  });

  it('should call buildSearch when interfaceElement is search', async () => {
    mocks.bindingsType = 'search';
    const element = await setupElement();
    element.initialize();

    expect(buildSearch).toHaveBeenCalledWith(element.bindings.engine);
  });
});
