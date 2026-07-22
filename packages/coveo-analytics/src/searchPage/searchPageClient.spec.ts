import {CoveoSearchPageClient, EventDescription, SearchPageClientProvider} from './searchPageClient';
import {
    SearchPageEvents,
    PartialDocumentInformation,
    CustomEventsTypes,
    OmniboxSuggestionsMetadata,
    StaticFilterToggleValueMetadata,
    GeneratedAnswerFeedbackReason,
    GeneratedAnswerRephraseFormat,
    GeneratedAnswerFeedbackReasonOption,
} from './searchPageEvents';
import CoveoAnalyticsClient from '../client/analytics';
import {NoopAnalytics} from '../client/noopAnalytics';
import {mockFetch, lastCallBody} from '../../tests/fetchMock';
import doNotTrack from '../donottrack';
import {Cookie} from '../cookieutils';

jest.mock('../donottrack', () => {
    return {
        default: jest.fn(),
        doNotTrack: jest.fn(),
    };
});
const {fetchMock, fetchMockBeforeEach} = mockFetch();

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

    const fakeStreamId = 'some-stream-id-123';

    let client: CoveoSearchPageClient;

    const provider: SearchPageClientProvider = {
        getBaseMetadata: () => ({foo: 'bar'}),
        getGeneratedAnswerMetadata: () => ({genQaMetadata: 'bar'}),
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
        getSplitTestRunName: () => 'split-test-run-something',
        getSplitTestRunVersion: () => 'split-test-run-something/foo',
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

    const customDataFromMiddleware = {helloFromMiddleware: 1234};

    const initClient = () => {
        return new CoveoSearchPageClient(
            {
                beforeSendHooks: [
                    (_, payload) =>
                        Promise.resolve({...payload, customData: {...payload.customData, ...customDataFromMiddleware}}),
                ],
            },
            provider
        );
    };

    const expectOrigins = () => ({
        originContext: 'origin-context',
        originLevel1: 'origin-level-1',
        originLevel2: 'origin-level-2',
        originLevel3: 'origin-level-3',
    });

    const expectSplitTestRun = () => ({
        splitTestRunName: 'split-test-run-something',
        splitTestRunVersion: 'split-test-run-something/foo',
    });

    const expectMatchPayload = (actionCause: SearchPageEvents, meta = {}) => {
        const body: string = lastCallBody(fetchMock);
        const customData = {foo: 'bar', genQaMetadata: 'bar', ...customDataFromMiddleware, ...meta};
        expect(JSON.parse(body)).toEqual({
            queryText: 'queryText',
            responseTime: 123,
            searchQueryUid: provider.getSearchUID(),
            queryPipeline: 'my-pipeline',
            actionCause,
            anonymous: false,
            customData,
            facetState: fakeFacetState,
            language: 'en',
            clientId: 'visitor-id',
            userAgent: expect.any(String),
            ...expectOrigins(),
            ...expectSplitTestRun(),
        });
    };

    const expectMatchDescription = (description: EventDescription, actionCause: SearchPageEvents, meta = {}) => {
        const customData = {foo: 'bar', ...customDataFromMiddleware, ...meta};
        expect(description).toEqual({
            actionCause,
            customData,
        });
    };

    const expectSearchEventToMatchDescription = (
        description: EventDescription,
        actionCause: SearchPageEvents,
        meta = {}
    ) => {
        expectMatchDescription(description, actionCause, {...meta, genQaMetadata: 'bar'});
    };

    const expectMatchDocumentPayload = (actionCause: SearchPageEvents, doc: PartialDocumentInformation, meta = {}) => {
        const body: string = lastCallBody(fetchMock);
        const customData = {foo: 'bar', ...customDataFromMiddleware, ...meta};
        expect(JSON.parse(body)).toEqual({
            anonymous: false,
            actionCause,
            customData,
            language: 'en',
            clientId: 'visitor-id',
            facetState: fakeFacetState,
            searchQueryUid: provider.getSearchUID(),
            userAgent: expect.any(String),
            ...doc,
            ...expectOrigins(),
            ...expectSplitTestRun(),
        });
    };

    const expectMatchCustomEventPayload = (
        actionCause: SearchPageEvents,
        meta = {},
        eventType = CustomEventsTypes[actionCause]
    ) => {
        const body: string = lastCallBody(fetchMock);
        const customData = {foo: 'bar', ...customDataFromMiddleware, ...meta};
        expect(JSON.parse(body)).toEqual({
            anonymous: false,
            eventValue: actionCause,
            eventType,
            lastSearchQueryUid: 'my-uid',
            customData,
            language: 'en',
            clientId: 'visitor-id',
            facetState: fakeFacetState,
            userAgent: expect.any(String),
            ...expectOrigins(),
            ...expectSplitTestRun(),
        });
    };

    const expectMatchCustomEventWithTypePayload = (eventValue: string, eventType: string, meta = {}) => {
        const body: string = lastCallBody(fetchMock);
        const customData = {foo: 'bar', ...customDataFromMiddleware, ...meta};
        expect(JSON.parse(body)).toEqual({
            anonymous: false,
            eventValue,
            eventType,
            lastSearchQueryUid: 'my-uid',
            customData,
            language: 'en',
            clientId: 'visitor-id',
            facetState: fakeFacetState,
            userAgent: expect.any(String),
            ...expectOrigins(),
            ...expectSplitTestRun(),
        });
    };

    it('should send proper payload for #interfaceLoad', async () => {
        await client.logInterfaceLoad();
        expectMatchPayload(SearchPageEvents.interfaceLoad);
    });

    it('should send proper payload for #makeInterfaceLoad', async () => {
        const built = await client.makeInterfaceLoad();
        await built.log({searchUID: provider.getSearchUID()});
        expectMatchPayload(SearchPageEvents.interfaceLoad);
        expectSearchEventToMatchDescription(built.description, SearchPageEvents.interfaceLoad);
    });

    it('should send proper payload for #interfaceChange', async () => {
        await client.logInterfaceChange({
            interfaceChangeTo: 'bob',
        });
        expectMatchPayload(SearchPageEvents.interfaceChange, {interfaceChangeTo: 'bob'});
    });

    it('should send proper payload for #makeInterfaceChange', async () => {
        const built = await client.makeInterfaceChange({interfaceChangeTo: 'bob'});
        await built.log({searchUID: provider.getSearchUID()});
        expectMatchPayload(SearchPageEvents.interfaceChange, {interfaceChangeTo: 'bob'});
        expectSearchEventToMatchDescription(built.description, SearchPageEvents.interfaceChange, {
            interfaceChangeTo: 'bob',
        });
    });

    it('should send proper payload for #didyoumeanAutomatic', async () => {
        await client.logDidYouMeanAutomatic();
        expectMatchPayload(SearchPageEvents.didyoumeanAutomatic);
    });

    it('should send proper payload for #makeDidyoumeanAutomatic', async () => {
        const built = await client.makeDidYouMeanAutomatic();
        await built.log({searchUID: provider.getSearchUID()});
        expectMatchPayload(SearchPageEvents.didyoumeanAutomatic);
        expectSearchEventToMatchDescription(built.description, SearchPageEvents.didyoumeanAutomatic);
    });

    it('should send proper payload for #didyoumeanClick', async () => {
        await client.logDidYouMeanClick();
        expectMatchPayload(SearchPageEvents.didyoumeanClick);
    });

    it('should send proper payload for #makeDidyoumeanClick', async () => {
        const built = await client.makeDidYouMeanClick();
        await built.log({searchUID: provider.getSearchUID()});
        expectMatchPayload(SearchPageEvents.didyoumeanClick);
        expectSearchEventToMatchDescription(built.description, SearchPageEvents.didyoumeanClick);
    });

    it('should send proper payload for #resultsSort', async () => {
        await client.logResultsSort({resultsSortBy: 'date ascending'});
        expectMatchPayload(SearchPageEvents.resultsSort, {resultsSortBy: 'date ascending'});
    });

    it('should send proper payload for #makeResultsSort', async () => {
        const built = await client.makeResultsSort({resultsSortBy: 'date ascending'});
        await built.log({searchUID: provider.getSearchUID()});
        expectMatchPayload(SearchPageEvents.resultsSort, {resultsSortBy: 'date ascending'});
        expectSearchEventToMatchDescription(built.description, SearchPageEvents.resultsSort, {
            resultsSortBy: 'date ascending',
        });
    });

    it('should send proper payload for #searchboxSubmit', async () => {
        await client.logSearchboxSubmit();
        expectMatchPayload(SearchPageEvents.searchboxSubmit);
    });

    it('should send proper payload for #makeSearchboxSubmit', async () => {
        const built = await client.makeSearchboxSubmit();
        await built.log({searchUID: provider.getSearchUID()});
        expectMatchPayload(SearchPageEvents.searchboxSubmit);
        expectSearchEventToMatchDescription(built.description, SearchPageEvents.searchboxSubmit);
    });

    it('should send proper payload for #searchboxClear', async () => {
        await client.logSearchboxClear();
        expectMatchPayload(SearchPageEvents.searchboxClear);
    });

    it('should send proper payload for #makeSearchboxClear', async () => {
        const built = await client.makeSearchboxClear();
        await built.log({searchUID: provider.getSearchUID()});
        expectMatchPayload(SearchPageEvents.searchboxClear);
        expectSearchEventToMatchDescription(built.description, SearchPageEvents.searchboxClear);
    });

    it('should send proper payload for #searchboxAsYouType', async () => {
        await client.logSearchboxAsYouType();
        expectMatchPayload(SearchPageEvents.searchboxAsYouType);
    });

    it('should send proper payload for #makeSearchboxAsYouType', async () => {
        const built = await client.makeSearchboxAsYouType();
        await built.log({searchUID: provider.getSearchUID()});
        expectMatchPayload(SearchPageEvents.searchboxAsYouType);
        expectSearchEventToMatchDescription(built.description, SearchPageEvents.searchboxAsYouType);
    });

    it('should send proper payload for #documentQuickview', async () => {
        await client.logDocumentQuickview(fakeDocInfo, fakeDocID);
        expectMatchDocumentPayload(SearchPageEvents.documentQuickview, fakeDocInfo, fakeDocID);
    });

    it('should send proper payload for #makeDocumentQuickview', async () => {
        const built = await client.makeDocumentQuickview(fakeDocInfo, fakeDocID);
        await built.log({searchUID: provider.getSearchUID()});
        expectMatchDocumentPayload(SearchPageEvents.documentQuickview, fakeDocInfo, fakeDocID);
        expectMatchDescription(built.description, SearchPageEvents.documentQuickview, {...fakeDocID});
    });

    it('should send proper payload for #documentOpen', async () => {
        await client.logDocumentOpen(fakeDocInfo, fakeDocID);
        expectMatchDocumentPayload(SearchPageEvents.documentOpen, fakeDocInfo, fakeDocID);
    });

    it('should send proper payload for #makeDocumentOpen', async () => {
        const built = await client.makeDocumentOpen(fakeDocInfo, fakeDocID);
        await built.log({searchUID: provider.getSearchUID()});
        expectMatchDocumentPayload(SearchPageEvents.documentOpen, fakeDocInfo, fakeDocID);
        expectMatchDescription(built.description, SearchPageEvents.documentOpen, {...fakeDocID});
    });

    it('should send proper payload for #showMoreFoldedResults', async () => {
        await client.logShowMoreFoldedResults(fakeDocInfo, fakeDocID);
        expectMatchDocumentPayload(SearchPageEvents.showMoreFoldedResults, fakeDocInfo, fakeDocID);
    });

    it('should send proper payload for #makeShowMoreFoldedResults', async () => {
        const built = await client.makeShowMoreFoldedResults(fakeDocInfo, fakeDocID);
        await built.log({searchUID: provider.getSearchUID()});
        expectMatchDocumentPayload(SearchPageEvents.showMoreFoldedResults, fakeDocInfo, fakeDocID);
        expectMatchDescription(built.description, SearchPageEvents.showMoreFoldedResults, fakeDocID);
    });

    it('should send proper payload for #showLessFoldedResults', async () => {
        await client.logShowLessFoldedResults();
        expectMatchCustomEventPayload(SearchPageEvents.showLessFoldedResults);
    });

    it('should send proper payload for #makeShowLessFoldedResults', async () => {
        const built = await client.makeShowLessFoldedResults();
        await built.log({searchUID: provider.getSearchUID()});
        expectMatchCustomEventPayload(SearchPageEvents.showLessFoldedResults);
        expectMatchDescription(built.description, SearchPageEvents.showLessFoldedResults);
    });

    it('should send proper payload for #omniboxAnalytics', async () => {
        const meta: OmniboxSuggestionsMetadata = {
            partialQueries: 'a;b;c',
            partialQuery: 'abcd',
            suggestionRanking: 1,
            suggestions: 'q;w;e;r;t;y',
            querySuggestResponseId: '1',
        };
        await client.logOmniboxAnalytics(meta);
        expectMatchPayload(SearchPageEvents.omniboxAnalytics, meta);
    });

    it('should send proper payload for #makeOmniboxAnalytics', async () => {
        const meta: OmniboxSuggestionsMetadata = {
            partialQueries: 'a;b;c',
            partialQuery: 'abcd',
            suggestionRanking: 1,
            suggestions: 'q;w;e;r;t;y',
            querySuggestResponseId: '1',
        };
        const built = await client.makeOmniboxAnalytics(meta);
        await built.log({searchUID: provider.getSearchUID()});
        expectMatchPayload(SearchPageEvents.omniboxAnalytics, meta);
        expectSearchEventToMatchDescription(built.description, SearchPageEvents.omniboxAnalytics, meta);
    });

    it('should send proper payload for #logOmniboxFromLink', async () => {
        const meta: OmniboxSuggestionsMetadata = {
            partialQueries: 'a;b;c',
            partialQuery: 'abcd',
            suggestionRanking: 1,
            suggestions: 'q;w;e;r;t;y',
            querySuggestResponseId: '1',
        };
        await client.logOmniboxFromLink(meta);
        expectMatchPayload(SearchPageEvents.omniboxFromLink, meta);
    });

    it('should send proper payload for #makeOmniboxFromLink', async () => {
        const meta: OmniboxSuggestionsMetadata = {
            partialQueries: 'a;b;c',
            partialQuery: 'abcd',
            suggestionRanking: 1,
            suggestions: 'q;w;e;r;t;y',
            querySuggestResponseId: '1',
        };
        const built = await client.makeOmniboxFromLink(meta);
        await built.log({searchUID: provider.getSearchUID()});
        expectMatchPayload(SearchPageEvents.omniboxFromLink, meta);
        expectSearchEventToMatchDescription(built.description, SearchPageEvents.omniboxFromLink, meta);
    });

    it('should send proper payload for #logSearchFromLink', async () => {
        await client.logSearchFromLink();
        expectMatchPayload(SearchPageEvents.searchFromLink);
    });

    it('should send proper payload for #makeSearchFromLink', async () => {
        const built = await client.makeSearchFromLink();
        await built.log({searchUID: provider.getSearchUID()});
        expectMatchPayload(SearchPageEvents.searchFromLink);
        expectSearchEventToMatchDescription(built.description, SearchPageEvents.searchFromLink);
    });

    it('should send proper payload for #logTriggerNotify', async () => {
        const meta = {
            notifications: ['foo', 'bar'],
        };
        await client.logTriggerNotify(meta);
        expectMatchCustomEventPayload(SearchPageEvents.triggerNotify, meta);
    });

    it('should send proper payload for #makeTriggerNotify', async () => {
        const meta = {
            notifications: ['foo', 'bar'],
        };
        const built = await client.makeTriggerNotify(meta);
        await built.log({searchUID: provider.getSearchUID()});
        expectMatchCustomEventPayload(SearchPageEvents.triggerNotify, meta);
        expectMatchDescription(built.description, SearchPageEvents.triggerNotify, meta);
    });

    it('should send proper payload for #logTriggerExecute', async () => {
        const meta = {
            executions: [
                {functionName: 'foo', params: [true, 3, 'hello']},
                {functionName: 'world', params: []},
            ],
        };
        await client.logTriggerExecute(meta);
        expectMatchCustomEventPayload(SearchPageEvents.triggerExecute, meta);
    });

    it('should send proper payload for #makeTriggerExecute', async () => {
        const meta = {
            executions: [
                {functionName: 'foo', params: [true, 3, 'hello']},
                {functionName: 'world', params: []},
            ],
        };
        const built = await client.makeTriggerExecute(meta);
        await built.log({searchUID: provider.getSearchUID()});
        expectMatchCustomEventPayload(SearchPageEvents.triggerExecute, meta);
        expectMatchDescription(built.description, SearchPageEvents.triggerExecute, meta);
    });

    it('should send proper payload for #logTriggerQuery', async () => {
        const meta = {
            query: 'queryText',
        };
        await client.logTriggerQuery();
        expectMatchCustomEventPayload(SearchPageEvents.triggerQuery, meta, 'queryPipelineTriggers');
    });

    it('should send proper payload for #makeTriggerQuery', async () => {
        const meta = {
            query: 'queryText',
        };
        const built = await client.makeTriggerQuery();
        await built.log({searchUID: provider.getSearchUID()});
        expectMatchCustomEventPayload(SearchPageEvents.triggerQuery, meta, 'queryPipelineTriggers');
        expectMatchDescription(built.description, SearchPageEvents.triggerQuery, meta);
    });

    it('should send proper payload for #logUndoTriggerQuery', async () => {
        const meta = {
            undoneQuery: 'foo',
        };
        await client.logUndoTriggerQuery(meta);
        expectMatchPayload(SearchPageEvents.undoTriggerQuery, meta);
    });

    it('should send proper payload for #makeUndoTriggerQuery', async () => {
        const meta = {
            undoneQuery: 'foo',
        };
        const built = await client.makeUndoTriggerQuery(meta);
        await built.log({searchUID: provider.getSearchUID()});
        expectMatchPayload(SearchPageEvents.undoTriggerQuery, meta);
        expectSearchEventToMatchDescription(built.description, SearchPageEvents.undoTriggerQuery, meta);
    });

    it('should send proper payload for #logTriggerRedirect', async () => {
        const meta = {
            redirectedTo: 'foo',
            query: provider.getSearchEventRequestPayload().queryText,
        };
        await client.logTriggerRedirect(meta);
        expectMatchCustomEventPayload(SearchPageEvents.triggerRedirect, meta);
    });

    it('should send proper payload for #makeTriggerRedirect', async () => {
        const meta = {
            redirectedTo: 'foo',
            query: provider.getSearchEventRequestPayload().queryText,
        };
        const built = await client.makeTriggerRedirect(meta);
        await built.log({searchUID: provider.getSearchUID()});
        expectMatchCustomEventPayload(SearchPageEvents.triggerRedirect, meta);
        expectMatchDescription(built.description, SearchPageEvents.triggerRedirect, meta);
    });

    it('should send proper payload for #logPagerResize', async () => {
        const meta = {
            currentResultsPerPage: 123,
        };
        await client.logPagerResize(meta);
        expectMatchCustomEventPayload(SearchPageEvents.pagerResize, meta);
    });

    it('should send proper payload for #makePagerResize', async () => {
        const meta = {
            currentResultsPerPage: 123,
        };
        const built = await client.makePagerResize(meta);
        await built.log({searchUID: provider.getSearchUID()});
        expectMatchCustomEventPayload(SearchPageEvents.pagerResize, meta);
        expectMatchDescription(built.description, SearchPageEvents.pagerResize, meta);
    });

    it('should send proper payload for #logPagerNumber', async () => {
        const meta = {pagerNumber: 123};
        await client.logPagerNumber(meta);
        expectMatchCustomEventPayload(SearchPageEvents.pagerNumber, meta);
    });

    it('should send proper payload for #makePagerNumber', async () => {
        const meta = {pagerNumber: 123};
        const built = await client.makePagerNumber(meta);
        await built.log({searchUID: provider.getSearchUID()});
        expectMatchCustomEventPayload(SearchPageEvents.pagerNumber, meta);
        expectMatchDescription(built.description, SearchPageEvents.pagerNumber, meta);
    });

    it('should send proper payload for #logPagerNext', async () => {
        const meta = {pagerNumber: 123};
        await client.logPagerNext(meta);
        expectMatchCustomEventPayload(SearchPageEvents.pagerNext, meta);
    });

    it('should send proper payload for #makePagerNext', async () => {
        const meta = {pagerNumber: 123};
        const built = await client.makePagerNext(meta);
        await built.log({searchUID: provider.getSearchUID()});
        expectMatchCustomEventPayload(SearchPageEvents.pagerNext, meta);
        expectMatchDescription(built.description, SearchPageEvents.pagerNext, meta);
    });

    it('should send proper payload for #logPagerPrevious', async () => {
        const meta = {pagerNumber: 123};
        await client.logPagerPrevious(meta);
        expectMatchCustomEventPayload(SearchPageEvents.pagerPrevious, meta);
    });

    it('should send proper payload for #makePagerPrevious', async () => {
        const meta = {pagerNumber: 123};
        const built = await client.makePagerPrevious(meta);
        await built.log({searchUID: provider.getSearchUID()});
        expectMatchCustomEventPayload(SearchPageEvents.pagerPrevious, meta);
        expectMatchDescription(built.description, SearchPageEvents.pagerPrevious, meta);
    });

    it('should send proper payload for #logPagerScrolling', async () => {
        await client.logPagerScrolling();
        expectMatchCustomEventPayload(SearchPageEvents.pagerScrolling);
    });

    it('should send proper payload for #makePagerScrolling', async () => {
        const built = await client.makePagerScrolling();
        await built.log({searchUID: provider.getSearchUID()});
        expectMatchCustomEventPayload(SearchPageEvents.pagerScrolling);
        expectMatchDescription(built.description, SearchPageEvents.pagerScrolling);
    });

    it('should send the proper payload for #logStaticFilterClearAll', async () => {
        const staticFilterId = 'filetypes';
        await client.logStaticFilterClearAll({staticFilterId});

        expectMatchPayload(SearchPageEvents.staticFilterClearAll, {staticFilterId});
    });

    it('should send the proper payload for #makeStaticFilterClearAll', async () => {
        const staticFilterId = 'filetypes';
        const built = await client.makeStaticFilterClearAll({staticFilterId});
        await built.log({searchUID: provider.getSearchUID()});
        expectMatchPayload(SearchPageEvents.staticFilterClearAll, {staticFilterId});
        expectSearchEventToMatchDescription(built.description, SearchPageEvents.staticFilterClearAll, {staticFilterId});
    });

    it('should send the proper payload for #logStaticFilterSelect', async () => {
        const meta: StaticFilterToggleValueMetadata = {
            staticFilterId: 'filetypes',
            staticFilterValue: {
                caption: 'Youtube',
                expression: '@filetype="youtubevideo"',
            },
        };
        await client.logStaticFilterSelect(meta);

        expectMatchPayload(SearchPageEvents.staticFilterSelect, meta);
    });

    it('should send the proper payload for #makeStaticFilterSelect', async () => {
        const meta: StaticFilterToggleValueMetadata = {
            staticFilterId: 'filetypes',
            staticFilterValue: {
                caption: 'Youtube',
                expression: '@filetype="youtubevideo"',
            },
        };
        const built = await client.makeStaticFilterSelect(meta);
        await built.log({searchUID: provider.getSearchUID()});

        expectMatchPayload(SearchPageEvents.staticFilterSelect, meta);
        expectSearchEventToMatchDescription(built.description, SearchPageEvents.staticFilterSelect, meta);
    });

    it('should send the proper payload for #logStaticFilterDeselect', async () => {
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

    it('should send the proper payload for #makeStaticFilterDeselect', async () => {
        const meta: StaticFilterToggleValueMetadata = {
            staticFilterId: 'filetypes',
            staticFilterValue: {
                caption: 'Youtube',
                expression: '@filetype="youtubevideo"',
            },
        };
        const built = await client.makeStaticFilterDeselect(meta);
        await built.log({searchUID: provider.getSearchUID()});
        expectMatchPayload(SearchPageEvents.staticFilterDeselect, meta);
        expectSearchEventToMatchDescription(built.description, SearchPageEvents.staticFilterDeselect, meta);
    });

    it('should send proper payload for #logFacetSearch', async () => {
        const meta = {
            facetField: '@foo',
            facetId: 'bar',
            facetTitle: 'title',
        };
        await client.logFacetSearch(meta);
        expectMatchPayload(SearchPageEvents.facetSearch, meta);
    });

    it('should send proper payload for #makeFacetSearch', async () => {
        const meta = {
            facetField: '@foo',
            facetId: 'bar',
            facetTitle: 'title',
        };
        const built = await client.makeFacetSearch(meta);
        await built.log({searchUID: provider.getSearchUID()});
        expectMatchPayload(SearchPageEvents.facetSearch, meta);
        expectSearchEventToMatchDescription(built.description, SearchPageEvents.facetSearch, meta);
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

    it('should send proper payload for #makeFacetSelect', async () => {
        const meta = {
            facetField: '@foo',
            facetId: 'bar',
            facetTitle: 'title',
            facetValue: 'qwerty',
        };
        const built = await client.makeFacetSelect(meta);
        await built.log({searchUID: provider.getSearchUID()});
        expectMatchPayload(SearchPageEvents.facetSelect, meta);
        expectSearchEventToMatchDescription(built.description, SearchPageEvents.facetSelect, meta);
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

    it('should send proper payload for #makeFacetDeselect', async () => {
        const meta = {
            facetField: '@foo',
            facetId: 'bar',
            facetTitle: 'title',
            facetValue: 'qwerty',
        };

        const built = await client.makeFacetDeselect(meta);
        await built.log({searchUID: provider.getSearchUID()});
        expectMatchPayload(SearchPageEvents.facetDeselect, meta);
        expectSearchEventToMatchDescription(built.description, SearchPageEvents.facetDeselect, meta);
    });

    it('should send proper payload for #logFacetExclude', async () => {
        const meta = {
            facetField: '@foo',
            facetId: 'bar',
            facetTitle: 'title',
            facetValue: 'qwerty',
        };
        await client.logFacetExclude(meta);
        expectMatchPayload(SearchPageEvents.facetExclude, meta);
    });

    it('should send proper payload for #makeFacetExclude', async () => {
        const meta = {
            facetField: '@foo',
            facetId: 'bar',
            facetTitle: 'title',
            facetValue: 'qwerty',
        };
        const built = await client.makeFacetExclude(meta);
        await built.log({searchUID: provider.getSearchUID()});
        expectMatchPayload(SearchPageEvents.facetExclude, meta);
        expectSearchEventToMatchDescription(built.description, SearchPageEvents.facetExclude, meta);
    });

    it('should send proper payload for #logFacetUnexclude', async () => {
        const meta = {
            facetField: '@foo',
            facetId: 'bar',
            facetTitle: 'title',
            facetValue: 'qwerty',
        };
        await client.logFacetUnexclude(meta);
        expectMatchPayload(SearchPageEvents.facetUnexclude, meta);
    });

    it('should send proper payload for #makeFacetUnexclude', async () => {
        const meta = {
            facetField: '@foo',
            facetId: 'bar',
            facetTitle: 'title',
            facetValue: 'qwerty',
        };
        const built = await client.makeFacetUnexclude(meta);
        await built.log({searchUID: provider.getSearchUID()});
        expectMatchPayload(SearchPageEvents.facetUnexclude, meta);
        expectSearchEventToMatchDescription(built.description, SearchPageEvents.facetUnexclude, meta);
    });

    it('should send proper payload for #logFacetSelectAll', async () => {
        const meta = {
            facetField: '@foo',
            facetId: 'bar',
            facetTitle: 'title',
        };
        await client.logFacetSelectAll(meta);
        expectMatchPayload(SearchPageEvents.facetSelectAll, meta);
    });

    it('should send proper payload for #makeFacetSelectAll', async () => {
        const meta = {
            facetField: '@foo',
            facetId: 'bar',
            facetTitle: 'title',
        };
        const built = await client.makeFacetSelectAll(meta);
        await built.log({searchUID: provider.getSearchUID()});
        expectMatchPayload(SearchPageEvents.facetSelectAll, meta);
        expectSearchEventToMatchDescription(built.description, SearchPageEvents.facetSelectAll, meta);
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

    it('should send proper payload for #makeFacetUpdateSort', async () => {
        const meta = {
            facetField: '@foo',
            facetId: 'bar',
            facetTitle: 'title',
            criteria: 'bazz',
        };
        const built = await client.makeFacetUpdateSort(meta);
        await built.log({searchUID: provider.getSearchUID()});
        expectMatchPayload(SearchPageEvents.facetUpdateSort, meta);
        expectSearchEventToMatchDescription(built.description, SearchPageEvents.facetUpdateSort, meta);
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

    it('should send proper payload for #makeFacetShowMore', async () => {
        const meta = {
            facetField: '@foo',
            facetId: 'bar',
            facetTitle: 'title',
        };
        const built = await client.makeFacetShowMore(meta);
        await built.log({searchUID: provider.getSearchUID()});
        expectMatchCustomEventPayload(SearchPageEvents.facetShowMore, meta);
        expectMatchDescription(built.description, SearchPageEvents.facetShowMore, meta);
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

    it('should send proper payload for #makeFacetShowLess', async () => {
        const meta = {
            facetField: '@foo',
            facetId: 'bar',
            facetTitle: 'title',
        };
        const built = await client.makeFacetShowLess(meta);
        await built.log({searchUID: provider.getSearchUID()});
        expectMatchCustomEventPayload(SearchPageEvents.facetShowLess, meta);
        expectMatchDescription(built.description, SearchPageEvents.facetShowLess, meta);
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

    it('should send proper payload for #makeQueryError', async () => {
        const meta = {
            query: 'q',
            aq: 'aq',
            cq: 'cq',
            dq: 'dq',
            errorMessage: 'boom',
            errorType: 'a bad one',
        };
        const built = await client.makeQueryError(meta);
        await built.log({searchUID: provider.getSearchUID()});
        expectMatchCustomEventPayload(SearchPageEvents.queryError, meta);
        expectMatchDescription(built.description, SearchPageEvents.queryError, meta);
    });

    it('should send proper payload for #logQueryErrorBack', async () => {
        await client.logQueryErrorBack();
        expectMatchPayload(SearchPageEvents.queryErrorBack);
    });

    it('should send proper payload for #makeQueryErrorBack', async () => {
        const built = await client.makeQueryErrorBack();
        await built.log({searchUID: provider.getSearchUID()});

        expectMatchPayload(SearchPageEvents.queryErrorBack);
        expectMatchDescription(built.description, SearchPageEvents.queryErrorBack);
    });

    it('should send proper payload for #logQueryErrorRetry', async () => {
        await client.logQueryErrorRetry();
        expectMatchPayload(SearchPageEvents.queryErrorRetry);
    });

    it('should send proper payload for #makeQueryErrorRetry', async () => {
        const built = await client.makeQueryErrorRetry();
        await built.log({searchUID: provider.getSearchUID()});
        expectMatchPayload(SearchPageEvents.queryErrorRetry);
        expectMatchDescription(built.description, SearchPageEvents.queryErrorRetry);
    });

    it('should send proper payload for #logQueryErrorClear', async () => {
        await client.logQueryErrorClear();
        expectMatchPayload(SearchPageEvents.queryErrorClear);
    });

    it('should send proper payload for #makeQueryErrorClear', async () => {
        const built = await client.makeQueryErrorClear();
        await built.log({searchUID: provider.getSearchUID()});
        expectMatchPayload(SearchPageEvents.queryErrorClear);
        expectMatchDescription(built.description, SearchPageEvents.queryErrorClear);
    });

    it('should send proper payload for #logRecommendationInterfaceLoad', async () => {
        await client.logRecommendationInterfaceLoad();
        expectMatchPayload(SearchPageEvents.recommendationInterfaceLoad);
    });

    it('should send proper payload for #makeRecommendationInterfaceLoad', async () => {
        const built = await client.makeRecommendationInterfaceLoad();
        await built.log({searchUID: provider.getSearchUID()});
        expectMatchPayload(SearchPageEvents.recommendationInterfaceLoad);
        expectSearchEventToMatchDescription(built.description, SearchPageEvents.recommendationInterfaceLoad);
    });

    it('should send proper payload for #logRecommendation', async () => {
        await client.logRecommendation();
        expectMatchCustomEventPayload(SearchPageEvents.recommendation);
    });

    it('should send proper payload for #makeRecommendation', async () => {
        const built = await client.makeRecommendation();
        await built.log({searchUID: provider.getSearchUID()});
        expectMatchCustomEventPayload(SearchPageEvents.recommendation);
    });

    it('should send proper payload for #recommendationOpen', async () => {
        await client.logRecommendationOpen(fakeDocInfo, fakeDocID);
        expectMatchDocumentPayload(SearchPageEvents.recommendationOpen, fakeDocInfo, fakeDocID);
    });

    it('should send proper payload for #makeRecommendationOpen', async () => {
        const built = await client.makeRecommendationOpen(fakeDocInfo, fakeDocID);
        await built.log({searchUID: provider.getSearchUID()});
        expectMatchDocumentPayload(SearchPageEvents.recommendationOpen, fakeDocInfo, fakeDocID);
        expectMatchDescription(built.description, SearchPageEvents.recommendationOpen, {...fakeDocID});
    });

    it('should send proper payload for #fetchMoreResults', async () => {
        await client.logFetchMoreResults();
        expectMatchCustomEventPayload(SearchPageEvents.pagerScrolling, {type: 'getMoreResults'});
    });

    it('should send proper payload for #makeFetchMoreResults', async () => {
        const built = await client.makeFetchMoreResults();
        await built.log({searchUID: provider.getSearchUID()});
        expectMatchCustomEventPayload(SearchPageEvents.pagerScrolling, {type: 'getMoreResults'});
        expectMatchDescription(built.description, SearchPageEvents.pagerScrolling, {type: 'getMoreResults'});
    });

    it('should send proper payload for #logLikeSmartSnippet', async () => {
        await client.logLikeSmartSnippet();
        expectMatchCustomEventPayload(SearchPageEvents.likeSmartSnippet);
    });

    it('should send proper payload for #makeLikeSmartSnippet', async () => {
        const built = await client.makeLikeSmartSnippet();
        await built.log({searchUID: provider.getSearchUID()});
        expectMatchCustomEventPayload(SearchPageEvents.likeSmartSnippet);
        expectMatchDescription(built.description, SearchPageEvents.likeSmartSnippet);
    });

    it('should send proper payload for #logDislikeSmartSnippet', async () => {
        await client.logDislikeSmartSnippet();
        expectMatchCustomEventPayload(SearchPageEvents.dislikeSmartSnippet);
    });

    it('should send proper payload for #makeDislikeSmartSnippet', async () => {
        const built = await client.makeDislikeSmartSnippet();
        await built.log({searchUID: provider.getSearchUID()});
        expectMatchCustomEventPayload(SearchPageEvents.dislikeSmartSnippet);
        expectMatchDescription(built.description, SearchPageEvents.dislikeSmartSnippet);
    });

    it('should send proper payload for #logExpandSmartSnippet', async () => {
        await client.logExpandSmartSnippet();
        expectMatchCustomEventPayload(SearchPageEvents.expandSmartSnippet);
    });

    it('should send proper payload for #makeExpandSmartSnippet', async () => {
        const built = await client.makeExpandSmartSnippet();
        await built.log({searchUID: provider.getSearchUID()});
        expectMatchCustomEventPayload(SearchPageEvents.expandSmartSnippet);
        expectMatchDescription(built.description, SearchPageEvents.expandSmartSnippet);
    });

    it('should send proper payload for #logCollapseSmartSnippet', async () => {
        await client.logCollapseSmartSnippet();
        expectMatchCustomEventPayload(SearchPageEvents.collapseSmartSnippet);
    });

    it('should send proper payload for #makeCollapseSmartSnippet', async () => {
        const built = await client.makeCollapseSmartSnippet();
        await built.log({searchUID: provider.getSearchUID()});
        expectMatchCustomEventPayload(SearchPageEvents.collapseSmartSnippet);
        expectMatchDescription(built.description, SearchPageEvents.collapseSmartSnippet);
    });

    it('should send proper payload for #logOpenSmartSnippetFeedbackModal', async () => {
        await client.logOpenSmartSnippetFeedbackModal();
        expectMatchCustomEventPayload(SearchPageEvents.openSmartSnippetFeedbackModal);
    });

    it('should send proper payload for #makeOpenSmartSnippetFeedbackModal', async () => {
        const built = await client.makeOpenSmartSnippetFeedbackModal();
        await built.log({searchUID: provider.getSearchUID()});
        expectMatchCustomEventPayload(SearchPageEvents.openSmartSnippetFeedbackModal);
        expectMatchDescription(built.description, SearchPageEvents.openSmartSnippetFeedbackModal);
    });

    it('should send proper payload for #logCloseSmartSnippetFeedbackModal', async () => {
        await client.logCloseSmartSnippetFeedbackModal();
        expectMatchCustomEventPayload(SearchPageEvents.closeSmartSnippetFeedbackModal);
    });

    it('should send proper payload for #makeCloseSmartSnippetFeedbackModal', async () => {
        const built = await client.makeCloseSmartSnippetFeedbackModal();
        await built.log({searchUID: provider.getSearchUID()});
        expectMatchCustomEventPayload(SearchPageEvents.closeSmartSnippetFeedbackModal);
        expectMatchDescription(built.description, SearchPageEvents.closeSmartSnippetFeedbackModal);
    });

    it('should send proper payload for #logSmartSnippetFeedbackReason', async () => {
        await client.logSmartSnippetFeedbackReason('does_not_answer', 'this is irrelevant');
        expectMatchCustomEventPayload(SearchPageEvents.sendSmartSnippetReason, {
            details: 'this is irrelevant',
            reason: 'does_not_answer',
        });
    });

    it('should send proper payload for #makeSmartSnippetFeedbackReason', async () => {
        const built = await client.makeSmartSnippetFeedbackReason('does_not_answer', 'this is irrelevant');
        await built.log({searchUID: provider.getSearchUID()});
        expectMatchCustomEventPayload(SearchPageEvents.sendSmartSnippetReason, {
            details: 'this is irrelevant',
            reason: 'does_not_answer',
        });
        expectMatchDescription(built.description, SearchPageEvents.sendSmartSnippetReason, {
            details: 'this is irrelevant',
            reason: 'does_not_answer',
        });
    });

    it('should send proper payload for #logExpandSmartSnippetSuggestion', async () => {
        await client.logExpandSmartSnippetSuggestion({
            question: 'Abc',
            answerSnippet: 'Def',
            documentId: {contentIdKey: 'permanentid', contentIdValue: 'foo'},
        });
        expectMatchCustomEventPayload(SearchPageEvents.expandSmartSnippetSuggestion, {
            question: 'Abc',
            answerSnippet: 'Def',
            documentId: {contentIdKey: 'permanentid', contentIdValue: 'foo'},
        });
    });

    it('should send proper payload for #makeExpandSmartSnippetSuggestion', async () => {
        const built = await client.makeExpandSmartSnippetSuggestion({
            question: 'Abc',
            answerSnippet: 'Def',
            documentId: {contentIdKey: 'permanentid', contentIdValue: 'foo'},
        });
        await built.log({searchUID: provider.getSearchUID()});
        expectMatchCustomEventPayload(SearchPageEvents.expandSmartSnippetSuggestion, {
            question: 'Abc',
            answerSnippet: 'Def',
            documentId: {contentIdKey: 'permanentid', contentIdValue: 'foo'},
        });
        expectMatchDescription(built.description, SearchPageEvents.expandSmartSnippetSuggestion, {
            question: 'Abc',
            answerSnippet: 'Def',
            documentId: {contentIdKey: 'permanentid', contentIdValue: 'foo'},
        });
    });

    it('should send proper payload for #logCollapseSmartSnippetSuggestion', async () => {
        await client.logCollapseSmartSnippetSuggestion({
            question: 'Abc',
            answerSnippet: 'Def',
            documentId: {contentIdKey: 'permanentid', contentIdValue: 'foo'},
        });
        expectMatchCustomEventPayload(SearchPageEvents.collapseSmartSnippetSuggestion, {
            question: 'Abc',
            answerSnippet: 'Def',
            documentId: {contentIdKey: 'permanentid', contentIdValue: 'foo'},
        });
    });

    it('should send proper payload for #makeCollapseSmartSnippetSuggestion', async () => {
        const built = await client.makeCollapseSmartSnippetSuggestion({
            question: 'Abc',
            answerSnippet: 'Def',
            documentId: {contentIdKey: 'permanentid', contentIdValue: 'foo'},
        });
        await built.log({searchUID: provider.getSearchUID()});
        expectMatchCustomEventPayload(SearchPageEvents.collapseSmartSnippetSuggestion, {
            question: 'Abc',
            answerSnippet: 'Def',
            documentId: {contentIdKey: 'permanentid', contentIdValue: 'foo'},
        });
        expectMatchDescription(built.description, SearchPageEvents.collapseSmartSnippetSuggestion, {
            question: 'Abc',
            answerSnippet: 'Def',
            documentId: {contentIdKey: 'permanentid', contentIdValue: 'foo'},
        });
    });

    it('should send proper payload for #logExpandSmartSnippetSuggestion when called with only the documentId', async () => {
        await client.logExpandSmartSnippetSuggestion({contentIdKey: 'permanentid', contentIdValue: 'foo'});
        expectMatchCustomEventPayload(SearchPageEvents.expandSmartSnippetSuggestion, {
            documentId: {contentIdKey: 'permanentid', contentIdValue: 'foo'},
        });
    });

    it('should send proper payload for #makeExpandSmartSnippetSuggestion when called with only the documentId', async () => {
        const built = await client.makeExpandSmartSnippetSuggestion({
            contentIdKey: 'permanentid',
            contentIdValue: 'foo',
        });
        await built.log({searchUID: provider.getSearchUID()});
        expectMatchCustomEventPayload(SearchPageEvents.expandSmartSnippetSuggestion, {
            documentId: {contentIdKey: 'permanentid', contentIdValue: 'foo'},
        });
        expectMatchDescription(built.description, SearchPageEvents.expandSmartSnippetSuggestion, {
            documentId: {contentIdKey: 'permanentid', contentIdValue: 'foo'},
        });
    });

    it('should send proper payload for #logCollapseSmartSnippetSuggestion when called with only the documentId', async () => {
        await client.logCollapseSmartSnippetSuggestion({contentIdKey: 'permanentid', contentIdValue: 'foo'});
        expectMatchCustomEventPayload(SearchPageEvents.collapseSmartSnippetSuggestion, {
            documentId: {contentIdKey: 'permanentid', contentIdValue: 'foo'},
        });
    });

    it('should send proper payload for #makeCollapseSmartSnippetSuggestion when called with only the documentId', async () => {
        const built = await client.makeCollapseSmartSnippetSuggestion({
            contentIdKey: 'permanentid',
            contentIdValue: 'foo',
        });
        await built.log({searchUID: provider.getSearchUID()});
        expectMatchCustomEventPayload(SearchPageEvents.collapseSmartSnippetSuggestion, {
            documentId: {contentIdKey: 'permanentid', contentIdValue: 'foo'},
        });
        expectMatchDescription(built.description, SearchPageEvents.collapseSmartSnippetSuggestion, {
            documentId: {contentIdKey: 'permanentid', contentIdValue: 'foo'},
        });
    });

    it('should send proper payload for #logShowMoreSmartSnippetSuggestion', async () => {
        await client.logShowMoreSmartSnippetSuggestion({
            question: 'Abc',
            answerSnippet: 'Def',
            documentId: {contentIdKey: 'permanentid', contentIdValue: 'foo'},
        });
        expectMatchCustomEventPayload(SearchPageEvents.showMoreSmartSnippetSuggestion, {
            question: 'Abc',
            answerSnippet: 'Def',
            documentId: {contentIdKey: 'permanentid', contentIdValue: 'foo'},
        });
    });

    it('should send proper payload for #logShowLessSmartSnippetSuggestion', async () => {
        await client.logShowLessSmartSnippetSuggestion({
            question: 'Abc',
            answerSnippet: 'Def',
            documentId: {contentIdKey: 'permanentid', contentIdValue: 'foo'},
        });
        expectMatchCustomEventPayload(SearchPageEvents.showLessSmartSnippetSuggestion, {
            question: 'Abc',
            answerSnippet: 'Def',
            documentId: {contentIdKey: 'permanentid', contentIdValue: 'foo'},
        });
    });

    it('should send proper payload for #logOpenSmartSnippetSource', async () => {
        await client.logOpenSmartSnippetSource(fakeDocInfo, fakeDocID);
        expectMatchDocumentPayload(SearchPageEvents.openSmartSnippetSource, fakeDocInfo, fakeDocID);
    });

    it('should send proper payload for #logCopyToClipboard', async () => {
        await client.logCopyToClipboard(fakeDocInfo, fakeDocID);
        expectMatchDocumentPayload(SearchPageEvents.copyToClipboard, fakeDocInfo, fakeDocID);
    });

    it('should send proper payload for #makeOpenSmartSnippetSource', async () => {
        const built = await client.makeOpenSmartSnippetSource(fakeDocInfo, fakeDocID);
        await built.log({searchUID: provider.getSearchUID()});
        expectMatchDocumentPayload(SearchPageEvents.openSmartSnippetSource, fakeDocInfo, fakeDocID);
        expectMatchDescription(built.description, SearchPageEvents.openSmartSnippetSource, {...fakeDocID});
    });

    it('should send proper payload for #logOpenSmartSnippetSuggestionSource', async () => {
        const meta = {
            question: 'Abc',
            answerSnippet: 'Def',
            documentId: {contentIdKey: 'permanentid', contentIdValue: 'foo'},
        };
        await client.logOpenSmartSnippetSuggestionSource(fakeDocInfo, meta);
        expectMatchDocumentPayload(SearchPageEvents.openSmartSnippetSuggestionSource, fakeDocInfo, {
            ...meta,
            contentIDKey: meta.documentId.contentIdKey,
            contentIDValue: meta.documentId.contentIdValue,
        });
    });

    it('should send proper payload for #makeOpenSmartSnippetSuggestionSource', async () => {
        const meta = {
            question: 'Abc',
            answerSnippet: 'Def',
            contentIDKey: 'permanentid',
            contentIDValue: 'foo',
            documentId: {contentIdKey: 'permanentid', contentIdValue: 'foo'},
        };
        const built = await client.makeOpenSmartSnippetSuggestionSource(fakeDocInfo, meta);
        await built.log({searchUID: provider.getSearchUID()});
        expectMatchDocumentPayload(SearchPageEvents.openSmartSnippetSuggestionSource, fakeDocInfo, meta);
        expectMatchDescription(built.description, SearchPageEvents.openSmartSnippetSuggestionSource, meta);
    });

    it('should send proper payload for #logOpenSmartSnippetInlineLink', async () => {
        const meta = {
            ...fakeDocID,
            linkText: 'Some text',
            linkURL: 'https://invalid.com',
        };
        await client.logOpenSmartSnippetInlineLink(fakeDocInfo, meta);
        expectMatchDocumentPayload(SearchPageEvents.openSmartSnippetInlineLink, fakeDocInfo, meta);
    });

    it('should send proper payload for #makeOpenSmartSnippetInlineLink', async () => {
        const meta = {
            ...fakeDocID,
            linkText: 'Some text',
            linkURL: 'https://invalid.com',
        };
        const built = await client.makeOpenSmartSnippetInlineLink(fakeDocInfo, meta);
        await built.log({searchUID: provider.getSearchUID()});
        expectMatchDocumentPayload(SearchPageEvents.openSmartSnippetInlineLink, fakeDocInfo, meta);
        expectMatchDescription(built.description, SearchPageEvents.openSmartSnippetInlineLink, meta);
    });

    it('should send proper payload for #logOpenSmartSnippetSuggestionInlineLink', async () => {
        const meta = {
            question: 'Abc',
            answerSnippet: 'Def',
            documentId: {contentIdKey: 'permanentid', contentIdValue: 'foo'},
            linkText: 'Some text',
            linkURL: 'https://invalid.com',
        };
        await client.logOpenSmartSnippetSuggestionInlineLink(fakeDocInfo, meta);
        expectMatchDocumentPayload(SearchPageEvents.openSmartSnippetSuggestionInlineLink, fakeDocInfo, {
            ...meta,
            contentIDKey: meta.documentId.contentIdKey,
            contentIDValue: meta.documentId.contentIdValue,
        });
    });

    it('should send proper payload for #makeOpenSmartSnippetSuggestionInlineLink', async () => {
        const meta = {
            question: 'Abc',
            answerSnippet: 'Def',
            contentIDKey: 'permanentid',
            contentIDValue: 'foo',
            documentId: {contentIdKey: 'permanentid', contentIdValue: 'foo'},
            linkText: 'Some text',
            linkURL: 'https://invalid.com',
        };
        const built = await client.makeOpenSmartSnippetSuggestionInlineLink(fakeDocInfo, meta);
        await built.log({searchUID: provider.getSearchUID()});
        expectMatchDocumentPayload(SearchPageEvents.openSmartSnippetSuggestionInlineLink, fakeDocInfo, meta);
        expectMatchDescription(built.description, SearchPageEvents.openSmartSnippetSuggestionInlineLink, meta);
    });

    it('should send proper payload for #logRecentQueryClick', async () => {
        await client.logRecentQueryClick();
        expectMatchPayload(SearchPageEvents.recentQueryClick);
    });

    it('should send proper payload for #makeRecentQueryClick', async () => {
        const built = await client.makeRecentQueryClick();
        await built.log({searchUID: provider.getSearchUID()});

        expectMatchPayload(SearchPageEvents.recentQueryClick);
        expectSearchEventToMatchDescription(built.description, SearchPageEvents.recentQueryClick);
    });

    it('should send proper payload for #logClearRecentQueries', async () => {
        await client.logClearRecentQueries();
        expectMatchCustomEventPayload(SearchPageEvents.clearRecentQueries);
    });

    it('should send proper payload for #makeClearRecentQueries', async () => {
        const built = await client.makeClearRecentQueries();
        await built.log({searchUID: provider.getSearchUID()});

        expectMatchCustomEventPayload(SearchPageEvents.clearRecentQueries);
        expectMatchDescription(built.description, SearchPageEvents.clearRecentQueries);
    });

    it('should send proper payload for #logRecentResultClick', async () => {
        await client.logRecentResultClick(fakeDocInfo, fakeDocID);
        expectMatchCustomEventPayload(SearchPageEvents.recentResultClick, {
            info: fakeDocInfo,
            identifier: fakeDocID,
        });
    });

    it('should send proper payload for #makeRecentResultClick', async () => {
        const built = await client.makeRecentResultClick(fakeDocInfo, fakeDocID);
        await built.log({searchUID: provider.getSearchUID()});

        expectMatchCustomEventPayload(SearchPageEvents.recentResultClick, {
            info: fakeDocInfo,
            identifier: fakeDocID,
        });

        expectMatchDescription(built.description, SearchPageEvents.recentResultClick, {
            info: fakeDocInfo,
            identifier: fakeDocID,
        });
    });

    it('should send proper payload for #logNoResultsBack', async () => {
        await client.logNoResultsBack();
        expectMatchPayload(SearchPageEvents.noResultsBack);
    });

    it('should send proper payload for #makeNoResultsBack', async () => {
        const built = await client.makeNoResultsBack();
        await built.log({searchUID: provider.getSearchUID()});

        expectMatchPayload(SearchPageEvents.noResultsBack);
        expectSearchEventToMatchDescription(built.description, SearchPageEvents.noResultsBack);
    });

    it('should send proper payload for #logClearRecentResults', async () => {
        await client.logClearRecentResults();
        expectMatchCustomEventPayload(SearchPageEvents.clearRecentResults);
    });

    it('should send proper payload for #makeClearRecentResults', async () => {
        const built = await client.makeClearRecentResults();
        await built.log({searchUID: provider.getSearchUID()});

        expectMatchCustomEventPayload(SearchPageEvents.clearRecentResults);
        expectMatchDescription(built.description, SearchPageEvents.clearRecentResults);
    });

    it('should send proper payload for #logCustomEventWithType', async () => {
        await client.logCustomEventWithType('foo', 'bar', {buzz: 'bazz'});
        expectMatchCustomEventWithTypePayload('foo', 'bar', {buzz: 'bazz'});
    });

    it('should send proper payload for #makeCustomEventWithType', async () => {
        const built = await client.makeCustomEventWithType('foo', 'bar', {buzz: 'bazz'});
        await built.log({searchUID: provider.getSearchUID()});

        expectMatchCustomEventWithTypePayload('foo', 'bar', {buzz: 'bazz'});
        expectMatchDescription(built.description, 'foo' as SearchPageEvents, {buzz: 'bazz'});
    });

    it('should enable analytics tracking by default', () => {
        const c = new CoveoSearchPageClient({}, provider);
        expect(c.coveoAnalyticsClient instanceof CoveoAnalyticsClient).toBe(true);
    });

    it('should allow disabling analytics on initialization', () => {
        const c = new CoveoSearchPageClient({enableAnalytics: false}, provider);
        expect(c.coveoAnalyticsClient instanceof NoopAnalytics).toBe(true);
    });

    it('should disable analytics when doNotTrack is enabled', async () => {
        (doNotTrack as jest.Mock).mockImplementationOnce(() => true);

        const c = new CoveoSearchPageClient({}, provider);
        expect(c.coveoAnalyticsClient instanceof NoopAnalytics).toBe(true);
    });

    it('should allow disabling analytics after initialization', () => {
        const c = new CoveoSearchPageClient({enableAnalytics: true}, provider);
        expect(c.coveoAnalyticsClient instanceof CoveoAnalyticsClient).toBe(true);
        c.disable();
        expect(c.coveoAnalyticsClient instanceof NoopAnalytics).toBe(true);
    });

    it('disabling analytics does not delete the visitorId', () => {
        const visitorId = 'uuid';
        Cookie.set('coveo_visitorId', visitorId);
        const c = new CoveoSearchPageClient({enableAnalytics: true}, provider);

        expect(Cookie.get('coveo_visitorId')).toBe(visitorId);
        c.disable();
        expect(Cookie.get('coveo_visitorId')).toBe(visitorId);
    });

    it('should allow enabling analytics after initialization', () => {
        const c = new CoveoSearchPageClient({enableAnalytics: false}, provider);
        expect(c.coveoAnalyticsClient instanceof NoopAnalytics).toBe(true);
        c.enable();
        expect(c.coveoAnalyticsClient instanceof CoveoAnalyticsClient).toBe(true);
    });

    it('should send proper payload for #logLikeGeneratedAnswer', async () => {
        const meta = {generativeQuestionAnsweringId: fakeStreamId};
        await client.logLikeGeneratedAnswer(meta);
        expectMatchCustomEventPayload(SearchPageEvents.likeGeneratedAnswer, meta);
    });

    it('should send proper payload for #makeLikeGeneratedAnswer', async () => {
        const meta = {generativeQuestionAnsweringId: fakeStreamId};
        const built = await client.makeLikeGeneratedAnswer(meta);
        await built.log({searchUID: provider.getSearchUID()});
        expectMatchCustomEventPayload(SearchPageEvents.likeGeneratedAnswer, meta);
        expectMatchDescription(built.description, SearchPageEvents.likeGeneratedAnswer, meta);
    });

    it('should send proper payload for #logDislikeGeneratedAnswer', async () => {
        const meta = {generativeQuestionAnsweringId: fakeStreamId};
        await client.logDislikeGeneratedAnswer(meta);
        expectMatchCustomEventPayload(SearchPageEvents.dislikeGeneratedAnswer, meta);
    });

    it('should send proper payload for #makeDislikeGeneratedAnswer', async () => {
        const meta = {generativeQuestionAnsweringId: fakeStreamId};
        const built = await client.makeDislikeGeneratedAnswer(meta);
        await built.log({searchUID: provider.getSearchUID()});
        expectMatchCustomEventPayload(SearchPageEvents.dislikeGeneratedAnswer, meta);
        expectMatchDescription(built.description, SearchPageEvents.dislikeGeneratedAnswer, meta);
    });

    it('should send proper payload for #logOpenGeneratedAnswerSource', async () => {
        const meta = {
            generativeQuestionAnsweringId: fakeStreamId,
            citationId: 'some-document-id',
            permanentId: 'perm-id',
        };
        await client.logOpenGeneratedAnswerSource(meta);
        expectMatchCustomEventPayload(SearchPageEvents.openGeneratedAnswerSource, meta);
    });

    it('should send proper payload for #makeOpenGeneratedAnswerSource', async () => {
        const meta = {
            generativeQuestionAnsweringId: fakeStreamId,
            citationId: 'some-document-id',
            permanentId: 'perm-id',
        };
        const built = await client.makeOpenGeneratedAnswerSource(meta);
        await built.log({searchUID: provider.getSearchUID()});
        expectMatchCustomEventPayload(SearchPageEvents.openGeneratedAnswerSource, meta);
        expectMatchDescription(built.description, SearchPageEvents.openGeneratedAnswerSource, meta);
    });

    it('should send proper payload for #logGeneratedAnswerStreamEnd', async () => {
        const meta = {generativeQuestionAnsweringId: fakeStreamId, answerGenerated: true, answerTextIsEmpty: false};
        await client.logGeneratedAnswerStreamEnd(meta);
        expectMatchCustomEventPayload(SearchPageEvents.generatedAnswerStreamEnd, meta);
    });

    it('should send proper payload for #makeGeneratedAnswerStreamEnd', async () => {
        const meta = {generativeQuestionAnsweringId: fakeStreamId, answerGenerated: true, answerTextIsEmpty: false};
        const built = await client.makeGeneratedAnswerStreamEnd(meta);
        await built.log({searchUID: provider.getSearchUID()});
        expectMatchCustomEventPayload(SearchPageEvents.generatedAnswerStreamEnd, meta);
        expectMatchDescription(built.description, SearchPageEvents.generatedAnswerStreamEnd, meta);
    });

    it('should send proper payload for #logGeneratedAnswerSourceHover', async () => {
        const meta = {
            generativeQuestionAnsweringId: fakeStreamId,
            citationId: 'some-document-id',
            permanentId: 'perm-id',
            citationHoverTimeMs: 100,
        };
        await client.logGeneratedAnswerSourceHover(meta);
        expectMatchCustomEventPayload(SearchPageEvents.generatedAnswerSourceHover, meta);
    });

    it('should send proper payload for #makeGeneratedAnswerSourceHover', async () => {
        const meta = {
            generativeQuestionAnsweringId: fakeStreamId,
            citationId: 'some-document-id',
            permanentId: 'perm-id',
            citationHoverTimeMs: 100,
        };
        const built = await client.makeGeneratedAnswerSourceHover(meta);
        await built.log({searchUID: provider.getSearchUID()});
        expectMatchCustomEventPayload(SearchPageEvents.generatedAnswerSourceHover, meta);
        expectMatchDescription(built.description, SearchPageEvents.generatedAnswerSourceHover, meta);
    });

    it('should send proper payload for #logGeneratedAnswerCopyToClipboard', async () => {
        const meta = {generativeQuestionAnsweringId: fakeStreamId};
        await client.logGeneratedAnswerCopyToClipboard(meta);
        expectMatchCustomEventPayload(SearchPageEvents.generatedAnswerCopyToClipboard, meta);
    });

    it('should send proper payload for #makeGeneratedAnswerCopyToClipboard', async () => {
        const meta = {generativeQuestionAnsweringId: fakeStreamId};
        const built = await client.makeGeneratedAnswerCopyToClipboard(meta);
        await built.log({searchUID: provider.getSearchUID()});
        expectMatchCustomEventPayload(SearchPageEvents.generatedAnswerCopyToClipboard, meta);
        expectMatchDescription(built.description, SearchPageEvents.generatedAnswerCopyToClipboard, meta);
    });

    it('should send proper payload for #logGeneratedAnswerHideAnswers', async () => {
        const meta = {generativeQuestionAnsweringId: fakeStreamId};
        await client.logGeneratedAnswerHideAnswers(meta);
        expectMatchCustomEventPayload(SearchPageEvents.generatedAnswerHideAnswers, meta);
    });

    it('should send proper payload for #makeGeneratedAnswerHideAnswers', async () => {
        const meta = {generativeQuestionAnsweringId: fakeStreamId};
        const built = await client.makeGeneratedAnswerHideAnswers(meta);
        await built.log({searchUID: provider.getSearchUID()});
        expectMatchCustomEventPayload(SearchPageEvents.generatedAnswerHideAnswers, meta);
        expectMatchDescription(built.description, SearchPageEvents.generatedAnswerHideAnswers, meta);
    });

    it('should send proper payload for #logGeneratedAnswerShowAnswers', async () => {
        const meta = {generativeQuestionAnsweringId: fakeStreamId};
        await client.logGeneratedAnswerShowAnswers(meta);
        expectMatchCustomEventPayload(SearchPageEvents.generatedAnswerShowAnswers, meta);
    });

    it('should send proper payload for #makeGeneratedAnswerShowAnswers', async () => {
        const meta = {generativeQuestionAnsweringId: fakeStreamId};
        const built = await client.makeGeneratedAnswerShowAnswers(meta);
        await built.log({searchUID: provider.getSearchUID()});
        expectMatchCustomEventPayload(SearchPageEvents.generatedAnswerShowAnswers, meta);
        expectMatchDescription(built.description, SearchPageEvents.generatedAnswerShowAnswers, meta);
    });

    it('should send proper payload for #logGeneratedAnswerExpand', async () => {
        const meta = {generativeQuestionAnsweringId: fakeStreamId};
        await client.logGeneratedAnswerExpand(meta);
        expectMatchCustomEventPayload(SearchPageEvents.generatedAnswerExpand, meta);
    });

    it('should send proper payload for #makeGeneratedAnswerExpand', async () => {
        const meta = {generativeQuestionAnsweringId: fakeStreamId};
        const built = await client.makeGeneratedAnswerExpand(meta);
        await built.log({searchUID: provider.getSearchUID()});
        expectMatchCustomEventPayload(SearchPageEvents.generatedAnswerExpand, meta);
        expectMatchDescription(built.description, SearchPageEvents.generatedAnswerExpand, meta);
    });

    it('should send proper payload for #logGeneratedAnswerCollapse', async () => {
        const meta = {generativeQuestionAnsweringId: fakeStreamId};
        await client.logGeneratedAnswerCollapse(meta);
        expectMatchCustomEventPayload(SearchPageEvents.generatedAnswerCollapse, meta);
    });

    it('should send proper payload for #makeGeneratedAnswerCollapse', async () => {
        const meta = {generativeQuestionAnsweringId: fakeStreamId};
        const built = await client.makeGeneratedAnswerCollapse(meta);
        await built.log({searchUID: provider.getSearchUID()});
        expectMatchCustomEventPayload(SearchPageEvents.generatedAnswerCollapse, meta);
        expectMatchDescription(built.description, SearchPageEvents.generatedAnswerCollapse, meta);
    });

    it('should send proper payload for #logGeneratedAnswerFeedbackSubmitV2', async () => {
        const meta = {
            generativeQuestionAnsweringId: fakeStreamId,
            helpful: true,
            readable: <GeneratedAnswerFeedbackReasonOption>'yes',
            documented: <GeneratedAnswerFeedbackReasonOption>'no',
            correctTopic: <GeneratedAnswerFeedbackReasonOption>'unknown',
            hallucinationFree: <GeneratedAnswerFeedbackReasonOption>'yes',
            details: 'a few additional details',
            documentUrl: 'https://document.com',
        };
        await client.logGeneratedAnswerFeedbackSubmitV2(meta);
        expectMatchCustomEventPayload(SearchPageEvents.generatedAnswerFeedbackSubmitV2, meta);
    });

    it('should send proper payload for #logGeneratedAnswerFeedbackSubmit', async () => {
        const meta = {
            generativeQuestionAnsweringId: fakeStreamId,
            reason: <GeneratedAnswerFeedbackReason>'other',
            details: 'a few additional details',
        };
        await client.logGeneratedAnswerFeedbackSubmit(meta);
        expectMatchCustomEventPayload(SearchPageEvents.generatedAnswerFeedbackSubmit, meta);
    });

    it('should send proper payload for #makeGeneratedAnswerFeedbackSubmit', async () => {
        const meta = {
            generativeQuestionAnsweringId: fakeStreamId,
            reason: <GeneratedAnswerFeedbackReason>'other',
            details: 'a few additional details',
        };
        const built = await client.makeGeneratedAnswerFeedbackSubmit(meta);
        await built.log({searchUID: provider.getSearchUID()});
        expectMatchCustomEventPayload(SearchPageEvents.generatedAnswerFeedbackSubmit, meta);
        expectMatchDescription(built.description, SearchPageEvents.generatedAnswerFeedbackSubmit, meta);
    });

    it('should send proper payload for #logRephraseGeneratedAnswer', async () => {
        const meta = {
            generativeQuestionAnsweringId: fakeStreamId,
            rephraseFormat: <GeneratedAnswerRephraseFormat>'step',
        };
        await client.logRephraseGeneratedAnswer(meta);
        expectMatchPayload(SearchPageEvents.rephraseGeneratedAnswer, meta);
    });

    it('should send proper payload for #makeRephraseGeneratedAnswer', async () => {
        const meta = {
            generativeQuestionAnsweringId: fakeStreamId,
            rephraseFormat: <GeneratedAnswerRephraseFormat>'step',
        };
        const built = await client.makeRephraseGeneratedAnswer(meta);
        await built.log({searchUID: provider.getSearchUID()});
        expectMatchPayload(SearchPageEvents.rephraseGeneratedAnswer, meta);
        expectSearchEventToMatchDescription(built.description, SearchPageEvents.rephraseGeneratedAnswer, meta);
    });
});
