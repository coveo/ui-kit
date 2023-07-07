import {SearchAppState} from '../../state/search-app-state';
import {buildMockCategoryFacetRequest} from '../../test/mock-category-facet-request';
import {buildMockCategoryFacetSlice} from '../../test/mock-category-facet-slice';
import {buildMockDateFacetRequest} from '../../test/mock-date-facet-request';
import {buildMockDateFacetSlice} from '../../test/mock-date-facet-slice';
import {buildMockDateFacetValue} from '../../test/mock-date-facet-value';
import {buildMockFacetOptions} from '../../test/mock-facet-options';
import {buildFacetOptionsSlice} from '../../test/mock-facet-options-slice';
import {buildMockFacetRequest} from '../../test/mock-facet-request';
import {buildMockFacetSlice} from '../../test/mock-facet-slice';
import {buildMockNumericFacetRequest} from '../../test/mock-numeric-facet-request';
import {buildMockNumericFacetSlice} from '../../test/mock-numeric-facet-slice';
import {createMockState} from '../../test/mock-state';
import {buildMockStaticFilterSlice} from '../../test/mock-static-filter-slice';
import {buildMockStaticFilterValue} from '../../test/mock-static-filter-value';
import {buildMockTabSlice} from '../../test/mock-tab-state';
import {maximumNumberOfResultsFromIndex} from '../pagination/pagination-constants';
import {buildSearchRequest} from './search-request';

