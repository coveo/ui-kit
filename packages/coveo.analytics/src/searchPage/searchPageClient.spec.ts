import * as fetchMock from 'fetch-mock';
import { CoveoSearchPageClient } from './searchPageClient'
import { SearchPageEvents, PartialDocumentInformation, DocumentIdentifier, CustomEventsTypes } from './searchPageEvents'

describe('SearchPageClient', () => {

    const fakeDocInfo = {
        collectionName: 'collection',
        documentAuthor: 'author',
        documentPosition: 1,
        documentTitle: 'title',
        documentUri: 'uri',
        documentUriHash: 'hash',
        documentUrl: 'url',
        queryPipeline: 'pipeline',
        rankingModifier: 'modifier',
        sourceName: 'source'
    }

    const fakeDocID = {
        contentIDKey: 'permanentID',
        contentIDValue: 'the-permanent-id'
    }

    let client: CoveoSearchPageClient

    beforeEach(() => {
        client = initClient()
        fetchMock.mock(/.*/, {
            visitId: 'visit-id',
            visitorId: 'visitor-id',
        });
    })


    afterEach(() => {
        fetchMock.reset();
    })

    const initClient = () => {
        return new CoveoSearchPageClient({}, {
            getBaseMetadata: () => ({ 'foo': 'bar' }),
            getSearchEventRequestPayload: () => ({
                queryText: 'queryText',
                responseTime: 123,
            }),
            getSearchUID: () => 'my-uid'
        })
    }

    const expectMatchPayload = (actionCause: SearchPageEvents, meta = {}) => {
        const [, { body }] = fetchMock.lastCall();
        const customData = { 'foo': 'bar', ...meta }
        expect(JSON.parse(body.toString())).toMatchObject({
            queryText: 'queryText',
            responseTime: 123,
            actionCause,
            customData,
        });
    }

    const expectMatchDocumentPayload = (actionCause: SearchPageEvents, doc: PartialDocumentInformation, meta = {}) => {
        const [, { body }] = fetchMock.lastCall();
        const customData = { 'foo': 'bar', ...meta };
        expect(JSON.parse(body.toString())).toMatchObject({
            actionCause,
            customData,
            ...doc
        });
    }

    const expectMatchCustomEventPayload = (actionCause: SearchPageEvents, meta = {}) => {
        const [, { body }] = fetchMock.lastCall();
        const customData = { 'foo': 'bar', ...meta };
        expect(JSON.parse(body.toString())).toMatchObject({
            eventValue: actionCause,
            eventType: CustomEventsTypes[actionCause],
            lastSearchQueryUid: 'my-uid',
            customData,
        });
    }

    it('should send proper payload for #interfaceLoad', async () => {
        await client.logInterfaceLoad();
        expectMatchPayload(SearchPageEvents.interfaceLoad);
    })

    it('should send proper payload for #interfaceChange', async () => {
        await client.logInterfaceChange({
            interfaceChangeTo: 'bob'
        });
        expectMatchPayload(SearchPageEvents.interfaceChange, { interfaceChangeTo: 'bob' });
    })

    it('should send proper payload for #didyoumeanAutomatic', async () => {
        await client.logDidYouMeanAutomatic();
        expectMatchPayload(SearchPageEvents.didyoumeanAutomatic);
    })

    it('should send proper payload for #didyoumeanClick', async () => {
        await client.logDidYouMeanClick();
        expectMatchPayload(SearchPageEvents.didyoumeanClick);
    })

    it('should send proper payload for #resultsSort', async () => {
        await client.logResultsSort({ resultsSortBy: 'date ascending' });
        expectMatchPayload(SearchPageEvents.resultsSort, { resultsSortBy: 'date ascending' });
    })

    it('should send proper payload for #searchboxSubmit', async () => {
        await client.logSearchboxSubmit();
        expectMatchPayload(SearchPageEvents.searchboxSubmit);
    })

    it('should send proper payload for #searchboxClear', async () => {
        await client.logSearchboxClear();
        expectMatchPayload(SearchPageEvents.searchboxClear);
    })

    it('should send proper payload for #searchboxAsYouType', async () => {
        await client.logSearchboxAsYouType();
        expectMatchPayload(SearchPageEvents.searchboxAsYouType);
    })

    it('should send proper payload for #searchboxAsYouType', async () => {
        await client.logBreadcrumbResetAll();
        expectMatchPayload(SearchPageEvents.breadcrumbResetAll);
    })

    it('should send proper payload for #documentQuickview', async () => {
        await client.logDocumentQuickview(fakeDocInfo, fakeDocID);
        expectMatchDocumentPayload(SearchPageEvents.documentQuickview, fakeDocInfo, fakeDocID);
    })

    it('should send proper payload for ', async () => {
        await client.logDocumentOpen(fakeDocInfo, fakeDocID);
        expectMatchDocumentPayload(SearchPageEvents.documentOpen, fakeDocInfo, fakeDocID);
    })

    it('should send proper payload for #omniboxAnalytics', async () => {
        const meta = {
            partialQueries: 'a;b;c',
            partialQuery: 'abcd',
            suggestionRanking: 1,
            suggestions: 'q;w;e;r;t;y'
        }
        await client.logOmniboxAnalytics(meta);
        expectMatchPayload(SearchPageEvents.omniboxAnalytics, meta)
    })

    it('should send proper payload for #logOmniboxFromLink', async () => {
        const meta = {
            partialQueries: 'a;b;c',
            partialQuery: 'abcd',
            suggestionRanking: 1,
            suggestions: 'q;w;e;r;t;y'
        };
        await client.logOmniboxFromLink(meta);
        expectMatchPayload(SearchPageEvents.omniboxFromLink, meta);
    })

    it('should send proper payload for #logTriggerNotify', async () => {
        const meta = {
            notification: 'foo',
        };
        await client.logTriggerNotify(meta);
        expectMatchCustomEventPayload(SearchPageEvents.triggerNotify, meta);
    })

    it('should send proper payload for #logTriggerExecute', async () => {
        const meta = {
            executed: 'foo',
        };
        await client.logTriggerExecute(meta);
        expectMatchCustomEventPayload(SearchPageEvents.triggerExecute, meta);
    })

    it('should send proper payload for #logTriggerQuery', async () => {
        const meta = {
            query: 'queryText',
        };
        await client.logTriggerQuery();
        expectMatchCustomEventPayload(SearchPageEvents.triggerQuery, meta);
    })

    it('should send proper payload for #logTriggerRedirect', async () => {
        const meta = {
            redirectedTo: 'foo',
        };
        await client.logTriggerRedirect(meta);
        expectMatchCustomEventPayload(SearchPageEvents.triggerRedirect, meta);
    })
})