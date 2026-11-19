import {
  buildSearchParameterManager,
  type SearchParameterManager,
} from '@coveo/headless-src/controllers/search-parameter-manager/headless-search-parameter-manager.js';
import {advancedSearchQueriesReducer} from '@coveo/headless-src/features/advanced-search-queries/advanced-search-queries-slice.js';
import {configurationReducer} from '@coveo/headless-src/features/configuration/configuration-slice.js';
import {debugReducer} from '@coveo/headless-src/features/debug/debug-slice.js';
import {facetOptionsReducer} from '@coveo/headless-src/features/facet-options/facet-options-slice.js';
import {automaticFacetSetReducer} from '@coveo/headless-src/features/facets/automatic-facet-set/automatic-facet-set-slice.js';
import {categoryFacetSetReducer} from '@coveo/headless-src/features/facets/category-facet-set/category-facet-set-slice.js';
import {facetSetReducer} from '@coveo/headless-src/features/facets/facet-set/facet-set-slice.js';
import {dateFacetSetReducer} from '@coveo/headless-src/features/facets/range-facets/date-facet-set/date-facet-set-slice.js';
import {numericFacetSetReducer} from '@coveo/headless-src/features/facets/range-facets/numeric-facet-set/numeric-facet-set-slice.js';
import {paginationReducer} from '@coveo/headless-src/features/pagination/pagination-slice.js';
import {queryReducer} from '@coveo/headless-src/features/query/query-slice.js';
import {sortCriteriaReducer} from '@coveo/headless-src/features/sort-criteria/sort-criteria-slice.js';
import {staticFilterSetReducer} from '@coveo/headless-src/features/static-filter-set/static-filter-set-slice.js';
import {tabSetReducer} from '@coveo/headless-src/features/tab-set/tab-set-slice.js';
import {buildMockSSRSearchEngine} from '@coveo/headless-src/test/mock-engine-v2.js';
import {createMockState} from '@coveo/headless-src/test/mock-state.js';
import type {SSRSearchEngine} from '../../engine/search-engine.ssr.js';
import type {ControllerDefinitionWithProps} from '../../types/controller-definition.js';
import {
  defineSearchParameterManager,
  type SearchParameterManagerBuildProps,
} from './headless-search-parameter-manager.ssr.js';

vi.mock(
  '@coveo/headless-src/controllers/search-parameter-manager/headless-search-parameter-manager.js'
);
const buildSearchParameterManagerMock = vi.mocked(buildSearchParameterManager);

type SearchParameterManagerDefinitionType = ControllerDefinitionWithProps<
  SSRSearchEngine,
  SearchParameterManager,
  SearchParameterManagerBuildProps
>;

describe('define search parameter manager', () => {
  let searchParameterManagerDefinition: SearchParameterManagerDefinitionType;

  beforeEach(() => {
    searchParameterManagerDefinition = defineSearchParameterManager();
    buildSearchParameterManagerMock.mockClear();
  });

  it('it adds the correct reducers to engine', () => {
    const engine: SSRSearchEngine = buildMockSSRSearchEngine(createMockState());
    const props: SearchParameterManagerBuildProps =
      {} as unknown as SearchParameterManagerBuildProps;

    searchParameterManagerDefinition.buildWithProps(engine, {
      initialState: props.initialState,
    });

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

  it('defineSearchParameterManager returns the proper type', () => {
    expect(searchParameterManagerDefinition).toMatchObject<SearchParameterManagerDefinitionType>({
      buildWithProps: expect.any(Function),
    });
  });

  it("buildWithProps should pass it's parameters to the buildSearchParameterManager", () => {
    const engine: SSRSearchEngine = buildMockSSRSearchEngine(createMockState());
    const props: SearchParameterManagerBuildProps =
      {} as unknown as SearchParameterManagerBuildProps;

    searchParameterManagerDefinition.buildWithProps(engine, {
      initialState: props.initialState,
    });

    expect(buildSearchParameterManagerMock).toHaveBeenCalledWith(engine, props);
  });
});
