import CoveoAnalyticsClient, {ClientOptions, AnalyticsClient, PreparedEvent} from '../client/analytics';
import {
    SearchEventRequest,
    CustomEventRequest,
    SearchEventResponse,
    AnyEventResponse,
    ClickEventResponse,
    CustomEventResponse,
    PreparedClickEventRequest,
    PreparedSearchEventRequest,
} from '../events';
import {
    SearchPageEvents,
    OmniboxSuggestionsMetadata,
    FacetMetadata,
    FacetRangeMetadata,
    CategoryFacetMetadata,
    DocumentIdentifier,
    InterfaceChangeMetadata,
    ResultsSortMetadata,
    PartialDocumentInformation,
    CustomEventsTypes,
    TriggerNotifyMetadata,
    TriggerExecuteMetadata,
    TriggerRedirectMetadata,
    PagerResizeMetadata,
    PagerMetadata,
    FacetBaseMeta,
    FacetSortMeta,
    QueryErrorMeta,
    FacetStateMetadata,
    SmartSnippetFeedbackReason,
    SmartSnippetSuggestionMeta,
    SmartSnippetDocumentIdentifier,
    StaticFilterMetadata,
    StaticFilterToggleValueMetadata,
    UndoTriggerRedirectMetadata,
    SmartSnippetLinkMeta,
    GeneratedAnswerFeedbackMeta,
    GeneratedAnswerCitationMeta,
    GeneratedAnswerStreamEndMeta,
    GeneratedAnswerSourceHoverMeta,
    GeneratedAnswerBaseMeta,
    GeneratedAnswerRephraseMeta,
    GeneratedAnswerFeedbackMetaV2,
} from './searchPageEvents';
import {NoopAnalytics} from '../client/noopAnalytics';
import {formatOmniboxMetadata} from '../formatting/format-omnibox-metadata';
import doNotTrack from '../donottrack';

export interface SearchPageClientProvider {
    getBaseMetadata: () => Record<string, any>;
    getSearchEventRequestPayload: () => Omit<SearchEventRequest, 'actionCause' | 'searchQueryUid'>;
    getSearchUID: () => string;
    getPipeline: () => string;
    getOriginContext?: () => string;
    getOriginLevel1: () => string;
    getOriginLevel2: () => string;
    getOriginLevel3: () => string;
    getLanguage: () => string;
    getIsAnonymous: () => boolean;
    getFacetState?: () => FacetStateMetadata[];
    getSplitTestRunName?: () => string | undefined;
    getSplitTestRunVersion?: () => string | undefined;
    getGeneratedAnswerMetadata?: () => Record<string, any>;
}

export interface SearchPageClientOptions extends ClientOptions {
    enableAnalytics: boolean;
}

export type EventDescription = Pick<SearchEventRequest, 'actionCause' | 'customData'>;

export interface EventBuilder<T extends AnyEventResponse = AnyEventResponse> {
    description: EventDescription;
    log(metadata: {searchUID: string}): Promise<T | void>;
}

export class CoveoSearchPageClient {
    public coveoAnalyticsClient: AnalyticsClient;

    constructor(private opts: Partial<SearchPageClientOptions>, private provider: SearchPageClientProvider) {
        const shouldDisableAnalytics = opts.enableAnalytics === false || doNotTrack();
        this.coveoAnalyticsClient = shouldDisableAnalytics ? new NoopAnalytics() : new CoveoAnalyticsClient(opts);
    }

    public disable() {
        this.coveoAnalyticsClient = new NoopAnalytics();
    }

    public enable() {
        this.coveoAnalyticsClient = new CoveoAnalyticsClient(this.opts);
    }

    public makeInterfaceLoad() {
        return this.makeSearchEvent(SearchPageEvents.interfaceLoad);
    }

    public async logInterfaceLoad() {
        return (await this.makeInterfaceLoad()).log({searchUID: this.provider.getSearchUID()});
    }

    public makeRecommendationInterfaceLoad() {
        return this.makeSearchEvent(SearchPageEvents.recommendationInterfaceLoad);
    }

    public async logRecommendationInterfaceLoad() {
        return (await this.makeRecommendationInterfaceLoad()).log({searchUID: this.provider.getSearchUID()});
    }

    public makeRecommendation() {
        return this.makeCustomEvent(SearchPageEvents.recommendation);
    }

    public async logRecommendation() {
        return (await this.makeRecommendation()).log({searchUID: this.provider.getSearchUID()});
    }

    public makeRecommendationOpen(info: PartialDocumentInformation, identifier: DocumentIdentifier) {
        return this.makeClickEvent(SearchPageEvents.recommendationOpen, info, identifier);
    }

    public async logRecommendationOpen(info: PartialDocumentInformation, identifier: DocumentIdentifier) {
        return (await this.makeRecommendationOpen(info, identifier)).log({searchUID: this.provider.getSearchUID()});
    }

    public makeStaticFilterClearAll(meta: StaticFilterMetadata) {
        return this.makeSearchEvent(SearchPageEvents.staticFilterClearAll, meta);
    }

    public async logStaticFilterClearAll(meta: StaticFilterMetadata) {
        return (await this.makeStaticFilterClearAll(meta)).log({searchUID: this.provider.getSearchUID()});
    }

