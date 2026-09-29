import {describe, it, expect, beforeEach} from 'vitest';
import {converseSchemaResponses} from '@coveo/platform-mock-api/converse';
import type {ConverseEvent} from '@coveo/platform-mock-api/converse';

const {matchSchemaPrompt, buildSearchActionEvents} = converseSchemaResponses;

// The surface keeps an in-memory view across calls, so reset it to defaults before any
// assertion that assumes a fresh surface by rebuilding the initial "water sports" response.
function resetSurface(): ConverseEvent[] {
  return matchSchemaPrompt('water sports');
}

// The server-owned Component_State namespace prefix. Whole-component state values are written at
// `/state/<id>` by updateDataModel ops on `a2ui-surface` activities.
const STATE_PREFIX = '/state/';

function eventData(event: ConverseEvent): Record<string, unknown> {
  return event.data as Record<string, unknown>;
}

// The A2-UI `a2ui-surface` activities carry their v1.0 messages under `content.messages`. An
// activity is either a createSurface activity (messages carry `createSurface`) or a state
// activity (messages carry `updateDataModel` ops); both share the `a2ui-surface` activityType.
function surfaceMessages(event: ConverseEvent): Array<Record<string, unknown>> {
  const content = eventData(event).content as Record<string, unknown>;
  return content.messages as Array<Record<string, unknown>>;
}

// Finds the single `a2ui-surface` ACTIVITY_SNAPSHOT that (re-)creates the surface and returns its
// createSurface envelope. The surface is only created by the initial "water sports" response;
// action responses never carry a createSurface message.
function findCreateSurface(events: ConverseEvent[]): Record<string, unknown> | undefined {
  const activity = events.find(
    (e) =>
      e.event === 'ACTIVITY_SNAPSHOT' &&
      eventData(e).activityType === 'a2ui-surface' &&
      surfaceMessages(e).some((m) => m.createSurface !== undefined)
  );
  if (!activity) {
    return undefined;
  }
  const message = surfaceMessages(activity).find((m) => m.createSurface !== undefined)!;
  return message.createSurface as Record<string, unknown>;
}

// Collects the resolved per-component state from the updateDataModel ops. Component_State is now
// transported inline as whole-component `/state/<id>` writes on `a2ui-surface` activities rather
// than as an AG-UI STATE_SNAPSHOT, so the map replaces the removed `snapshot.components` lookup:
// each `/state/<id>` op contributes `{ [id]: value }`. Later ops win, matching the mock re-emitting
// the whole component value on every response.
function collectComponentState(events: ConverseEvent[]): Record<string, unknown> {
  const components: Record<string, unknown> = {};
  for (const event of events) {
    if (event.event !== 'ACTIVITY_SNAPSHOT' || eventData(event).activityType !== 'a2ui-surface') {
      continue;
    }
    for (const message of surfaceMessages(event)) {
      const op = message.updateDataModel as Record<string, unknown> | undefined;
      if (!op) {
        continue;
      }
      const path = op.path as string;
      if (!path.startsWith(STATE_PREFIX)) {
        continue;
      }
      const id = path.slice(STATE_PREFIX.length);
      components[id] = op.value;
    }
  }
  return components;
}

