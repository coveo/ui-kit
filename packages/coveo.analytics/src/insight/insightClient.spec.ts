import {mockFetch} from '../../tests/fetchMock';
import CoveoAnalyticsClient from '../client/analytics';
import {NoopAnalytics} from '../client/noopAnalytics';
import {CustomEventsTypes, SearchPageEvents, StaticFilterToggleValueMetadata} from '../searchPage/searchPageEvents';
import {CoveoInsightClient, InsightClientProvider} from './insightClient';
import doNotTrack from '../donottrack';
import {InsightEvents} from './insightEvents';

jest.mock('../donottrack', () => {
    return {
        default: jest.fn(),
        doNotTrack: jest.fn(),
    };
});

const {fetchMock, fetchMockBeforeEach} = mockFetch();
describe('InsightClient', () => {
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

    let client: CoveoInsightClient;

    const provider: InsightClientProvider = {
        getBaseMetadata: () => ({foo: 'bar'}),
        getSearchEventRequestPayload: () => ({
            queryText: 'queryText',
            responseTime: 123,
        }),
        getSearchUID: () => 'my-uid',
        getPipeline: () => 'my-pipeline',
        getOriginContext: () => 'origin-context',
        getOriginLevel1: () => 'origin-level-1',
        getOriginLevel2: () => 'origin-level-2',
        getOriginLevel3: () => 'origin-level-3',
        getLanguage: () => 'en',
        getFacetState: () => fakeFacetState,
        getIsAnonymous: () => false,
    };

    const initClient = () => {
        return new CoveoInsightClient({}, provider);
    };

    const expectOrigins = () => ({
        originContext: 'origin-context',
        originLevel1: 'origin-level-1',
        originLevel2: 'origin-level-2',
        originLevel3: 'origin-level-3',
    });

    const expectMatchPayload = (actionCause: SearchPageEvents | InsightEvents, meta = {}) => {
        const [, {body}] = fetchMock.lastCall();
        const customData = {foo: 'bar', ...meta};
        expect(JSON.parse(body.toString())).toMatchObject({
            queryText: 'queryText',
            responseTime: 123,
            queryPipeline: 'my-pipeline',
            actionCause,
            customData,
            facetState: fakeFacetState,
            language: 'en',
            clientId: 'visitor-id',
            ...expectOrigins(),
        });
    };

    const expectMatchCustomEventPayload = (actionCause: SearchPageEvents | InsightEvents, meta = {}) => {
        const [, {body}] = fetchMock.lastCall();
        const customData = {foo: 'bar', ...meta};
        expect(JSON.parse(body.toString())).toMatchObject({
            eventValue: actionCause,
            eventType: CustomEventsTypes[actionCause],
            lastSearchQueryUid: 'my-uid',
            customData,
            language: 'en',
            clientId: 'visitor-id',
            ...expectOrigins(),
        });
    };

    beforeEach(() => {
        fetchMockBeforeEach();

        client = initClient();
        client.coveoAnalyticsClient.runtime.storage.setItem('visitorId', 'visitor-id');
        fetchMock.mock(/.*/, {
            visitId: 'visit-id',
        });
    });

    afterEach(() => {
        fetchMock.reset();
    });

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

    it('should send proper payload for #fetchMoreResults', async () => {
        await client.logFetchMoreResults();
        expectMatchCustomEventPayload(SearchPageEvents.pagerScrolling, {type: 'getMoreResults'});
    });

    it('should send proper payload for #staticFilterDeselect', async () => {
        const meta: StaticFilterToggleValueMetadata = {
            staticFilterId: 'filetypes',
            staticFilterValue: {
                caption: 'Youtube',
                expression: '@filetype="youtubevideo"',
            },
        };
        await client.logStaticFilterDeselect(meta);

        expectMatchPayload(SearchPageEvents.staticFilterDeselect, meta);
    });

    it('should send proper payload for #breadcrumbResetAll', async () => {
        await client.logBreadcrumbResetAll();
        expectMatchPayload(SearchPageEvents.breadcrumbResetAll);
    });

    it('should send proper payload for #breadcrumbFacet', async () => {
        const meta = {
            facetField: '@foo',
            facetId: 'bar',
            facetTitle: 'title',
            facetValue: 'qwerty',
        };
        await client.logBreadcrumbFacet(meta);
        expectMatchPayload(SearchPageEvents.breadcrumbFacet, meta);
    });

    it('should send proper payload for #breadcrumbResetAll', async () => {
        await client.logBreadcrumbResetAll();
        expectMatchPayload(SearchPageEvents.breadcrumbResetAll);
    });

    it('should send proper payload for #breadcrumbFacet', async () => {
        const meta = {
            facetField: '@foo',
            facetId: 'bar',
            facetTitle: 'title',
            facetValue: 'qwerty',
        };
        await client.logBreadcrumbFacet(meta);
        expectMatchPayload(SearchPageEvents.breadcrumbFacet, meta);
    });

    it('should send proper payload for #logFacetSelect', async () => {
        const meta = {
            facetField: '@foo',
            facetId: 'bar',
            facetTitle: 'title',
            facetValue: 'qwerty',
        };

        await client.logFacetSelect(meta);
        expectMatchPayload(SearchPageEvents.facetSelect, meta);
    });

    it('should send proper payload for #logFacetDeselect', async () => {
        const meta = {
            facetField: '@foo',
            facetId: 'bar',
            facetTitle: 'title',
            facetValue: 'qwerty',
        };

        await client.logFacetDeselect(meta);
        expectMatchPayload(SearchPageEvents.facetDeselect, meta);
    });

    it('should send proper payload for #logFacetUpdateSort', async () => {
        const meta = {
            facetField: '@foo',
            facetId: 'bar',
            facetTitle: 'title',
            criteria: 'bazz',
        };
        await client.logFacetUpdateSort(meta);
        expectMatchPayload(SearchPageEvents.facetUpdateSort, meta);
    });

    it('should send proper payload for #logFacetClearAll', async () => {
        const meta = {
            facetField: '@foo',
            facetId: 'bar',
            facetTitle: 'title',
        };
        await client.logFacetClearAll(meta);
        expectMatchPayload(SearchPageEvents.facetClearAll, meta);
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

    it('should send proper payload for #resultsSort', async () => {
        await client.logResultsSort({resultsSortBy: 'date ascending'});
        expectMatchPayload(SearchPageEvents.resultsSort, {resultsSortBy: 'date ascending'});
    });

    it('should enable analytics tracking by default', () => {
        const c = new CoveoInsightClient({}, provider);
        expect(c.coveoAnalyticsClient instanceof CoveoAnalyticsClient).toBe(true);
    });

    it('should allow disabling analytics on initialization', () => {
        const c = new CoveoInsightClient({enableAnalytics: false}, provider);
        expect(c.coveoAnalyticsClient instanceof NoopAnalytics).toBe(true);
    });

    it('should allow disabling analytics after initialization', () => {
        const c = new CoveoInsightClient({enableAnalytics: true}, provider);
        expect(c.coveoAnalyticsClient instanceof CoveoAnalyticsClient).toBe(true);
        c.disable();
        expect(c.coveoAnalyticsClient instanceof NoopAnalytics).toBe(true);
    });

    it('should disable analytics when doNotTrack is enabled', async () => {
        (doNotTrack as jest.Mock).mockImplementationOnce(() => true);

        const c = new CoveoInsightClient({}, provider);
        expect(c.coveoAnalyticsClient instanceof NoopAnalytics).toBe(true);
    });

    it('should allow enabling analytics after initialization', () => {
        const c = new CoveoInsightClient({enableAnalytics: false}, provider);
        expect(c.coveoAnalyticsClient instanceof NoopAnalytics).toBe(true);
        c.enable();
        expect(c.coveoAnalyticsClient instanceof CoveoAnalyticsClient).toBe(true);
    });

    it('should send proper payload for #contextChanged', async () => {
        const meta = {
            caseId: '1234',
            caseNumber: '5678',
            caseContext: {Case_Subject: 'test subject', Case_Description: 'test description'},
        };

        const expectedMeta = {
            CaseId: '1234',
            CaseNumber: '5678',
            CaseSubject: 'test subject',
            context_Case_Subject: 'test subject',
            context_Case_Description: 'test description',
        };

        await client.logContextChanged(meta);
        expectMatchPayload(InsightEvents.contextChanged, expectedMeta);
    });

    it('should send proper payload for #expandToFullUI', async () => {
        const meta = {
            caseId: '1234',
            caseNumber: '5678',
            caseContext: {Case_Subject: 'test subject', Case_Description: 'test description'},
            fullSearchComponentName: 'c__FullSearch',
            triggeredBy: 'openFullSearchButton',
        };

        const expectedMeta = {
            CaseId: '1234',
            CaseNumber: '5678',
            CaseSubject: 'test subject',
            fullSearchComponentName: 'c__FullSearch',
            triggeredBy: 'openFullSearchButton',
        };
        await client.logExpandToFullUI(meta);
        expectMatchCustomEventPayload(InsightEvents.expandToFullUI, expectedMeta);
    });
});
