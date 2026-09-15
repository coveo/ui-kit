import {describe, it, expect, beforeEach} from 'vitest';
import {converseSchemaResponses} from '@coveo/platform-mock-api/converse';
import type {ConverseEvent} from '@coveo/platform-mock-api/converse';

const {matchSchemaPrompt, buildSearchActionEvents} = converseSchemaResponses;

// The surface keeps an in-memory view across calls, so reset it to defaults before any
// assertion that assumes a fresh surface by rebuilding the initial "water sports" response.
function resetSurface(): ConverseEvent[] {
  return matchSchemaPrompt('water sports');
}

function findStateSnapshotComponents(events: ConverseEvent[]): Record<string, unknown> {
  const snapshotEvent = events.find(
    (e) =>
      e.event === 'message' &&
      (e.data as Record<string, unknown>).type === 'STATE_SNAPSHOT' &&
      (e.data as Record<string, unknown>).snapshot !== undefined &&
      Object.keys((e.data as Record<string, unknown>).snapshot as object).length > 0
  );
  const snapshot = (snapshotEvent!.data as Record<string, unknown>).snapshot as Record<
    string,
    unknown
  >;
  return snapshot.components as Record<string, unknown>;
}

describe('schema-response-search decomposed surface structure', () => {
  const events: ConverseEvent[] = resetSurface();
  const activitySnapshot = events.find(
    (e) =>
      e.event === 'ACTIVITY_SNAPSHOT' &&
      (e.data as Record<string, unknown>).activityType === 'a2ui-surface'
  );
  const stateSnapshot = events.find(
    (e) =>
      e.event === 'message' &&
      (e.data as Record<string, unknown>).type === 'STATE_SNAPSHOT' &&
      (e.data as Record<string, unknown>).snapshot !== undefined &&
      Object.keys((e.data as Record<string, unknown>).snapshot as object).length > 0
  );

  describe('createSurface activity snapshot', () => {
    it('emits an ACTIVITY_SNAPSHOT with a2ui-surface type', () => {
      expect(activitySnapshot).toBeDefined();
      expect((activitySnapshot!.data as Record<string, unknown>).activityType).toBe('a2ui-surface');
    });

    it('places the surface in the main region via surfaceProperties', () => {
      const content = (activitySnapshot!.data as Record<string, unknown>).content as Record<
        string,
        unknown
      >;
      const messages = content.messages as Array<Record<string, unknown>>;
      const createSurface = messages[0].createSurface as Record<string, unknown>;
      const surfaceProperties = createSurface.surfaceProperties as Record<string, unknown>;
      expect(surfaceProperties.placement).toBe('main');
    });

    it('includes individual decomposed components', () => {
      const content = (activitySnapshot!.data as Record<string, unknown>).content as Record<
        string,
        unknown
      >;
      const messages = content.messages as Array<Record<string, unknown>>;
      const createSurface = messages[0].createSurface as Record<string, unknown>;
      const components = createSurface.components as Array<Record<string, unknown>>;
      const componentIds = components.map((c) => c.id);
      expect(componentIds).toContain('query-summary-2');
      expect(componentIds).toContain('product-list-2');
      expect(componentIds).toContain('pagination-2');
      expect(componentIds).toContain('sort-2');
      expect(componentIds).toContain('page-size-2');
    });

    it('composes the two-column layout from generic layout-stack nodes', () => {
      const content = (activitySnapshot!.data as Record<string, unknown>).content as Record<
        string,
        unknown
      >;
      const messages = content.messages as Array<Record<string, unknown>>;
      const createSurface = messages[0].createSurface as Record<string, unknown>;
      const components = createSurface.components as Array<Record<string, unknown>>;
      const componentMap = new Map(components.map((c) => [c.id, c]));

      // The root composes exactly the sidebar and main columns.
      expect(componentMap.get('commerce-search-2')!.children as string[]).toEqual([
        'search-sidebar',
        'search-main',
      ]);

      // Each layout region is a layout-stack carrying its direction as a node prop.
      const layoutRegions: [string, 'column' | 'row'][] = [
        ['search-sidebar', 'column'],
        ['search-main', 'column'],
        ['search-top', 'row'],
        ['search-bottom', 'row'],
      ];
      for (const [id, direction] of layoutRegions) {
        const entry = componentMap.get(id);
        expect(entry, `expected surface to declare ${id}`).toBeDefined();
        const props = entry!.props as Record<string, unknown>;
        expect(props.componentType).toBe('layout-stack');
        expect(props.direction).toBe(direction);
      }

      // The top row places the summary before the sort; the bottom row pagination before page size.
      expect(componentMap.get('search-top')!.children as string[]).toEqual([
        'query-summary-2',
        'sort-2',
      ]);
      expect(componentMap.get('search-bottom')!.children as string[]).toEqual([
        'pagination-2',
        'page-size-2',
      ]);
    });

    it('includes the three facets and a facet manager', () => {
      const content = (activitySnapshot!.data as Record<string, unknown>).content as Record<
        string,
        unknown
      >;
      const messages = content.messages as Array<Record<string, unknown>>;
      const createSurface = messages[0].createSurface as Record<string, unknown>;
      const components = createSurface.components as Array<Record<string, unknown>>;
      const componentMap = new Map(components.map((c) => [c.id, c]));

      const expected: [string, string][] = [
        ['facet-brand-2', 'regular-facet'],
        ['facet-price-2', 'numeric-facet'],
        ['facet-category-2', 'category-facet'],
        ['facet-manager-2', 'facet-manager'],
      ];
      for (const [id, componentType] of expected) {
        const entry = componentMap.get(id);
        expect(entry, `expected surface to declare ${id}`).toBeDefined();
        expect((entry!.props as Record<string, unknown>).componentType).toBe(componentType);
      }
    });

    it('has correct componentType in props for each non-facet component', () => {
      const content = (activitySnapshot!.data as Record<string, unknown>).content as Record<
        string,
        unknown
      >;
      const messages = content.messages as Array<Record<string, unknown>>;
      const createSurface = messages[0].createSurface as Record<string, unknown>;
      const components = createSurface.components as Array<Record<string, unknown>>;
      const componentMap = new Map(components.map((c) => [c.id, c]));
      expect(
        (componentMap.get('query-summary-2')!.props as Record<string, unknown>).componentType
      ).toBe('query-summary');
      expect(
        (componentMap.get('product-list-2')!.props as Record<string, unknown>).componentType
      ).toBe('product-list');
      expect(
        (componentMap.get('pagination-2')!.props as Record<string, unknown>).componentType
      ).toBe('pagination');
      expect((componentMap.get('sort-2')!.props as Record<string, unknown>).componentType).toBe(
        'sort'
      );
    });

    it('does not contain a monolithic ProductSearchSurface root component', () => {
      const content = (activitySnapshot!.data as Record<string, unknown>).content as Record<
        string,
        unknown
      >;
      const messages = content.messages as Array<Record<string, unknown>>;
      const createSurface = messages[0].createSurface as Record<string, unknown>;
      const components = createSurface.components as Array<Record<string, unknown>>;
      const componentNames = components.map((c) => c.component);
      expect(componentNames).not.toContain('ProductSearchSurface');
      expect(componentNames).not.toContain('ProductListingSurface');
    });
  });

  describe('state snapshot with component state', () => {
    it('emits a STATE_SNAPSHOT event with component state data', () => {
      expect(stateSnapshot).toBeDefined();
    });

    function getComponents(): Record<string, unknown> {
      const snapshot = (stateSnapshot!.data as Record<string, unknown>).snapshot as Record<
        string,
        unknown
      >;
      return snapshot.components as Record<string, unknown>;
    }

    it('delivers state for query-summary-2 with the result-window aggregate', () => {
      const components = getComponents();
      const summaryState = components['query-summary-2'] as Record<string, unknown>;
      expect(summaryState).toBeDefined();
      expect(typeof summaryState.query).toBe('string');
      expect(typeof summaryState.firstIndex).toBe('number');
      expect(typeof summaryState.lastIndex).toBe('number');
      expect(typeof summaryState.totalEntries).toBe('number');
    });

    it('delivers state for page-size-2 with the current pageSize', () => {
      const components = getComponents();
      const pageSizeState = components['page-size-2'] as Record<string, unknown>;
      expect(pageSizeState).toBeDefined();
      expect(typeof pageSizeState.pageSize).toBe('number');
    });

    it('delivers state for product-list-2 with products array', () => {
      const components = getComponents();
      const productListState = components['product-list-2'] as Record<string, unknown>;
      expect(productListState).toBeDefined();
      expect(Array.isArray(productListState.products)).toBe(true);
      expect((productListState.products as unknown[]).length).toBeGreaterThan(0);
    });

    it('delivers state for pagination-2 with page, pageSize, totalEntries, totalPages', () => {
      const components = getComponents();
      const paginationState = components['pagination-2'] as Record<string, unknown>;
      expect(paginationState).toBeDefined();
      expect(typeof paginationState.page).toBe('number');
      expect(typeof paginationState.pageSize).toBe('number');
      expect(typeof paginationState.totalEntries).toBe('number');
      expect(typeof paginationState.totalPages).toBe('number');
    });

    it('delivers state for sort-2 with appliedSort and availableSorts', () => {
      const components = getComponents();
      const sortState = components['sort-2'] as Record<string, unknown>;
      expect(sortState).toBeDefined();
      expect(sortState.appliedSort).toBeDefined();
      expect(Array.isArray(sortState.availableSorts)).toBe(true);
    });

    it('delivers brand facet values and a facet manager listing all facets', () => {
      const components = getComponents();
      const brandFacet = components['facet-brand-2'] as Record<string, unknown>;
      expect(Array.isArray(brandFacet.values)).toBe(true);
      expect((brandFacet.values as unknown[]).length).toBeGreaterThan(0);

      // Facet ordering lives on the facet-manager A2-UI node's children, not in AG-UI state.
      const facetManager = components['facet-manager-2'] as Record<string, unknown>;
      expect(facetManager).toBeDefined();
      expect(facetManager.facetIds).toBeUndefined();
    });
  });
});

