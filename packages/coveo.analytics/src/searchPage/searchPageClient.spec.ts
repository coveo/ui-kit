import {CoveoSearchPageClient, EventDescription, SearchPageClientProvider} from './searchPageClient';
import {
    SearchPageEvents,
    PartialDocumentInformation,
    CustomEventsTypes,
    SmartSnippetFeedbackReason,
    OmniboxSuggestionsMetadata,
    StaticFilterToggleValueMetadata,
} from './searchPageEvents';
import CoveoAnalyticsClient from '../client/analytics';
import {NoopAnalytics} from '../client/noopAnalytics';
import {mockFetch} from '../../tests/fetchMock';
import doNotTrack from '../donottrack';
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

    let client: CoveoSearchPageClient;

    const provider: SearchPageClientProvider = {
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

    const initClient = () => {
        return new CoveoSearchPageClient({}, provider);
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
            ...expectSplitTestRun(),
        });
    };

    const expectMatchDescription = (description: EventDescription, actionCause: SearchPageEvents, meta = {}) => {
        const customData = {foo: 'bar', ...meta};
        expect(description).toMatchObject({
            actionCause,
            customData,
        });
    };

    const expectMatchDocumentPayload = (actionCause: SearchPageEvents, doc: PartialDocumentInformation, meta = {}) => {
        const [, {body}] = fetchMock.lastCall();
        const customData = {foo: 'bar', ...meta};
        expect(JSON.parse(body.toString())).toMatchObject({
            actionCause,
            customData,
            queryPipeline: 'my-pipeline',
            language: 'en',
            clientId: 'visitor-id',
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
        const [, {body}] = fetchMock.lastCall();
        const customData = {foo: 'bar', ...meta};
        expect(JSON.parse(body.toString())).toMatchObject({
            eventValue: actionCause,
            eventType,
            lastSearchQueryUid: 'my-uid',
            customData,
            language: 'en',
            clientId: 'visitor-id',
            ...expectOrigins(),
            ...expectSplitTestRun(),
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
            language: 'en',
            clientId: 'visitor-id',
            ...expectOrigins(),
            ...expectSplitTestRun(),
        });
    };

    it('should send proper payload for #interfaceLoad', async () => {
        await client.logInterfaceLoad();
        expectMatchPayload(SearchPageEvents.interfaceLoad);
    });

    it('should send proper payload for #makeInterfaceLoad', async () => {
        const built = client.makeInterfaceLoad();
        await built.log();
        expectMatchPayload(SearchPageEvents.interfaceLoad);
        expectMatchDescription(built.description, SearchPageEvents.interfaceLoad);
    });

    it('should send proper payload for #interfaceChange', async () => {
        await client.logInterfaceChange({
            interfaceChangeTo: 'bob',
        });
        expectMatchPayload(SearchPageEvents.interfaceChange, {interfaceChangeTo: 'bob'});
    });

    it('should send proper payload for #makeInterfaceChange', async () => {
        const built = client.makeInterfaceChange({interfaceChangeTo: 'bob'});
        await built.log();
        expectMatchPayload(SearchPageEvents.interfaceChange, {interfaceChangeTo: 'bob'});
        expectMatchDescription(built.description, SearchPageEvents.interfaceChange, {interfaceChangeTo: 'bob'});
    });

    it('should send proper payload for #didyoumeanAutomatic', async () => {
        await client.logDidYouMeanAutomatic();
        expectMatchPayload(SearchPageEvents.didyoumeanAutomatic);
    });

    it('should send proper payload for #makeDidyoumeanAutomatic', async () => {
        const built = client.makeDidYouMeanAutomatic();
        await built.log();
        expectMatchPayload(SearchPageEvents.didyoumeanAutomatic);
        expectMatchDescription(built.description, SearchPageEvents.didyoumeanAutomatic);
    });

    it('should send proper payload for #didyoumeanClick', async () => {
        await client.logDidYouMeanClick();
        expectMatchPayload(SearchPageEvents.didyoumeanClick);
    });

    it('should send proper payload for #makeDidyoumeanClick', async () => {
        const built = client.makeDidYouMeanClick();
        await built.log();
        expectMatchPayload(SearchPageEvents.didyoumeanClick);
        expectMatchDescription(built.description, SearchPageEvents.didyoumeanClick);
    });

    it('should send proper payload for #resultsSort', async () => {
        await client.logResultsSort({resultsSortBy: 'date ascending'});
        expectMatchPayload(SearchPageEvents.resultsSort, {resultsSortBy: 'date ascending'});
    });

    it('should send proper payload for #makeResultsSort', async () => {
        const built = client.makeResultsSort({resultsSortBy: 'date ascending'});
        await built.log();
        expectMatchPayload(SearchPageEvents.resultsSort, {resultsSortBy: 'date ascending'});
        expectMatchDescription(built.description, SearchPageEvents.resultsSort, {resultsSortBy: 'date ascending'});
    });

    it('should send proper payload for #searchboxSubmit', async () => {
        await client.logSearchboxSubmit();
        expectMatchPayload(SearchPageEvents.searchboxSubmit);
    });

    it('should send proper payload for #makeSearchboxSubmit', async () => {
        const built = client.makeSearchboxSubmit();
        await built.log();
        expectMatchPayload(SearchPageEvents.searchboxSubmit);
        expectMatchDescription(built.description, SearchPageEvents.searchboxSubmit);
    });

    it('should send proper payload for #searchboxClear', async () => {
        await client.logSearchboxClear();
        expectMatchPayload(SearchPageEvents.searchboxClear);
    });

    it('should send proper payload for #makeSearchboxClear', async () => {
        const built = client.makeSearchboxClear();
        await built.log();
        expectMatchPayload(SearchPageEvents.searchboxClear);
        expectMatchDescription(built.description, SearchPageEvents.searchboxClear);
    });

    it('should send proper payload for #searchboxAsYouType', async () => {
        await client.logSearchboxAsYouType();
        expectMatchPayload(SearchPageEvents.searchboxAsYouType);
    });

    it('should send proper payload for #makeSearchboxAsYouType', async () => {
        const built = client.makeSearchboxAsYouType();
        await built.log();
        expectMatchPayload(SearchPageEvents.searchboxAsYouType);
        expectMatchDescription(built.description, SearchPageEvents.searchboxAsYouType);
    });

    it('should send proper payload for #documentQuickview', async () => {
        await client.logDocumentQuickview(fakeDocInfo, fakeDocID);
        expectMatchDocumentPayload(SearchPageEvents.documentQuickview, fakeDocInfo, fakeDocID);
    });

    it('should send proper payload for #makeDocumentQuickview', async () => {
        const built = client.makeDocumentQuickview(fakeDocInfo, fakeDocID);
        await built.log();
        expectMatchDocumentPayload(SearchPageEvents.documentQuickview, fakeDocInfo, fakeDocID);
        expectMatchDescription(built.description, SearchPageEvents.documentQuickview, {...fakeDocID});
    });

    it('should send proper payload for #documentOpen', async () => {
        await client.logDocumentOpen(fakeDocInfo, fakeDocID);
        expectMatchDocumentPayload(SearchPageEvents.documentOpen, fakeDocInfo, fakeDocID);
    });

    it('should send proper payload for #makeDocumentOpen', async () => {
        const built = client.makeDocumentOpen(fakeDocInfo, fakeDocID);
        await built.log();
        expectMatchDocumentPayload(SearchPageEvents.documentOpen, fakeDocInfo, fakeDocID);
        expectMatchDescription(built.description, SearchPageEvents.documentOpen, {...fakeDocID});
    });

    it('should send proper payload for #showMoreFoldedResults', async () => {
        await client.logShowMoreFoldedResults(fakeDocInfo, fakeDocID);
        expectMatchDocumentPayload(SearchPageEvents.showMoreFoldedResults, fakeDocInfo, fakeDocID);
    });

    it('should send proper payload for #makeShowMoreFoldedResults', async () => {
        const built = client.makeShowMoreFoldedResults(fakeDocInfo, fakeDocID);
        await built.log();
        expectMatchDocumentPayload(SearchPageEvents.showMoreFoldedResults, fakeDocInfo, fakeDocID);
        expectMatchDescription(built.description, SearchPageEvents.showMoreFoldedResults, fakeDocID);
    });

    it('should send proper payload for #showLessFoldedResults', async () => {
        await client.logShowLessFoldedResults();
        expectMatchCustomEventPayload(SearchPageEvents.showLessFoldedResults);
    });

    it('should send proper payload for #makeShowLessFoldedResults', async () => {
        const built = client.makeShowLessFoldedResults();
        await built.log();
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
        const built = client.makeOmniboxAnalytics(meta);
        await built.log();
        expectMatchPayload(SearchPageEvents.omniboxAnalytics, meta);
        expectMatchDescription(built.description, SearchPageEvents.omniboxAnalytics, meta);
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
        const built = client.makeOmniboxFromLink(meta);
        await built.log();
        expectMatchPayload(SearchPageEvents.omniboxFromLink, meta);
        expectMatchDescription(built.description, SearchPageEvents.omniboxFromLink, meta);
    });

    it('should send proper payload for #logSearchFromLink', async () => {
        await client.logSearchFromLink();
        expectMatchPayload(SearchPageEvents.searchFromLink);
    });

    it('should send proper payload for #makeSearchFromLink', async () => {
        const built = client.makeSearchFromLink();
        await built.log();
        expectMatchPayload(SearchPageEvents.searchFromLink);
        expectMatchDescription(built.description, SearchPageEvents.searchFromLink);
    });

    it('should send proper payload for #logTriggerNotify', async () => {
        const meta = {
            notification: 'foo',
        };
        await client.logTriggerNotify(meta);
        expectMatchCustomEventPayload(SearchPageEvents.triggerNotify, meta);
    });

    it('should send proper payload for #makeTriggerNotify', async () => {
        const meta = {
            notification: 'foo',
        };
        const built = client.makeTriggerNotify(meta);
        await built.log();
        expectMatchCustomEventPayload(SearchPageEvents.triggerNotify, meta);
        expectMatchDescription(built.description, SearchPageEvents.triggerNotify, meta);
    });

    it('should send proper payload for #logTriggerExecute', async () => {
        const meta = {
            executed: 'foo',
        };
        await client.logTriggerExecute(meta);
        expectMatchCustomEventPayload(SearchPageEvents.triggerExecute, meta);
    });

    it('should send proper payload for #makeTriggerExecute', async () => {
        const meta = {
            executed: 'foo',
        };
        const built = client.makeTriggerExecute(meta);
        await built.log();
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
        const built = client.makeTriggerQuery();
        await built.log();
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
        const built = client.makeUndoTriggerQuery(meta);
        await built.log();
        expectMatchPayload(SearchPageEvents.undoTriggerQuery, meta);
        expectMatchDescription(built.description, SearchPageEvents.undoTriggerQuery, meta);
    });

    it('should send proper payload for #logTriggerRedirect', async () => {
        const meta = {
            redirectedTo: 'foo',
        };
        await client.logTriggerRedirect(meta);
        expectMatchCustomEventPayload(SearchPageEvents.triggerRedirect, meta);
    });

    it('should send proper payload for #makeTriggerRedirect', async () => {
        const meta = {
            redirectedTo: 'foo',
        };
        const built = client.makeTriggerRedirect(meta);
        await built.log();
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
        const built = client.makePagerResize(meta);
        await built.log();
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
        const built = client.makePagerNumber(meta);
        await built.log();
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
        const built = client.makePagerNext(meta);
        await built.log();
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
        const built = client.makePagerPrevious(meta);
        await built.log();
        expectMatchCustomEventPayload(SearchPageEvents.pagerPrevious, meta);
        expectMatchDescription(built.description, SearchPageEvents.pagerPrevious, meta);
    });

    it('should send proper payload for #logPagerScrolling', async () => {
        await client.logPagerScrolling();
        expectMatchCustomEventPayload(SearchPageEvents.pagerScrolling);
    });

    it('should send proper payload for #makePagerScrolling', async () => {
        const built = client.makePagerScrolling();
        await built.log();
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
        const built = client.makeStaticFilterClearAll({staticFilterId});
        await built.log();
        expectMatchPayload(SearchPageEvents.staticFilterClearAll, {staticFilterId});
        expectMatchDescription(built.description, SearchPageEvents.staticFilterClearAll, {staticFilterId});
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
        const built = client.makeStaticFilterSelect(meta);
        await built.log();

        expectMatchPayload(SearchPageEvents.staticFilterSelect, meta);
        expectMatchDescription(built.description, SearchPageEvents.staticFilterSelect, meta);
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
        const built = client.makeStaticFilterDeselect(meta);
        await built.log();
        expectMatchPayload(SearchPageEvents.staticFilterDeselect, meta);
        expectMatchDescription(built.description, SearchPageEvents.staticFilterDeselect, meta);
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
        const built = client.makeFacetSearch(meta);
        await built.log();
        expectMatchPayload(SearchPageEvents.facetSearch, meta);
        expectMatchDescription(built.description, SearchPageEvents.facetSearch, meta);
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
        await built.log();
        expectMatchPayload(SearchPageEvents.facetSelect, meta);
        expectMatchDescription(built.description, SearchPageEvents.facetSelect, meta);
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

        const built = client.makeFacetDeselect(meta);
        await built.log();
        expectMatchPayload(SearchPageEvents.facetDeselect, meta);
        expectMatchDescription(built.description, SearchPageEvents.facetDeselect, meta);
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
        const built = client.makeFacetExclude(meta);
        await built.log();
        expectMatchPayload(SearchPageEvents.facetExclude, meta);
        expectMatchDescription(built.description, SearchPageEvents.facetExclude, meta);
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
        const built = client.makeFacetUnexclude(meta);
        await built.log();
        expectMatchPayload(SearchPageEvents.facetUnexclude, meta);
        expectMatchDescription(built.description, SearchPageEvents.facetUnexclude, meta);
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
        const built = client.makeFacetSelectAll(meta);
        await built.log();
        expectMatchPayload(SearchPageEvents.facetSelectAll, meta);
        expectMatchDescription(built.description, SearchPageEvents.facetSelectAll, meta);
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
        const built = client.makeFacetUpdateSort(meta);
        await built.log();
        expectMatchPayload(SearchPageEvents.facetUpdateSort, meta);
        expectMatchDescription(built.description, SearchPageEvents.facetUpdateSort, meta);
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
        const built = client.makeFacetShowMore(meta);
        await built.log();
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
        const built = client.makeFacetShowLess(meta);
        await built.log();
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
        const built = client.makeQueryError(meta);
        await built.log();
        expectMatchCustomEventPayload(SearchPageEvents.queryError, meta);
        expectMatchDescription(built.description, SearchPageEvents.queryError, meta);
    });

    it('should send proper payload for #logQueryErrorBack', async () => {
        await client.logQueryErrorBack();
        expectMatchPayload(SearchPageEvents.queryErrorBack);
    });

    it('should send proper payload for #makeQueryErrorBack', async () => {
        const built = client.makeQueryErrorBack();
        await built.log();

        expectMatchPayload(SearchPageEvents.queryErrorBack);
        expectMatchDescription(built.description, SearchPageEvents.queryErrorBack);
    });

    it('should send proper payload for #logQueryErrorRetry', async () => {
        await client.logQueryErrorRetry();
        expectMatchPayload(SearchPageEvents.queryErrorRetry);
    });

    it('should send proper payload for #makeQueryErrorRetry', async () => {
        const built = client.makeQueryErrorRetry();
        await built.log();
        expectMatchPayload(SearchPageEvents.queryErrorRetry);
        expectMatchDescription(built.description, SearchPageEvents.queryErrorRetry);
    });

    it('should send proper payload for #logQueryErrorClear', async () => {
        await client.logQueryErrorClear();
        expectMatchPayload(SearchPageEvents.queryErrorClear);
    });

    it('should send proper payload for #makeQueryErrorClear', async () => {
        const built = client.makeQueryErrorClear();
        await built.log();
        expectMatchPayload(SearchPageEvents.queryErrorClear);
        expectMatchDescription(built.description, SearchPageEvents.queryErrorClear);
    });

    it('should send proper payload for #logRecommendationInterfaceLoad', async () => {
        await client.logRecommendationInterfaceLoad();
        expectMatchPayload(SearchPageEvents.recommendationInterfaceLoad);
    });

    it('should send proper payload for #makeRecommendationInterfaceLoad', async () => {
        const built = client.makeRecommendationInterfaceLoad();
        await built.log();
        expectMatchPayload(SearchPageEvents.recommendationInterfaceLoad);
        expectMatchDescription(built.description, SearchPageEvents.recommendationInterfaceLoad);
    });

    it('should send proper payload for #logRecommendation', async () => {
        await client.logRecommendation();
        expectMatchCustomEventPayload(SearchPageEvents.recommendation);
    });

    it('should send proper payload for #makeRecommendation', async () => {
        const built = client.makeRecommendation();
        await built.log();
        expectMatchCustomEventPayload(SearchPageEvents.recommendation);
    });

    it('should send proper payload for #recommendationOpen', async () => {
        await client.logRecommendationOpen(fakeDocInfo, fakeDocID);
        expectMatchDocumentPayload(SearchPageEvents.recommendationOpen, fakeDocInfo, fakeDocID);
    });

    it('should send proper payload for #makeRecommendationOpen', async () => {
        const built = client.makeRecommendationOpen(fakeDocInfo, fakeDocID);
        await built.log();
        expectMatchDocumentPayload(SearchPageEvents.recommendationOpen, fakeDocInfo, fakeDocID);
        expectMatchDescription(built.description, SearchPageEvents.recommendationOpen, {...fakeDocID});
    });

    it('should send proper payload for #fetchMoreResults', async () => {
        await client.logFetchMoreResults();
        expectMatchCustomEventPayload(SearchPageEvents.pagerScrolling, {type: 'getMoreResults'});
    });

    it('should send proper payload for #makeFetchMoreResults', async () => {
        const built = client.makeFetchMoreResults();
        await built.log();
        expectMatchCustomEventPayload(SearchPageEvents.pagerScrolling, {type: 'getMoreResults'});
        expectMatchDescription(built.description, SearchPageEvents.pagerScrolling);
    });

    it('should send proper payload for #logLikeSmartSnippet', async () => {
        await client.logLikeSmartSnippet();
        expectMatchCustomEventPayload(SearchPageEvents.likeSmartSnippet);
    });

    it('should send proper payload for #makeLikeSmartSnippet', async () => {
        const built = client.makeLikeSmartSnippet();
        await built.log();
        expectMatchCustomEventPayload(SearchPageEvents.likeSmartSnippet);
        expectMatchDescription(built.description, SearchPageEvents.likeSmartSnippet);
    });

    it('should send proper payload for #logDislikeSmartSnippet', async () => {
        await client.logDislikeSmartSnippet();
        expectMatchCustomEventPayload(SearchPageEvents.dislikeSmartSnippet);
    });

    it('should send proper payload for #makeDislikeSmartSnippet', async () => {
        const built = client.makeDislikeSmartSnippet();
        await built.log();
        expectMatchCustomEventPayload(SearchPageEvents.dislikeSmartSnippet);
        expectMatchDescription(built.description, SearchPageEvents.dislikeSmartSnippet);
    });

    it('should send proper payload for #logExpandSmartSnippet', async () => {
        await client.logExpandSmartSnippet();
        expectMatchCustomEventPayload(SearchPageEvents.expandSmartSnippet);
    });

    it('should send proper payload for #makeExpandSmartSnippet', async () => {
        const built = client.makeExpandSmartSnippet();
        await built.log();
        expectMatchCustomEventPayload(SearchPageEvents.expandSmartSnippet);
        expectMatchDescription(built.description, SearchPageEvents.expandSmartSnippet);
    });

    it('should send proper payload for #logCollapseSmartSnippet', async () => {
        await client.logCollapseSmartSnippet();
        expectMatchCustomEventPayload(SearchPageEvents.collapseSmartSnippet);
    });

    it('should send proper payload for #makeCollapseSmartSnippet', async () => {
        const built = client.makeCollapseSmartSnippet();
        await built.log();
        expectMatchCustomEventPayload(SearchPageEvents.collapseSmartSnippet);
        expectMatchDescription(built.description, SearchPageEvents.collapseSmartSnippet);
    });

    it('should send proper payload for #logOpenSmartSnippetFeedbackModal', async () => {
        await client.logOpenSmartSnippetFeedbackModal();
        expectMatchCustomEventPayload(SearchPageEvents.openSmartSnippetFeedbackModal);
    });

    it('should send proper payload for #makeOpenSmartSnippetFeedbackModal', async () => {
        const built = client.makeOpenSmartSnippetFeedbackModal();
        await built.log();
        expectMatchCustomEventPayload(SearchPageEvents.openSmartSnippetFeedbackModal);
        expectMatchDescription(built.description, SearchPageEvents.openSmartSnippetFeedbackModal);
    });

    it('should send proper payload for #logCloseSmartSnippetFeedbackModal', async () => {
        await client.logCloseSmartSnippetFeedbackModal();
        expectMatchCustomEventPayload(SearchPageEvents.closeSmartSnippetFeedbackModal);
    });

    it('should send proper payload for #makeCloseSmartSnippetFeedbackModal', async () => {
        const built = client.makeCloseSmartSnippetFeedbackModal();
        await built.log();
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
        const built = client.makeSmartSnippetFeedbackReason('does_not_answer', 'this is irrelevant');
        await built.log();
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
        const built = client.makeExpandSmartSnippetSuggestion({
            question: 'Abc',
            answerSnippet: 'Def',
            documentId: {contentIdKey: 'permanentid', contentIdValue: 'foo'},
        });
        await built.log();
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
        const built = client.makeCollapseSmartSnippetSuggestion({
            question: 'Abc',
            answerSnippet: 'Def',
            documentId: {contentIdKey: 'permanentid', contentIdValue: 'foo'},
        });
        await built.log();
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
        const built = client.makeExpandSmartSnippetSuggestion({
            contentIdKey: 'permanentid',
            contentIdValue: 'foo',
        });
        await built.log();
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
        const built = client.makeCollapseSmartSnippetSuggestion({contentIdKey: 'permanentid', contentIdValue: 'foo'});
        await built.log();
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

    it('should send proper payload for #makeOpenSmartSnippetSource', async () => {
        const built = client.makeOpenSmartSnippetSource(fakeDocInfo, fakeDocID);
        await built.log();
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
            documentId: {contentIdKey: 'permanentid', contentIdValue: 'foo'},
        };
        const built = client.makeOpenSmartSnippetSuggestionSource(fakeDocInfo, meta);
        await built.log();
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
        const built = client.makeOpenSmartSnippetInlineLink(fakeDocInfo, meta);
        await built.log();
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
            documentId: {contentIdKey: 'permanentid', contentIdValue: 'foo'},
            linkText: 'Some text',
            linkURL: 'https://invalid.com',
        };
        const built = client.makeOpenSmartSnippetSuggestionInlineLink(fakeDocInfo, meta);
        await built.log();
        expectMatchDocumentPayload(SearchPageEvents.openSmartSnippetSuggestionInlineLink, fakeDocInfo, meta);
        expectMatchDescription(built.description, SearchPageEvents.openSmartSnippetSuggestionInlineLink, meta);
    });

    it('should send proper payload for #logRecentQueryClick', async () => {
        await client.logRecentQueryClick();
        expectMatchPayload(SearchPageEvents.recentQueryClick);
    });

    it('should send proper payload for #makeRecentQueryClick', async () => {
        const built = client.makeRecentQueryClick();
        await built.log();

        expectMatchPayload(SearchPageEvents.recentQueryClick);
        expectMatchDescription(built.description, SearchPageEvents.recentQueryClick);
    });

    it('should send proper payload for #logClearRecentQueries', async () => {
        await client.logClearRecentQueries();
        expectMatchCustomEventPayload(SearchPageEvents.clearRecentQueries);
    });

    it('should send proper payload for #makeClearRecentQueries', async () => {
        const built = client.makeClearRecentQueries();
        await built.log();

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
        const built = client.makeRecentResultClick(fakeDocInfo, fakeDocID);
        await built.log();

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
        const built = client.makeNoResultsBack();
        await built.log();

        expectMatchPayload(SearchPageEvents.noResultsBack);
        expectMatchDescription(built.description, SearchPageEvents.noResultsBack);
    });

    it('should send proper payload for #logClearRecentResults', async () => {
        await client.logClearRecentResults();
        expectMatchCustomEventPayload(SearchPageEvents.clearRecentResults);
    });

    it('should send proper payload for #makeClearRecentResults', async () => {
        const built = client.makeClearRecentResults();
        await built.log();

        expectMatchCustomEventPayload(SearchPageEvents.clearRecentResults);
        expectMatchDescription(built.description, SearchPageEvents.clearRecentResults);
    });

    it('should send proper payload for #logCustomEventWithType', async () => {
        await client.logCustomEventWithType('foo', 'bar', {buzz: 'bazz'});
        expectMatchCustomEventWithTypePayload('foo', 'bar', {buzz: 'bazz'});
    });

    it('should send proper payload for #makeCustomEventWithType', async () => {
        const built = client.makeCustomEventWithType('foo', 'bar', {buzz: 'bazz'});
        await built.log();

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

    it('should allow enabling analytics after initialization', () => {
        const c = new CoveoSearchPageClient({enableAnalytics: false}, provider);
        expect(c.coveoAnalyticsClient instanceof NoopAnalytics).toBe(true);
        c.enable();
        expect(c.coveoAnalyticsClient instanceof CoveoAnalyticsClient).toBe(true);
    });
});