    public makeStaticFilterSelect(meta: StaticFilterToggleValueMetadata) {
        return this.makeSearchEvent(SearchPageEvents.staticFilterSelect, meta);
    }

    public async logStaticFilterSelect(meta: StaticFilterToggleValueMetadata) {
        return (await this.makeStaticFilterSelect(meta)).log({searchUID: this.provider.getSearchUID()});
    }

    public makeStaticFilterDeselect(meta: StaticFilterToggleValueMetadata) {
        return this.makeSearchEvent(SearchPageEvents.staticFilterDeselect, meta);
    }

    public async logStaticFilterDeselect(meta: StaticFilterToggleValueMetadata) {
        return (await this.makeStaticFilterDeselect(meta)).log({searchUID: this.provider.getSearchUID()});
    }

    public makeFetchMoreResults() {
        return this.makeCustomEvent(SearchPageEvents.pagerScrolling, {type: 'getMoreResults'});
    }

    public async logFetchMoreResults() {
        return (await this.makeFetchMoreResults()).log({searchUID: this.provider.getSearchUID()});
    }

    public makeInterfaceChange(metadata: InterfaceChangeMetadata) {
        return this.makeSearchEvent(SearchPageEvents.interfaceChange, metadata);
    }

    public async logInterfaceChange(metadata: InterfaceChangeMetadata) {
        return (await this.makeInterfaceChange(metadata)).log({searchUID: this.provider.getSearchUID()});
    }

    public makeDidYouMeanAutomatic() {
        return this.makeSearchEvent(SearchPageEvents.didyoumeanAutomatic);
    }

    public async logDidYouMeanAutomatic() {
        return (await this.makeDidYouMeanAutomatic()).log({searchUID: this.provider.getSearchUID()});
    }

    public makeDidYouMeanClick() {
        return this.makeSearchEvent(SearchPageEvents.didyoumeanClick);
    }

    public async logDidYouMeanClick() {
        return (await this.makeDidYouMeanClick()).log({searchUID: this.provider.getSearchUID()});
    }

    public makeResultsSort(metadata: ResultsSortMetadata) {
        return this.makeSearchEvent(SearchPageEvents.resultsSort, metadata);
    }

    public async logResultsSort(metadata: ResultsSortMetadata) {
        return (await this.makeResultsSort(metadata)).log({searchUID: this.provider.getSearchUID()});
    }

    public makeSearchboxSubmit() {
        return this.makeSearchEvent(SearchPageEvents.searchboxSubmit);
    }

    public async logSearchboxSubmit() {
        return (await this.makeSearchboxSubmit()).log({searchUID: this.provider.getSearchUID()});
    }

    public makeSearchboxClear() {
        return this.makeSearchEvent(SearchPageEvents.searchboxClear);
    }

    public async logSearchboxClear() {
        return (await this.makeSearchboxClear()).log({searchUID: this.provider.getSearchUID()});
    }

    public makeSearchboxAsYouType() {
        return this.makeSearchEvent(SearchPageEvents.searchboxAsYouType);
    }

    public async logSearchboxAsYouType() {
        return (await this.makeSearchboxAsYouType()).log({searchUID: this.provider.getSearchUID()});
    }

    public makeBreadcrumbFacet(metadata: FacetMetadata | FacetRangeMetadata | CategoryFacetMetadata) {
        return this.makeSearchEvent(SearchPageEvents.breadcrumbFacet, metadata);
    }

    public async logBreadcrumbFacet(metadata: FacetMetadata | FacetRangeMetadata | CategoryFacetMetadata) {
        return (await this.makeBreadcrumbFacet(metadata)).log({searchUID: this.provider.getSearchUID()});
    }

    public makeBreadcrumbResetAll() {
        return this.makeSearchEvent(SearchPageEvents.breadcrumbResetAll);
    }

    public async logBreadcrumbResetAll() {
        return (await this.makeBreadcrumbResetAll()).log({searchUID: this.provider.getSearchUID()});
    }

    public makeDocumentQuickview(info: PartialDocumentInformation, identifier: DocumentIdentifier) {
        return this.makeClickEvent(SearchPageEvents.documentQuickview, info, identifier);
    }

    public async logDocumentQuickview(info: PartialDocumentInformation, identifier: DocumentIdentifier) {
        return (await this.makeDocumentQuickview(info, identifier)).log({searchUID: this.provider.getSearchUID()});
    }

    public makeDocumentOpen(info: PartialDocumentInformation, identifier: DocumentIdentifier) {
        return this.makeClickEvent(SearchPageEvents.documentOpen, info, identifier);
    }

    public async logDocumentOpen(info: PartialDocumentInformation, identifier: DocumentIdentifier) {
        return (await this.makeDocumentOpen(info, identifier)).log({searchUID: this.provider.getSearchUID()});
    }

    public makeOmniboxAnalytics(meta: OmniboxSuggestionsMetadata) {
        return this.makeSearchEvent(SearchPageEvents.omniboxAnalytics, formatOmniboxMetadata(meta));
    }

    public async logOmniboxAnalytics(meta: OmniboxSuggestionsMetadata) {
        return (await this.makeOmniboxAnalytics(meta)).log({searchUID: this.provider.getSearchUID()});
    }

