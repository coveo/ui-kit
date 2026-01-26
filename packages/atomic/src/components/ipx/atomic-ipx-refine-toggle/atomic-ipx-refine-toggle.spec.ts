import {
  type BreadcrumbManager,
  type BreadcrumbManagerState,
  buildBreadcrumbManager,
  buildSearchStatus,
  type SearchStatus,
  type SearchStatusState,
} from '@coveo/headless';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {describe, expect, it, vi} from 'vitest';
import {page} from 'vitest/browser';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import {buildFakeBreadcrumbManager} from '@/vitest-utils/testing-helpers/fixtures/headless/search/breadcrumb-manager';
import {buildFakeSearchEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/search/engine';
import {buildFakeSearchStatus} from '@/vitest-utils/testing-helpers/fixtures/headless/search/search-status';
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
    mockedSearchStatus = buildFakeSearchStatus({
      state: searchStatusState,
    });

    vi.mocked(buildBreadcrumbManager).mockReturnValue(mockedBreadcrumbManager);
    vi.mocked(buildSearchStatus).mockReturnValue(mockedSearchStatus);

    const {element} =
      await renderInAtomicSearchInterface<AtomicIpxRefineToggle>({
        template: html`<atomic-ipx-refine-toggle
        collapse-facets-after=${ifDefined(collapseFacetsAfter)}
      ></atomic-ipx-refine-toggle>`,
        selector: 'atomic-ipx-refine-toggle',
        bindings: (bindings) => {
          bindings.engine = mockedEngine;
          return bindings;
        },
      });

    return {
      element,
      button: () => page.getByRole('button', {name: 'Filters'}),
      parts: (el: AtomicIpxRefineToggle) => ({
        container: el.shadowRoot?.querySelector(
          '[part="ipx-refine-toggle-container"]'
        ),
        button: el.shadowRoot?.querySelector(
          '[part="ipx-refine-toggle-button"]'
        ),
        icon: el.shadowRoot?.querySelector('[part="ipx-refine-toggle-icon"]'),
        badge: el.shadowRoot?.querySelector('[part="ipx-refine-toggle-badge"]'),
      }),
    };
  };

  describe('constructor', () => {
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
  });

  describe('initialize', () => {
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

  describe('rendering', () => {
    it('should render the container part', async () => {
      const {parts, element} = await renderRefineToggle();
      await expect.element(parts(element).container).toBeInTheDocument();
    });

    it('should render the button part', async () => {
      const {parts, element} = await renderRefineToggle({
        searchStatusState: {hasResults: true},
      });
      await expect.element(parts(element).button).toBeInTheDocument();
    });

    it('should render the icon part', async () => {
      const {parts, element} = await renderRefineToggle({
        searchStatusState: {hasResults: true},
      });
      await expect.element(parts(element).icon).toBeInTheDocument();
    });

    it('should render the button with correct accessibility label', async () => {
      const {button} = await renderRefineToggle({
        searchStatusState: {hasResults: true},
      });
      await expect.element(button()).toBeInTheDocument();
    });
  });

  describe('when there are no results and no breadcrumbs', () => {
    it('should disable the button', async () => {
      const {button} = await renderRefineToggle({
        searchStatusState: {hasResults: false},
        breadcrumbState: {hasBreadcrumbs: false},
      });
      await expect.element(button()).toBeDisabled();
    });
  });

  describe('when there are results', () => {
    it('should enable the button', async () => {
      const {button} = await renderRefineToggle({
        searchStatusState: {hasResults: true},
        breadcrumbState: {hasBreadcrumbs: false},
      });
      await expect.element(button()).toBeEnabled();
    });
  });

  describe('when there are breadcrumbs but no results', () => {
    it('should enable the button', async () => {
      const {button} = await renderRefineToggle({
        searchStatusState: {hasResults: false},
        breadcrumbState: {hasBreadcrumbs: true},
      });
      await expect.element(button()).toBeEnabled();
    });
  });

  describe('badge rendering', () => {
    it('should not render badge when there are no breadcrumbs', async () => {
      const {parts, element} = await renderRefineToggle({
        searchStatusState: {hasResults: true},
        breadcrumbState: {
          hasBreadcrumbs: false,
          facetBreadcrumbs: [],
          categoryFacetBreadcrumbs: [],
          numericFacetBreadcrumbs: [],
          dateFacetBreadcrumbs: [],
          staticFilterBreadcrumbs: [],
        },
      });
      expect(parts(element).badge).toBeFalsy();
    });

    it('should render badge when there are breadcrumbs', async () => {
      const {parts, element} = await renderRefineToggle({
        searchStatusState: {hasResults: true},
        breadcrumbState: {
          hasBreadcrumbs: true,
          facetBreadcrumbs: [
            {
              facetId: 'test-facet',
              facetDisplayName: 'Test',
              values: [{value: {value: 'value1'}, deselect: vi.fn()}],
            },
          ],
          categoryFacetBreadcrumbs: [],
          numericFacetBreadcrumbs: [],
          dateFacetBreadcrumbs: [],
          staticFilterBreadcrumbs: [],
        },
      });
      await expect.element(parts(element).badge).toBeInTheDocument();
    });

    it('should display correct count when there is 1 facet breadcrumb', async () => {
      const {parts, element} = await renderRefineToggle({
        searchStatusState: {hasResults: true},
        breadcrumbState: {
          hasBreadcrumbs: true,
          facetBreadcrumbs: [
            {
              facetId: 'test-facet',
              facetDisplayName: 'Test',
              values: [{value: {value: 'value1'}, deselect: vi.fn()}],
            },
          ],
          categoryFacetBreadcrumbs: [],
          numericFacetBreadcrumbs: [],
          dateFacetBreadcrumbs: [],
          staticFilterBreadcrumbs: [],
        },
      });
      await expect.element(parts(element).badge).toHaveTextContent('1');
    });

    it('should display correct count with multiple breadcrumb types', async () => {
      const {parts, element} = await renderRefineToggle({
        searchStatusState: {hasResults: true},
        breadcrumbState: {
          hasBreadcrumbs: true,
          facetBreadcrumbs: [
            {
              facetId: 'facet1',
              facetDisplayName: 'Facet 1',
              values: [{value: {value: 'value1'}, deselect: vi.fn()}],
            },
            {
              facetId: 'facet2',
              facetDisplayName: 'Facet 2',
              values: [{value: {value: 'value2'}, deselect: vi.fn()}],
            },
          ],
          categoryFacetBreadcrumbs: [
            {
              facetId: 'category1',
              facetDisplayName: 'Category 1',
              path: [{value: {value: 'cat1'}, deselect: vi.fn()}],
            },
          ],
          numericFacetBreadcrumbs: [],
          dateFacetBreadcrumbs: [],
          staticFilterBreadcrumbs: [],
        },
      });
      await expect.element(parts(element).badge).toHaveTextContent('3');
    });
  });

  describe('collapseFacetsAfter prop', () => {
    it('should reflect to attribute', async () => {
      const {element} = await renderRefineToggle({
        collapseFacetsAfter: 5,
      });

      expect(element.getAttribute('collapse-facets-after')).toBe('5');
    });

    it('should update when property changes', async () => {
      const {element} = await renderRefineToggle({
        collapseFacetsAfter: 3,
      });

      element.collapseFacetsAfter = 7;
      await element.updateComplete;

      expect(element.collapseFacetsAfter).toBe(7);
      expect(element.getAttribute('collapse-facets-after')).toBe('7');
    });
  });
});
