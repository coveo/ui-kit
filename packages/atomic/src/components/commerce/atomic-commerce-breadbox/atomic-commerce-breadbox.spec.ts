import {
  type BreadcrumbManager,
  type BreadcrumbManagerState,
  buildContext,
  buildProductListing,
  buildSearch,
} from '@coveo/headless/commerce';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {page, userEvent} from 'vitest/browser';
import {renderInAtomicCommerceInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-commerce-interface-fixture';
import {buildFakeBreadcrumbManager} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/breadcrumb-manager-subcontroller';
import {buildFakeContext} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/context-controller';
import {buildFakeCommerceEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/engine';
import {buildFakeProductListing} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/product-listing-controller';
import {buildFakeSearch} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/search-controller';
import {mockConsole} from '@/vitest-utils/testing-helpers/testing-utils/mock-console';
import type {AtomicCommerceBreadbox} from './atomic-commerce-breadbox';
import './atomic-commerce-breadbox';

vi.mock('@coveo/headless/commerce', {spy: true});
vi.mock('@/src/utils/date-utils', () => {
  const parseDate = vi.fn((date) => {
    const d = new Date(date);
    // biome-ignore lint/suspicious/noExplicitAny: <>
    (d as any).format = vi.fn((_fmt: string) => {
      return d.toISOString().split('T')[0];
    });
    return d;
  });
  return {parseDate};
});

describe('atomic-commerce-breadbox', () => {
  const mockedEngine = buildFakeCommerceEngine();
  let mockedBreadcrumbManager: BreadcrumbManager;
  const mockedDeselectAll = vi.fn();

  beforeEach(() => {
    mockConsole();
  });

  interface RenderBreadboxOptions {
    interfaceElementType?: 'product-listing' | 'search';
    pathLimit?: number;
    state?: Partial<BreadcrumbManagerState>;
  }

  const renderBreadbox = async ({
    interfaceElementType = 'product-listing',
    pathLimit = 3,
    state = {},
  }: RenderBreadboxOptions = {}) => {
    mockedBreadcrumbManager = buildFakeBreadcrumbManager({
      state,
      implementation: {
        deselectAll: mockedDeselectAll,
      },
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
    vi.mocked(buildContext).mockReturnValue(buildFakeContext({}));

    const {element} =
      await renderInAtomicCommerceInterface<AtomicCommerceBreadbox>({
        template: html`<div>
          <atomic-commerce-breadbox
            path-limit=${ifDefined(pathLimit)}
          ></atomic-commerce-breadbox>
        </div>`,
        selector: 'atomic-commerce-breadbox',
        bindings: (bindings) => {
          bindings.interfaceElement.type = interfaceElementType;
          bindings.engine = mockedEngine;
          return bindings;
        },
      });

    return {
      element,
      label: () => page.getByText('Filters:'),
      noTitle: () => page.getByTitle('No label'),
      regular: () => page.getByTitle('Regular'),
      hierarchical: () => page.getByTitle('Hierarchical'),
      numericalRange: () => page.getByTitle('Numerical Range'),
      dateRange: () => page.getByTitle('Date Range'),
      showMore: () => page.getByLabelText(/Show \+ \d+ more filters/),
      showLess: () => page.getByText('Show less'),
      clearAll: () => page.getByLabelText('Clear All Filters'),
      parts: (element: AtomicCommerceBreadbox) => {
        const qs = (part: string) =>
          element.shadowRoot?.querySelector(`[part="${part}"]`);
        return {
          container: qs('container'),
          breadcrumbListContainer: qs('breadcrumb-list-container'),
          breadcrumbList: qs('breadcrumb-list'),
          breadcrumbButton: qs('breadcrumb-button'),
          breadcrumbLabel: qs('breadcrumb-label'),
          breadcrumbValue: qs('breadcrumb-value'),
          breadcrumbClear: qs('breadcrumb-clear'),
          showMore: qs('show-more'),
          showLess: qs('show-less'),
          clearAll: qs('clear'),
        };
      },
    };
  };

  it('should call buildProductListing when interfaceElement.type is "product-listing"', async () => {
    await renderBreadbox({interfaceElementType: 'product-listing'});
    expect(buildProductListing).toHaveBeenCalledWith(mockedEngine);
  });

  it('should call buildSearch when interfaceElement.type is "search"', async () => {
    await renderBreadbox({interfaceElementType: 'search'});
    expect(buildSearch).toHaveBeenCalledWith(mockedEngine);
  });

  it('should call buildContext', async () => {
    await renderBreadbox();
    expect(buildContext).toHaveBeenCalledWith(mockedEngine);
  });

  it('should call breadcrumbManager on this.breadcrumbManager', async () => {
    const {element} = await renderBreadbox();
    expect(element.breadcrumbManager).toBe(mockedBreadcrumbManager);
  });

  it('should set error when pathLimit is initially lower than 1', async () => {
    const {element} = await renderBreadbox({
      interfaceElementType: 'product-listing',
      pathLimit: 0,
    });

    expect(element.error).toBeDefined();
    expect(element.error.message).toMatch(
      /pathLimit: minimum value of 1 not respected/i
    );
  });

  it('should set error when valid pathLimit is updated to a value lower than 1', async () => {
    const {element} = await renderBreadbox();

    expect(element.error).toBeUndefined();

    element.pathLimit = 0;

    await element.updateComplete;

    expect(element.error).toBeDefined();
    expect(element.error.message).toMatch(
      /pathLimit: minimum value of 1 not respected/i
    );
  });

  it('should render nothing when there are no breadcrumbs', async () => {
    const {element} = await renderBreadbox({
      state: {facetBreadcrumbs: []},
    });
    expect(
      element.shadowRoot?.querySelector('atomic-commerce-breadbox')
    ).toBeNull();
  });

  it('should have the right text on the label', async () => {
    const {label} = await renderBreadbox();
    await expect.element(label()).toHaveTextContent('Filters:');
  });

  it('should respect the pathLimit on hierarchical breadcrumbs', async () => {
    const {showMore} = await renderBreadbox({pathLimit: 2});
    await userEvent.click(showMore()!);
    await expect.element(page.getByText('path1 / ... / path4')).toBeVisible();
  });

  it('should call deselect when a breadcrumb is clicked', async () => {
    const mockedDeselect = vi.fn();
    const {regular} = await renderBreadbox({
      state: {
        facetBreadcrumbs: [
          {
            facetId: 'brand',
            facetDisplayName: 'Regular',
            field: 'brand',
            type: 'regular',
            values: [
              {
                value: {
                  value: 'Gucci',
                  numberOfResults: 1,
                  state: 'selected',
                },
                deselect: mockedDeselect,
              },
            ],
          },
        ],
      },
    });

    await userEvent.click(regular()!);

    expect(mockedDeselect).toHaveBeenCalled();
  });

  it('should use "no-label" as the label when facetDisplayName is undefined', async () => {
    await renderBreadbox({
      state: {
        facetBreadcrumbs: [
          {
            facetId: 'brand',
            facetDisplayName: undefined as unknown as string,
            field: 'brand',
            type: 'regular',
            values: [
              {
                value: {
                  value: 'Gucci',
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

    await expect.element(page.getByText('No label')).toBeVisible();
  });

  it('should have the correct value as the text on the  regular breadcrumb', async () => {
    const {showMore, regular} = await renderBreadbox();
    await userEvent.click(showMore()!);

    const content = regular().element().textContent?.trim();
    expect(content).toContain('Gucci');
  });

  it('should have the correct value as the text on the hierarchical breadcrumb', async () => {
    const {showMore, hierarchical} = await renderBreadbox();
    await userEvent.click(showMore()!);

    const content = hierarchical().element().textContent?.trim();
    expect(content).toContain('path1 / ... / path3 / path4');
  });

  it('should have the correct value on the numericalRange breadcrumb', async () => {
    const {showMore, numericalRange} = await renderBreadbox();
    await userEvent.click(showMore()!);

    const content = numericalRange().element().textContent?.trim();
    expect(content).toContain('0 to 100');
  });

  it('should have the correct value on the dateRange breadcrumb', async () => {
    const {showMore, dateRange} = await renderBreadbox();
    await userEvent.click(showMore()!);

    const content = dateRange().element().textContent?.trim();
    expect(content).toContain('2023-01-01 to 2023-12-31');
  });

  it('should show the correct number of breadcrumbs to expand when collapsed', async () => {
    const {showMore} = await renderBreadbox();
    await expect.element(showMore()).toHaveTextContent('+ 3');
  });

  it('should have the correct aria-label on the show more button', async () => {
    const {showMore} = await renderBreadbox();
    await expect
      .element(showMore())
      .toHaveAttribute('aria-label', 'Show + 3 more filters');
  });

  it('should expand and collapse the number of breadcrumbs when clicking on the show more button and on the show less button', async () => {
    const {
      regular,
      hierarchical,
      numericalRange,
      dateRange,
      showMore,
      showLess,
    } = await renderBreadbox();

    await expect.element(regular()).toBeVisible();
    await expect.element(hierarchical()).not.toBeVisible();
    await expect.element(numericalRange()).not.toBeVisible();
    await expect.element(dateRange()).not.toBeVisible();

    await userEvent.click(showMore()!);

    await expect.element(regular()).toBeVisible();
    await expect.element(hierarchical()).toBeVisible();
    await expect.element(numericalRange()).toBeVisible();
    await expect.element(dateRange()).toBeVisible();

    await userEvent.click(showLess()!);

    await expect.element(regular()).toBeVisible();
    await expect.element(hierarchical()).not.toBeVisible();
    await expect.element(numericalRange()).not.toBeVisible();
    await expect.element(dateRange()).not.toBeVisible();
  });

  it('should have the correct text on the show less button', async () => {
    const {showMore, showLess} = await renderBreadbox();
    await userEvent.click(showMore()!);
    await expect.element(showLess()).toBeVisible();
  });

  it('should call the deselectAll method when the clear all button is clicked', async () => {
    const {clearAll} = await renderBreadbox();
    await userEvent.click(clearAll());
    expect(mockedDeselectAll).toHaveBeenCalled();
  });

  it('should have the correct text on the clear all button', async () => {
    const {clearAll} = await renderBreadbox();
    await expect.element(clearAll()).toHaveTextContent('Clear');
  });

  it('should have the correct aria-label on the clear all button', async () => {
    const {clearAll} = await renderBreadbox();
    await expect
      .element(clearAll())
      .toHaveAttribute('aria-label', 'Clear All Filters');
  });

  it('should hide the breadcrumbs when the viewport gets smaller', async () => {
    await page.viewport(1200, 100);
    const {regular, hierarchical, numericalRange, dateRange, showMore} =
      await renderBreadbox();
    await expect.element(regular()).toBeVisible();
    await expect.element(hierarchical()).toBeVisible();
    await expect.element(numericalRange()).toBeVisible();
    await expect.element(dateRange()).toBeVisible();

    await page.viewport(1000, 100);

    await expect.element(regular()).toBeVisible();
    await expect.element(hierarchical()).toBeVisible();
    await expect.element(numericalRange()).toBeVisible();
    await expect.element(dateRange()).not.toBeVisible();
    await expect.element(showMore()).toHaveTextContent('+ 1');

    await page.viewport(600, 100);

    await expect.element(regular()).toBeVisible();
    await expect.element(hierarchical()).toBeVisible();
    await expect.element(numericalRange()).not.toBeVisible();
    await expect.element(dateRange()).not.toBeVisible();
    await expect.element(showMore()).toHaveTextContent('+ 2');

    await page.viewport(400, 100);

    await expect.element(regular()).toBeVisible();
    await expect.element(hierarchical()).not.toBeVisible();
    await expect.element(numericalRange()).not.toBeVisible();
    await expect.element(dateRange()).not.toBeVisible();
    await expect.element(showMore()).toHaveTextContent('+ 3');

    await page.viewport(200, 100);

    await expect.element(regular()).not.toBeVisible();
    await expect.element(hierarchical()).not.toBeVisible();
    await expect.element(numericalRange()).not.toBeVisible();
    await expect.element(dateRange()).not.toBeVisible();
    await expect.element(showMore()).toHaveTextContent('+ 4');
  });

  it('should not hide the breadcrumbs when they are expanded and the viewport gets smaller', async () => {
    await page.viewport(200, 100);
    const {regular, hierarchical, numericalRange, dateRange, showMore} =
      await renderBreadbox();
    await userEvent.click(showMore()!);

    await page.viewport(1200, 100);

    await expect.element(regular()).toBeVisible();
    await expect.element(hierarchical()).toBeVisible();
    await expect.element(numericalRange()).toBeVisible();
    await expect.element(dateRange()).toBeVisible();

    await page.viewport(200, 100);

    await expect.element(regular()).toBeVisible();
    await expect.element(hierarchical()).toBeVisible();
    await expect.element(numericalRange()).toBeVisible();
    await expect.element(dateRange()).toBeVisible();
  });

  it('should render every part', async () => {
    const {element, parts} = await renderBreadbox();

    const partsElements = parts(element);

    await expect.element(partsElements.container!).toBeInTheDocument();
    await expect
      .element(partsElements.breadcrumbListContainer!)
      .toBeInTheDocument();
    await expect.element(partsElements.breadcrumbList!).toBeInTheDocument();
    await expect.element(partsElements.breadcrumbButton!).toBeInTheDocument();
    await expect.element(partsElements.breadcrumbLabel!).toBeInTheDocument();
    await expect.element(partsElements.breadcrumbValue!).toBeInTheDocument();
    await expect.element(partsElements.breadcrumbClear!).toBeInTheDocument();
    await expect.element(partsElements.showMore!).toBeInTheDocument();
    await expect.element(partsElements.clearAll!).toBeInTheDocument();
  });

  it('should disconnect the resize observer when disconnected', async () => {
    const {element} = await renderBreadbox();
    const disconnectSpy = vi.spyOn(ResizeObserver.prototype, 'disconnect');
    element.disconnectedCallback();
    expect(disconnectSpy).toHaveBeenCalled();
  });
});
