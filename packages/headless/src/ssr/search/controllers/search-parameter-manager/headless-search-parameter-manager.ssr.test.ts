import {
  buildSearchParameterManager,
  type SearchParameterManager,
} from '../../../../controllers/search-parameter-manager/headless-search-parameter-manager.js';
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
import {createMockState} from '../../../../test/mock-state.js';
import type {ControllerDefinitionWithProps} from '../../../common/types/controllers.js';
import type {SSRSearchEngine} from '../../engine/search-engine.ssr.js';
import {
  defineSearchParameterManager,
  type SearchParameterManagerBuildProps,
} from './headless-search-parameter-manager.ssr.js';

vi.mock(
  '../../../../controllers/search-parameter-manager/headless-search-parameter-manager.js'
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
    expect(
      searchParameterManagerDefinition
    ).toMatchObject<SearchParameterManagerDefinitionType>({
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

    expect(buildSearchParameterManagerMock).toBeCalledWith(engine, props);
  });
});
