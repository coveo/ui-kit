import {lastCallBody, mockFetch} from '../../tests/fetchMock';
import CoveoAnalyticsClient from '../client/analytics';
import {NoopAnalytics} from '../client/noopAnalytics';
import {
    CustomEventsTypes,
    GeneratedAnswerFeedbackReason,
    GeneratedAnswerFeedbackReasonOption,
    GeneratedAnswerRephraseFormat,
    PartialDocumentInformation,
    SearchPageEvents,
    StaticFilterToggleValueMetadata,
} from '../searchPage/searchPageEvents';
import {CoveoInsightClient, InsightClientProvider} from './insightClient';
import doNotTrack from '../donottrack';
import {InsightEvents, InsightStaticFilterToggleValueMetadata} from './insightEvents';
import {Cookie} from '../cookieutils';

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
        getGeneratedAnswerMetadata: () => ({genratedAnswerMetadata: 'foo'}),
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
        const body: string = lastCallBody(fetchMock);
        const customData = {foo: 'bar', genratedAnswerMetadata: 'foo', ...meta};
        expect(JSON.parse(body)).toMatchObject({
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
        const body: string = lastCallBody(fetchMock);
        const customData = {foo: 'bar', ...meta};
        expect(JSON.parse(body)).toMatchObject({
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
        const body: string = lastCallBody(fetchMock);
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

        it('should send proper payload for #caseSendEmail', async () => {
            await client.logCaseSendEmail(fakeDocInfo, fakeDocID);
            expectMatchDocumentPayload(SearchPageEvents.caseSendEmail, fakeDocInfo, fakeDocID);
        });

        it('should send proper payload for #feedItemTextPost', async () => {
            await client.logFeedItemTextPost(fakeDocInfo, fakeDocID);
            expectMatchDocumentPayload(SearchPageEvents.feedItemTextPost, fakeDocInfo, fakeDocID);
        });

        it('should send proper payload for #documentQuickview', async () => {
            const expectedMetadata = {
                ...fakeDocID,
                documentTitle: fakeDocInfo.documentTitle,
                documentURL: fakeDocInfo.documentUrl,
            };
            await client.logDocumentQuickview(fakeDocInfo, fakeDocID);
            expectMatchDocumentPayload(SearchPageEvents.documentQuickview, fakeDocInfo, expectedMetadata);
        });

        it('should send proper payload for #caseAttach', async () => {
            const expectedMetadata = {
                ...fakeDocID,
                documentTitle: fakeDocInfo.documentTitle,
                documentURL: fakeDocInfo.documentUrl,
                resultUriHash: fakeDocInfo.documentUriHash,
            };
            await client.logCaseAttach(fakeDocInfo, fakeDocID);
            expectMatchDocumentPayload(SearchPageEvents.caseAttach, fakeDocInfo, expectedMetadata);
        });

        it('should send proper payload for #caseDetach', async () => {
            const expectedMetadata = {
                resultUriHash: fakeDocInfo.documentUriHash,
            };
            await client.logCaseDetach(fakeDocInfo.documentUriHash);
            expectMatchCustomEventPayload(SearchPageEvents.caseDetach, expectedMetadata);
        });

        it('should send proper payload for #likeSmartSnippet', async () => {
            await client.logLikeSmartSnippet();
            expectMatchCustomEventPayload(SearchPageEvents.likeSmartSnippet);
        });

        it('should send proper payload for #dislikeSmartSnippet', async () => {
            await client.logDislikeSmartSnippet();
            expectMatchCustomEventPayload(SearchPageEvents.dislikeSmartSnippet);
        });

        it('should send proper payload for #expandSmartSnippet', async () => {
            await client.logExpandSmartSnippet();
            expectMatchCustomEventPayload(SearchPageEvents.expandSmartSnippet);
        });

        it('should send proper payload for #collapseSmartSnippet', async () => {
            await client.logCollapseSmartSnippet();
            expectMatchCustomEventPayload(SearchPageEvents.collapseSmartSnippet);
        });

        it('should send proper payload for #openSmartSnippetFeedbackModal', async () => {
            await client.logOpenSmartSnippetFeedbackModal();
            expectMatchCustomEventPayload(SearchPageEvents.openSmartSnippetFeedbackModal);
        });

        it('should send proper payload for #closeSmartSnippetFeedbackModal', async () => {
            await client.logCloseSmartSnippetFeedbackModal();
            expectMatchCustomEventPayload(SearchPageEvents.closeSmartSnippetFeedbackModal);
        });

        it('should send proper payload for #sendSmartSnippetReason', async () => {
            const reason = 'other';
            const details = 'example details';
            const expectedMetadata = {
                reason,
                details,
            };

            await client.logSmartSnippetFeedbackReason(reason, details);
            expectMatchCustomEventPayload(SearchPageEvents.sendSmartSnippetReason, expectedMetadata);
        });

        it('should send proper payload for #expandSmartSnippetSuggestion', async () => {
            const exampleSmartSnippetSuggestion = {
                question: 'Abc',
                answerSnippet: 'Def',
                documentId: {contentIdKey: 'permanentid', contentIdValue: 'foo'},
            };

            await client.logExpandSmartSnippetSuggestion(exampleSmartSnippetSuggestion);
            expectMatchCustomEventPayload(SearchPageEvents.expandSmartSnippetSuggestion, exampleSmartSnippetSuggestion);
        });

        it('should send proper payload for #collapseSmartSnippetSuggestion', async () => {
            const exampleSmartSnippetSuggestion = {
                question: 'Abc',
                answerSnippet: 'Def',
                documentId: {contentIdKey: 'permanentid', contentIdValue: 'foo'},
            };

            await client.logCollapseSmartSnippetSuggestion(exampleSmartSnippetSuggestion);
            expectMatchCustomEventPayload(
                SearchPageEvents.collapseSmartSnippetSuggestion,
                exampleSmartSnippetSuggestion
            );
        });

        it('should send proper payload for #openSmartSnippetSource', async () => {
            await client.logOpenSmartSnippetSource(fakeDocInfo, fakeDocID);
            expectMatchDocumentPayload(SearchPageEvents.openSmartSnippetSource, fakeDocInfo, fakeDocID);
        });

        it('should send proper payload for #openSmartSnippetInlineLink', async () => {
            const meta = {
                ...fakeDocID,
                linkText: 'Some text',
                linkURL: 'https://invalid.com',
            };

            await client.logOpenSmartSnippetInlineLink(fakeDocInfo, meta);
            expectMatchDocumentPayload(SearchPageEvents.openSmartSnippetInlineLink, fakeDocInfo, meta);
        });

        it('should send proper payload for #openSmartSnippetSuggestionSource', async () => {
            const meta = {
                question: 'Abc',
                answerSnippet: 'Def',
                documentId: {contentIdKey: 'permanentid', contentIdValue: 'foo'},
            };

            const expectedMetadata = {
                ...meta,
                contentIDKey: meta.documentId.contentIdKey,
                contentIDValue: meta.documentId.contentIdValue,
            };

            await client.logOpenSmartSnippetSuggestionSource(fakeDocInfo, meta);
            expectMatchDocumentPayload(
                SearchPageEvents.openSmartSnippetSuggestionSource,
                fakeDocInfo,
                expectedMetadata
            );
        });

        it('should send proper payload for #openSmartSnippetSuggestionInlineLink', async () => {
            const meta = {
                question: 'Abc',
                answerSnippet: 'Def',
                documentId: {contentIdKey: 'permanentid', contentIdValue: 'foo'},
                linkText: 'Some text',
                linkURL: 'https://invalid.com',
            };
            const expectedMetadata = {
                ...meta,
                contentIDKey: meta.documentId.contentIdKey,
                contentIDValue: meta.documentId.contentIdValue,
            };

            await client.logOpenSmartSnippetSuggestionInlineLink(fakeDocInfo, meta);
            expectMatchDocumentPayload(
                SearchPageEvents.openSmartSnippetSuggestionInlineLink,
                fakeDocInfo,
                expectedMetadata
            );
        });
        it('should send proper payload for #showMoreFoldedResults', async () => {
            await client.logShowMoreFoldedResults(fakeDocInfo, fakeDocID);
            expectMatchDocumentPayload(SearchPageEvents.showMoreFoldedResults, fakeDocInfo, fakeDocID);
        });

        it('should send proper payload for #showLessFoldedResults', async () => {
            await client.logShowLessFoldedResults();
            expectMatchCustomEventPayload(SearchPageEvents.showLessFoldedResults);
        });

        it('should send proper payload for #likeGeneratedAnswer', async () => {
            const exampleGeneratedAnswerMetadata = {
                generativeQuestionAnsweringId: '123',
            };

            await client.logLikeGeneratedAnswer(exampleGeneratedAnswerMetadata);
            expectMatchCustomEventPayload(SearchPageEvents.likeGeneratedAnswer, exampleGeneratedAnswerMetadata);
        });

        it('should send proper payload for #dislikeGeneratedAnswer', async () => {
            const exampleGeneratedAnswerMetadata = {
                generativeQuestionAnsweringId: '123',
            };

            await client.logDislikeGeneratedAnswer(exampleGeneratedAnswerMetadata);
            expectMatchCustomEventPayload(SearchPageEvents.dislikeGeneratedAnswer, exampleGeneratedAnswerMetadata);
        });

        it('should send proper payload for #openGeneratedAnswerSource', async () => {
            const exampleGeneratedAnswerMetadata = {
                generativeQuestionAnsweringId: '123',
                permanentId: 'foo',
                citationId: 'bar',
            };

            await client.logOpenGeneratedAnswerSource(exampleGeneratedAnswerMetadata);
            expectMatchCustomEventPayload(SearchPageEvents.openGeneratedAnswerSource, exampleGeneratedAnswerMetadata);
        });

        it('should send proper payload for #generatedAnswerSourceHover', async () => {
            const exampleGeneratedAnswerMetadata = {
                generativeQuestionAnsweringId: '123',
                permanentId: 'foo',
                citationId: 'bar',
                citationHoverTimeMs: 100,
            };

            await client.logGeneratedAnswerSourceHover(exampleGeneratedAnswerMetadata);
            expectMatchCustomEventPayload(SearchPageEvents.generatedAnswerSourceHover, exampleGeneratedAnswerMetadata);
        });

        it('should send proper payload for #generatedAnswerCopyToClipboard', async () => {
            const exampleGeneratedAnswerMetadata = {
                generativeQuestionAnsweringId: '123',
            };

            await client.logGeneratedAnswerCopyToClipboard(exampleGeneratedAnswerMetadata);
            expectMatchCustomEventPayload(
                SearchPageEvents.generatedAnswerCopyToClipboard,
                exampleGeneratedAnswerMetadata
            );
        });

        it('should send proper payload for #generatedAnswerHideAnswers', async () => {
            const exampleGeneratedAnswerMetadata = {
                generativeQuestionAnsweringId: '123',
            };

            await client.logGeneratedAnswerHideAnswers(exampleGeneratedAnswerMetadata);
            expectMatchCustomEventPayload(SearchPageEvents.generatedAnswerHideAnswers, exampleGeneratedAnswerMetadata);
        });

        it('should send proper payload for #generatedAnswerShowAnswers', async () => {
            const exampleGeneratedAnswerMetadata = {
                generativeQuestionAnsweringId: '123',
            };

            await client.logGeneratedAnswerShowAnswers(exampleGeneratedAnswerMetadata);
            expectMatchCustomEventPayload(SearchPageEvents.generatedAnswerShowAnswers, exampleGeneratedAnswerMetadata);
        });

        it('should send proper payload for #generatedAnswerExpand', async () => {
            const exampleGeneratedAnswerMetadata = {
                generativeQuestionAnsweringId: '123',
            };

            await client.logGeneratedAnswerExpand(exampleGeneratedAnswerMetadata);
            expectMatchCustomEventPayload(SearchPageEvents.generatedAnswerExpand, exampleGeneratedAnswerMetadata);
        });

        it('should send proper payload for #generatedAnswerCollapse', async () => {
            const exampleGeneratedAnswerMetadata = {
                generativeQuestionAnsweringId: '123',
            };

            await client.logGeneratedAnswerCollapse(exampleGeneratedAnswerMetadata);
            expectMatchCustomEventPayload(SearchPageEvents.generatedAnswerCollapse, exampleGeneratedAnswerMetadata);
        });

        it('should send proper payload for #generatedAnswerFeedbackSubmit', async () => {
            const exampleGeneratedAnswerMetadata = {
                generativeQuestionAnsweringId: '123',
                reason: <GeneratedAnswerFeedbackReason>'other',
                details: 'foo',
            };

            await client.logGeneratedAnswerFeedbackSubmit(exampleGeneratedAnswerMetadata);
            expectMatchCustomEventPayload(
                SearchPageEvents.generatedAnswerFeedbackSubmit,
                exampleGeneratedAnswerMetadata
            );
        });

        it('should send proper payload for #rephraseGeneratedAnswer', async () => {
            const exampleGeneratedAnswerMetadata = {
                generativeQuestionAnsweringId: '123',
                rephraseFormat: <GeneratedAnswerRephraseFormat>'step',
            };

            await client.logRephraseGeneratedAnswer(exampleGeneratedAnswerMetadata);
            expectMatchPayload(SearchPageEvents.rephraseGeneratedAnswer, exampleGeneratedAnswerMetadata);
        });

        it('should send proper payload for #retryGeneratedAnswer', async () => {
            await client.logRetryGeneratedAnswer();
            expectMatchPayload(SearchPageEvents.retryGeneratedAnswer);
        });

        it('should send proper payload for #generatedAnswerStreamEnd', async () => {
            const exampleGeneratedAnswerMetadata = {
                generativeQuestionAnsweringId: '123',
                answerGenerated: true,
                answerTextIsEmpty: false,
            };

            await client.logGeneratedAnswerStreamEnd(exampleGeneratedAnswerMetadata);
            expectMatchCustomEventPayload(SearchPageEvents.generatedAnswerStreamEnd, exampleGeneratedAnswerMetadata);
        });

        it('should send proper payload for #createArticle', async () => {
            const exampleCreateArticleMetadata = {
                articleType: 'Knowledge__kav',
                triggeredBy: 'CreateArticleButton',
            };
            await client.logCreateArticle(exampleCreateArticleMetadata);
            expectMatchCustomEventPayload(InsightEvents.createArticle, exampleCreateArticleMetadata);
        });

        it('should send proper payload for #generatedAnswerFeedbackSubmitV2', async () => {
            const exampleGeneratedAnswerMetadata = {
                generativeQuestionAnsweringId: '123',
                helpful: true,
                readable: <GeneratedAnswerFeedbackReasonOption>'yes',
                documented: <GeneratedAnswerFeedbackReasonOption>'no',
                correctTopic: <GeneratedAnswerFeedbackReasonOption>'unknown',
                hallucinationFree: <GeneratedAnswerFeedbackReasonOption>'yes',
                details: 'foo',
                documentUrl: 'https://document.com',
            };

            await client.logGeneratedAnswerFeedbackSubmitV2(exampleGeneratedAnswerMetadata);
            expectMatchCustomEventPayload(
                SearchPageEvents.generatedAnswerFeedbackSubmitV2,
                exampleGeneratedAnswerMetadata
            );
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

        it('should send proper payload for #logFacetExclude', async () => {
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

            await client.logFacetExclude(metadata);
            expectMatchPayload(SearchPageEvents.facetExclude, expectedMetadata);
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

        it('should send proper payload for #caseSendEmail', async () => {
            const metadata = baseCaseMetadata;

            const expectedMetadata = {
                ...fakeDocID,
                ...expectedBaseCaseMetadata,
            };
            await client.logCaseSendEmail(fakeDocInfo, fakeDocID, metadata);
            expectMatchDocumentPayload(SearchPageEvents.caseSendEmail, fakeDocInfo, expectedMetadata);
        });

        it('should send proper payload for #feedItemTextPost', async () => {
            const metadata = baseCaseMetadata;

            const expectedMetadata = {
                ...fakeDocID,
                ...expectedBaseCaseMetadata,
            };
            await client.logFeedItemTextPost(fakeDocInfo, fakeDocID, metadata);
            expectMatchDocumentPayload(SearchPageEvents.feedItemTextPost, fakeDocInfo, expectedMetadata);
        });

        it('should send proper payload for #documentQuickview', async () => {
            const metadata = baseCaseMetadata;

            const expectedMetadata = {
                ...fakeDocID,
                ...expectedBaseCaseMetadata,
                documentTitle: fakeDocInfo.documentTitle,
                documentURL: fakeDocInfo.documentUrl,
            };
            await client.logDocumentQuickview(fakeDocInfo, fakeDocID, metadata);
            expectMatchDocumentPayload(SearchPageEvents.documentQuickview, fakeDocInfo, expectedMetadata);
        });

        it('should send proper payload for #caseAttach', async () => {
            const metadata = baseCaseMetadata;

            const expectedMetadata = {
                ...fakeDocID,
                ...expectedBaseCaseMetadata,
                documentTitle: fakeDocInfo.documentTitle,
                documentURL: fakeDocInfo.documentUrl,
                resultUriHash: fakeDocInfo.documentUriHash,
            };
            await client.logCaseAttach(fakeDocInfo, fakeDocID, metadata);
            expectMatchDocumentPayload(SearchPageEvents.caseAttach, fakeDocInfo, expectedMetadata);
        });

        it('should send proper payload for #caseDetach', async () => {
            const metadata = baseCaseMetadata;

            const expectedMetadata = {
                ...expectedBaseCaseMetadata,
                resultUriHash: fakeDocInfo.documentUriHash,
            };
            await client.logCaseDetach(fakeDocInfo.documentUriHash, metadata);
            expectMatchCustomEventPayload(SearchPageEvents.caseDetach, expectedMetadata);
        });

        it('should send proper payload for #likeSmartSnippet', async () => {
            await client.logLikeSmartSnippet(baseCaseMetadata);
            expectMatchCustomEventPayload(SearchPageEvents.likeSmartSnippet, expectedBaseCaseMetadata);
        });

        it('should send proper payload for #dislikeSmartSnippet', async () => {
            await client.logDislikeSmartSnippet(baseCaseMetadata);
            expectMatchCustomEventPayload(SearchPageEvents.dislikeSmartSnippet, expectedBaseCaseMetadata);
        });

        it('should send proper payload for #expandSmartSnippet', async () => {
            await client.logExpandSmartSnippet(baseCaseMetadata);
            expectMatchCustomEventPayload(SearchPageEvents.expandSmartSnippet, expectedBaseCaseMetadata);
        });

        it('should send proper payload for #collapseSmartSnippet', async () => {
            await client.logCollapseSmartSnippet(baseCaseMetadata);
            expectMatchCustomEventPayload(SearchPageEvents.collapseSmartSnippet, expectedBaseCaseMetadata);
        });

        it('should send proper payload for #openSmartSnippetFeedbackModal', async () => {
            await client.logOpenSmartSnippetFeedbackModal(baseCaseMetadata);
            expectMatchCustomEventPayload(SearchPageEvents.openSmartSnippetFeedbackModal, expectedBaseCaseMetadata);
        });

        it('should send proper payload for #closeSmartSnippetFeedbackModal', async () => {
            await client.logCloseSmartSnippetFeedbackModal(baseCaseMetadata);
            expectMatchCustomEventPayload(SearchPageEvents.closeSmartSnippetFeedbackModal, expectedBaseCaseMetadata);
        });

        it('should send proper payload for #sendSmartSnippetReason', async () => {
            const reason = 'other';
            const details = 'example details';
            const expectedMetadata = {
                reason,
                details,
                ...expectedBaseCaseMetadata,
            };

            await client.logSmartSnippetFeedbackReason(reason, details, baseCaseMetadata);
            expectMatchCustomEventPayload(SearchPageEvents.sendSmartSnippetReason, expectedMetadata);
        });

        it('should send proper payload for #expandSmartSnippetSuggestion', async () => {
            const exampleSmartSnippetSuggestion = {
                question: 'Abc',
                answerSnippet: 'Def',
                documentId: {contentIdKey: 'permanentid', contentIdValue: 'foo'},
            };
            const expectedMetadata = {
                ...exampleSmartSnippetSuggestion,
                ...expectedBaseCaseMetadata,
            };

            await client.logExpandSmartSnippetSuggestion(exampleSmartSnippetSuggestion, baseCaseMetadata);
            expectMatchCustomEventPayload(SearchPageEvents.expandSmartSnippetSuggestion, expectedMetadata);
        });

        it('should send proper payload for #collapseSmartSnippetSuggestion', async () => {
            const exampleSmartSnippetSuggestion = {
                question: 'Abc',
                answerSnippet: 'Def',
                documentId: {contentIdKey: 'permanentid', contentIdValue: 'foo'},
            };
            const expectedMetadata = {
                ...exampleSmartSnippetSuggestion,
                ...expectedBaseCaseMetadata,
            };

            await client.logCollapseSmartSnippetSuggestion(exampleSmartSnippetSuggestion, baseCaseMetadata);
            expectMatchCustomEventPayload(SearchPageEvents.collapseSmartSnippetSuggestion, expectedMetadata);
        });

        it('should send proper payload for #openSmartSnippetSource', async () => {
            const expectedMetadata = {
                ...fakeDocID,
                ...expectedBaseCaseMetadata,
            };
            await client.logOpenSmartSnippetSource(fakeDocInfo, fakeDocID, baseCaseMetadata);
            expectMatchDocumentPayload(SearchPageEvents.openSmartSnippetSource, fakeDocInfo, expectedMetadata);
        });

        it('should send proper payload for #openSmartSnippetInlineLink', async () => {
            const meta = {
                ...fakeDocID,
                linkText: 'Some text',
                linkURL: 'https://invalid.com',
            };
            const expectedMetadata = {
                ...meta,
                ...expectedBaseCaseMetadata,
            };

            await client.logOpenSmartSnippetInlineLink(fakeDocInfo, meta, baseCaseMetadata);
            expectMatchDocumentPayload(SearchPageEvents.openSmartSnippetInlineLink, fakeDocInfo, expectedMetadata);
        });

        it('should send proper payload for #openSmartSnippetSuggestionSource', async () => {
            const meta = {
                question: 'Abc',
                answerSnippet: 'Def',
                documentId: {contentIdKey: 'permanentid', contentIdValue: 'foo'},
            };

            const expectedMetadata = {
                ...meta,
                ...expectedBaseCaseMetadata,
                contentIDKey: meta.documentId.contentIdKey,
                contentIDValue: meta.documentId.contentIdValue,
            };

            await client.logOpenSmartSnippetSuggestionSource(fakeDocInfo, meta, baseCaseMetadata);
            expectMatchDocumentPayload(
                SearchPageEvents.openSmartSnippetSuggestionSource,
                fakeDocInfo,
                expectedMetadata
            );
        });

        it('should send proper payload for #openSmartSnippetSuggestionInlineLink', async () => {
            const meta = {
                question: 'Abc',
                answerSnippet: 'Def',
                documentId: {contentIdKey: 'permanentid', contentIdValue: 'foo'},
                linkText: 'Some text',
                linkURL: 'https://invalid.com',
            };
            const expectedMetadata = {
                ...meta,
                ...expectedBaseCaseMetadata,
                contentIDKey: meta.documentId.contentIdKey,
                contentIDValue: meta.documentId.contentIdValue,
            };

            await client.logOpenSmartSnippetSuggestionInlineLink(fakeDocInfo, meta, baseCaseMetadata);
            expectMatchDocumentPayload(
                SearchPageEvents.openSmartSnippetSuggestionInlineLink,
                fakeDocInfo,
                expectedMetadata
            );
        });

        it('should send proper payload for #showMoreFoldedResults', async () => {
            const expectedMetadata = {
                ...fakeDocID,
                ...expectedBaseCaseMetadata,
            };
            await client.logShowMoreFoldedResults(fakeDocInfo, fakeDocID, baseCaseMetadata);
            expectMatchDocumentPayload(SearchPageEvents.showMoreFoldedResults, fakeDocInfo, expectedMetadata);
        });

        it('should send proper payload for #showLessFoldedResults', async () => {
            const expectedMetadata = {
                ...expectedBaseCaseMetadata,
            };
            await client.logShowLessFoldedResults(baseCaseMetadata);
            expectMatchCustomEventPayload(SearchPageEvents.showLessFoldedResults, expectedMetadata);
        });

        it('should send proper payload for #likeGeneratedAnswer', async () => {
            const exampleGeneratedAnswerMetadata = {
                generativeQuestionAnsweringId: '123',
            };
            const expectedMetadata = {
                ...exampleGeneratedAnswerMetadata,
                ...expectedBaseCaseMetadata,
            };

            await client.logLikeGeneratedAnswer(exampleGeneratedAnswerMetadata, baseCaseMetadata);
            expectMatchCustomEventPayload(SearchPageEvents.likeGeneratedAnswer, expectedMetadata);
        });

        it('should send proper payload for #dislikeGeneratedAnswer', async () => {
            const exampleGeneratedAnswerMetadata = {
                generativeQuestionAnsweringId: '123',
            };
            const expectedMetadata = {
                ...exampleGeneratedAnswerMetadata,
                ...expectedBaseCaseMetadata,
            };

            await client.logDislikeGeneratedAnswer(exampleGeneratedAnswerMetadata, baseCaseMetadata);
            expectMatchCustomEventPayload(SearchPageEvents.dislikeGeneratedAnswer, expectedMetadata);
        });

        it('should send proper payload for #openGeneratedAnswerSource', async () => {
            const exampleGeneratedAnswerMetadata = {
                generativeQuestionAnsweringId: '123',
                permanentId: 'foo',
                citationId: 'bar',
            };
            const expectedMetadata = {
                ...exampleGeneratedAnswerMetadata,
                ...expectedBaseCaseMetadata,
            };

            await client.logOpenGeneratedAnswerSource(exampleGeneratedAnswerMetadata, baseCaseMetadata);
            expectMatchCustomEventPayload(SearchPageEvents.openGeneratedAnswerSource, expectedMetadata);
        });

        it('should send proper payload for #generatedAnswerSourceHover', async () => {
            const exampleGeneratedAnswerMetadata = {
                generativeQuestionAnsweringId: '123',
                permanentId: 'foo',
                citationId: 'bar',
                citationHoverTimeMs: 100,
            };
            const expectedMetadata = {
                ...exampleGeneratedAnswerMetadata,
                ...expectedBaseCaseMetadata,
            };

            await client.logGeneratedAnswerSourceHover(exampleGeneratedAnswerMetadata, baseCaseMetadata);
            expectMatchCustomEventPayload(SearchPageEvents.generatedAnswerSourceHover, expectedMetadata);
        });

        it('should send proper payload for #generatedAnswerCopyToClipboard', async () => {
            const exampleGeneratedAnswerMetadata = {
                generativeQuestionAnsweringId: '123',
            };
            const expectedMetadata = {
                ...exampleGeneratedAnswerMetadata,
                ...expectedBaseCaseMetadata,
            };

            await client.logGeneratedAnswerCopyToClipboard(exampleGeneratedAnswerMetadata, baseCaseMetadata);
            expectMatchCustomEventPayload(SearchPageEvents.generatedAnswerCopyToClipboard, expectedMetadata);
        });

        it('should send proper payload for #generatedAnswerHideAnswers', async () => {
            const exampleGeneratedAnswerMetadata = {
                generativeQuestionAnsweringId: '123',
            };
            const expectedMetadata = {
                ...exampleGeneratedAnswerMetadata,
                ...expectedBaseCaseMetadata,
            };

            await client.logGeneratedAnswerHideAnswers(exampleGeneratedAnswerMetadata, baseCaseMetadata);
            expectMatchCustomEventPayload(SearchPageEvents.generatedAnswerHideAnswers, expectedMetadata);
        });

        it('should send proper payload for #generatedAnswerShowAnswers', async () => {
            const exampleGeneratedAnswerMetadata = {
                generativeQuestionAnsweringId: '123',
            };
            const expectedMetadata = {
                ...exampleGeneratedAnswerMetadata,
                ...expectedBaseCaseMetadata,
            };

            await client.logGeneratedAnswerShowAnswers(exampleGeneratedAnswerMetadata, baseCaseMetadata);
            expectMatchCustomEventPayload(SearchPageEvents.generatedAnswerShowAnswers, expectedMetadata);
        });

        it('should send proper payload for #generatedAnswerExpand', async () => {
            const exampleGeneratedAnswerMetadata = {
                generativeQuestionAnsweringId: '123',
            };
            const expectedMetadata = {
                ...exampleGeneratedAnswerMetadata,
                ...expectedBaseCaseMetadata,
            };

            await client.logGeneratedAnswerExpand(exampleGeneratedAnswerMetadata, baseCaseMetadata);
            expectMatchCustomEventPayload(SearchPageEvents.generatedAnswerExpand, expectedMetadata);
        });

        it('should send proper payload for #generatedAnswerCollapse', async () => {
            const exampleGeneratedAnswerMetadata = {
                generativeQuestionAnsweringId: '123',
            };
            const expectedMetadata = {
                ...exampleGeneratedAnswerMetadata,
                ...expectedBaseCaseMetadata,
            };

            await client.logGeneratedAnswerCollapse(exampleGeneratedAnswerMetadata, baseCaseMetadata);
            expectMatchCustomEventPayload(SearchPageEvents.generatedAnswerCollapse, expectedMetadata);
        });

        it('should send proper payload for #generatedAnswerFeedbackSubmit', async () => {
            const exampleGeneratedAnswerMetadata = {
                generativeQuestionAnsweringId: '123',
                reason: <GeneratedAnswerFeedbackReason>'other',
                details: 'foo',
            };
            const expectedMetadata = {
                ...exampleGeneratedAnswerMetadata,
                ...expectedBaseCaseMetadata,
            };

            await client.logGeneratedAnswerFeedbackSubmit(exampleGeneratedAnswerMetadata, baseCaseMetadata);
            expectMatchCustomEventPayload(SearchPageEvents.generatedAnswerFeedbackSubmit, expectedMetadata);
        });

        it('should send proper payload for #generatedAnswerFeedbackSubmitV2', async () => {
            const exampleGeneratedAnswerMetadata = {
                generativeQuestionAnsweringId: '123',
                helpful: true,
                readable: <GeneratedAnswerFeedbackReasonOption>'yes',
                documented: <GeneratedAnswerFeedbackReasonOption>'no',
                correctTopic: <GeneratedAnswerFeedbackReasonOption>'unknown',
                hallucinationFree: <GeneratedAnswerFeedbackReasonOption>'yes',
                details: 'foo',
                documentUrl: 'https://document.com',
            };
            const expectedMetadata = {
                ...exampleGeneratedAnswerMetadata,
                ...expectedBaseCaseMetadata,
            };

            await client.logGeneratedAnswerFeedbackSubmitV2(exampleGeneratedAnswerMetadata, baseCaseMetadata);
            expectMatchCustomEventPayload(SearchPageEvents.generatedAnswerFeedbackSubmitV2, expectedMetadata);
        });

        it('should send proper payload for #rephraseGeneratedAnswer', async () => {
            const exampleGeneratedAnswerMetadata = {
                generativeQuestionAnsweringId: '123',
                rephraseFormat: <GeneratedAnswerRephraseFormat>'step',
            };
            const expectedMetadata = {
                ...exampleGeneratedAnswerMetadata,
                ...expectedBaseCaseMetadata,
            };

            await client.logRephraseGeneratedAnswer(exampleGeneratedAnswerMetadata, baseCaseMetadata);
            expectMatchPayload(SearchPageEvents.rephraseGeneratedAnswer, expectedMetadata);
        });

        it('should send proper payload for #retryGeneratedAnswer', async () => {
            const expectedMetadata = {
                ...expectedBaseCaseMetadata,
            };

            await client.logRetryGeneratedAnswer(baseCaseMetadata);
            expectMatchPayload(SearchPageEvents.retryGeneratedAnswer, expectedMetadata);
        });

        it('should send proper payload for #generatedAnswerStreamEnd', async () => {
            const exampleGeneratedAnswerMetadata = {
                generativeQuestionAnsweringId: '123',
                answerGenerated: true,
                answerTextIsEmpty: false,
            };
            const expectedMetadata = {
                ...exampleGeneratedAnswerMetadata,
                ...expectedBaseCaseMetadata,
            };

            await client.logGeneratedAnswerStreamEnd(exampleGeneratedAnswerMetadata, baseCaseMetadata);
            expectMatchCustomEventPayload(SearchPageEvents.generatedAnswerStreamEnd, expectedMetadata);
        });

        it('should send proper payload for #createArticle', async () => {
            const exampleCreateArticleMetadata = {
                articleType: 'Knowledge__kav',
            };
            const expectedMetadata = {
                ...exampleCreateArticleMetadata,
                ...expectedBaseCaseMetadata,
            };
            await client.logCreateArticle(exampleCreateArticleMetadata, baseCaseMetadata);
            expectMatchCustomEventPayload(InsightEvents.createArticle, expectedMetadata);
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

    it('disabling analytics does not delete the visitorId', () => {
        const visitorId = 'uuid';
        Cookie.set('coveo_visitorId', visitorId);
        const c = new CoveoInsightClient({enableAnalytics: true}, provider);

        expect(Cookie.get('coveo_visitorId')).toBe(visitorId);
        c.disable();
        expect(Cookie.get('coveo_visitorId')).toBe(visitorId);
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

    it('should send proper payload for #logOpenUserActions', async () => {
        await client.logOpenUserActions(baseCaseMetadata);
        expectMatchCustomEventPayload(InsightEvents.openUserActions, expectedBaseCaseMetadata);
    });

    it('should send proper payload for #logShowPrecedingSession', async () => {
        await client.logShowPrecedingSessions(baseCaseMetadata);
        expectMatchCustomEventPayload(InsightEvents.showPrecedingSessions, expectedBaseCaseMetadata);
    });

    it('should send proper payload for #logShowFollowingSession', async () => {
        await client.logShowFollowingSessions(baseCaseMetadata);
        expectMatchCustomEventPayload(InsightEvents.showFollowingSessions, expectedBaseCaseMetadata);
    });

    it('should send proper payload for #logViewedDocumentClick', async () => {
        const document = {
            title: 'Some Title',
            uri: 'https://www.some-uri.com',
            uriHash: 'Acp8NfEWi0DeðeZU',
            permanentId: '8c88cd894t2767a96fa4f109041bb62bb54ca21ff31c1d760814b60cbcf2',
        };
        await client.logViewedDocumentClick(document, baseCaseMetadata);
        expectMatchCustomEventPayload(InsightEvents.clickViewedDocument, {
            ...expectedBaseCaseMetadata,
            document,
        });
    });

    it('should send proper payload for #logPageViewClick', async () => {
        const pageView = {
            title: 'Some Title',
            contentIdKey: 'someKey',
            contentIdValue: 'some-content-id-value',
        };
        await client.logPageViewClick(pageView, baseCaseMetadata);
        expectMatchCustomEventPayload(InsightEvents.clickPageView, {
            ...expectedBaseCaseMetadata,
            pageView,
        });
    });
});