    public makeOmniboxFromLink(meta: OmniboxSuggestionsMetadata) {
        return this.makeSearchEvent(SearchPageEvents.omniboxFromLink, formatOmniboxMetadata(meta));
    }

    public async logOmniboxFromLink(meta: OmniboxSuggestionsMetadata) {
        return (await this.makeOmniboxFromLink(meta)).log({searchUID: this.provider.getSearchUID()});
    }

    public makeSearchFromLink() {
        return this.makeSearchEvent(SearchPageEvents.searchFromLink);
    }

    public async logSearchFromLink() {
        return (await this.makeSearchFromLink()).log({searchUID: this.provider.getSearchUID()});
    }

    public makeTriggerNotify(meta: TriggerNotifyMetadata) {
        return this.makeCustomEvent(SearchPageEvents.triggerNotify, meta);
    }

    public async logTriggerNotify(meta: TriggerNotifyMetadata) {
        return (await this.makeTriggerNotify(meta)).log({searchUID: this.provider.getSearchUID()});
    }

    public makeTriggerExecute(meta: TriggerExecuteMetadata) {
        return this.makeCustomEvent(SearchPageEvents.triggerExecute, meta);
    }

    public async logTriggerExecute(meta: TriggerExecuteMetadata) {
        return (await this.makeTriggerExecute(meta)).log({searchUID: this.provider.getSearchUID()});
    }

    public makeTriggerQuery() {
        return this.makeCustomEvent(
            SearchPageEvents.triggerQuery,
            {query: this.provider.getSearchEventRequestPayload().queryText},
            'queryPipelineTriggers'
        );
    }

    public async logTriggerQuery() {
        return (await this.makeTriggerQuery()).log({searchUID: this.provider.getSearchUID()});
    }

    public makeUndoTriggerQuery(meta: UndoTriggerRedirectMetadata) {
        return this.makeSearchEvent(SearchPageEvents.undoTriggerQuery, meta);
    }

    public async logUndoTriggerQuery(meta: UndoTriggerRedirectMetadata) {
        return (await this.makeUndoTriggerQuery(meta)).log({searchUID: this.provider.getSearchUID()});
    }

    public makeTriggerRedirect(meta: TriggerRedirectMetadata) {
        return this.makeCustomEvent(SearchPageEvents.triggerRedirect, {
            ...meta,
            query: this.provider.getSearchEventRequestPayload().queryText,
        });
    }

    public async logTriggerRedirect(meta: TriggerRedirectMetadata) {
        return (await this.makeTriggerRedirect(meta)).log({searchUID: this.provider.getSearchUID()});
    }

    public makePagerResize(meta: PagerResizeMetadata) {
        return this.makeCustomEvent(SearchPageEvents.pagerResize, meta);
    }

    public async logPagerResize(meta: PagerResizeMetadata) {
        return (await this.makePagerResize(meta)).log({searchUID: this.provider.getSearchUID()});
    }

    public makePagerNumber(meta: PagerMetadata) {
        return this.makeCustomEvent(SearchPageEvents.pagerNumber, meta);
    }

    public async logPagerNumber(meta: PagerMetadata) {
        return (await this.makePagerNumber(meta)).log({searchUID: this.provider.getSearchUID()});
    }

    public makePagerNext(meta: PagerMetadata) {
        return this.makeCustomEvent(SearchPageEvents.pagerNext, meta);
    }

    public async logPagerNext(meta: PagerMetadata) {
        return (await this.makePagerNext(meta)).log({searchUID: this.provider.getSearchUID()});
    }

    public makePagerPrevious(meta: PagerMetadata) {
        return this.makeCustomEvent(SearchPageEvents.pagerPrevious, meta);
    }

    public async logPagerPrevious(meta: PagerMetadata) {
        return (await this.makePagerPrevious(meta)).log({searchUID: this.provider.getSearchUID()});
    }

    public makePagerScrolling() {
        return this.makeCustomEvent(SearchPageEvents.pagerScrolling);
    }

    public async logPagerScrolling() {
        return (await this.makePagerScrolling()).log({searchUID: this.provider.getSearchUID()});
    }

    public makeFacetClearAll(meta: FacetBaseMeta) {
        return this.makeSearchEvent(SearchPageEvents.facetClearAll, meta);
    }

    public async logFacetClearAll(meta: FacetBaseMeta) {
        return (await this.makeFacetClearAll(meta)).log({searchUID: this.provider.getSearchUID()});
    }

    public makeFacetSearch(meta: FacetBaseMeta) {
        return this.makeSearchEvent(SearchPageEvents.facetSearch, meta);
    }

    public async logFacetSearch(meta: FacetBaseMeta) {
        return (await this.makeFacetSearch(meta)).log({searchUID: this.provider.getSearchUID()});
    }

    public makeFacetSelect(meta: FacetMetadata) {
        return this.makeSearchEvent(SearchPageEvents.facetSelect, meta);
    }

    public async logFacetSelect(meta: FacetMetadata) {
        return (await this.makeFacetSelect(meta)).log({searchUID: this.provider.getSearchUID()});
    }

    public makeFacetDeselect(meta: FacetMetadata) {
        return this.makeSearchEvent(SearchPageEvents.facetDeselect, meta);
    }

    public async logFacetDeselect(meta: FacetMetadata) {
        return (await this.makeFacetDeselect(meta)).log({searchUID: this.provider.getSearchUID()});
    }