describe('schema-response-search initial response totals', () => {
  const events = resetSurface();
  const components = findStateSnapshotComponents(events);

  it('uses a pageSize of 12 with real product totals across 4 pages', () => {
    const pagination = components['pagination-2'] as Record<string, unknown>;
    const productList = components['product-list-2'] as Record<string, unknown>;
    expect(pagination.page).toBe(0);
    expect(pagination.pageSize).toBe(12);
    expect(pagination.totalEntries).toBe(43);
    expect(pagination.totalPages).toBe(4);
    // Page 0 slice is capped at the page size.
    expect((productList.products as unknown[]).length).toBe(12);
  });

  it('summarizes the initial window as "1-12 of 43 for Water Sports"', () => {
    const summary = components['query-summary-2'] as Record<string, unknown>;
    expect(summary.query).toBe('Water Sports');
    expect(summary.firstIndex).toBe(1);
    expect(summary.lastIndex).toBe(12);
    expect(summary.totalEntries).toBe(43);
  });
});

describe('schema-response-search action-driven recomputation', () => {
  // State persists across calls, so reset the surface to defaults before each test.
  beforeEach(() => {
    resetSurface();
  });

  function findActivitySnapshot(events: ConverseEvent[]) {
    return events.find(
      (e) =>
        e.event === 'ACTIVITY_SNAPSHOT' &&
        (e.data as Record<string, unknown>).activityType === 'a2ui-surface'
    );
  }

  it('selectPage returns the requested page and its product slice', () => {
    const events = buildSearchActionEvents({name: 'selectPage', context: {page: 3}});
    const components = findStateSnapshotComponents(events);
    const pagination = components['pagination-2'] as Record<string, unknown>;
    const productList = components['product-list-2'] as Record<string, unknown>;
    expect(pagination.page).toBe(3);
    expect(pagination.pageSize).toBe(12);
    // 43 products, page size 12 => the last page (index 3) holds the remaining 7.
    expect((productList.products as unknown[]).length).toBe(7);
  });

  it('selectSort with price_asc sorts by ascending price on page 0', () => {
    const events = buildSearchActionEvents({
      name: 'selectSort',
      context: {sortCriteria: 'price_asc'},
    });
    const components = findStateSnapshotComponents(events);
    const pagination = components['pagination-2'] as Record<string, unknown>;
    const sort = components['sort-2'] as Record<string, unknown>;
    const productList = components['product-list-2'] as Record<string, unknown>;
    const prices = (productList.products as Array<Record<string, unknown>>).map(
      (p) => p.ec_price as number
    );
    expect(pagination.page).toBe(0);
    expect((sort.appliedSort as Record<string, unknown>).sortCriteria).toBe('price_asc');
    const sortedAscending = [...prices].sort((a, b) => a - b);
    expect(prices).toEqual(sortedAscending);
  });

  it('setPageSize recomputes pageSize and totalPages', () => {
    const events = buildSearchActionEvents({name: 'setPageSize', context: {pageSize: 6}});
    const components = findStateSnapshotComponents(events);
    const pagination = components['pagination-2'] as Record<string, unknown>;
    const productList = components['product-list-2'] as Record<string, unknown>;
    expect(pagination.page).toBe(0);
    expect(pagination.pageSize).toBe(6);
    expect(pagination.totalEntries).toBe(43);
    // 43 products, page size 6 => 8 pages (last page holds 1).
    expect(pagination.totalPages).toBe(8);
    expect((productList.products as unknown[]).length).toBe(6);
  });

  it('selecting a brand narrows the product results', () => {
    const events = buildSearchActionEvents({
      name: 'toggleSelect',
      context: {value: 'Billabong'},
      sourceComponentId: 'facet-brand-2',
    });
    const components = findStateSnapshotComponents(events);
    const productList = components['product-list-2'] as Record<string, unknown>;
    const brandFacet = components['facet-brand-2'] as Record<string, unknown>;
    const products = productList.products as Array<Record<string, unknown>>;
    expect(products.length).toBeGreaterThan(0);
    // Every returned product belongs to the selected brand.
    for (const product of products) {
      expect(product.ec_brand).toBe('Billabong');
    }
    // The selected value is reflected in the facet state.
    const selected = (brandFacet.values as Array<Record<string, unknown>>).find(
      (v) => v.value === 'Billabong'
    );
    expect(selected?.state).toBe('selected');
  });

  it('does not re-create the surface (no ACTIVITY_SNAPSHOT) for action responses', () => {
    const events = buildSearchActionEvents({name: 'selectPage', context: {page: 1}});
    expect(findActivitySnapshot(events)).toBeUndefined();
  });
});

