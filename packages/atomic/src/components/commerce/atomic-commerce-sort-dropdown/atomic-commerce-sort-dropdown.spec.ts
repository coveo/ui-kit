import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import type {
  ProductListingState,
  SortState,
  SearchState,
} from '@coveo/headless/commerce';
import {page} from '@vitest/browser/context';
import '@vitest/browser/matchers.d.ts';
import {html} from 'lit';
import {describe, test, vi, expect} from 'vitest';
import {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface';
import type {AtomicCommerceSortDropdown} from './atomic-commerce-sort-dropdown';
import './atomic-commerce-sort-dropdown';

vi.mock('../../../utils/initialization-lit-stencil-common-utils', () => ({
  fetchBindings: vi.fn().mockImplementation(async () => {
    const i18nTest = await createTestI18n();
    return new Promise((resolve) => {
      resolve({
        i18n: i18nTest,

        store: {
          state: {
            iconAssetsPath: './assets',
          },
        },

        interfaceElement: {
          type: 'product-listing',
        } as HTMLAtomicCommerceInterfaceElement,
      } as CommerceBindings);
    });
  }),
}));

vi.mock('@coveo/headless/commerce', () => {
  return {
    buildProductListing: vi.fn(() => {
      return {
        sort: vi.fn(() => ({
          isSortedBy: vi.fn(),
        })),
      };
    }),
    buildSearch: vi.fn(),
  };
});

describe('AtomicCommerceSortDropdown', () => {
  const locators = {
    get label() {
      return page.getByText('Sort by:');
    },
    get select() {
      return page.getByRole('combobox');
    },
    placeholder(element: HTMLElement) {
      return element.shadowRoot!.querySelector('[part="placeholder"]')!;
    },
  };

  const setupElement = async ({
    mockSearchOrListingState,
    mockSortState,
  }: {
    mockSearchOrListingState?:
      | Partial<SearchState>
      | Partial<ProductListingState>;
    mockSortState?: Partial<SortState>;
  } = {}) => {
    const element = await fixture<AtomicCommerceSortDropdown>(
      html`<atomic-commerce-sort-dropdown></atomic-commerce-sort-dropdown>`
    );

    element.searchOrListingState = {
      responseId: 'some-id',
      products: [{}],
      isLoading: false,
      error: null,
      ...mockSearchOrListingState,
    } as ProductListingState;

    element.sortState = {
      availableSorts: [
        {by: 'fields', fields: [{name: 'foo'}]},
        {by: 'fields', fields: [{name: 'bar'}]},
      ],
      ...mockSortState,
    } as SortState;

    return element;
  };

  test('renders label and dropdown correctly', async () => {
    const element = await setupElement();
    await element.updateComplete;

    await expect.element(locators.label).toBeInTheDocument();
    await expect.element(locators.select).toBeInTheDocument();
  });

  test('renders nothing when there is an error', async () => {
    const element = await setupElement();
    element.error = new Error('Test error');
    await element.updateComplete;

    await expect.element(locators.label).not.toBeInTheDocument();
    await expect.element(locators.select).not.toBeInTheDocument();
  });

  test('renders nothing when there are no products', async () => {
    await setupElement({
      mockSearchOrListingState: {products: []},
    });
    await expect.element(locators.label).not.toBeInTheDocument();
    await expect.element(locators.select).not.toBeInTheDocument();
  });

  test('renders nothing when there are no available sorts', async () => {
    await setupElement({
      mockSortState: {availableSorts: []},
    });
    await expect.element(locators.label).not.toBeInTheDocument();
    await expect.element(locators.select).not.toBeInTheDocument();
  });

  test('renders placeholder when responseId is undefined', async () => {
    const element = await setupElement({
      mockSearchOrListingState: {responseId: ''},
    });

    const placeholder = () => locators.placeholder(element);
    await vi.waitUntil(placeholder);

    await expect.element(placeholder()).toBeInTheDocument();
    await expect.element(locators.select).not.toBeInTheDocument();
  });
});
