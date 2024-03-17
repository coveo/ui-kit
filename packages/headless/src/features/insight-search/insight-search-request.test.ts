import {InsightAppState} from '../../state/insight-app-state';
import {buildMockCategoryFacetRequest} from '../../test/mock-category-facet-request';
import {buildMockCategoryFacetSlice} from '../../test/mock-category-facet-slice';
import {buildMockDateFacetRequest} from '../../test/mock-date-facet-request';
import {buildMockDateFacetSlice} from '../../test/mock-date-facet-slice';
import {buildMockFacetRequest} from '../../test/mock-facet-request';
import {buildMockFacetSlice} from '../../test/mock-facet-slice';
import {buildMockInsightState} from '../../test/mock-insight-state';
import {buildMockNumericFacetRequest} from '../../test/mock-numeric-facet-request';
import {buildMockNumericFacetSlice} from '../../test/mock-numeric-facet-slice';
import {buildMockTabSlice} from '../../test/mock-tab-state';
import {getConfigurationInitialState} from '../configuration/configuration-state';
import {CollectionId, getFoldingInitialState} from '../folding/folding-state';
import {maximumNumberOfResultsFromIndex} from '../pagination/pagination-constants';
import {
  buildInsightSearchRequest,
  buildInsightLoadCollectionRequest,
} from './insight-search-request';