    public makeFacetExclude(meta: FacetMetadata) {
        return this.makeSearchEvent(SearchPageEvents.facetExclude, meta);
    }

    public async logFacetExclude(meta: FacetMetadata) {
        return (await this.makeFacetExclude(meta)).log({searchUID: this.provider.getSearchUID()});
    }

    public makeFacetUnexclude(meta: FacetMetadata) {
        return this.makeSearchEvent(SearchPageEvents.facetUnexclude, meta);
    }

    public async logFacetUnexclude(meta: FacetMetadata) {
        return (await this.makeFacetUnexclude(meta)).log({searchUID: this.provider.getSearchUID()});
    }

    public makeFacetSelectAll(meta: FacetBaseMeta) {
        return this.makeSearchEvent(SearchPageEvents.facetSelectAll, meta);
    }

    public async logFacetSelectAll(meta: FacetBaseMeta) {
        return (await this.makeFacetSelectAll(meta)).log({searchUID: this.provider.getSearchUID()});
    }

    public makeFacetUpdateSort(meta: FacetSortMeta) {
        return this.makeSearchEvent(SearchPageEvents.facetUpdateSort, meta);
    }

    public async logFacetUpdateSort(meta: FacetSortMeta) {
        return (await this.makeFacetUpdateSort(meta)).log({searchUID: this.provider.getSearchUID()});
    }

    public makeFacetShowMore(meta: FacetBaseMeta) {
        return this.makeCustomEvent(SearchPageEvents.facetShowMore, meta);
    }

    public async logFacetShowMore(meta: FacetBaseMeta) {
        return (await this.makeFacetShowMore(meta)).log({searchUID: this.provider.getSearchUID()});
    }

    public makeFacetShowLess(meta: FacetBaseMeta) {
        return this.makeCustomEvent(SearchPageEvents.facetShowLess, meta);
    }

    public async logFacetShowLess(meta: FacetBaseMeta) {
        return (await this.makeFacetShowLess(meta)).log({searchUID: this.provider.getSearchUID()});
    }

    public makeQueryError(meta: QueryErrorMeta) {
        return this.makeCustomEvent(SearchPageEvents.queryError, meta);
    }

    public async logQueryError(meta: QueryErrorMeta) {
        return (await this.makeQueryError(meta)).log({searchUID: this.provider.getSearchUID()});
    }

    public async makeQueryErrorBack(): Promise<EventBuilder<SearchEventResponse>> {
        const customEventBuilder = await this.makeCustomEvent(SearchPageEvents.queryErrorBack);
        return {
            description: customEventBuilder.description,
            log: async () => {
                await customEventBuilder.log({searchUID: this.provider.getSearchUID()});
                return this.logSearchEvent(SearchPageEvents.queryErrorBack);
            },
        };
    }

    public async logQueryErrorBack() {
        return (await this.makeQueryErrorBack()).log({searchUID: this.provider.getSearchUID()});
    }

    public async makeQueryErrorRetry(): Promise<EventBuilder<SearchEventResponse>> {
        const customEventBuilder = await this.makeCustomEvent(SearchPageEvents.queryErrorRetry);
        return {
            description: customEventBuilder.description,
            log: async () => {
                await customEventBuilder.log({searchUID: this.provider.getSearchUID()});
                return this.logSearchEvent(SearchPageEvents.queryErrorRetry);
            },
        };
    }

    public async logQueryErrorRetry() {
        return (await this.makeQueryErrorRetry()).log({searchUID: this.provider.getSearchUID()});
    }

    public async makeQueryErrorClear(): Promise<EventBuilder<SearchEventResponse>> {
        const customEventBuilder = await this.makeCustomEvent(SearchPageEvents.queryErrorClear);
        return {
            description: customEventBuilder.description,
            log: async () => {
                await customEventBuilder.log({searchUID: this.provider.getSearchUID()});
                return this.logSearchEvent(SearchPageEvents.queryErrorClear);
            },
        };
    }

    public async logQueryErrorClear() {
        return (await this.makeQueryErrorClear()).log({searchUID: this.provider.getSearchUID()});
    }

    public makeLikeSmartSnippet() {
        return this.makeCustomEvent(SearchPageEvents.likeSmartSnippet);
    }

    public async logLikeSmartSnippet() {
        return (await this.makeLikeSmartSnippet()).log({searchUID: this.provider.getSearchUID()});
    }

    public makeDislikeSmartSnippet() {
        return this.makeCustomEvent(SearchPageEvents.dislikeSmartSnippet);
    }

    public async logDislikeSmartSnippet() {
        return (await this.makeDislikeSmartSnippet()).log({searchUID: this.provider.getSearchUID()});
    }

    public makeExpandSmartSnippet() {
        return this.makeCustomEvent(SearchPageEvents.expandSmartSnippet);
    }

    public async logExpandSmartSnippet() {
        return (await this.makeExpandSmartSnippet()).log({searchUID: this.provider.getSearchUID()});
    }

    public makeCollapseSmartSnippet() {
        return this.makeCustomEvent(SearchPageEvents.collapseSmartSnippet);
    }

    public async logCollapseSmartSnippet() {
        return (await this.makeCollapseSmartSnippet()).log({searchUID: this.provider.getSearchUID()});
    }

