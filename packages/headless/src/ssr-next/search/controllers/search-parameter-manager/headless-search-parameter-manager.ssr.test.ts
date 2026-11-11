import {beforeEach, describe, expect, it, vi} from 'vitest';
import {buildSearchParameterManager} from '../../../../controllers/search-parameter-manager/headless-search-parameter-manager.js';
import {advancedSearchQueriesReducer} from '../../../../features/advanced-search-queries/advanced-search-queries-slice.js';
import {configurationReducer} from '../../../../features/configuration/configuration-slice.js';
import {debugReducer} from '../../../../features/debug/debug-slice.js';
import {facetOptionsReducer} from '../../../../features/facet-options/facet-options-slice.js';
import {automaticFacetSetReducer} from '../../../../features/facets/automatic-facet-set/automatic-facet-set-slice.js';
import {categoryFacetSetReducer} from '../../../../features/facets/category-facet-set/category-facet-set-slice.js';
import {facetSetReducer} from '../../../../features/facets/facet-set/facet-set-slice.js';
import {dateFacetSetReducer} from '../../../../features/facets/range-facets/date-facet-set/date-facet-set-slice.js';
import {numericFacetSetReducer} from '../../../../features/facets/range-facets/numeric-facet-set/numeric-facet-set-slice.js';
import {paginationReducer} from '../../../../features/pagination/pagination-slice.js';
import {queryReducer} from '../../../../features/query/query-slice.js';
import {sortCriteriaReducer} from '../../../../features/sort-criteria/sort-criteria-slice.js';
import {staticFilterSetReducer} from '../../../../features/static-filter-set/static-filter-set-slice.js';
import {tabSetReducer} from '../../../../features/tab-set/tab-set-slice.js';
import {buildMockSSRSearchEngine} from '../../../../test/mock-engine-v2.js';
import {buildMockNavigatorContext} from '../../../../test/mock-navigator-context.js';
import {createMockState} from '../../../../test/mock-state.js';
import type {SSRSearchEngine} from '../../types/build.js';
import {
  defineSearchParameterManager,
  type SearchParameterManagerDefinition,
} from './headless-search-parameter-manager.ssr.js';

vi.mock('../../../../controllers/search-parameter-manager/headless-search-parameter-manager.js');
const buildSearchParameterManagerMock = vi.mocked(buildSearchParameterManager);

describe('define search parameter manager', () => {
  let definition: SearchParameterManagerDefinition;
  let engine: SSRSearchEngine;

  beforeEach(() => {
    definition = defineSearchParameterManager();
    engine = buildMockSSRSearchEngine(createMockState());
    buildSearchParameterManagerMock.mockClear();
  });

  it('should return a definition with a build function', () => {
    expect(definition).toMatchObject<SearchParameterManagerDefinition>({
      build: expect.any(Function),
    });
  });

  it('should add the reducers the parameter manager needs to the engine', () => {
    definition.build(engine, {buildConfig: {navigatorContext: buildMockNavigatorContext()}});

    expect(engine.addReducers).toHaveBeenCalledWith({
      advancedSearchQueries: advancedSearchQueriesReducer,
      automaticFacetSet: automaticFacetSetReducer,
      categoryFacetSet: categoryFacetSetReducer,
      configuration: configurationReducer,
      dateFacetSet: dateFacetSetReducer,
      debug: debugReducer,
      facetOptions: facetOptionsReducer,
      facetSet: facetSetReducer,
      numericFacetSet: numericFacetSetReducer,
      pagination: paginationReducer,
      query: queryReducer,
      sortCriteria: sortCriteriaReducer,
      staticFilterSet: staticFilterSetReducer,
      tabSet: tabSetReducer,
    });
  });

  it('should build the parameter manager with the search params passed to fetchStaticState()', () => {
    definition.build(engine, {
      buildConfig: {
        navigatorContext: buildMockNavigatorContext(),
        searchParams: {q: 'test', firstResult: 10},
      },
    });

    expect(buildSearchParameterManagerMock).toHaveBeenCalledWith(engine, {
      initialState: {parameters: {q: 'test', firstResult: 10}},
    });
  });

  it('should build the parameter manager with no parameters when the request carries none', () => {
    definition.build(engine, {buildConfig: {navigatorContext: buildMockNavigatorContext()}});

    expect(buildSearchParameterManagerMock).toHaveBeenCalledWith(engine, {
      initialState: {parameters: {}},
    });
  });
});