describe('search request', () => {
  let state: SearchAppState;

  beforeEach(() => {
    state = createMockState();
  });

  it('#searchRequest returns the state #query', async () => {
    state.query.q = 'hello';
    const params = (await buildSearchRequest(state)).request;

    expect(params.q).toBe(state.query.q);
  });

  it('#searchRequest returns the state #enableQuerySyntax', async () => {
    state.query.enableQuerySyntax = true;
    const params = (await buildSearchRequest(state)).request;

    expect(params.enableQuerySyntax).toBe(state.query.enableQuerySyntax);
  });

  it('#searchRequest returns the state #sortCriteria', async () => {
    state.sortCriteria = 'qre';
    const params = (await buildSearchRequest(state)).request;

    expect(params.sortCriteria).toBe(state.sortCriteria);
  });

  it('#searchRequest returns the state #numberOfResults', async () => {
    state.pagination.numberOfResults = 10;
    const params = (await buildSearchRequest(state)).request;

    expect(params.numberOfResults).toBe(state.pagination.numberOfResults);
  });

  it('#searchRequest will modify #numberOfResults if it goes over index limits', async () => {
    state.pagination.numberOfResults = 10;
    state.pagination.firstResult = maximumNumberOfResultsFromIndex - 9;

    const params = (await buildSearchRequest(state)).request;

    expect(params.numberOfResults).toBe(9);
  });

  it('#searchRequest returns the state #firstResult', async () => {
    state.pagination.firstResult = 10;
    const params = (await buildSearchRequest(state)).request;

    expect(params.firstResult).toBe(state.pagination.firstResult);
  });

  it('#searchRequest returns the state #dictionaryFieldContext.contextValues', async () => {
    const contextValues = {price: 'cad'};
    state.dictionaryFieldContext.contextValues = contextValues;
    const params = (await buildSearchRequest(state)).request;

    expect(params.dictionaryFieldContext).toBe(contextValues);
  });

  it('#searchRequest returns the facets in the state #facetSet', async () => {
    const request = buildMockFacetRequest({field: 'objecttype'});
    state.facetSet[1] = buildMockFacetSlice({request});
    const {facets} = (await buildSearchRequest(state)).request;

    expect(facets).toContainEqual(request);
  });

  it('#searchRequest returns the facet state alphanumericDescending #sortCriteria', async () => {
    const request = buildMockFacetRequest({
      field: 'objecttype',
      sortCriteria: 'alphanumericDescending',
    });
    state.facetSet[1] = buildMockFacetSlice({request});
    const {facets} = (await buildSearchRequest(state)).request;

    expect(facets?.map((f) => f.sortCriteria)).toContainEqual({
      order: 'descending',
      type: 'alphanumeric',
    });
  });

  it('#searchRequest returns the facets in the state #numericFacetSet', async () => {
    const request = buildMockNumericFacetRequest({
      field: 'objecttype',
      currentValues: [{start: 0, end: 10, endInclusive: true, state: 'idle'}],
    });
    state.numericFacetSet[1] = buildMockNumericFacetSlice({request});

    const {facets} = (await buildSearchRequest(state)).request;
    expect(facets).toContainEqual(request);
  });

  it('#searchRequest strips facet values in #numericFacetSet for facets with generateAutomaticRanges & no selected values', async () => {
    const request = buildMockNumericFacetRequest({
      field: 'objecttype',
      currentValues: [{start: 0, end: 10, endInclusive: true, state: 'idle'}],
      generateAutomaticRanges: true,
    });
    state.numericFacetSet[1] = buildMockNumericFacetSlice({request});

    const {facets} = (await buildSearchRequest(state)).request;
    expect(facets).toContainEqual(
      buildMockNumericFacetRequest({
        field: 'objecttype',
        currentValues: [],
        generateAutomaticRanges: true,
      })
    );
  });

  it('#searchRequest does not strips facet values in #numericFacetSet for facets with generateAutomaticRanges & selected values', async () => {
    const request = buildMockNumericFacetRequest({
      field: 'objecttype',
      currentValues: [
        {start: 0, end: 10, endInclusive: true, state: 'idle'},
        {start: 0, end: 10, endInclusive: true, state: 'selected'},
      ],
      generateAutomaticRanges: true,
    });
    state.numericFacetSet[1] = buildMockNumericFacetSlice({request});

    const {facets} = (await buildSearchRequest(state)).request;
    expect(facets).toContainEqual(request);
  });

  it('#searchRequest returns the facets in the state #dateFacetSet', async () => {
    const request = buildMockDateFacetRequest({
      field: 'date',
      currentValues: [buildMockDateFacetValue({state: 'idle'})],
    });
    state.dateFacetSet[1] = buildMockDateFacetSlice({request});

    const {facets} = (await buildSearchRequest(state)).request;
    expect(facets).toContainEqual(request);
  });

  it('#searchRequest strips facet values in #dateFacetSet for facets with generateAutomaticRanges & no selected values', async () => {
    const request = buildMockDateFacetRequest({
      field: 'date',
      currentValues: [buildMockDateFacetValue({state: 'idle'})],
      generateAutomaticRanges: true,
    });
    state.dateFacetSet[1] = buildMockDateFacetSlice({request});

    const {facets} = (await buildSearchRequest(state)).request;
    expect(facets).toContainEqual(
      buildMockDateFacetRequest({
        field: 'date',
        currentValues: [],
        generateAutomaticRanges: true,
      })
    );
  });

  it('#searchRequest does not strips facet values in #dateFacetSet for facets with generateAutomaticRanges & selected values', async () => {
    const request = buildMockDateFacetRequest({
      field: 'date',
      currentValues: [
        buildMockDateFacetValue({state: 'idle'}),
        buildMockDateFacetValue({state: 'selected'}),
      ],
      generateAutomaticRanges: true,
    });
    state.dateFacetSet[1] = buildMockDateFacetSlice({request});

    const {facets} = (await buildSearchRequest(state)).request;
    expect(facets).toContainEqual(request);
  });

  it('#searchRequestParams returns the facets in the #categoryFacetSet', async () => {
    const request = buildMockCategoryFacetRequest({field: 'objecttype'});
    state.categoryFacetSet[1] = buildMockCategoryFacetSlice({request});

    const {facets} = (await buildSearchRequest(state)).request;
    expect(facets).toContainEqual(request);
  });

  it("#searchRequestParams doesn't return the disabled facets", async () => {
    const enabledFacetRequest = buildMockFacetRequest({
      field: 'a',
      facetId: 'a',
    });
    const disabledFacetRequest = buildMockFacetRequest({
      field: 'b',
      facetId: 'b',
    });
    const enabledNumericFacetRequest = buildMockNumericFacetRequest({
      field: 'c',
      facetId: 'c',
    });
    const disabledNumericFacetRequest = buildMockNumericFacetRequest({
      field: 'd',
      facetId: 'd',
    });
    const enabledDateFacetRequest = buildMockDateFacetRequest({
      field: 'e',
      facetId: 'e',
    });
    const disabledDateFacetRequest = buildMockDateFacetRequest({
      field: 'f',
      facetId: 'f',
    });
    const enabledCategoryFacetRequest = buildMockCategoryFacetRequest({
      field: 'g',
      facetId: 'g',
    });
    const disabledCategoryFacetRequest = buildMockCategoryFacetRequest({
      field: 'h',
      facetId: 'h',
    });

    state.facetSet['a'] = buildMockFacetSlice({request: enabledFacetRequest});
    state.facetSet['b'] = buildMockFacetSlice({request: disabledFacetRequest});
    state.numericFacetSet['c'] = buildMockNumericFacetSlice({
      request: enabledNumericFacetRequest,
    });
    state.numericFacetSet['d'] = buildMockNumericFacetSlice({
      request: disabledNumericFacetRequest,
    });
    state.dateFacetSet['e'] = buildMockDateFacetSlice({
      request: enabledDateFacetRequest,
    });
    state.dateFacetSet['f'] = buildMockDateFacetSlice({
      request: disabledDateFacetRequest,
    });
    state.categoryFacetSet['g'] = buildMockCategoryFacetSlice({
      request: enabledCategoryFacetRequest,
    });
    state.categoryFacetSet['h'] = buildMockCategoryFacetSlice({
      request: disabledCategoryFacetRequest,
    });

    state.facetOptions.facets['a'] = buildFacetOptionsSlice();
    state.facetOptions.facets['b'] = buildFacetOptionsSlice({enabled: false});
    state.facetOptions.facets['c'] = buildFacetOptionsSlice();
    state.facetOptions.facets['d'] = buildFacetOptionsSlice({enabled: false});
    state.facetOptions.facets['e'] = buildFacetOptionsSlice();
    state.facetOptions.facets['f'] = buildFacetOptionsSlice({enabled: false});
    state.facetOptions.facets['g'] = buildFacetOptionsSlice();
    state.facetOptions.facets['h'] = buildFacetOptionsSlice({enabled: false});

    const {facets} = (await buildSearchRequest(state)).request;
    expect(facets).toContainEqual(enabledFacetRequest);
    expect(facets).toContainEqual(enabledNumericFacetRequest);
    expect(facets).toContainEqual(enabledDateFacetRequest);
    expect(facets).toContainEqual(enabledCategoryFacetRequest);
    expect(facets).not.toContainEqual(disabledFacetRequest);
    expect(facets).not.toContainEqual(disabledNumericFacetRequest);
    expect(facets).not.toContainEqual(disabledDateFacetRequest);
    expect(facets).not.toContainEqual(disabledCategoryFacetRequest);
  });

  it('when no facets are configured, the #searchRequestParams does not contain a #facets key', async () => {
    const request = (await buildSearchRequest(state)).request;
    expect(request.facets).toBe(undefined);
  });

  it(`when there are facets ids in the same order as the facetOrder array,
  #searchRequestParams orders the facets in the same order as the response`, async () => {
    const facetId1 = '1';
    const facetId2 = '2';

    state.facetOrder = [facetId2, facetId1];

    state.facetSet[facetId1] = buildMockFacetSlice({
      request: buildMockFacetRequest({facetId: facetId1}),
    });
    state.facetSet[facetId2] = buildMockFacetSlice({
      request: buildMockFacetRequest({facetId: facetId2}),
    });

    const {facets} = (await buildSearchRequest(state)).request;
    expect(facets).toEqual([
      state.facetSet[facetId2].request,
      state.facetSet[facetId1].request,
    ]);
  });

  it(`when there is a facet id that is not in the facetOrder array,
  #searchRequestParams includes it at the end of the facets array`, async () => {
    const facetId1 = '1';
    const facetId2 = '2';

    state.facetOrder = [facetId2];

    state.facetSet[facetId1] = buildMockFacetSlice({
      request: buildMockFacetRequest({facetId: facetId1}),
    });
    state.facetSet[facetId2] = buildMockFacetSlice({
      request: buildMockFacetRequest({facetId: facetId2}),
    });

    const {facets} = (await buildSearchRequest(state)).request;
    expect(facets).toEqual([
      state.facetSet[facetId2].request,
      state.facetSet[facetId1].request,
    ]);
  });

  it('#searchRequestParams returns the freezeFacetOrder in state', async () => {
    state.facetOptions = buildMockFacetOptions({freezeFacetOrder: true});

    const params = (await buildSearchRequest(state)).request;
    expect(params.facetOptions).toEqual({
      freezeFacetOrder: state.facetOptions.freezeFacetOrder,
    });
  });

  it('should send visitorId if analytics is enable', async () => {
    state.configuration.analytics.enabled = true;
    expect((await buildSearchRequest(state)).request.visitorId).toBeDefined();
  });

  it('should not send visitorId if analytics is disabled', async () => {
    state.configuration.analytics.enabled = false;
    expect(
      (await buildSearchRequest(state)).request.visitorId
    ).not.toBeDefined();
  });

  it('#searchRequest.tab holds the #originLevel2', async () => {
    const originLevel2 = 'youtube';
    state.configuration.analytics.originLevel2 = originLevel2;
    expect((await buildSearchRequest(state)).request.tab).toBe(originLevel2);
  });

  it('#searchRequest.referrer holds the #originLevel3', async () => {
    const originLevel3 = 'www.coveo.com';
    state.configuration.analytics.originLevel3 = originLevel3;
    expect((await buildSearchRequest(state)).request.referrer).toBe(
      originLevel3
    );
  });

  it('#searchRequest.fieldsToInclude holds the #fieldsToInclude', async () => {
    state.fields.fieldsToInclude = ['foo', 'bar'];
    expect((await buildSearchRequest(state)).request.fieldsToInclude).toEqual(
      expect.arrayContaining(['foo', 'bar'])
    );
  });

  it('#searchRequest.fieldsToInclude does not holds #fieldsToInclude if #fetchAllFields is active', async () => {
    state.fields.fieldsToInclude = ['foo', 'bar'];
    state.fields.fetchAllFields = true;
    expect(
      (await buildSearchRequest(state)).request.fieldsToInclude
    ).not.toBeDefined();
  });

  it('when there are no cq expressions in state, cq is undefined', async () => {
    expect((await buildSearchRequest(state)).request.cq).toBe(undefined);
  });

  it('when there is a cq expression, it sets the cq to the expression', async () => {
    state.advancedSearchQueries.cq = 'a';
    expect((await buildSearchRequest(state)).request.cq).toBe('a');
  });

  it('when there is an active tab, it sets cq to the active tab expression', async () => {
    state.tabSet.a = buildMockTabSlice({expression: 'a', isActive: true});
    expect((await buildSearchRequest(state)).request.cq).toBe('a');
  });

  it(`when there is cq and an active tab,
  it sets the cq to a concatenated expression`, async () => {
    state.advancedSearchQueries.cq = 'a';
    state.tabSet.b = buildMockTabSlice({expression: 'b', isActive: true});

    expect((await buildSearchRequest(state)).request.cq).toBe('a AND b');
  });

  it(`when the cq and active tab expressions are surrounded by spaces,
  it trims them before concatenating`, async () => {
    state.advancedSearchQueries.cq = ' a ';
    state.tabSet.b = buildMockTabSlice({expression: ' b ', isActive: true});

    expect((await buildSearchRequest(state)).request.cq).toBe('a AND b');
  });

  it('static filter with an active value, it sets cq to the active filter value expression', async () => {
    const value = buildMockStaticFilterValue({
      expression: 'a',
      state: 'selected',
    });
    state.staticFilterSet.a = buildMockStaticFilterSlice({values: [value]});
    expect((await buildSearchRequest(state)).request.cq).toBe('a');
  });

  it(`static filter with two active values,
  it concatenates the expressions with OR and wraps them with parentheses`, async () => {
    const valueA = buildMockStaticFilterValue({
      expression: 'a',
      state: 'selected',
    });
    const valueB = buildMockStaticFilterValue({
      expression: 'b',
      state: 'selected',
    });

    state.staticFilterSet.a = buildMockStaticFilterSlice({
      values: [valueA, valueB],
    });
    expect((await buildSearchRequest(state)).request.cq).toBe('(a OR b)');
  });

  it(`static filter with two active values, one value has an empty space as an expression,
  it filters off the empty expression`, async () => {
    const valueA = buildMockStaticFilterValue({
      expression: 'a',
      state: 'selected',
    });
    const valueB = buildMockStaticFilterValue({
      expression: ' ',
      state: 'selected',
    });

    state.staticFilterSet.a = buildMockStaticFilterSlice({
      values: [valueA, valueB],
    });
    expect((await buildSearchRequest(state)).request.cq).toBe('a');
  });
});