    public makeOpenSmartSnippetFeedbackModal() {
        return this.makeCustomEvent(SearchPageEvents.openSmartSnippetFeedbackModal);
    }

    public async logOpenSmartSnippetFeedbackModal() {
        return (await this.makeOpenSmartSnippetFeedbackModal()).log({searchUID: this.provider.getSearchUID()});
    }

    public makeCloseSmartSnippetFeedbackModal() {
        return this.makeCustomEvent(SearchPageEvents.closeSmartSnippetFeedbackModal);
    }

    public async logCloseSmartSnippetFeedbackModal() {
        return (await this.makeCloseSmartSnippetFeedbackModal()).log({searchUID: this.provider.getSearchUID()});
    }

    public makeSmartSnippetFeedbackReason(reason: SmartSnippetFeedbackReason, details?: string) {
        return this.makeCustomEvent(SearchPageEvents.sendSmartSnippetReason, {reason, details});
    }

    public async logSmartSnippetFeedbackReason(reason: SmartSnippetFeedbackReason, details?: string) {
        return (await this.makeSmartSnippetFeedbackReason(reason, details)).log({
            searchUID: this.provider.getSearchUID(),
        });
    }

    public makeExpandSmartSnippetSuggestion(snippet: SmartSnippetSuggestionMeta | SmartSnippetDocumentIdentifier) {
        return this.makeCustomEvent(
            SearchPageEvents.expandSmartSnippetSuggestion,
            'documentId' in snippet ? snippet : {documentId: snippet}
        );
    }

    public async logExpandSmartSnippetSuggestion(snippet: SmartSnippetSuggestionMeta | SmartSnippetDocumentIdentifier) {
        return (await this.makeExpandSmartSnippetSuggestion(snippet)).log({searchUID: this.provider.getSearchUID()});
    }

    public makeCollapseSmartSnippetSuggestion(snippet: SmartSnippetSuggestionMeta | SmartSnippetDocumentIdentifier) {
        return this.makeCustomEvent(
            SearchPageEvents.collapseSmartSnippetSuggestion,
            'documentId' in snippet ? snippet : {documentId: snippet}
        );
    }

    public async logCollapseSmartSnippetSuggestion(
        snippet: SmartSnippetSuggestionMeta | SmartSnippetDocumentIdentifier
    ) {
        return (await this.makeCollapseSmartSnippetSuggestion(snippet)).log({searchUID: this.provider.getSearchUID()});
    }

    /**
     * @deprecated
     */
    private makeShowMoreSmartSnippetSuggestion(snippet: SmartSnippetSuggestionMeta) {
        return this.makeCustomEvent(SearchPageEvents.showMoreSmartSnippetSuggestion, snippet);
    }

    /**
     * @deprecated
     */
    public async logShowMoreSmartSnippetSuggestion(snippet: SmartSnippetSuggestionMeta) {
        return (await this.makeShowMoreSmartSnippetSuggestion(snippet)).log({searchUID: this.provider.getSearchUID()});
    }

    /**
     * @deprecated
     */
    private makeShowLessSmartSnippetSuggestion(snippet: SmartSnippetSuggestionMeta) {
        return this.makeCustomEvent(SearchPageEvents.showLessSmartSnippetSuggestion, snippet);
    }

    /**
     * @deprecated
     */
    public async logShowLessSmartSnippetSuggestion(snippet: SmartSnippetSuggestionMeta) {
        return (await this.makeShowLessSmartSnippetSuggestion(snippet)).log({searchUID: this.provider.getSearchUID()});
    }

    public makeOpenSmartSnippetSource(info: PartialDocumentInformation, identifier: DocumentIdentifier) {
        return this.makeClickEvent(SearchPageEvents.openSmartSnippetSource, info, identifier);
    }

    public async logOpenSmartSnippetSource(info: PartialDocumentInformation, identifier: DocumentIdentifier) {
        return (await this.makeOpenSmartSnippetSource(info, identifier)).log({searchUID: this.provider.getSearchUID()});
    }

    public makeOpenSmartSnippetSuggestionSource(info: PartialDocumentInformation, snippet: SmartSnippetSuggestionMeta) {
        return this.makeClickEvent(
            SearchPageEvents.openSmartSnippetSuggestionSource,
            info,
            {contentIDKey: snippet.documentId.contentIdKey, contentIDValue: snippet.documentId.contentIdValue},
            snippet
        );
    }

    public makeCopyToClipboard(info: PartialDocumentInformation, identifier: DocumentIdentifier) {
        return this.makeClickEvent(SearchPageEvents.copyToClipboard, info, identifier);
    }

    public async logCopyToClipboard(info: PartialDocumentInformation, identifier: DocumentIdentifier) {
        return (await this.makeCopyToClipboard(info, identifier)).log({searchUID: this.provider.getSearchUID()});
    }

    public async logOpenSmartSnippetSuggestionSource(
        info: PartialDocumentInformation,
        snippet: SmartSnippetSuggestionMeta
    ) {
        return (await this.makeOpenSmartSnippetSuggestionSource(info, snippet)).log({
            searchUID: this.provider.getSearchUID(),
        });
    }

