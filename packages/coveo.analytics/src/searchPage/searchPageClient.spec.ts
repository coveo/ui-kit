import * as fetchMock from 'fetch-mock';
import {CoveoSearchPageClient} from './searchPageClient';
import {
    SearchPageEvents,
    PartialDocumentInformation,
    DocumentIdentifier,
    CustomEventsTypes,
    FacetStateMetadata,
} from './searchPageEvents';
import CoveoAnalyticsClient from '../client/analytics';
import {NoopAnalytics} from '../client/noopAnalytics';

describe('SearchPageClient', () => {
    const fakeDocInfo = {
        collectionName: 'collection',
        documentAuthor: 'author',
        documentPosition: 1,
        documentTitle: 'title',
        documentUri: 'uri',
        documentUriHash: 'hash',
        documentUrl: 'url',
        queryPipeline: 'my-pipeline',
        rankingModifier: 'modifier',
        sourceName: 'source',
    };

    const fakeDocID = {
        contentIDKey: 'permanentID',
        contentIDValue: 'the-permanent-id',
    };

    const fakeFacetState = [
        {
            valuePosition: 0,
            value: 'foo',
            state: 'selected' as const,
            facetPosition: 1,
            displayValue: 'foobar',
            facetType: 'specific' as const,
            field: '@foo',
            id: 'bar',
            title: 'title',
        },
    ];

    let client: CoveoSearchPageClient;

    const provider = {
        getBaseMetadata: () => ({foo: 'bar'}),
        getSearchEventRequestPayload: () => ({
            queryText: 'queryText',
            responseTime: 123,
        }),
        getSearchUID: () => 'my-uid',
        getPipeline: () => 'my-pipeline',
        getOriginLevel1: () => 'origin-level-1',
        getOriginLevel2: () => 'origin-level-2',
        getOriginLevel3: () => 'origin-level-3',
    };

    beforeEach(() => {
        client = initClient();
        fetchMock.mock(/.*/, {
            visitId: 'visit-id',
            visitorId: 'visitor-id',
        });
    });

    afterEach(() => {
        fetchMock.reset();
    });

    const initClient = () => {
        return new CoveoSearchPageClient({}, provider);
    };

    const expectOrigins = () => ({
        originLevel1: 'origin-level-1',
        originLevel2: 'origin-level-2',
        originLevel3: 'origin-level-3',
    });

    const expectMatchPayload = (actionCause: SearchPageEvents, meta = {}) => {
        const [, {body}] = fetchMock.lastCall();
        const customData = {foo: 'bar', ...meta};
        expect(JSON.parse(body.toString())).toMatchObject({
            queryText: 'queryText',
            responseTime: 123,
            queryPipeline: 'my-pipeline',
            actionCause,
            customData,
            ...expectOrigins(),
        });
    };

    const expectMatchFacetPayload = (actionCause: SearchPageEvents, meta = {}, facetState: FacetStateMetadata[]) => {
        const [, {body}] = fetchMock.lastCall();
        const customData = {foo: 'bar', ...meta};
        expect(JSON.parse(body.toString())).toMatchObject({
            queryText: 'queryText',
            responseTime: 123,
            queryPipeline: 'my-pipeline',
            actionCause,
            customData,
            facetState,
            ...expectOrigins(),
        });
    };

    const expectMatchDocumentPayload = (actionCause: SearchPageEvents, doc: PartialDocumentInformation, meta = {}) => {
        const [, {body}] = fetchMock.lastCall();
        const customData = {foo: 'bar', ...meta};
        expect(JSON.parse(body.toString())).toMatchObject({
            actionCause,
            customData,
            queryPipeline: 'my-pipeline',
            ...doc,
            ...expectOrigins(),
        });
    };

    const expectMatchCustomEventPayload = (actionCause: SearchPageEvents, meta = {}) => {
        const [, {body}] = fetchMock.lastCall();
        const customData = {foo: 'bar', ...meta};
        expect(JSON.parse(body.toString())).toMatchObject({
            eventValue: actionCause,
            eventType: CustomEventsTypes[actionCause],
            lastSearchQueryUid: 'my-uid',
            customData,
            ...expectOrigins(),
        });
    };

    const expectMatchCustomEventWithTypePayload = (eventValue: string, eventType: string, meta = {}) => {
        const [, {body}] = fetchMock.lastCall();
        const customData = {foo: 'bar', ...meta};
        expect(JSON.parse(body.toString())).toMatchObject({
            eventValue,
            eventType,
            lastSearchQueryUid: 'my-uid',
            customData,
            ...expectOrigins(),
        });
    };

    it('should send proper payload for #interfaceLoad', async () => {
        await client.logInterfaceLoad();
        expectMatchPayload(SearchPageEvents.interfaceLoad);
    });

    it('should send proper payload for #interfaceChange', async () => {
        await client.logInterfaceChange({
            interfaceChangeTo: 'bob',
        });
        expectMatchPayload(SearchPageEvents.interfaceChange, {interfaceChangeTo: 'bob'});
    });

    it('should send proper payload for #didyoumeanAutomatic', async () => {
        await client.logDidYouMeanAutomatic();
        expectMatchPayload(SearchPageEvents.didyoumeanAutomatic);
    });

    it('should send proper payload for #didyoumeanClick', async () => {
        await client.logDidYouMeanClick();
        expectMatchPayload(SearchPageEvents.didyoumeanClick);
    });

    it('should send proper payload for #resultsSort', async () => {
        await client.logResultsSort({resultsSortBy: 'date ascending'});
        expectMatchPayload(SearchPageEvents.resultsSort, {resultsSortBy: 'date ascending'});
    });

    it('should send proper payload for #searchboxSubmit', async () => {
        await client.logSearchboxSubmit();
        expectMatchPayload(SearchPageEvents.searchboxSubmit);
    });

    it('should send proper payload for #searchboxClear', async () => {
        await client.logSearchboxClear();
        expectMatchPayload(SearchPageEvents.searchboxClear);
    });

    it('should send proper payload for #searchboxAsYouType', async () => {
        await client.logSearchboxAsYouType();
        expectMatchPayload(SearchPageEvents.searchboxAsYouType);
    });

    it('should send proper payload for #searchboxAsYouType', async () => {
        await client.logBreadcrumbResetAll();
        expectMatchPayload(SearchPageEvents.breadcrumbResetAll);
    });

    it('should send proper payload for #documentQuickview', async () => {
        await client.logDocumentQuickview(fakeDocInfo, fakeDocID);
        expectMatchDocumentPayload(SearchPageEvents.documentQuickview, fakeDocInfo, fakeDocID);
    });

    it('should send proper payload for ', async () => {
        await client.logDocumentOpen(fakeDocInfo, fakeDocID);
        expectMatchDocumentPayload(SearchPageEvents.documentOpen, fakeDocInfo, fakeDocID);
    });

    it('should send proper payload for #omniboxAnalytics', async () => {
        const meta = {
            partialQueries: 'a;b;c',
            partialQuery: 'abcd',
            suggestionRanking: 1,
            suggestions: 'q;w;e;r;t;y',
        };
        await client.logOmniboxAnalytics(meta);
        expectMatchPayload(SearchPageEvents.omniboxAnalytics, meta);
    });

    it('should send proper payload for #logOmniboxFromLink', async () => {
        const meta = {
            partialQueries: 'a;b;c',
            partialQuery: 'abcd',
            suggestionRanking: 1,
            suggestions: 'q;w;e;r;t;y',
        };
        await client.logOmniboxFromLink(meta);
        expectMatchPayload(SearchPageEvents.omniboxFromLink, meta);
    });

    it('should send proper payload for #logTriggerNotify', async () => {
        const meta = {
            notification: 'foo',
        };
        await client.logTriggerNotify(meta);
        expectMatchCustomEventPayload(SearchPageEvents.triggerNotify, meta);
    });

    it('should send proper payload for #logTriggerExecute', async () => {
        const meta = {
            executed: 'foo',
        };
        await client.logTriggerExecute(meta);
        expectMatchCustomEventPayload(SearchPageEvents.triggerExecute, meta);
    });

    it('should send proper payload for #logTriggerQuery', async () => {
        const meta = {
            query: 'queryText',
        };
        await client.logTriggerQuery();
        expectMatchCustomEventPayload(SearchPageEvents.triggerQuery, meta);
    });

    it('should send proper payload for #logTriggerRedirect', async () => {
        const meta = {
            redirectedTo: 'foo',
        };
        await client.logTriggerRedirect(meta);
        expectMatchCustomEventPayload(SearchPageEvents.triggerRedirect, meta);
    });

    it('should send proper payload for #logPagerResize', async () => {
        const meta = {
            currentResultsPerPage: 123,
        };
        await client.logPagerResize(meta);
        expectMatchCustomEventPayload(SearchPageEvents.pagerResize, meta);
    });

    it('should send proper payload for #logPagerNumber', async () => {
        const meta = {pagerNumber: 123};
        await client.logPagerNumber(meta);
        expectMatchCustomEventPayload(SearchPageEvents.pagerNumber, meta);
    });

    it('should send proper payload for #logPagerNext', async () => {
        const meta = {pagerNumber: 123};
        await client.logPagerNext(meta);
        expectMatchCustomEventPayload(SearchPageEvents.pagerNext, meta);
    });

    it('should send proper payload for #logPagerPrevious', async () => {
        const meta = {pagerNumber: 123};
        await client.logPagerPrevious(meta);
        expectMatchCustomEventPayload(SearchPageEvents.pagerPrevious, meta);
    });

    it('should send proper payload for #logPagerScrolling', async () => {
        await client.logPagerScrolling();
        expectMatchCustomEventPayload(SearchPageEvents.pagerScrolling);
    });

    it('should send proper payload for #logFacetSearch', async () => {
        const meta = {
            facetField: '@foo',
            facetId: 'bar',
            facetTitle: 'title',
        };
        await client.logFacetSearch(meta, fakeFacetState);
        expectMatchFacetPayload(SearchPageEvents.facetSearch, meta, fakeFacetState);
    });

    it('should send proper payload for #logFacetSelect', async () => {
        const meta = {
            facetField: '@foo',
            facetId: 'bar',
            facetTitle: 'title',
            facetValue: 'qwerty',
        };

        await client.logFacetSelect(meta, fakeFacetState);
        expectMatchFacetPayload(SearchPageEvents.facetSelect, meta, fakeFacetState);
    });

    it('should send proper payload for #logFacetSelect', async () => {
        const meta = {
            facetField: '@foo',
            facetId: 'bar',
            facetTitle: 'title',
            facetValue: 'qwerty',
        };

        await client.logFacetDeselect(meta, fakeFacetState);
        expectMatchFacetPayload(SearchPageEvents.facetDeselect, meta, fakeFacetState);
    });

    it('should send proper payload for #logFacetExclude', async () => {
        const meta = {
            facetField: '@foo',
            facetId: 'bar',
            facetTitle: 'title',
            facetValue: 'qwerty',
        };
        await client.logFacetExclude(meta, fakeFacetState);
        expectMatchFacetPayload(SearchPageEvents.facetExclude, meta, fakeFacetState);
    });

    it('should send proper payload for #logFacetUnexclude', async () => {
        const meta = {
            facetField: '@foo',
            facetId: 'bar',
            facetTitle: 'title',
            facetValue: 'qwerty',
        };
        await client.logFacetUnexclude(meta, fakeFacetState);
        expectMatchFacetPayload(SearchPageEvents.facetUnexclude, meta, fakeFacetState);
    });

    it('should send proper payload for #logFacetSelectAll', async () => {
        const meta = {
            facetField: '@foo',
            facetId: 'bar',
            facetTitle: 'title',
        };
        await client.logFacetSelectAll(meta, fakeFacetState);
        expectMatchFacetPayload(SearchPageEvents.facetSelectAll, meta, fakeFacetState);
    });

    it('should send proper payload for #logFacetUpdateSort', async () => {
        const meta = {
            facetField: '@foo',
            facetId: 'bar',
            facetTitle: 'title',
            criteria: 'bazz',
        };
        await client.logFacetUpdateSort(meta, fakeFacetState);
        expectMatchFacetPayload(SearchPageEvents.facetUpdateSort, meta, fakeFacetState);
    });

    it('should send proper payload for #logFacetShowMore', async () => {
        const meta = {
            facetField: '@foo',
            facetId: 'bar',
            facetTitle: 'title',
        };
        await client.logFacetShowMore(meta);
        expectMatchCustomEventPayload(SearchPageEvents.facetShowMore, meta);
    });

    it('should send proper payload for #logFacetShowLess', async () => {
        const meta = {
            facetField: '@foo',
            facetId: 'bar',
            facetTitle: 'title',
        };
        await client.logFacetShowLess(meta);
        expectMatchCustomEventPayload(SearchPageEvents.facetShowLess, meta);
    });

    it('should send proper payload for #logQueryError', async () => {
        const meta = {
            query: 'q',
            aq: 'aq',
            cq: 'cq',
            dq: 'dq',
            errorMessage: 'boom',
            errorType: 'a bad one',
        };
        await client.logQueryError(meta);
        expectMatchCustomEventPayload(SearchPageEvents.queryError, meta);
    });

    it('should send proper payload for #logQueryErrorBack', async () => {
        await client.logQueryErrorBack();
        expectMatchPayload(SearchPageEvents.queryErrorBack);
    });

    it('should send proper payload for #logQueryErrorRetry', async () => {
        await client.logQueryErrorRetry();
        expectMatchPayload(SearchPageEvents.queryErrorRetry);
    });

    it('should send proper payload for #logQueryErrorClear', async () => {
        await client.logQueryErrorClear();
        expectMatchPayload(SearchPageEvents.queryErrorClear);
    });

    it('should send proper payload for #logRecommendationInterfaceLoad', async () => {
        await client.logRecommendationInterfaceLoad();
        expectMatchPayload(SearchPageEvents.recommendationInterfaceLoad);
    });

    it('should send proper payload for #logRecommendation', async () => {
        await client.logRecommendation();
        expectMatchCustomEventPayload(SearchPageEvents.recommendation);
    });

    it('should send proper payload for #fetchMoreResults', async () => {
        await client.logFetchMoreResults();
        expectMatchCustomEventPayload(SearchPageEvents.pagerScrolling, {type: 'getMoreResults'});
    });

    it('should send proper payload for #logCustomEventWithType', async () => {
        await client.logCustomEventWithType('foo', 'bar', {buzz: 'bazz'});
        expectMatchCustomEventWithTypePayload('foo', 'bar', {buzz: 'bazz'});
    });

    it('should enable analytics tracking by default', () => {
        const c = new CoveoSearchPageClient({}, provider);
        expect(c.coveoAnalyticsClient instanceof CoveoAnalyticsClient).toBe(true);
    });

    it('should allow disabling analytics on initialization', () => {
        const c = new CoveoSearchPageClient({enableAnalytics: false}, provider);
        expect(c.coveoAnalyticsClient instanceof NoopAnalytics).toBe(true);
    });

    it('should allow disabling analytics after initialization', () => {
        const c = new CoveoSearchPageClient({enableAnalytics: true}, provider);
        expect(c.coveoAnalyticsClient instanceof CoveoAnalyticsClient).toBe(true);
        c.disable();
        expect(c.coveoAnalyticsClient instanceof NoopAnalytics).toBe(true);
    });

    it('should allow enabling analytics after initialization', () => {
        const c = new CoveoSearchPageClient({enableAnalytics: false}, provider);
        expect(c.coveoAnalyticsClient instanceof NoopAnalytics).toBe(true);
        c.enable();
        expect(c.coveoAnalyticsClient instanceof CoveoAnalyticsClient).toBe(true);
    });
});
