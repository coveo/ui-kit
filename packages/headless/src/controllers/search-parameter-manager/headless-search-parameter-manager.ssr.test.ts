import {SSRSearchEngine} from '../../app/search-engine/search-engine.ssr';
import {ControllerDefinitionWithProps} from '../../app/ssr-engine/types/common';
import {configurationReducer} from '../../features/configuration/configuration-slice';
import {debugReducer} from '../../features/debug/debug-slice';
import {facetOptionsReducer} from '../../features/facet-options/facet-options-slice';
import {automaticFacetSetReducer} from '../../features/facets/automatic-facet-set/automatic-facet-set-slice';
import {categoryFacetSetReducer} from '../../features/facets/category-facet-set/category-facet-set-slice';
import {facetSetReducer} from '../../features/facets/facet-set/facet-set-slice';
import {dateFacetSetReducer} from '../../features/facets/range-facets/date-facet-set/date-facet-set-slice';
import {numericFacetSetReducer} from '../../features/facets/range-facets/numeric-facet-set/numeric-facet-set-slice';
import {paginationReducer} from '../../features/pagination/pagination-slice';
import {queryReducer} from '../../features/query/query-slice';
import {sortCriteriaReducer} from '../../features/sort-criteria/sort-criteria-slice';
import {staticFilterSetReducer} from '../../features/static-filter-set/static-filter-set-slice';
import {tabSetReducer} from '../../features/tab-set/tab-set-slice';
import {buildMockSSRSearchEngine} from '../../test/mock-engine-v2';
import {createMockState} from '../../test/mock-state';
import {advancedSearchQueriesReducer} from './../../features/advanced-search-queries/advanced-search-queries-slice';
import {
  SearchParameterManager,
  buildSearchParameterManager,
} from './headless-search-parameter-manager';
import {
  SearchParameterManagerBuildProps,
  defineSearchParameterManager,
} from './headless-search-parameter-manager.ssr';

jest.mock('./headless-search-parameter-manager');
const buildSearchParameterManagerMock = jest.mocked(
  buildSearchParameterManager
);

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