    public makeOpenSmartSnippetInlineLink(
        info: PartialDocumentInformation,
        identifierAndLink: DocumentIdentifier & SmartSnippetLinkMeta
    ) {
        return this.makeClickEvent(
            SearchPageEvents.openSmartSnippetInlineLink,
            info,
            {contentIDKey: identifierAndLink.contentIDKey, contentIDValue: identifierAndLink.contentIDValue},
            identifierAndLink
        );
    }

    public async logOpenSmartSnippetInlineLink(
        info: PartialDocumentInformation,
        identifierAndLink: DocumentIdentifier & SmartSnippetLinkMeta
    ) {
        return (await this.makeOpenSmartSnippetInlineLink(info, identifierAndLink)).log({
            searchUID: this.provider.getSearchUID(),
        });
    }

    public makeOpenSmartSnippetSuggestionInlineLink(
        info: PartialDocumentInformation,
        snippetAndLink: SmartSnippetSuggestionMeta & SmartSnippetLinkMeta
    ) {
        return this.makeClickEvent(
            SearchPageEvents.openSmartSnippetSuggestionInlineLink,
            info,
            {
                contentIDKey: snippetAndLink.documentId.contentIdKey,
                contentIDValue: snippetAndLink.documentId.contentIdValue,
            },
            snippetAndLink
        );
    }

    public async logOpenSmartSnippetSuggestionInlineLink(
        info: PartialDocumentInformation,
        snippetAndLink: SmartSnippetSuggestionMeta & SmartSnippetLinkMeta
    ) {
        return (await this.makeOpenSmartSnippetSuggestionInlineLink(info, snippetAndLink)).log({
            searchUID: this.provider.getSearchUID(),
        });
    }

    public makeRecentQueryClick() {
        return this.makeSearchEvent(SearchPageEvents.recentQueryClick);
    }

    public async logRecentQueryClick() {
        return (await this.makeRecentQueryClick()).log({searchUID: this.provider.getSearchUID()});
    }

    public makeClearRecentQueries() {
        return this.makeCustomEvent(SearchPageEvents.clearRecentQueries);
    }

    public async logClearRecentQueries() {
        return (await this.makeClearRecentQueries()).log({searchUID: this.provider.getSearchUID()});
    }

    public makeRecentResultClick(info: PartialDocumentInformation, identifier: DocumentIdentifier) {
        return this.makeCustomEvent(SearchPageEvents.recentResultClick, {info, identifier});
    }

    public async logRecentResultClick(info: PartialDocumentInformation, identifier: DocumentIdentifier) {
        return (await this.makeRecentResultClick(info, identifier)).log({searchUID: this.provider.getSearchUID()});
    }

    public makeClearRecentResults() {
        return this.makeCustomEvent(SearchPageEvents.clearRecentResults);
    }

    public async logClearRecentResults() {
        return (await this.makeClearRecentResults()).log({searchUID: this.provider.getSearchUID()});
    }

    public makeNoResultsBack() {
        return this.makeSearchEvent(SearchPageEvents.noResultsBack);
    }

    public async logNoResultsBack() {
        return (await this.makeNoResultsBack()).log({searchUID: this.provider.getSearchUID()});
    }

    public makeShowMoreFoldedResults(info: PartialDocumentInformation, identifier: DocumentIdentifier) {
        return this.makeClickEvent(SearchPageEvents.showMoreFoldedResults, info, identifier);
    }

    public async logShowMoreFoldedResults(info: PartialDocumentInformation, identifier: DocumentIdentifier) {
        return (await this.makeShowMoreFoldedResults(info, identifier)).log({searchUID: this.provider.getSearchUID()});
    }

    public makeShowLessFoldedResults() {
        return this.makeCustomEvent(SearchPageEvents.showLessFoldedResults);
    }

    public async logShowLessFoldedResults() {
        return (await this.makeShowLessFoldedResults()).log({searchUID: this.provider.getSearchUID()});
    }

    private makeEventDescription(
        preparedEvent: PreparedEvent<unknown, unknown, AnyEventResponse>,
        actionCause: SearchPageEvents
    ): EventDescription {
        return {actionCause, customData: preparedEvent.payload?.customData};
    }

    public async makeCustomEvent(
        event: SearchPageEvents,
        metadata?: Record<string, any>,
        eventType: string = CustomEventsTypes[event]!
    ): Promise<EventBuilder<CustomEventResponse>> {
        this.coveoAnalyticsClient.getParameters;
        const customData = {...this.provider.getBaseMetadata(), ...metadata};
        const request: CustomEventRequest = {
            ...(await this.getBaseEventRequest(customData)),
            eventType,
            eventValue: event,
        };
        const preparedEvent = await this.coveoAnalyticsClient.makeCustomEvent(request);
        return {
            description: this.makeEventDescription(preparedEvent, event),
            log: ({searchUID}) => preparedEvent.log({lastSearchQueryUid: searchUID}),
        };
    }

    public async logCustomEvent(
        event: SearchPageEvents,
        metadata?: Record<string, any>,
        eventType: string = CustomEventsTypes[event]!
    ) {
        return (await this.makeCustomEvent(event, metadata, eventType)).log({searchUID: this.provider.getSearchUID()});
    }