describe('schema-response-search decomposed surface structure', () => {
  const events: ConverseEvent[] = resetSurface();
  const createSurface = findCreateSurface(events);
  const components = collectComponentState(events);

  describe('createSurface activity snapshot', () => {
    it('emits an a2ui-surface ACTIVITY_SNAPSHOT that creates the surface', () => {
      const activity = events.find(
        (e) => e.event === 'ACTIVITY_SNAPSHOT' && eventData(e).activityType === 'a2ui-surface'
      );
      expect(activity).toBeDefined();
      expect(createSurface).toBeDefined();
    });

    it('assembles the A2-UI v1.0 createSurface envelope with a canonical root node', () => {
      expect(typeof createSurface!.surfaceId).toBe('string');
      expect(typeof createSurface!.catalogId).toBe('string');
      const nodes = createSurface!.components as Array<Record<string, unknown>>;
      const rootNode = nodes.find((c) => c.id === 'root');
      expect(rootNode).toBeDefined();
      expect(rootNode!.component).toBe('CommerceSearch');
    });

    it('includes individual decomposed components', () => {
      const nodes = createSurface!.components as Array<Record<string, unknown>>;
      const componentIds = nodes.map((c) => c.id);
      expect(componentIds).toContain('query-summary-2');
      expect(componentIds).toContain('product-list-2');
      expect(componentIds).toContain('pagination-2');
      expect(componentIds).toContain('sort-2');
      expect(componentIds).toContain('page-size-2');
    });

    it('composes the two-column layout from generic LayoutStack nodes', () => {
      const nodes = createSurface!.components as Array<Record<string, unknown>>;
      const nodeMap = new Map(nodes.map((c) => [c.id, c]));

      // The CommerceSearch root composes the sidebar and main columns via named ComponentId slots.
      const root = nodeMap.get('root')!;
      expect(root.sidebarChild).toBe('search-sidebar');
      expect(root.mainChild).toBe('search-main');

      // Each layout region is a LayoutStack carrying its direction as a top-level node prop.
      const layoutRegions: [string, 'column' | 'row'][] = [
        ['search-sidebar', 'column'],
        ['search-main', 'column'],
        ['search-top', 'row'],
        ['search-bottom', 'row'],
      ];
      for (const [id, direction] of layoutRegions) {
        const entry = nodeMap.get(id);
        expect(entry, `expected surface to declare ${id}`).toBeDefined();
        expect(entry!.component).toBe('LayoutStack');
        expect(entry!.direction).toBe(direction);
      }

      // The top row places the summary before the sort; the bottom row pagination before page size.
      expect(nodeMap.get('search-top')!.children as string[]).toEqual([
        'query-summary-2',
        'sort-2',
      ]);
      expect(nodeMap.get('search-bottom')!.children as string[]).toEqual([
        'pagination-2',
        'page-size-2',
      ]);
    });

    it('includes the three facets and a facet manager', () => {
      const nodes = createSurface!.components as Array<Record<string, unknown>>;
      const nodeMap = new Map(nodes.map((c) => [c.id, c]));

      const expected: [string, string][] = [
        ['facet-brand-2', 'RegularFacet'],
        ['facet-price-2', 'NumericFacet'],
        ['facet-category-2', 'CategoryFacet'],
        ['facet-manager-2', 'FacetManager'],
      ];
      for (const [id, component] of expected) {
        const entry = nodeMap.get(id);
        expect(entry, `expected surface to declare ${id}`).toBeDefined();
        expect(entry!.component).toBe(component);
      }

      // The facet-manager expresses facet ordering via its children (composition plane).
      expect(nodeMap.get('facet-manager-2')!.children as string[]).toEqual([
        'facet-brand-2',
        'facet-price-2',
        'facet-category-2',
      ]);
    });

    it('has the correct PascalCase component discriminant for each non-facet component', () => {
      const nodes = createSurface!.components as Array<Record<string, unknown>>;
      const nodeMap = new Map(nodes.map((c) => [c.id, c]));
      expect(nodeMap.get('query-summary-2')!.component).toBe('QuerySummary');
      expect(nodeMap.get('product-list-2')!.component).toBe('ProductList');
      expect(nodeMap.get('pagination-2')!.component).toBe('Pagination');
      expect(nodeMap.get('sort-2')!.component).toBe('Sort');
      expect(nodeMap.get('page-size-2')!.component).toBe('PageSize');
    });

    it('does not contain a monolithic ProductSearchSurface root component', () => {
      const nodes = createSurface!.components as Array<Record<string, unknown>>;
      const componentNames = nodes.map((c) => c.component);
      expect(componentNames).not.toContain('ProductSearchSurface');
      expect(componentNames).not.toContain('ProductListingSurface');
    });
  });

  describe('inline component state via updateDataModel ops', () => {
    it('writes per-component state under /state/<id> for the stateful nodes', () => {
      expect(Object.keys(components).length).toBeGreaterThan(0);
      expect(components['query-summary-2']).toBeDefined();
      expect(components['product-list-2']).toBeDefined();
      expect(components['pagination-2']).toBeDefined();
      expect(components['sort-2']).toBeDefined();
      expect(components['page-size-2']).toBeDefined();
    });

    it('delivers state for query-summary-2 with the result-window aggregate', () => {
      const summaryState = components['query-summary-2'] as Record<string, unknown>;
      expect(summaryState).toBeDefined();
      expect(typeof summaryState.query).toBe('string');
      expect(typeof summaryState.firstIndex).toBe('number');
      expect(typeof summaryState.lastIndex).toBe('number');
      expect(typeof summaryState.totalEntries).toBe('number');
    });

    it('delivers state for page-size-2 with the current pageSize', () => {
      const pageSizeState = components['page-size-2'] as Record<string, unknown>;
      expect(pageSizeState).toBeDefined();
      expect(typeof pageSizeState.pageSize).toBe('number');
    });

    it('delivers state for product-list-2 with products array', () => {
      const productListState = components['product-list-2'] as Record<string, unknown>;
      expect(productListState).toBeDefined();
      expect(Array.isArray(productListState.products)).toBe(true);
      expect((productListState.products as unknown[]).length).toBeGreaterThan(0);
    });

    it('delivers state for pagination-2 with page, pageSize, totalEntries, totalPages', () => {
      const paginationState = components['pagination-2'] as Record<string, unknown>;
      expect(paginationState).toBeDefined();
      expect(typeof paginationState.page).toBe('number');
      expect(typeof paginationState.pageSize).toBe('number');
      expect(typeof paginationState.totalEntries).toBe('number');
      expect(typeof paginationState.totalPages).toBe('number');
    });

    it('delivers state for sort-2 with appliedSort and availableSorts', () => {
      const sortState = components['sort-2'] as Record<string, unknown>;
      expect(sortState).toBeDefined();
      expect(sortState.appliedSort).toBeDefined();
      expect(Array.isArray(sortState.availableSorts)).toBe(true);
    });

    it('delivers brand facet values and writes no state for the facet manager', () => {
      const brandFacet = components['facet-brand-2'] as Record<string, unknown>;
      expect(Array.isArray(brandFacet.values)).toBe(true);
      expect((brandFacet.values as unknown[]).length).toBeGreaterThan(0);

      // FacetManager owns no Component_State: ordering lives on its node `children` (asserted in
      // the createSurface block), so it emits no `/state/<id>` op.
      expect(components['facet-manager-2']).toBeUndefined();
    });
  });
});

