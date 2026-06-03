import {renderInAtomicCommerceInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-commerce-interface-fixture';
import '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-commerce-interface-fixture';
import {buildProductListing, buildSearch} from '@coveo/headless/commerce';
import {html} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {page} from 'vitest/browser';
import type {CommerceBindings} from '@/src/components/commerce/atomic-commerce-interface/atomic-commerce-interface';
import {buildFakeProductListing} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/product-listing-controller';
import {buildFakeSearch} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/search-controller';
import {buildFakeSort} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/sort-subcontroller';
import {AtomicCommerceSortDropdown} from './atomic-commerce-sort-dropdown';
import './atomic-commerce-sort-dropdown';

vi.mock('@coveo/headless/commerce', {spy: true});

describe('atomic-commerce-sort-dropdown', () => {
  const mockedSort = vi.fn();

  beforeEach(() => {
    mockedSort.mockReturnValue(buildFakeSort());
    vi.mocked(buildProductListing).mockReturnValue(
      buildFakeProductListing({
        implementation: {
          sort: mockedSort,
        },
      })
    );
    vi.mocked(buildSearch).mockReturnValue(
      buildFakeSearch({
        implementation: {
          sort: mockedSort,
        },
      })
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
    }: {
      interfaceType: CommerceBindings['interfaceElement']['type'];
    } = {
      interfaceType: 'product-listing',
    }
  ) => {
    const {element} =
      await renderInAtomicCommerceInterface<AtomicCommerceSortDropdown>({
        template: html`<atomic-commerce-sort-dropdown></atomic-commerce-sort-dropdown>`,
        selector: 'atomic-commerce-sort-dropdown',
        bindings: (bindings) => {
          bindings.interfaceElement.type = interfaceType;
          return bindings;
        },
      });

    return element;
  };

  it('is defined', async () => {
    const el = await setupElement();
    expect(el).toBeInstanceOf(AtomicCommerceSortDropdown);
  });

  it('renders label correctly', async () => {
    await setupElement();

    await expect.element(locators.label).toBeInTheDocument();
  });

  it('renders dropdown select correctly', async () => {
    await setupElement();

    await expect.element(locators.select).toBeInTheDocument();
  });

  // KIT-4158: TODO: This test intermittently fails and takes too long
  it.skip('should call sort.sortBy when select is changed', async () => {
    const mockedSortBy = vi.fn();
    mockedSort.mockReturnValue(
      buildFakeSort({implementation: {sortBy: mockedSortBy}})
    );
    await setupElement();

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
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const element = await setupElement();

    element.error = new Error('Test error');

    await expect.element(locators.label).not.toBeInTheDocument();
    await expect.element(locators.select).not.toBeInTheDocument();
  });

  it('renders nothing when there are no products', async () => {
    vi.mocked(buildProductListing).mockReturnValue(
      buildFakeProductListing({
        implementation: {
          sort: mockedSort,
        },
        state: {products: []},
      })
    );

    await setupElement();

    await expect.element(locators.label).not.toBeInTheDocument();
    await expect.element(locators.select).not.toBeInTheDocument();
  });

  it('renders nothing when there are no available sorts', async () => {
    mockedSort.mockReturnValue(
      buildFakeSort({
        state: {
          availableSorts: [],
        },
      })
    );

    await setupElement();

    await expect.element(locators.label).not.toBeInTheDocument();
    await expect.element(locators.select).not.toBeInTheDocument();
  });

  it('renders placeholder when responseId is empty', async () => {
    vi.mocked(buildProductListing).mockReturnValue(
      buildFakeProductListing({
        implementation: {
          sort: mockedSort,
        },
        state: {
          responseId: '',
        },
      })
    );

    const element = await setupElement();

    await expect.element(locators.placeholder(element)).toBeInTheDocument();
    await expect.element(locators.select).not.toBeInTheDocument();
  });

  it('should call buildProductListing when interfaceElement is product-listing', async () => {
    const element = await setupElement();

    expect(buildProductListing).toHaveBeenCalledWith(element.bindings.engine);
  });

  it('should call buildSearch when interfaceElement is search', async () => {
    const element = await setupElement({
      interfaceType: 'search',
    });

    expect(buildSearch).toHaveBeenCalledWith(element.bindings.engine);
  });
});
