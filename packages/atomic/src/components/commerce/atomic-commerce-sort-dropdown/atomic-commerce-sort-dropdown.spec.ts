import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {FixtureAtomicCommerceInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic-commerce-interface-fixture';
import '@/vitest-utils/testing-helpers/fixtures/atomic-commerce-interface-fixture';
import {
  buildProductListing,
  buildSearch,
  ProductListing,
  Search,
} from '@coveo/headless/commerce';
import {page} from '@vitest/browser/context';
import '@vitest/browser/matchers.d.ts';
import {html} from 'lit';
import {expect, vi} from 'vitest';
import {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface';
import {AtomicCommerceSortDropdown} from './atomic-commerce-sort-dropdown';
import './atomic-commerce-sort-dropdown';

vi.mock('@coveo/headless/commerce', {spy: true});

describe('AtomicCommerceSortDropdown', () => {
  const stubbedSubscribe = (subscribedFunction: () => void) => {
    subscribedFunction();
  };
  const defaultSearchOrListingState = {
    responseId: 'some-id',
    products: [{}],
    isLoading: false,
    error: null,
  };
  const defaultSortState = {
    availableSorts: [
      {by: 'fields', fields: [{name: 'foo'}]},
      {by: 'fields', fields: [{name: 'bar'}]},
    ],
  };
  const mockedSort = vi.fn();
  beforeEach(() => {
    mockedSort.mockImplementation(() => ({
      state: defaultSortState,
      subscribe: stubbedSubscribe,
      sortBy: vi.fn(),
      isSortedBy: vi.fn(),
    }));
    vi.mocked(buildProductListing).mockImplementation(
      () =>
        ({
          state: defaultSearchOrListingState,
          subscribe: stubbedSubscribe,
          sort: mockedSort,
        }) as unknown as ProductListing
    );
    vi.mocked(buildSearch).mockImplementation(
      () =>
        ({
          state: defaultSearchOrListingState,
          subscribe: stubbedSubscribe,
          sort: mockedSort,
        }) as unknown as Search
    );
  });

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

  const setupElement = async (
    {
      interfaceType,
    }: {interfaceType: CommerceBindings['interfaceElement']['type']} = {
      interfaceType: 'product-listing',
    }
  ) => {
    const fixtureInterface = await fixture<FixtureAtomicCommerceInterface>(
      html`<atomic-commerce-interface></atomic-commerce-interface>`
    );

    fixtureInterface.setBindings({
      interfaceElement: {
        type: interfaceType,
      } as HTMLAtomicCommerceInterfaceElement,
      store: {
        state: {
          iconAssetsPath: './assets',
        },
      } as unknown as CommerceBindings['store'],
    });
    fixtureInterface.setRenderTemplate(
      html`<atomic-commerce-sort-dropdown></atomic-commerce-sort-dropdown>`
    );

    await fixtureInterface.updateComplete;
    const element = fixtureInterface.shadowRoot!.querySelector(
      'atomic-commerce-sort-dropdown'
    )!;

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

  it('should call sort.sortBy when select is changed', async () => {
    const mockedSortBy = vi.fn();
    mockedSort.mockImplementation(() => ({
      state: defaultSortState,
      sortBy: mockedSortBy,
      isSortedBy: vi.fn(),
      subscribe: stubbedSubscribe,
    }));

    const element = await setupElement();

    await element.updateComplete;
    await vi.waitUntil(() => locators.select);

    await locators.select.selectOptions('bar');
    expect(mockedSortBy).toHaveBeenCalledWith({
      by: 'fields',
      fields: [
        {
          name: 'bar',
        },
      ],
    });
  });
  it('renders nothing when there is an error', async () => {
    const element = await setupElement();
    element.error = new Error('Test error');
    await element.updateComplete;

    await expect.element(locators.label).not.toBeInTheDocument();
    await expect.element(locators.select).not.toBeInTheDocument();
  });

  it('renders nothing when there are no products', async () => {
    vi.mocked(buildProductListing).mockImplementationOnce(
      () =>
        ({
          state: {
            ...defaultSearchOrListingState,
            products: [],
          },
          sort: mockedSort,
        }) as unknown as ProductListing
    );

    await setupElement();

    await expect.element(locators.label).not.toBeInTheDocument();
    await expect.element(locators.select).not.toBeInTheDocument();
  });

  it('renders nothing when there are no available sorts', async () => {
    mockedSort.mockImplementationOnce(() => ({
      state: {
        ...defaultSortState,
      },
    }));
    await setupElement();

    await expect.element(locators.label).not.toBeInTheDocument();
    await expect.element(locators.select).not.toBeInTheDocument();
  });

  it('renders placeholder when responseId is empty', async () => {
    vi.mocked(buildProductListing).mockImplementation(
      () =>
        ({
          state: {...defaultSearchOrListingState, responseId: ''},
          subscribe: stubbedSubscribe,
          sort: mockedSort,
        }) as unknown as ProductListing
    );
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
    const element = await setupElement({
      interfaceType: 'search',
    });
    await element.updateComplete;

    expect(buildSearch).toHaveBeenCalledWith(element.bindings.engine);
  });
});