describe('schema-response-search stateful surface across actions', () => {
  beforeEach(() => {
    resetSurface();
  });

  it('preserves the sort criteria when changing page after sorting', () => {
    buildSearchActionEvents({name: 'selectSort', context: {sortCriteria: 'price_asc'}});
    const events = buildSearchActionEvents({name: 'selectPage', context: {page: 1}});
    const components = findStateSnapshotComponents(events);
    const sort = components['sort-2'] as Record<string, unknown>;
    const pagination = components['pagination-2'] as Record<string, unknown>;
    expect((sort.appliedSort as Record<string, unknown>).sortCriteria).toBe('price_asc');
    expect(pagination.page).toBe(1);
  });

  it('preserves the page size when changing page after resizing', () => {
    buildSearchActionEvents({name: 'setPageSize', context: {pageSize: 6}});
    const events = buildSearchActionEvents({name: 'selectPage', context: {page: 2}});
    const components = findStateSnapshotComponents(events);
    const pagination = components['pagination-2'] as Record<string, unknown>;
    expect(pagination.pageSize).toBe(6);
    expect(pagination.page).toBe(2);
  });

  it('preserves a selected brand when changing sort', () => {
    buildSearchActionEvents({
      name: 'toggleSelect',
      context: {value: 'Billabong'},
      sourceComponentId: 'facet-brand-2',
    });
    const events = buildSearchActionEvents({
      name: 'selectSort',
      context: {sortCriteria: 'price_desc'},
    });
    const components = findStateSnapshotComponents(events);
    const productList = components['product-list-2'] as Record<string, unknown>;
    for (const product of productList.products as Array<Record<string, unknown>>) {
      expect(product.ec_brand).toBe('Billabong');
    }
  });

  it('resets the view to defaults when the initial water sports response is rebuilt', () => {
    buildSearchActionEvents({name: 'selectSort', context: {sortCriteria: 'price_desc'}});
    buildSearchActionEvents({name: 'setPageSize', context: {pageSize: 6}});
    buildSearchActionEvents({name: 'selectPage', context: {page: 2}});
    buildSearchActionEvents({
      name: 'toggleSelect',
      context: {value: 'Billabong'},
      sourceComponentId: 'facet-brand-2',
    });
    const events = matchSchemaPrompt('water sports');
    const components = findStateSnapshotComponents(events);
    const pagination = components['pagination-2'] as Record<string, unknown>;
    const sort = components['sort-2'] as Record<string, unknown>;
    expect(pagination.page).toBe(0);
    expect(pagination.pageSize).toBe(12);
    expect(pagination.totalEntries).toBe(43);
    expect((sort.appliedSort as Record<string, unknown>).sortCriteria).toBe('relevance');
  });
});
