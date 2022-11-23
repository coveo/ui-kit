import {mockFetch} from '../../tests/fetchMock';
import CoveoAnalyticsClient from '../client/analytics';
import {NoopAnalytics} from '../client/noopAnalytics';
import {
    CustomEventsTypes,
    PartialDocumentInformation,
    SearchPageEvents,
    StaticFilterToggleValueMetadata,
} from '../searchPage/searchPageEvents';
import {CoveoInsightClient, InsightClientProvider} from './insightClient';
import doNotTrack from '../donottrack';
import {InsightEvents, InsightStaticFilterToggleValueMetadata} from './insightEvents';

const baseCaseMetadata = {
    caseId: '1234',
    caseNumber: '5678',
    caseContext: {Case_Subject: 'test subject', Case_Description: 'test description'},
};

const expectedBaseCaseMetadata = {
    CaseId: '1234',
    CaseNumber: '5678',
    CaseSubject: 'test subject',
};

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

    const expectMatchDocumentPayload = (actionCause: SearchPageEvents, doc: PartialDocumentInformation, meta = {}) => {
        const [, {body}] = fetchMock.lastCall();
        const customData = {foo: 'bar', ...meta};
        expect(JSON.parse(body.toString())).toMatchObject({
            actionCause,
            customData,
            language: 'en',
            clientId: 'visitor-id',
            ...doc,
            ...expectOrigins(),
        });
    };

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

    describe('when the case metadata is not included', () => {
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

        it('should send proper payload for #documentOpen', async () => {
            await client.logDocumentOpen(fakeDocInfo, fakeDocID);
            expectMatchDocumentPayload(SearchPageEvents.documentOpen, fakeDocInfo, fakeDocID);
        });

        it('should send proper payload for #copyToClipboard', async () => {
            await client.logCopyToClipboard(fakeDocInfo, fakeDocID);
            expectMatchDocumentPayload(SearchPageEvents.copyToClipboard, fakeDocInfo, fakeDocID);
        });
    });

    describe('when the case metadata is included', () => {
        it('should send proper payload for #interfaceLoad', async () => {
            const metadata = baseCaseMetadata;

            const expectedMetadata = {
                ...expectedBaseCaseMetadata,
                context_Case_Subject: 'test subject',
                context_Case_Description: 'test description',
            };
            await client.logInterfaceLoad(metadata);
            expectMatchPayload(SearchPageEvents.interfaceLoad, expectedMetadata);
        });

        it('should send proper payload for #interfaceChange', async () => {
            const metadata = {
                ...baseCaseMetadata,
                interfaceChangeTo: 'bob',
            };

            const expectedMetadata = {
                ...expectedBaseCaseMetadata,
                context_Case_Subject: 'test subject',
                context_Case_Description: 'test description',
                interfaceChangeTo: 'bob',
            };
            await client.logInterfaceChange(metadata);
            expectMatchPayload(SearchPageEvents.interfaceChange, expectedMetadata);
        });

        it('should send proper payload for #fetchMoreResults', async () => {
            const metadata = {
                ...baseCaseMetadata,
            };

            const expectedMetadata = {
                ...expectedBaseCaseMetadata,
                context_Case_Subject: 'test subject',
                context_Case_Description: 'test description',
                type: 'getMoreResults',
            };
            await client.logFetchMoreResults(metadata);
            expectMatchCustomEventPayload(SearchPageEvents.pagerScrolling, expectedMetadata);
        });

        it('should send proper payload for #staticFilterDeselect', async () => {
            const metadata: InsightStaticFilterToggleValueMetadata = {
                ...baseCaseMetadata,
                staticFilterId: 'filetypes',
                staticFilterValue: {
                    caption: 'Youtube',
                    expression: '@filetype="youtubevideo"',
                },
            };

            const expectedMetadata = {
                ...expectedBaseCaseMetadata,
                context_Case_Subject: 'test subject',
                context_Case_Description: 'test description',
                staticFilterId: 'filetypes',
                staticFilterValue: {
                    caption: 'Youtube',
                    expression: '@filetype="youtubevideo"',
                },
            };
            await client.logStaticFilterDeselect(metadata);

            expectMatchPayload(SearchPageEvents.staticFilterDeselect, expectedMetadata);
        });

        it('should send proper payload for #breadcrumbResetAll', async () => {
            const metadata = baseCaseMetadata;

            const expectedMetadata = {
                ...expectedBaseCaseMetadata,
                context_Case_Subject: 'test subject',
                context_Case_Description: 'test description',
            };
            await client.logBreadcrumbResetAll(metadata);
            expectMatchPayload(SearchPageEvents.breadcrumbResetAll, expectedMetadata);
        });

        it('should send proper payload for #breadcrumbFacet', async () => {
            const metadata = {
                ...baseCaseMetadata,
                facetField: '@foo',
                facetId: 'bar',
                facetTitle: 'title',
                facetValue: 'qwerty',
            };

            const expectedMetadata = {
                ...expectedBaseCaseMetadata,
                context_Case_Subject: 'test subject',
                context_Case_Description: 'test description',
                facetField: '@foo',
                facetId: 'bar',
                facetTitle: 'title',
                facetValue: 'qwerty',
            };
            await client.logBreadcrumbFacet(metadata);
            expectMatchPayload(SearchPageEvents.breadcrumbFacet, expectedMetadata);
        });

        it('should send proper payload for #logFacetSelect', async () => {
            const metadata = {
                ...baseCaseMetadata,
                facetField: '@foo',
                facetId: 'bar',
                facetTitle: 'title',
                facetValue: 'qwerty',
            };

            const expectedMetadata = {
                ...expectedBaseCaseMetadata,
                context_Case_Subject: 'test subject',
                context_Case_Description: 'test description',
                facetField: '@foo',
                facetId: 'bar',
                facetTitle: 'title',
                facetValue: 'qwerty',
            };

            await client.logFacetSelect(metadata);
            expectMatchPayload(SearchPageEvents.facetSelect, expectedMetadata);
        });

        it('should send proper payload for #logFacetDeselect', async () => {
            const metadata = {
                ...baseCaseMetadata,
                facetField: '@foo',
                facetId: 'bar',
                facetTitle: 'title',
                facetValue: 'qwerty',
            };

            const expectedMetadata = {
                ...expectedBaseCaseMetadata,
                context_Case_Subject: 'test subject',
                context_Case_Description: 'test description',
                facetField: '@foo',
                facetId: 'bar',
                facetTitle: 'title',
                facetValue: 'qwerty',
            };

            await client.logFacetDeselect(metadata);
            expectMatchPayload(SearchPageEvents.facetDeselect, expectedMetadata);
        });

        it('should send proper payload for #logFacetUpdateSort', async () => {
            const metadata = {
                ...baseCaseMetadata,
                facetField: '@foo',
                facetId: 'bar',
                facetTitle: 'title',
                criteria: 'bazz',
            };

            const expectedMetadata = {
                ...expectedBaseCaseMetadata,
                context_Case_Subject: 'test subject',
                context_Case_Description: 'test description',
                facetField: '@foo',
                facetId: 'bar',
                facetTitle: 'title',
                criteria: 'bazz',
            };
            await client.logFacetUpdateSort(metadata);
            expectMatchPayload(SearchPageEvents.facetUpdateSort, expectedMetadata);
        });

        it('should send proper payload for #logFacetClearAll', async () => {
            const metadata = {
                ...baseCaseMetadata,
                facetField: '@foo',
                facetId: 'bar',
                facetTitle: 'title',
            };

            const expectedMetadata = {
                ...expectedBaseCaseMetadata,
                context_Case_Subject: 'test subject',
                context_Case_Description: 'test description',
                facetField: '@foo',
                facetId: 'bar',
                facetTitle: 'title',
            };
            await client.logFacetClearAll(metadata);
            expectMatchPayload(SearchPageEvents.facetClearAll, expectedMetadata);
        });

        it('should send proper payload for #logFacetShowMore', async () => {
            const metadata = {
                ...baseCaseMetadata,
                facetField: '@foo',
                facetId: 'bar',
                facetTitle: 'title',
            };

            const expectedMetadata = {
                ...expectedBaseCaseMetadata,
                facetField: '@foo',
                facetId: 'bar',
                facetTitle: 'title',
            };
            await client.logFacetShowMore(metadata);
            expectMatchCustomEventPayload(SearchPageEvents.facetShowMore, expectedMetadata);
        });

        it('should send proper payload for #logFacetShowLess', async () => {
            const metadata = {
                ...baseCaseMetadata,
                facetField: '@foo',
                facetId: 'bar',
                facetTitle: 'title',
            };

            const expectedMetadata = {
                ...expectedBaseCaseMetadata,
                facetField: '@foo',
                facetId: 'bar',
                facetTitle: 'title',
            };
            await client.logFacetShowLess(metadata);
            expectMatchCustomEventPayload(SearchPageEvents.facetShowLess, expectedMetadata);
        });

        it('should send proper payload for #logQueryError', async () => {
            const metadata = {
                ...baseCaseMetadata,
                query: 'q',
                aq: 'aq',
                cq: 'cq',
                dq: 'dq',
                errorMessage: 'boom',
                errorType: 'a bad one',
            };

            const expectedMetadata = {
                ...expectedBaseCaseMetadata,
                query: 'q',
                aq: 'aq',
                cq: 'cq',
                dq: 'dq',
                errorMessage: 'boom',
                errorType: 'a bad one',
            };
            await client.logQueryError(metadata);
            expectMatchCustomEventPayload(SearchPageEvents.queryError, expectedMetadata);
        });

        it('should send proper payload for #logPagerNumber', async () => {
            const metadata = {
                ...baseCaseMetadata,
                pagerNumber: 123,
            };

            const expectedMetadata = {
                ...expectedBaseCaseMetadata,
                pagerNumber: 123,
            };
            await client.logPagerNumber(metadata);
            expectMatchCustomEventPayload(SearchPageEvents.pagerNumber, expectedMetadata);
        });

        it('should send proper payload for #logPagerNext', async () => {
            const metadata = {
                ...baseCaseMetadata,
                pagerNumber: 123,
            };

            const expectedMetadata = {
                ...expectedBaseCaseMetadata,
                pagerNumber: 123,
            };
            await client.logPagerNext(metadata);
            expectMatchCustomEventPayload(SearchPageEvents.pagerNext, expectedMetadata);
        });

        it('should send proper payload for #logPagerPrevious', async () => {
            const metadata = {
                ...baseCaseMetadata,
                pagerNumber: 123,
            };

            const expectedMetadata = {
                ...expectedBaseCaseMetadata,
                pagerNumber: 123,
            };
            await client.logPagerPrevious(metadata);
            expectMatchCustomEventPayload(SearchPageEvents.pagerPrevious, expectedMetadata);
        });

        it('should send proper payload for #didyoumeanAutomatic', async () => {
            const metadata = baseCaseMetadata;

            const expectedMetadata = {
                ...expectedBaseCaseMetadata,
                context_Case_Subject: 'test subject',
                context_Case_Description: 'test description',
            };
            await client.logDidYouMeanAutomatic(metadata);
            expectMatchPayload(SearchPageEvents.didyoumeanAutomatic, expectedMetadata);
        });

        it('should send proper payload for #didyoumeanClick', async () => {
            const metadata = baseCaseMetadata;

            const expectedMetadata = {
                ...expectedBaseCaseMetadata,
                context_Case_Subject: 'test subject',
                context_Case_Description: 'test description',
            };
            await client.logDidYouMeanClick(metadata);
            expectMatchPayload(SearchPageEvents.didyoumeanClick, expectedMetadata);
        });

        it('should send proper payload for #resultsSort', async () => {
            const metadata = {
                ...baseCaseMetadata,
                resultsSortBy: 'date ascending',
            };

            const expectedMetadata = {
                ...expectedBaseCaseMetadata,
                context_Case_Subject: 'test subject',
                context_Case_Description: 'test description',
                resultsSortBy: 'date ascending',
            };
            await client.logResultsSort(metadata);
            expectMatchPayload(SearchPageEvents.resultsSort, expectedMetadata);
        });

        it('should send proper payload for #searchboxSubmit', async () => {
            const metadata = baseCaseMetadata;

            const expectedMetadata = {
                ...expectedBaseCaseMetadata,
                context_Case_Subject: 'test subject',
                context_Case_Description: 'test description',
            };
            await client.logSearchboxSubmit(metadata);
            expectMatchPayload(SearchPageEvents.searchboxSubmit, expectedMetadata);
        });

        it('should send proper payload for #documentOpen', async () => {
            const metadata = baseCaseMetadata;

            const expectedMetadata = {
                ...fakeDocID,
                ...expectedBaseCaseMetadata,
            };
            await client.logDocumentOpen(fakeDocInfo, fakeDocID, metadata);
            expectMatchDocumentPayload(SearchPageEvents.documentOpen, fakeDocInfo, expectedMetadata);
        });

        it('should send proper payload for #copyToClipboard', async () => {
            const metadata = baseCaseMetadata;

            const expectedMetadata = {
                ...fakeDocID,
                ...expectedBaseCaseMetadata,
            };
            await client.logCopyToClipboard(fakeDocInfo, fakeDocID, metadata);
            expectMatchDocumentPayload(SearchPageEvents.copyToClipboard, fakeDocInfo, expectedMetadata);
        });
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