describe('insight search request', () => {
  let state: InsightAppState;
  let collectionId: CollectionId;

  beforeEach(() => {
    state = buildMockInsightState();
    collectionId = 'mockCollectionId';
  });

  describe('when using buildInsightSearchRequest', () => {
    it('#buildInsightSearchRequest returns the values extracted from the #configuration state', async () => {
      state.configuration = {
        ...getConfigurationInitialState(),
        accessToken: '123',
        organizationId: 'foo',
        platformUrl: 'bar',
      };
      const params = (await buildInsightSearchRequest(state)).request;

      expect(params.accessToken).toBe(state.configuration.accessToken);
      expect(params.organizationId).toBe(state.configuration.organizationId);
      expect(params.url).toBe(state.configuration.platformUrl);
    });

    it('#buildInsightSearchRequest returns the state #insightId', async () => {
      state.insightConfiguration.insightId = '123';
      const params = (await buildInsightSearchRequest(state)).request;

      expect(params.insightId).toBe(state.insightConfiguration.insightId);
    });

    it('#buildInsightSearchRequest should add the correct analytics section', async () => {
      state.configuration.analytics.originLevel3 = 'foo';
      state.configuration.analytics.originContext = 'bar';
      state.configuration.analytics.analyticsMode = 'next';
      state.configuration.analytics.trackingId = '123';

      const exampleEventDescription = {
        actionCause: 'exampleActionCause',
      };

      const request = (
        await buildInsightSearchRequest(state, exampleEventDescription)
      ).request.analytics;

      expect(request?.documentReferrer).toBe(
        state.configuration.analytics.originLevel3
      );
      expect(request?.originContext).toBe(
        state.configuration.analytics.originContext
      );
      expect(request?.actionCause).toBe(exampleEventDescription.actionCause);
      expect(request?.trackingId).toBe(
        state.configuration.analytics.trackingId
      );
    });

    it('#buildInsightSearchRequest returns the state #query', async () => {
      state.query.q = 'hello';
      const params = (await buildInsightSearchRequest(state)).request;

      expect(params.q).toBe(state.query.q);
    });

    it('#searchRequest.tab holds the #originLevel2', async () => {
      const originLevel2 = 'youtube';
      state.configuration.analytics.originLevel2 = originLevel2;
      expect((await buildInsightSearchRequest(state)).request.tab).toBe(
        originLevel2
      );
    });

    it('#searchRequest.referrer holds the #originLevel3', async () => {
      const originLevel3 = 'www.coveo.com';
      state.configuration.analytics.originLevel3 = originLevel3;
      expect(
        (await buildInsightSearchRequest(state)).request.analytics
          ?.documentReferrer
      ).toBe(originLevel3);
    });

    it('#buildInsightSearchRequest returns the state #sortCriteria', async () => {
      state.sortCriteria = 'qre';
      const params = (await buildInsightSearchRequest(state)).request;

      expect(params.sortCriteria).toBe(state.sortCriteria);
    });

    it('#buildInsightSearchRequest returns the facets in the state #facetSet', async () => {
      const request = buildMockFacetRequest({field: 'objecttype'});
      state.facetSet[1] = buildMockFacetSlice({request});
      const {facets} = (await buildInsightSearchRequest(state)).request;

      expect(facets).toContainEqual(request);
    });

    it('#buildInsightSearchRequest returns the facets in the state #numericFacetSet', async () => {
      const request = buildMockNumericFacetRequest({field: 'objecttype'});
      state.numericFacetSet[1] = buildMockNumericFacetSlice({request});

      const {facets} = (await buildInsightSearchRequest(state)).request;
      expect(facets).toContainEqual(request);
    });

    it('#buildInsightSearchRequest returns the facets in the state #dateFacetSet', async () => {
      const request = buildMockDateFacetRequest({field: 'objecttype'});
      state.dateFacetSet[1] = buildMockDateFacetSlice({request});

      const {facets} = (await buildInsightSearchRequest(state)).request;
      expect(facets).toContainEqual(request);
    });

    it('#buildInsightSearchRequest returns the facets in the #categoryFacetSet', async () => {
      const request = buildMockCategoryFacetRequest({field: 'objecttype'});
      state.categoryFacetSet[1] = buildMockCategoryFacetSlice({request});

      const {facets} = (await buildInsightSearchRequest(state)).request;
      expect(facets).toContainEqual(request);
    });

    it('#buildInsightSearchRequest.fieldsToInclude holds the #fieldsToInclude', async () => {
      state.fields.fieldsToInclude = ['foo', 'bar'];
      expect(
        (await buildInsightSearchRequest(state)).request.fieldsToInclude
      ).toEqual(expect.arrayContaining(['foo', 'bar']));
    });

    it('#buildInsightSearchRequest.fieldsToInclude does not holds #fieldsToInclude if #fetchAllFields is active', async () => {
      state.fields.fieldsToInclude = ['foo', 'bar'];
      state.fields.fetchAllFields = true;
      expect(
        (await buildInsightSearchRequest(state)).request.fieldsToInclude
      ).toBeUndefined();
    });

    it('#buildInsightSearchRequest returns the state #numberOfResults', async () => {
      state.pagination.numberOfResults = 10;
      const params = (await buildInsightSearchRequest(state)).request;

      expect(params.numberOfResults).toBe(state.pagination.numberOfResults);
    });

    it('#buildInsightSearchRequest will modify #numberOfResults if it goes over index limits', async () => {
      state.pagination.numberOfResults = 10;
      state.pagination.firstResult = maximumNumberOfResultsFromIndex - 9;

      const params = (await buildInsightSearchRequest(state)).request;

      expect(params.numberOfResults).toBe(9);
    });

    it('#buildInsightSearchRequest returns the state #firstResult', async () => {
      state.pagination.firstResult = 10;
      const params = (await buildInsightSearchRequest(state)).request;

      expect(params.firstResult).toBe(state.pagination.firstResult);
    });

    it('#buildInsightSearchRequest returns the state #generatedAnswer.responseFormat', async () => {
      state.generatedAnswer.responseFormat = {answerStyle: 'concise'};
      const params = (await buildInsightSearchRequest(state)).request;

      expect(
        params.pipelineRuleParameters?.mlGenerativeQuestionAnswering
          ?.responseFormat
      ).toBe(state.generatedAnswer.responseFormat);
    });

    it('#buildInsightSearchRequest returns the state #generatedAnswer.citationsFieldToInclude', async () => {
      state.generatedAnswer.fieldsToIncludeInCitations = ['foo', 'bar'];
      const params = (await buildInsightSearchRequest(state)).request;

      expect(
        params.pipelineRuleParameters?.mlGenerativeQuestionAnswering
          ?.citationsFieldToInclude
      ).toBe(state.generatedAnswer.fieldsToIncludeInCitations);
    });

    it('when there are no cq expressions in state, cq is undefined', async () => {
      expect(
        (await buildInsightSearchRequest(state)).request.cq
      ).toBeUndefined();
    });

    it('when there is an active tab, it sets cq to the active tab expression', async () => {
      state.tabSet.a = buildMockTabSlice({expression: 'a', isActive: true});
      expect((await buildInsightSearchRequest(state)).request.cq).toBe('a');
    });

    it('when there is a context set, it returns the context', async () => {
      const expectedState = {foo: 'bar'};
      state.context.contextValues = expectedState;
      expect((await buildInsightSearchRequest(state)).request.context).toEqual(
        expectedState
      );
    });

    it('#buildInsightSearchRequest returns the state #caseContext', async () => {
      state.insightCaseContext.caseContext = {value: 'foo'};

      const params = (await buildInsightSearchRequest(state)).request;
      expect(params.caseContext).toEqual(state.insightCaseContext.caseContext);
    });

    it('#buildInsightSearchRequest returns the state #didYouMean', async () => {
      state.didYouMean.enableDidYouMean = true;
      const params = (await buildInsightSearchRequest(state)).request;

      expect(params.enableDidYouMean).toBe(state.didYouMean.enableDidYouMean);
    });

    it('#buildInsightSearchRequest returns the values extracted from the #folding state', async () => {
      state.folding = {
        ...getFoldingInitialState(),
        fields: {
          collection: 'foo',
          child: 'bar',
          parent: 'baz',
        },
        filterFieldRange: 3,
      };
      const params = (await buildInsightSearchRequest(state)).request;

      expect(params.filterField).toBe(state.folding.fields.collection);
      expect(params.childField).toBe(state.folding.fields.parent);
      expect(params.parentField).toBe(state.folding.fields.child);
      expect(params.filterFieldRange).toBe(state.folding.filterFieldRange);
    });
  });

  describe('when using buildInsightLoadCollectionRequest', () => {
    it('#buildInsightLoadCollectionRequest returns the values extracted from the #configuration state', async () => {
      state.configuration = {
        ...getConfigurationInitialState(),
        accessToken: '123',
        organizationId: 'foo',
        platformUrl: 'bar',
      };
      const params = (
        await buildInsightLoadCollectionRequest(state, collectionId)
      ).request;

      expect(params.accessToken).toBe(state.configuration.accessToken);
      expect(params.organizationId).toBe(state.configuration.organizationId);
      expect(params.url).toBe(state.configuration.platformUrl);
    });

    it('#buildInsightLoadCollectionRequest returns the state #insightId', async () => {
      state.insightConfiguration.insightId = '123';
      const params = (
        await buildInsightLoadCollectionRequest(state, collectionId)
      ).request;

      expect(params.insightId).toBe(state.insightConfiguration.insightId);
    });

    it('#buildInsightLoadCollectionRequest should add the correct analytics section', async () => {
      state.configuration.analytics.originLevel3 = 'foo';
      state.configuration.analytics.originContext = 'bar';
      state.configuration.analytics.analyticsMode = 'next';
      state.configuration.analytics.trackingId = '123';

      const request = (
        await buildInsightLoadCollectionRequest(state, collectionId)
      ).request.analytics;

      expect(request?.documentReferrer).toBe(
        state.configuration.analytics.originLevel3
      );
      expect(request?.originContext).toBe(
        state.configuration.analytics.originContext
      );
      expect(request?.trackingId).toBe(
        state.configuration.analytics.trackingId
      );
    });

    it('#buildInsightLoadCollectionRequest returns the state #query', async () => {
      state.query.q = 'hello';
      const params = (
        await buildInsightLoadCollectionRequest(state, collectionId)
      ).request;

      expect(params.q).toBe(state.query.q);
    });

    it('#buildInsightLoadCollectionRequest returns the state #sortCriteria', async () => {
      state.sortCriteria = 'qre';
      const params = (
        await buildInsightLoadCollectionRequest(state, collectionId)
      ).request;

      expect(params.sortCriteria).toBe(state.sortCriteria);
    });

    it('#buildInsightLoadCollectionRequest returns the facets in the state #facetSet', async () => {
      const request = buildMockFacetRequest({field: 'objecttype'});
      state.facetSet[1] = buildMockFacetSlice({request});
      const {facets} = (
        await buildInsightLoadCollectionRequest(state, collectionId)
      ).request;

      expect(facets).toContainEqual(request);
    });

    it('#buildInsightLoadCollectionRequest returns the facets in the state #numericFacetSet', async () => {
      const request = buildMockNumericFacetRequest({field: 'objecttype'});
      state.numericFacetSet[1] = buildMockNumericFacetSlice({request});

      const {facets} = (
        await buildInsightLoadCollectionRequest(state, collectionId)
      ).request;
      expect(facets).toContainEqual(request);
    });

    it('#buildInsightLoadCollectionRequest returns the facets in the state #dateFacetSet', async () => {
      const request = buildMockDateFacetRequest({field: 'objecttype'});
      state.dateFacetSet[1] = buildMockDateFacetSlice({request});

      const {facets} = (
        await buildInsightLoadCollectionRequest(state, collectionId)
      ).request;
      expect(facets).toContainEqual(request);
    });

    it('#buildInsightLoadCollectionRequest returns the facets in the #categoryFacetSet', async () => {
      const request = buildMockCategoryFacetRequest({field: 'objecttype'});
      state.categoryFacetSet[1] = buildMockCategoryFacetSlice({request});

      const {facets} = (
        await buildInsightLoadCollectionRequest(state, collectionId)
      ).request;
      expect(facets).toContainEqual(request);
    });

    it('#buildInsightLoadCollectionRequest.fieldsToInclude holds the #fieldsToInclude', async () => {
      state.fields.fieldsToInclude = ['foo', 'bar'];
      expect(
        (await buildInsightLoadCollectionRequest(state, collectionId)).request
          .fieldsToInclude
      ).toEqual(expect.arrayContaining(['foo', 'bar']));
    });

    it('#buildInsightLoadCollectionRequest.fieldsToInclude does not holds #fieldsToInclude if #fetchAllFields is active', async () => {
      state.fields.fieldsToInclude = ['foo', 'bar'];
      state.fields.fetchAllFields = true;
      expect(
        (await buildInsightLoadCollectionRequest(state, collectionId)).request
          .fieldsToInclude
      ).toBeUndefined();
    });

    it('#buildInsightLoadCollectionRequest sets the cq to the collectionId', async () => {
      expect(
        (await buildInsightLoadCollectionRequest(state, collectionId)).request
          .cq
      ).toBe(`@foldingcollection="${collectionId}"`);
    });

    it('when there is an active tab, it sets cq to the active tab expression', async () => {
      state.tabSet.a = buildMockTabSlice({
        expression: collectionId,
        isActive: true,
      });
      expect(
        (await buildInsightLoadCollectionRequest(state, collectionId)).request
          .cq
      ).toBe(`@foldingcollection="${collectionId}"`);
    });

    it('when there is a context sets the context param', async () => {
      const expectedContext = {foo: 'bar'};
      state.context.contextValues = expectedContext;
      const params = (
        await buildInsightLoadCollectionRequest(state, collectionId)
      ).request;

      expect(params.context).toBe(expectedContext);
    });
  });
});
