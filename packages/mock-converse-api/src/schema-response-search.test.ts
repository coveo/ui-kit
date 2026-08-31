import {describe, it, expect} from 'vitest';
import {converseSchemaResponses} from '@coveo/platform-mock-api/converse';
import type {ConverseEvent} from '@coveo/platform-mock-api/converse';

const {matchSchemaPrompt} = converseSchemaResponses;

describe('schema-response-search decomposed surface structure', () => {
  const events: ConverseEvent[] = matchSchemaPrompt('wetsuits');

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

    it('includes surfaceType: commerceSearch in the createSurface payload', () => {
      const content = (activitySnapshot!.data as Record<string, unknown>).content as Record<
        string,
        unknown
      >;
      const messages = content.messages as Array<Record<string, unknown>>;
      const createSurface = messages[0].createSurface as Record<string, unknown>;

      expect(createSurface.surfaceType).toBe('commerceSearch');
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

      expect(componentIds).toContain('search-box-1');
      expect(componentIds).toContain('product-list-1');
      expect(componentIds).toContain('pagination-1');
      expect(componentIds).toContain('sort-1');
    });

    it('has correct componentType in props for each component', () => {
      const content = (activitySnapshot!.data as Record<string, unknown>).content as Record<
        string,
        unknown
      >;
      const messages = content.messages as Array<Record<string, unknown>>;
      const createSurface = messages[0].createSurface as Record<string, unknown>;
      const components = createSurface.components as Array<Record<string, unknown>>;

      const componentMap = new Map(components.map((c) => [c.id, c]));

      expect(
        (componentMap.get('search-box-1')!.props as Record<string, unknown>).componentType
      ).toBe('search-box');
      expect(
        (componentMap.get('product-list-1')!.props as Record<string, unknown>).componentType
      ).toBe('product-list');
      expect(
        (componentMap.get('pagination-1')!.props as Record<string, unknown>).componentType
      ).toBe('pagination');
      expect((componentMap.get('sort-1')!.props as Record<string, unknown>).componentType).toBe(
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

    it('delivers state for search-box-1 with query', () => {
      const components = getComponents();
      const searchBoxState = components['search-box-1'] as Record<string, unknown>;

      expect(searchBoxState).toBeDefined();
      expect(typeof searchBoxState.query).toBe('string');
    });

    it('delivers state for product-list-1 with products array', () => {
      const components = getComponents();
      const productListState = components['product-list-1'] as Record<string, unknown>;

      expect(productListState).toBeDefined();
      expect(Array.isArray(productListState.products)).toBe(true);
      expect((productListState.products as unknown[]).length).toBeGreaterThan(0);
    });

    it('delivers state for pagination-1 with page, pageSize, totalEntries, totalPages', () => {
      const components = getComponents();
      const paginationState = components['pagination-1'] as Record<string, unknown>;

      expect(paginationState).toBeDefined();
      expect(typeof paginationState.page).toBe('number');
      expect(typeof paginationState.pageSize).toBe('number');
      expect(typeof paginationState.totalEntries).toBe('number');
      expect(typeof paginationState.totalPages).toBe('number');
    });

    it('delivers state for sort-1 with appliedSort and availableSorts', () => {
      const components = getComponents();
      const sortState = components['sort-1'] as Record<string, unknown>;

      expect(sortState).toBeDefined();
      expect(sortState.appliedSort).toBeDefined();
      expect(Array.isArray(sortState.availableSorts)).toBe(true);
    });
  });
});