describe('schema-response-search initial response totals', () => {
  const events = resetSurface();
  const components = collectComponentState(events);

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

  it('selectPage returns the requested page and its product slice', () => {
    const events = buildSearchActionEvents({name: 'selectPage', context: {page: 3}});
    const components = collectComponentState(events);
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
    const components = collectComponentState(events);
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
    const components = collectComponentState(events);
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
    const components = collectComponentState(events);
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

  it('does not re-create the surface (no createSurface activity) for action responses', () => {
    const events = buildSearchActionEvents({name: 'selectPage', context: {page: 1}});
    expect(findCreateSurface(events)).toBeUndefined();
  });
});

describe('schema-response-search stateful surface across actions', () => {
  beforeEach(() => {
    resetSurface();
  });

  it('preserves the sort criteria when changing page after sorting', () => {
    buildSearchActionEvents({name: 'selectSort', context: {sortCriteria: 'price_asc'}});
    const events = buildSearchActionEvents({name: 'selectPage', context: {page: 1}});
    const components = collectComponentState(events);
    const sort = components['sort-2'] as Record<string, unknown>;
    const pagination = components['pagination-2'] as Record<string, unknown>;
    expect((sort.appliedSort as Record<string, unknown>).sortCriteria).toBe('price_asc');
    expect(pagination.page).toBe(1);
  });

  it('preserves the page size when changing page after resizing', () => {
    buildSearchActionEvents({name: 'setPageSize', context: {pageSize: 6}});
    const events = buildSearchActionEvents({name: 'selectPage', context: {page: 2}});
    const components = collectComponentState(events);
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
    const components = collectComponentState(events);
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
    const components = collectComponentState(events);
    const pagination = components['pagination-2'] as Record<string, unknown>;
    const sort = components['sort-2'] as Record<string, unknown>;
    expect(pagination.page).toBe(0);
    expect(pagination.pageSize).toBe(12);
    expect(pagination.totalEntries).toBe(43);
    expect((sort.appliedSort as Record<string, unknown>).sortCriteria).toBe('relevance');
  });
});
