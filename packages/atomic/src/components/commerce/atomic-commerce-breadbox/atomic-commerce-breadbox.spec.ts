import {
  type BreadcrumbManager,
  type BreadcrumbManagerState,
  buildContext,
  buildProductListing,
  buildSearch,
} from '@coveo/headless/commerce';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {page, userEvent} from 'vitest/browser';
import type {CommerceStore} from '@/src/components/commerce/atomic-commerce-interface/store';
import {FocusTargetController} from '@/src/utils/accessibility-utils';
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
    // oxlint-disable-next-line @typescript-eslint/no-explicit-any -- <>
    (d as any).format = vi.fn((fmt: string) =>
      fmt === 'YYYY-MM-DD' ? d.toISOString().split('T')[0] : `unexpected format ${fmt}`
    );
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
    disableCollapse?: boolean;
    state?: Partial<BreadcrumbManagerState>;
    subscribe?: BreadcrumbManager['subscribe'];
    store?: Partial<CommerceStore>;
  }

  const renderBreadbox = async ({
    interfaceElementType = 'product-listing',
    pathLimit = 3,
    disableCollapse,
    state = {},
    subscribe,
    store,
  }: RenderBreadboxOptions = {}) => {
    mockedBreadcrumbManager = buildFakeBreadcrumbManager({
      state,
      implementation: {
        deselectAll: mockedDeselectAll,
        ...(subscribe && {subscribe}),
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

    const {element} = await renderInAtomicCommerceInterface<AtomicCommerceBreadbox>({
      template: html`<div>
        <atomic-commerce-breadbox
          path-limit=${ifDefined(pathLimit)}
          ?disable-collapse=${disableCollapse}
        ></atomic-commerce-breadbox>
      </div>`,
      selector: 'atomic-commerce-breadbox',
      bindings: (bindings) => {
        bindings.interfaceElement.type = interfaceElementType;
        bindings.engine = mockedEngine;
        return store ? {...bindings, store: {...bindings.store, ...store}} : bindings;
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
      showMore: () => page.getByLabelText(/Show \d+ more filters/),
      showLess: () => page.getByText('Show less'),
      clearAll: () => page.getByLabelText('Clear All Filters'),
      parts: (element: AtomicCommerceBreadbox) => {
        const qs = (part: string) => element.shadowRoot?.querySelector(`[part="${part}"]`);
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

  it('should unsubscribe from the breadcrumb manager when removed from the DOM', async () => {
    const unsubscribe = vi.fn();
    const {element} = await renderBreadbox({
      subscribe: vi.fn((listener: () => void) => {
        listener();
        return unsubscribe;
      }),
    });

    element.remove();

    expect(unsubscribe).toHaveBeenCalledOnce();
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
    expect(element.error.message).toMatch(/pathLimit: minimum value of 1 not respected/i);
  });

  it('should set error when valid pathLimit is updated to a value lower than 1', async () => {
    const {element} = await renderBreadbox();

    expect(element.error).toBeUndefined();

    element.pathLimit = 0;

    await element.updateComplete;

    expect(element.error).toBeDefined();
    expect(element.error.message).toMatch(/pathLimit: minimum value of 1 not respected/i);
  });

  it('should render nothing when there are no breadcrumbs', async () => {
    const {element, parts} = await renderBreadbox({
      state: {facetBreadcrumbs: []},
    });
    expect(parts(element).container).toBeNull();
    expect(parts(element).clearAll).toBeNull();
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

  describe('when formatting numerical range values', () => {
    const numericalRangeBreadcrumb = (facetId: string, facetDisplayName: string) => ({
      facetId,
      facetDisplayName,
      field: facetId,
      type: 'numericalRange' as const,
      values: [
        {
          value: {
            start: 0,
            end: 100,
            endInclusive: true,
            state: 'selected' as const,
            numberOfResults: 1,
            moreValuesAvailable: false,
            isSuggested: false,
            isAutoSelected: false,
          },
          deselect: vi.fn(),
        },
      ],
    });

    it('should format the ec_price range in the context currency', async () => {
      await renderBreadbox({
        state: {facetBreadcrumbs: [numericalRangeBreadcrumb('ec_price', 'Price')]},
      });

      await expect.element(page.getByTitle('Price')).toHaveTextContent('$0.00 to $100.00');
    });

    it('should format the ec_promo_price range in the context currency', async () => {
      await renderBreadbox({
        state: {facetBreadcrumbs: [numericalRangeBreadcrumb('ec_promo_price', 'Promo price')]},
      });

      await expect.element(page.getByTitle('Promo price')).toHaveTextContent('$0.00 to $100.00');
    });

    it('should format other numerical ranges as plain numbers', async () => {
      await renderBreadbox({
        state: {facetBreadcrumbs: [numericalRangeBreadcrumb('size', 'Size')]},
      });

      await expect.element(page.getByTitle('Size')).toHaveTextContent('0 to 100');
      await expect.element(page.getByTitle('Size')).not.toHaveTextContent('$');
    });
  });

  it('should log a warning and render an empty value for an unsupported breadcrumb type', async () => {
    const {element, parts} = await renderBreadbox({
      state: {
        facetBreadcrumbs: [
          {
            facetId: 'location',
            facetDisplayName: 'Location',
            field: 'location',
            type: 'location',
            values: [
              {
                value: {value: 'Montreal', numberOfResults: 1, state: 'selected'},
                deselect: vi.fn(),
              },
            ],
          },
        ],
      },
    });

    expect(mockedEngine.logger.warn).toHaveBeenCalledWith('Unexpected breadcrumb type.');
    expect(parts(element).breadcrumbValue?.textContent?.trim()).toBe('');
  });

  it('should show the correct number of breadcrumbs to expand when collapsed', async () => {
    const {showMore} = await renderBreadbox();
    await expect.element(showMore()).toHaveTextContent('Show 3 more filters');
  });

  it('should have the correct aria-label on the show more button', async () => {
    const {showMore} = await renderBreadbox();
    await expect.element(showMore()).toHaveAttribute('aria-label', 'Show 3 more filters');
  });

  it('should expand and collapse the number of breadcrumbs when clicking on the show more button and on the show less button', async () => {
    const {regular, hierarchical, numericalRange, dateRange, showMore, showLess} =
      await renderBreadbox();

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
    await expect.element(clearAll()).toHaveAttribute('aria-label', 'Clear All Filters');
  });

  it('should hide the breadcrumbs when the viewport gets smaller', async () => {
    await page.viewport(1600, 100);
    const {element, parts, regular, hierarchical, numericalRange, dateRange, showMore} =
      await renderBreadbox();
    await expect.element(regular()).toBeVisible();
    await expect.element(hierarchical()).toBeVisible();
    await expect.element(numericalRange()).toBeVisible();
    await expect.element(dateRange()).toBeVisible();
    await expect.element(parts(element).showMore as HTMLElement).not.toBeVisible();

    await page.viewport(200, 100);

    await expect.element(regular()).not.toBeVisible();
    await expect.element(hierarchical()).not.toBeVisible();
    await expect.element(numericalRange()).not.toBeVisible();
    await expect.element(dateRange()).not.toBeVisible();
    await expect.element(showMore()).toBeVisible();
    await expect.element(showMore()).toHaveTextContent('Show 4 more filters');
  });

  it('should update the number of hidden breadcrumbs when the breadcrumbs change without a resize', async () => {
    await page.viewport(200, 100);
    const {element, showMore} = await renderBreadbox();
    await expect.element(showMore()).toHaveTextContent('Show 4 more filters');

    element.breadcrumbManagerState = {
      ...element.breadcrumbManagerState,
      facetBreadcrumbs: element.breadcrumbManagerState.facetBreadcrumbs.slice(0, 3),
    };

    await expect.element(showMore()).toHaveTextContent('Show 3 more filters');
  });

  it('should only show the show less button when the expanded breadcrumbs wrap', async () => {
    await page.viewport(200, 100);
    const {element, parts, showMore, showLess} = await renderBreadbox();
    await userEvent.click(showMore());
    await expect.element(showLess()).toBeVisible();

    await page.viewport(1600, 100);

    await expect.element(parts(element).showLess as HTMLElement).not.toBeVisible();

    await page.viewport(200, 100);

    await expect.element(showLess()).toBeVisible();
  });

  it('should not hide the breadcrumbs when they are expanded and the viewport gets smaller', async () => {
    await page.viewport(200, 100);
    const {regular, hierarchical, numericalRange, dateRange, showMore} = await renderBreadbox();
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
    await expect.element(partsElements.breadcrumbListContainer!).toBeInTheDocument();
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

  describe('when removing or expanding breadcrumbs', () => {
    const focusOnFirstResultAfterNextSearch = vi.fn();
    let searchId: string;

    const store = () =>
      ({
        state: {
          loadingFlags: [],
          resultList: {focusOnFirstResultAfterNextSearch, focusOnNextNewResult: vi.fn()},
        } as Partial<CommerceStore['state']>,
        getUniqueIDFromEngine: () => searchId,
      }) as Partial<CommerceStore>;

    const singleBreadcrumbState: Partial<BreadcrumbManagerState> = {
      facetBreadcrumbs: [
        {
          facetId: 'brand',
          facetDisplayName: 'Regular',
          field: 'brand',
          type: 'regular',
          values: [
            {
              value: {value: 'Gucci', numberOfResults: 1, state: 'selected'},
              deselect: vi.fn(),
            },
          ],
        },
      ],
    };

    const focusedElement = (element: AtomicCommerceBreadbox) => element.shadowRoot!.activeElement;

    const simulateSearchWithout = (element: AtomicCommerceBreadbox, removedIndex: number) => {
      searchId = 'after-removal';
      element.breadcrumbManagerState = {
        ...element.breadcrumbManagerState,
        facetBreadcrumbs: element.breadcrumbManagerState.facetBreadcrumbs.filter(
          (_, index) => index !== removedIndex
        ),
      };
    };

    beforeEach(() => {
      searchId = 'before-removal';
    });

    it('should focus the first product after the next search when the only breadcrumb is removed', async () => {
      const {regular} = await renderBreadbox({
        disableCollapse: true,
        state: singleBreadcrumbState,
        store: store(),
      });

      await userEvent.click(regular());

      expect(focusOnFirstResultAfterNextSearch).toHaveBeenCalledOnce();
    });

    it('should focus a breadcrumb after the next search when one of several breadcrumbs is removed', async () => {
      const focusAfterSearchSpy = vi.spyOn(FocusTargetController.prototype, 'focusAfterSearch');
      const {regular} = await renderBreadbox({disableCollapse: true, store: store()});

      await userEvent.click(regular());

      expect(focusAfterSearchSpy).toHaveBeenCalledOnce();
      expect(focusOnFirstResultAfterNextSearch).not.toHaveBeenCalled();
    });

    it('should focus the breadcrumb that takes the place of the removed one', async () => {
      const {element, regular} = await renderBreadbox({
        disableCollapse: true,
        store: store(),
      });

      await userEvent.click(regular());
      simulateSearchWithout(element, 0);

      await expect
        .poll(() => focusedElement(element)?.getAttribute('title'))
        .toMatch(/^Hierarchical:/);
    });

    it('should focus the clear all button when the breadcrumb at the end of the list is removed', async () => {
      const {element, dateRange} = await renderBreadbox({
        disableCollapse: true,
        store: store(),
      });

      await userEvent.click(dateRange());
      simulateSearchWithout(element, 3);

      await expect.poll(() => focusedElement(element)?.getAttribute('part')).toBe('clear');
    });

    it('should focus the first breadcrumb that was hidden after clicking on the show more button', async () => {
      await page.viewport(414, 896);
      const {element, showMore} = await renderBreadbox();
      const breadcrumbs = () =>
        Array.from(element.shadowRoot!.querySelectorAll<HTMLElement>('li.breadcrumb'));
      const firstHiddenIndex = breadcrumbs().findIndex((li) => li.style.display === 'none');
      expect(firstHiddenIndex).toBeGreaterThan(0);
      const firstHiddenTitle = breadcrumbs()
        [firstHiddenIndex].querySelector('button')!
        .getAttribute('title');

      await userEvent.click(showMore());

      await expect
        .poll(() => focusedElement(element)?.getAttribute('title'))
        .toBe(firstHiddenTitle);
    });

    it('should focus the show more button after clicking on the show less button', async () => {
      await page.viewport(414, 896);
      const {element, showMore, showLess} = await renderBreadbox();

      await userEvent.click(showMore());
      await userEvent.click(showLess());

      await expect.poll(() => focusedElement(element)?.getAttribute('part')).toBe('show-more');
    });

    describe('when announcing the removal', () => {
      const updateMessage = vi.fn();
      const registerRegion = vi.fn();
      const provideAriaLive = (event: Event) => {
        (event as CustomEvent).detail.element = {updateMessage, registerRegion};
      };

      beforeEach(() => {
        document.addEventListener('atomic/accessibility/findAriaLive', provideAriaLive);
      });

      afterEach(() => {
        document.removeEventListener('atomic/accessibility/findAriaLive', provideAriaLive);
      });

      it('should announce the removed filter assertively in the breadbox region', async () => {
        const {regular} = await renderBreadbox({
          disableCollapse: true,
          state: singleBreadcrumbState,
          store: store(),
        });

        await userEvent.click(regular());

        expect(registerRegion).toHaveBeenCalledWith('breadbox', true);
        expect(updateMessage).toHaveBeenCalledWith('breadbox', 'Filter removed', true);
      });
    });
  });

  describe('disable-collapse', () => {
    it('should show all breadcrumbs without a show-more button when disable-collapse is set', async () => {
      await page.viewport(400, 100);
      const {parts, element} = await renderBreadbox({
        disableCollapse: true,
      });

      const breadcrumbButtons = element.shadowRoot?.querySelectorAll('[part="breadcrumb-button"]');
      expect(breadcrumbButtons?.length).toBe(4);

      const partsElements = parts(element);
      expect(partsElements.showMore).toBeNull();
      expect(partsElements.showLess).toBeNull();
    });

    it('should use flex-wrap on the breadcrumb list when disable-collapse is set', async () => {
      const {parts, element} = await renderBreadbox({
        disableCollapse: true,
      });

      const partsElements = parts(element);
      expect(partsElements.breadcrumbList).toHaveClass('flex-wrap');
      expect(partsElements.breadcrumbList).not.toHaveClass('flex-nowrap');
    });

    it('should not hide breadcrumbs when the viewport is small and disable-collapse is set', async () => {
      await page.viewport(200, 100);
      const {element} = await renderBreadbox({
        disableCollapse: true,
      });

      const visibleBreadcrumbs = Array.from(
        element.shadowRoot!.querySelectorAll('li.breadcrumb')
      ).filter((el) => (el as HTMLElement).style.display !== 'none');
      expect(visibleBreadcrumbs.length).toBe(4);
    });
  });
});