    public async makeCustomEventWithType(
        eventValue: string,
        eventType: string,
        metadata?: Record<string, any>
    ): Promise<EventBuilder<CustomEventResponse>> {
        const customData = {...this.provider.getBaseMetadata(), ...metadata};
        const payload: CustomEventRequest = {
            ...(await this.getBaseEventRequest(customData)),
            eventType,
            eventValue,
        };
        const preparedEvent = await this.coveoAnalyticsClient.makeCustomEvent(payload);
        return {
            description: this.makeEventDescription(preparedEvent, eventValue as SearchPageEvents),
            log: ({searchUID}) => preparedEvent.log({lastSearchQueryUid: searchUID}),
        };
    }

    public async logCustomEventWithType(eventValue: string, eventType: string, metadata?: Record<string, any>) {
        return (await this.makeCustomEventWithType(eventValue, eventType, metadata)).log({
            searchUID: this.provider.getSearchUID(),
        });
    }

    public async logSearchEvent(event: SearchPageEvents, metadata?: Record<string, any>) {
        return (await this.makeSearchEvent(event, metadata)).log({searchUID: this.provider.getSearchUID()});
    }

    public async makeSearchEvent(
        event: SearchPageEvents,
        metadata?: Record<string, any>
    ): Promise<EventBuilder<SearchEventResponse>> {
        const request = await this.getBaseSearchEventRequest(event, metadata);
        const preparedEvent = await this.coveoAnalyticsClient.makeSearchEvent(request);
        return {
            description: this.makeEventDescription(preparedEvent, event),
            log: ({searchUID}) => preparedEvent.log({searchQueryUid: searchUID}),
        };
    }

    public async makeClickEvent(
        event: SearchPageEvents,
        info: PartialDocumentInformation,
        identifier: DocumentIdentifier,
        metadata?: Record<string, any>
    ): Promise<EventBuilder<ClickEventResponse>> {
        const request: PreparedClickEventRequest = {
            ...info,
            ...(await this.getBaseEventRequest({...identifier, ...metadata})),
            queryPipeline: this.provider.getPipeline(),
            actionCause: event,
        };
        const preparedEvent = await this.coveoAnalyticsClient.makeClickEvent(request);
        return {
            description: this.makeEventDescription(preparedEvent, event),
            log: ({searchUID}) => preparedEvent.log({searchQueryUid: searchUID}),
        };
    }

    public async logClickEvent(
        event: SearchPageEvents,
        info: PartialDocumentInformation,
        identifier: DocumentIdentifier,
        metadata?: Record<string, any>
    ) {
        return (await this.makeClickEvent(event, info, identifier, metadata)).log({
            searchUID: this.provider.getSearchUID(),
        });
    }

    private async getBaseSearchEventRequest(
        event: SearchPageEvents,
        metadata?: Record<string, any>
    ): Promise<PreparedSearchEventRequest> {
        return {
            ...(await this.getBaseEventRequest({...metadata, ...this.provider.getGeneratedAnswerMetadata?.()})),
            ...this.provider.getSearchEventRequestPayload(),
            queryPipeline: this.provider.getPipeline(),
            actionCause: event,
        };
    }

    private async getBaseEventRequest(metadata?: Record<string, any>) {
        const customData = {...this.provider.getBaseMetadata(), ...metadata};
        return {
            ...this.getOrigins(),
            ...this.getSplitTestRun(),
            customData,
            language: this.provider.getLanguage(),
            facetState: this.provider.getFacetState ? this.provider.getFacetState() : [],
            anonymous: this.provider.getIsAnonymous(),
            clientId: await this.getClientId(),
        };
    }

    private getOrigins() {
        return {
            originContext: this.provider.getOriginContext?.(),
            originLevel1: this.provider.getOriginLevel1(),
            originLevel2: this.provider.getOriginLevel2(),
            originLevel3: this.provider.getOriginLevel3(),
        };
    }

    private getClientId() {
        return this.coveoAnalyticsClient instanceof CoveoAnalyticsClient
            ? this.coveoAnalyticsClient.getCurrentVisitorId()
            : undefined;
    }

    private getSplitTestRun() {
        const splitTestRunName = this.provider.getSplitTestRunName ? this.provider.getSplitTestRunName() : '';
        const splitTestRunVersion = this.provider.getSplitTestRunVersion ? this.provider.getSplitTestRunVersion() : '';
        return {
            ...(splitTestRunName && {splitTestRunName}),
            ...(splitTestRunVersion && {splitTestRunVersion}),
        };
    }

    public makeLikeGeneratedAnswer(metadata: GeneratedAnswerBaseMeta) {
        return this.makeCustomEvent(SearchPageEvents.likeGeneratedAnswer, metadata);
    }

    public async logLikeGeneratedAnswer(metadata: GeneratedAnswerBaseMeta) {
        return (await this.makeLikeGeneratedAnswer(metadata)).log({searchUID: this.provider.getSearchUID()});
    }

    public makeDislikeGeneratedAnswer(metadata: GeneratedAnswerBaseMeta) {
        return this.makeCustomEvent(SearchPageEvents.dislikeGeneratedAnswer, metadata);
    }

    public async logDislikeGeneratedAnswer(metadata: GeneratedAnswerBaseMeta) {
        return (await this.makeDislikeGeneratedAnswer(metadata)).log({searchUID: this.provider.getSearchUID()});
    }

    public makeOpenGeneratedAnswerSource(metadata: GeneratedAnswerCitationMeta) {
        return this.makeCustomEvent(SearchPageEvents.openGeneratedAnswerSource, metadata);
    }

