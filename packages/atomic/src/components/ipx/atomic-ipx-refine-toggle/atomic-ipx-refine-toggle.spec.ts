import {
  type BreadcrumbManager,
  type BreadcrumbManagerState,
  buildBreadcrumbManager,
  buildQuerySummary,
  buildSearchStatus,
  type SearchStatus,
  type SearchStatusState,
} from '@coveo/headless';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {describe, expect, it, vi} from 'vitest';
import {userEvent} from 'vitest/browser';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import {buildFakeBreadcrumbManager} from '@/vitest-utils/testing-helpers/fixtures/headless/search/breadcrumb-manager';
import {buildFakeSearchEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/search/engine';
import {buildFakeSearchStatus} from '@/vitest-utils/testing-helpers/fixtures/headless/search/search-status-controller';
import {buildFakeSummary} from '@/vitest-utils/testing-helpers/fixtures/headless/search/summary-controller';
import type {AtomicIpxRefineToggle} from './atomic-ipx-refine-toggle';
import './atomic-ipx-refine-toggle';

vi.mock('@coveo/headless', {spy: true});

describe('atomic-ipx-refine-toggle', () => {
  const mockedEngine = buildFakeSearchEngine();
  let mockedBreadcrumbManager: BreadcrumbManager;
  let mockedSearchStatus: SearchStatus;

  interface RenderRefineToggleOptions {
    collapseFacetsAfter?: number;
    breadcrumbState?: Partial<BreadcrumbManagerState>;
    searchStatusState?: Partial<SearchStatusState>;
  }

  const renderRefineToggle = async ({
    collapseFacetsAfter,
    breadcrumbState = {},
    searchStatusState = {},
  }: RenderRefineToggleOptions = {}) => {
    mockedBreadcrumbManager = buildFakeBreadcrumbManager({
      state: breadcrumbState,
    });
    mockedSearchStatus = buildFakeSearchStatus(searchStatusState);

    vi.mocked(buildBreadcrumbManager).mockReturnValue(mockedBreadcrumbManager);
    vi.mocked(buildSearchStatus).mockReturnValue(mockedSearchStatus);

    // Mock controllers used by atomic-ipx-refine-modal (which is dynamically created)
    vi.mocked(buildQuerySummary).mockReturnValue(buildFakeSummary());

    const {element} =
      await renderInAtomicSearchInterface<AtomicIpxRefineToggle>({
        template: html`<atomic-ipx-refine-toggle
          collapse-facets-after=${ifDefined(collapseFacetsAfter)}
        ></atomic-ipx-refine-toggle>`,
        selector: 'atomic-ipx-refine-toggle',
        bindings: (bindings) => {
          bindings.engine = mockedEngine;
          bindings.store = {
            ...bindings.store,
            waitUntilAppLoaded: (cb: () => void) => cb(),
            getFacetElements: () => [],
          };
          return bindings;
        },
      });

    return {
      element,
      parts: (el: AtomicIpxRefineToggle) => {
        const qs = (part: string) =>
          el.shadowRoot?.querySelector<HTMLElement>(`[part="${part}"]`);
        return {
          container: qs('ipx-refine-toggle-container') ?? null,
          button: qs('ipx-refine-toggle-button') as HTMLButtonElement | null,
          icon: qs('ipx-refine-toggle-icon') ?? null,
          badge: qs('ipx-refine-toggle-badge') ?? null,
        };
      },
    };
  };

  it('should not set error with valid props', async () => {
    const {element} = await renderRefineToggle({
      collapseFacetsAfter: 5,
    });

    expect(element.error).toBeUndefined();
  });

  it('should have default value of 0 for collapseFacetsAfter', async () => {
    const {element} = await renderRefineToggle();

    expect(element.collapseFacetsAfter).toBe(0);
  });

  it('should reflect collapseFacetsAfter property to attribute', async () => {
    const {element} = await renderRefineToggle({
      collapseFacetsAfter: 5,
    });

    expect(element.getAttribute('collapse-facets-after')).toBe('5');
  });

  it('should reflect updated collapseFacetsAfter value to attribute when property changes', async () => {
    const {element} = await renderRefineToggle({
      collapseFacetsAfter: 3,
    });

    element.collapseFacetsAfter = 7;
    await element.updateComplete;

    expect(element.collapseFacetsAfter).toBe(7);
    expect(element.getAttribute('collapse-facets-after')).toBe('7');
  });

  describe('#initialize', () => {
    it('should build breadcrumbManager with engine', async () => {
      const {element} = await renderRefineToggle();

      expect(buildBreadcrumbManager).toHaveBeenCalledWith(mockedEngine);
      expect(element.breadcrumbManager).toBe(mockedBreadcrumbManager);
    });

    it('should build searchStatus with engine', async () => {
      const {element} = await renderRefineToggle();

      expect(buildSearchStatus).toHaveBeenCalledWith(mockedEngine);
      expect(element.searchStatus).toBe(mockedSearchStatus);
    });
  });

  describe('when rendering (#render)', () => {
    it('should render all shadow parts', async () => {
      const {parts, element} = await renderRefineToggle({
        searchStatusState: {hasResults: true},
      });
      await expect.element(parts(element).container!).toBeInTheDocument();
      await expect.element(parts(element).button!).toBeInTheDocument();
      await expect.element(parts(element).icon!).toBeInTheDocument();
    });

    it('should render the button with correct aria-label', async () => {
      const {parts, element} = await renderRefineToggle({
        searchStatusState: {hasResults: true},
      });
      expect(parts(element).button?.getAttribute('aria-label')).toBe('Filters');
    });

    it('should render the button with correct title', async () => {
      const {parts, element} = await renderRefineToggle({
        searchStatusState: {hasResults: true},
      });
      expect(parts(element).button?.getAttribute('title')).toBe('Filters');
    });

    it('should disable the button when there are no results and no breadcrumbs', async () => {
      const {parts, element} = await renderRefineToggle({
        searchStatusState: {hasResults: false},
        breadcrumbState: {hasBreadcrumbs: false},
      });
      expect(parts(element).button?.disabled).toBe(true);
    });

    it('should enable the button when there are results', async () => {
      const {parts, element} = await renderRefineToggle({
        searchStatusState: {hasResults: true},
        breadcrumbState: {hasBreadcrumbs: false},
      });
      expect(parts(element).button?.disabled).toBe(false);
    });

    it('should enable the button when there are breadcrumbs but no results', async () => {
      const {parts, element} = await renderRefineToggle({
        searchStatusState: {hasResults: false},
        breadcrumbState: {
          hasBreadcrumbs: true,
          facetBreadcrumbs: [
            {
              facetId: 'test-facet',
              field: 'test-field',
              values: [
                {
                  value: {
                    value: 'value1',
                    state: 'selected',
                    numberOfResults: 1,
                  },
                  deselect: vi.fn(),
                },
              ],
            },
          ],
        },
      });
      expect(parts(element).button?.disabled).toBe(false);
    });

    it('should not render the badge when there are no breadcrumbs', async () => {
      const {parts, element} = await renderRefineToggle({
        searchStatusState: {hasResults: true},
        breadcrumbState: {hasBreadcrumbs: false},
      });
      expect(parts(element).badge).toBeNull();
    });

    describe('when there are breadcrumbs', () => {
      it('should render the badge with correct count for facet breadcrumbs', async () => {
        const {parts, element} = await renderRefineToggle({
          searchStatusState: {hasResults: true},
          breadcrumbState: {
            hasBreadcrumbs: true,
            facetBreadcrumbs: [
              {
                facetId: 'test-facet',
                field: 'test-field',
                values: [
                  {
                    value: {
                      value: 'value1',
                      state: 'selected',
                      numberOfResults: 1,
                    },
                    deselect: vi.fn(),
                  },
                ],
              },
            ],
          },
        });
        await expect.element(parts(element).badge!).toBeInTheDocument();
        await expect.element(parts(element).badge!).toHaveTextContent('1');
      });

      it('should sum all breadcrumb types in badge count', async () => {
        const {parts, element} = await renderRefineToggle({
          searchStatusState: {hasResults: true},
          breadcrumbState: {
            hasBreadcrumbs: true,
            facetBreadcrumbs: [
              {
                facetId: 'facet1',
                field: 'field1',
                values: [
                  {
                    value: {
                      value: 'value1',
                      state: 'selected',
                      numberOfResults: 1,
                    },
                    deselect: vi.fn(),
                  },
                ],
              },
            ],
            categoryFacetBreadcrumbs: [
              {
                facetId: 'category1',
                field: 'cat-field',
                path: [
                  {
                    value: 'cat1',
                    state: 'selected',
                    numberOfResults: 1,
                    path: [],
                    children: [],
                    moreValuesAvailable: false,
                    isLeafValue: true,
                  },
                ],
                deselect: vi.fn(),
              },
            ],
            numericFacetBreadcrumbs: [
              {
                facetId: 'numeric1',
                field: 'numeric-field',
                values: [
                  {
                    value: {
                      start: 0,
                      end: 100,
                      endInclusive: true,
                      state: 'selected',
                      numberOfResults: 5,
                    },
                    deselect: vi.fn(),
                  },
                ],
              },
            ],
            dateFacetBreadcrumbs: [
              {
                facetId: 'date1',
                field: 'date-field',
                values: [
                  {
                    value: {
                      start: '2024-01-01',
                      end: '2024-12-31',
                      endInclusive: true,
                      state: 'selected',
                      numberOfResults: 3,
                    },
                    deselect: vi.fn(),
                  },
                ],
              },
            ],
            staticFilterBreadcrumbs: [
              {
                id: 'static1',
                values: [
                  {
                    value: {
                      caption: 'Static Filter',
                      expression: 'expr',
                      state: 'selected',
                    },
                    deselect: vi.fn(),
                  },
                ],
              },
            ],
            automaticFacetBreadcrumbs: [
              {
                facetId: 'auto1',
                field: 'auto-field',
                label: 'Auto Facet',
                values: [
                  {
                    value: {
                      value: 'auto-val',
                      state: 'selected',
                      numberOfResults: 1,
                    },
                    deselect: vi.fn(),
                  },
                ],
              },
            ],
          },
        });
        await expect.element(parts(element).badge!).toHaveTextContent('6');
      });
    });
  });

  describe('when the button is clicked', () => {
    it('should open the modal', async () => {
      const {element, parts} = await renderRefineToggle({
        searchStatusState: {hasResults: true},
      });

      const button = parts(element).button!;
      await userEvent.click(button);

      const modal = element.parentElement?.querySelector(
        'atomic-ipx-refine-modal'
      );
      expect(modal).toBeTruthy();
      expect(modal?.isOpen).toBe(true);
    });

    it('should set collapseFacetsAfter on the modal', async () => {
      const {element, parts} = await renderRefineToggle({
        collapseFacetsAfter: 5,
        searchStatusState: {hasResults: true},
      });

      const button = parts(element).button!;
      await userEvent.click(button);

      const modal = element.parentElement?.querySelector(
        'atomic-ipx-refine-modal'
      );
      expect(modal?.collapseFacetsAfter).toBe(5);
    });
  });
});