    public async logOpenGeneratedAnswerSource(metadata: GeneratedAnswerCitationMeta) {
        return (await this.makeOpenGeneratedAnswerSource(metadata)).log({
            searchUID: this.provider.getSearchUID(),
        });
    }

    public makeGeneratedAnswerSourceHover(metadata: GeneratedAnswerSourceHoverMeta) {
        return this.makeCustomEvent(SearchPageEvents.generatedAnswerSourceHover, metadata);
    }

    public async logGeneratedAnswerSourceHover(metadata: GeneratedAnswerSourceHoverMeta) {
        return (await this.makeGeneratedAnswerSourceHover(metadata)).log({
            searchUID: this.provider.getSearchUID(),
        });
    }

    public makeGeneratedAnswerCopyToClipboard(metadata: GeneratedAnswerBaseMeta) {
        return this.makeCustomEvent(SearchPageEvents.generatedAnswerCopyToClipboard, metadata);
    }

    public async logGeneratedAnswerCopyToClipboard(metadata: GeneratedAnswerBaseMeta) {
        return (await this.makeGeneratedAnswerCopyToClipboard(metadata)).log({
            searchUID: this.provider.getSearchUID(),
        });
    }

    public makeGeneratedAnswerHideAnswers(metadata: GeneratedAnswerBaseMeta) {
        return this.makeCustomEvent(SearchPageEvents.generatedAnswerHideAnswers, metadata);
    }

    public async logGeneratedAnswerHideAnswers(metadata: GeneratedAnswerBaseMeta) {
        return (await this.makeGeneratedAnswerHideAnswers(metadata)).log({
            searchUID: this.provider.getSearchUID(),
        });
    }

    public makeGeneratedAnswerShowAnswers(metadata: GeneratedAnswerBaseMeta) {
        return this.makeCustomEvent(SearchPageEvents.generatedAnswerShowAnswers, metadata);
    }

    public async logGeneratedAnswerShowAnswers(metadata: GeneratedAnswerBaseMeta) {
        return (await this.makeGeneratedAnswerShowAnswers(metadata)).log({
            searchUID: this.provider.getSearchUID(),
        });
    }

    public makeGeneratedAnswerExpand(metadata: GeneratedAnswerBaseMeta) {
        return this.makeCustomEvent(SearchPageEvents.generatedAnswerExpand, metadata);
    }

    public async logGeneratedAnswerExpand(metadata: GeneratedAnswerBaseMeta) {
        return (await this.makeGeneratedAnswerExpand(metadata)).log({searchUID: this.provider.getSearchUID()});
    }

    public makeGeneratedAnswerCollapse(metadata: GeneratedAnswerBaseMeta) {
        return this.makeCustomEvent(SearchPageEvents.generatedAnswerCollapse, metadata);
    }

    public async logGeneratedAnswerCollapse(metadata: GeneratedAnswerBaseMeta) {
        return (await this.makeGeneratedAnswerCollapse(metadata)).log({searchUID: this.provider.getSearchUID()});
    }

    public makeGeneratedAnswerFeedbackSubmit(meta: GeneratedAnswerFeedbackMeta) {
        return this.makeCustomEvent(SearchPageEvents.generatedAnswerFeedbackSubmit, meta);
    }

    public async logGeneratedAnswerFeedbackSubmit(meta: GeneratedAnswerFeedbackMeta) {
        return (await this.makeGeneratedAnswerFeedbackSubmit(meta)).log({
            searchUID: this.provider.getSearchUID(),
        });
    }

    public makeGeneratedAnswerFeedbackSubmitV2(metadata: GeneratedAnswerBaseMeta) {
        return this.makeCustomEvent(SearchPageEvents.generatedAnswerFeedbackSubmitV2, metadata);
    }
    public async logGeneratedAnswerFeedbackSubmitV2(meta: GeneratedAnswerFeedbackMetaV2) {
        return (await this.makeGeneratedAnswerFeedbackSubmitV2(meta)).log({
            searchUID: this.provider.getSearchUID(),
        });
    }

    public makeRephraseGeneratedAnswer(meta: GeneratedAnswerRephraseMeta) {
        return this.makeSearchEvent(SearchPageEvents.rephraseGeneratedAnswer, meta);
    }

    public async logRephraseGeneratedAnswer(meta: GeneratedAnswerRephraseMeta) {
        return (await this.makeRephraseGeneratedAnswer(meta)).log({searchUID: this.provider.getSearchUID()});
    }

    public makeRetryGeneratedAnswer() {
        return this.makeSearchEvent(SearchPageEvents.retryGeneratedAnswer);
    }

    public async logRetryGeneratedAnswer() {
        return (await this.makeRetryGeneratedAnswer()).log({searchUID: this.provider.getSearchUID()});
    }

    public makeGeneratedAnswerStreamEnd(metadata: GeneratedAnswerStreamEndMeta) {
        return this.makeCustomEvent(SearchPageEvents.generatedAnswerStreamEnd, metadata);
    }

    public async logGeneratedAnswerStreamEnd(metadata: GeneratedAnswerStreamEndMeta) {
        return (await this.makeGeneratedAnswerStreamEnd(metadata)).log({searchUID: this.provider.getSearchUID()});
    }
}
