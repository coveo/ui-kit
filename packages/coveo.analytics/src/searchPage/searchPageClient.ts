import CoveoAnalyticsClient, {ClientOptions, AnalyticsClient} from '../client/analytics';
import {
    SearchEventRequest,
    ClickEventRequest,
    CustomEventRequest,
    SearchEventResponse,
    AnyEventResponse,
    ClickEventResponse,
    CustomEventResponse,
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
}

export interface SearchPageClientOptions extends ClientOptions {
    enableAnalytics: boolean;
}

export type EventDescription = Pick<SearchEventRequest, 'actionCause' | 'customData'>;

export interface EventBuilder<T extends AnyEventResponse = AnyEventResponse> {
    description: EventDescription;
    log: () => Promise<T | void>;
}

export class CoveoSearchPageClient {
    public coveoAnalyticsClient: AnalyticsClient;

    constructor(private opts: Partial<SearchPageClientOptions>, private provider: SearchPageClientProvider) {
        const shouldDisableAnalytics = opts.enableAnalytics === false || doNotTrack();
        this.coveoAnalyticsClient = shouldDisableAnalytics ? new NoopAnalytics() : new CoveoAnalyticsClient(opts);
    }

    public disable() {
        if (this.coveoAnalyticsClient instanceof CoveoAnalyticsClient) {
            this.coveoAnalyticsClient.clear();
        }

        this.coveoAnalyticsClient = new NoopAnalytics();
    }

    public enable() {
        this.coveoAnalyticsClient = new CoveoAnalyticsClient(this.opts);
    }

    public makeInterfaceLoad() {
        return this.makeSearchEvent(SearchPageEvents.interfaceLoad);
    }

    public logInterfaceLoad() {
        return this.makeInterfaceLoad().log();
    }

    public makeRecommendationInterfaceLoad() {
        return this.makeSearchEvent(SearchPageEvents.recommendationInterfaceLoad);
    }

    public logRecommendationInterfaceLoad() {
        return this.makeRecommendationInterfaceLoad().log();
    }

    public makeRecommendation() {
        return this.makeCustomEvent(SearchPageEvents.recommendation);
    }

    public logRecommendation() {
        return this.makeRecommendation().log();
    }

    public makeRecommendationOpen(info: PartialDocumentInformation, identifier: DocumentIdentifier) {
        return this.makeClickEvent(SearchPageEvents.recommendationOpen, info, identifier);
    }

    public logRecommendationOpen(info: PartialDocumentInformation, identifier: DocumentIdentifier) {
        return this.makeRecommendationOpen(info, identifier).log();
    }

    public makeStaticFilterClearAll(meta: StaticFilterMetadata) {
        return this.makeSearchEvent(SearchPageEvents.staticFilterClearAll, meta);
    }

    public logStaticFilterClearAll(meta: StaticFilterMetadata) {
        return this.makeStaticFilterClearAll(meta).log();
    }

    public makeStaticFilterSelect(meta: StaticFilterToggleValueMetadata) {
        return this.makeSearchEvent(SearchPageEvents.staticFilterSelect, meta);
    }

    public logStaticFilterSelect(meta: StaticFilterToggleValueMetadata) {
        return this.makeStaticFilterSelect(meta).log();
    }

    public makeStaticFilterDeselect(meta: StaticFilterToggleValueMetadata) {
        return this.makeSearchEvent(SearchPageEvents.staticFilterDeselect, meta);
    }

    public logStaticFilterDeselect(meta: StaticFilterToggleValueMetadata) {
        return this.makeStaticFilterDeselect(meta).log();
    }

    public makeFetchMoreResults() {
        return this.makeCustomEvent(SearchPageEvents.pagerScrolling, {type: 'getMoreResults'});
    }

    public logFetchMoreResults() {
        return this.makeFetchMoreResults().log();
    }

    public makeInterfaceChange(metadata: InterfaceChangeMetadata) {
        return this.makeSearchEvent(SearchPageEvents.interfaceChange, metadata);
    }

    public logInterfaceChange(metadata: InterfaceChangeMetadata) {
        return this.makeInterfaceChange(metadata).log();
    }

    public makeDidYouMeanAutomatic() {
        return this.makeSearchEvent(SearchPageEvents.didyoumeanAutomatic);
    }

    public logDidYouMeanAutomatic() {
        return this.makeDidYouMeanAutomatic().log();
    }

    public makeDidYouMeanClick() {
        return this.makeSearchEvent(SearchPageEvents.didyoumeanClick);
    }

    public logDidYouMeanClick() {
        return this.makeDidYouMeanClick().log();
    }

    public makeResultsSort(metadata: ResultsSortMetadata) {
        return this.makeSearchEvent(SearchPageEvents.resultsSort, metadata);
    }

    public logResultsSort(metadata: ResultsSortMetadata) {
        return this.makeResultsSort(metadata).log();
    }

    public makeSearchboxSubmit() {
        return this.makeSearchEvent(SearchPageEvents.searchboxSubmit);
    }

    public logSearchboxSubmit() {
        return this.makeSearchboxSubmit().log();
    }

    public makeSearchboxClear() {
        return this.makeSearchEvent(SearchPageEvents.searchboxClear);
    }

    public logSearchboxClear() {
        return this.makeSearchboxClear().log();
    }

    public makeSearchboxAsYouType() {
        return this.makeSearchEvent(SearchPageEvents.searchboxAsYouType);
    }

    public logSearchboxAsYouType() {
        return this.makeSearchboxAsYouType().log();
    }

    public makeBreadcrumbFacet(metadata: FacetMetadata | FacetRangeMetadata | CategoryFacetMetadata) {
        return this.makeSearchEvent(SearchPageEvents.breadcrumbFacet, metadata);
    }

    public logBreadcrumbFacet(metadata: FacetMetadata | FacetRangeMetadata | CategoryFacetMetadata) {
        return this.makeBreadcrumbFacet(metadata).log();
    }

    public makeBreadcrumbResetAll() {
        return this.makeSearchEvent(SearchPageEvents.breadcrumbResetAll);
    }

    public logBreadcrumbResetAll() {
        return this.makeBreadcrumbResetAll().log();
    }

    public makeDocumentQuickview(info: PartialDocumentInformation, identifier: DocumentIdentifier) {
        return this.makeClickEvent(SearchPageEvents.documentQuickview, info, identifier);
    }

    public logDocumentQuickview(info: PartialDocumentInformation, identifier: DocumentIdentifier) {
        return this.makeDocumentQuickview(info, identifier).log();
    }

    public makeDocumentOpen(info: PartialDocumentInformation, identifier: DocumentIdentifier) {
        return this.makeClickEvent(SearchPageEvents.documentOpen, info, identifier);
    }

    public logDocumentOpen(info: PartialDocumentInformation, identifier: DocumentIdentifier) {
        return this.makeDocumentOpen(info, identifier).log();
    }

    public makeOmniboxAnalytics(meta: OmniboxSuggestionsMetadata) {
        return this.makeSearchEvent(SearchPageEvents.omniboxAnalytics, formatOmniboxMetadata(meta));
    }

    public logOmniboxAnalytics(meta: OmniboxSuggestionsMetadata) {
        return this.makeOmniboxAnalytics(meta).log();
    }

    public makeOmniboxFromLink(meta: OmniboxSuggestionsMetadata) {
        return this.makeSearchEvent(SearchPageEvents.omniboxFromLink, formatOmniboxMetadata(meta));
    }

    public logOmniboxFromLink(meta: OmniboxSuggestionsMetadata) {
        return this.makeOmniboxFromLink(meta).log();
    }

    public makeSearchFromLink() {
        return this.makeSearchEvent(SearchPageEvents.searchFromLink);
    }

    public logSearchFromLink() {
        return this.makeSearchFromLink().log();
    }

    public makeTriggerNotify(meta: TriggerNotifyMetadata) {
        return this.makeCustomEvent(SearchPageEvents.triggerNotify, meta);
    }

    public logTriggerNotify(meta: TriggerNotifyMetadata) {
        return this.makeTriggerNotify(meta).log();
    }

    public makeTriggerExecute(meta: TriggerExecuteMetadata) {
        return this.makeCustomEvent(SearchPageEvents.triggerExecute, meta);
    }

    public logTriggerExecute(meta: TriggerExecuteMetadata) {
        return this.makeTriggerExecute(meta).log();
    }

    public makeTriggerQuery() {
        return this.makeCustomEvent(
            SearchPageEvents.triggerQuery,
            {query: this.provider.getSearchEventRequestPayload().queryText},
            'queryPipelineTriggers'
        );
    }

    public logTriggerQuery() {
        return this.makeTriggerQuery().log();
    }

    public makeUndoTriggerQuery(meta: UndoTriggerRedirectMetadata) {
        return this.makeSearchEvent(SearchPageEvents.undoTriggerQuery, meta);
    }

    public logUndoTriggerQuery(meta: UndoTriggerRedirectMetadata) {
        return this.makeUndoTriggerQuery(meta).log();
    }

    public makeTriggerRedirect(meta: TriggerRedirectMetadata) {
        return this.makeCustomEvent(SearchPageEvents.triggerRedirect, {
            ...meta,
            query: this.provider.getSearchEventRequestPayload().queryText,
        });
    }

    public logTriggerRedirect(meta: TriggerRedirectMetadata) {
        return this.makeTriggerRedirect(meta).log();
    }

    public makePagerResize(meta: PagerResizeMetadata) {
        return this.makeCustomEvent(SearchPageEvents.pagerResize, meta);
    }

    public logPagerResize(meta: PagerResizeMetadata) {
        return this.makePagerResize(meta).log();
    }

    public makePagerNumber(meta: PagerMetadata) {
        return this.makeCustomEvent(SearchPageEvents.pagerNumber, meta);
    }

    public logPagerNumber(meta: PagerMetadata) {
        return this.makePagerNumber(meta).log();
    }

    public makePagerNext(meta: PagerMetadata) {
        return this.makeCustomEvent(SearchPageEvents.pagerNext, meta);
    }

    public logPagerNext(meta: PagerMetadata) {
        return this.makePagerNext(meta).log();
    }

    public makePagerPrevious(meta: PagerMetadata) {
        return this.makeCustomEvent(SearchPageEvents.pagerPrevious, meta);
    }

    public logPagerPrevious(meta: PagerMetadata) {
        return this.makePagerPrevious(meta).log();
    }

    public makePagerScrolling() {
        return this.makeCustomEvent(SearchPageEvents.pagerScrolling);
    }

    public logPagerScrolling() {
        return this.makePagerScrolling().log();
    }

    public makeFacetClearAll(meta: FacetBaseMeta) {
        return this.makeSearchEvent(SearchPageEvents.facetClearAll, meta);
    }

    public logFacetClearAll(meta: FacetBaseMeta) {
        return this.makeFacetClearAll(meta).log();
    }

    public makeFacetSearch(meta: FacetBaseMeta) {
        return this.makeSearchEvent(SearchPageEvents.facetSearch, meta);
    }

    public logFacetSearch(meta: FacetBaseMeta) {
        return this.makeFacetSearch(meta).log();
    }

    public makeFacetSelect(meta: FacetMetadata) {
        return this.makeSearchEvent(SearchPageEvents.facetSelect, meta);
    }

    public logFacetSelect(meta: FacetMetadata) {
        return this.makeFacetSelect(meta).log();
    }

    public makeFacetDeselect(meta: FacetMetadata) {
        return this.makeSearchEvent(SearchPageEvents.facetDeselect, meta);
    }

    public logFacetDeselect(meta: FacetMetadata) {
        return this.makeFacetDeselect(meta).log();
    }

    public makeFacetExclude(meta: FacetMetadata) {
        return this.makeSearchEvent(SearchPageEvents.facetExclude, meta);
    }

    public logFacetExclude(meta: FacetMetadata) {
        return this.makeFacetExclude(meta).log();
    }

    public makeFacetUnexclude(meta: FacetMetadata) {
        return this.makeSearchEvent(SearchPageEvents.facetUnexclude, meta);
    }

    public logFacetUnexclude(meta: FacetMetadata) {
        return this.makeFacetUnexclude(meta).log();
    }

    public makeFacetSelectAll(meta: FacetBaseMeta) {
        return this.makeSearchEvent(SearchPageEvents.facetSelectAll, meta);
    }

    public logFacetSelectAll(meta: FacetBaseMeta) {
        return this.makeFacetSelectAll(meta).log();
    }

    public makeFacetUpdateSort(meta: FacetSortMeta) {
        return this.makeSearchEvent(SearchPageEvents.facetUpdateSort, meta);
    }

    public logFacetUpdateSort(meta: FacetSortMeta) {
        return this.makeFacetUpdateSort(meta).log();
    }

    public makeFacetShowMore(meta: FacetBaseMeta) {
        return this.makeCustomEvent(SearchPageEvents.facetShowMore, meta);
    }

    public logFacetShowMore(meta: FacetBaseMeta) {
        return this.makeFacetShowMore(meta).log();
    }

    public makeFacetShowLess(meta: FacetBaseMeta) {
        return this.makeCustomEvent(SearchPageEvents.facetShowLess, meta);
    }

    public logFacetShowLess(meta: FacetBaseMeta) {
        return this.makeFacetShowLess(meta).log();
    }

    public makeQueryError(meta: QueryErrorMeta) {
        return this.makeCustomEvent(SearchPageEvents.queryError, meta);
    }

    public logQueryError(meta: QueryErrorMeta) {
        return this.makeQueryError(meta).log();
    }

    public makeQueryErrorBack(): EventBuilder<SearchEventResponse> {
        return {
            description: this.makeDescription(SearchPageEvents.queryErrorBack),
            log: async () => {
                await this.logCustomEvent(SearchPageEvents.queryErrorBack);
                return this.logSearchEvent(SearchPageEvents.queryErrorBack);
            },
        };
    }

    public logQueryErrorBack() {
        return this.makeQueryErrorBack().log();
    }

    public makeQueryErrorRetry(): EventBuilder<SearchEventResponse> {
        return {
            description: this.makeDescription(SearchPageEvents.queryErrorRetry),
            log: async () => {
                await this.logCustomEvent(SearchPageEvents.queryErrorRetry);
                return this.logSearchEvent(SearchPageEvents.queryErrorRetry);
            },
        };
    }

    public logQueryErrorRetry() {
        return this.makeQueryErrorRetry().log();
    }

    public makeQueryErrorClear(): EventBuilder<SearchEventResponse> {
        return {
            description: this.makeDescription(SearchPageEvents.queryErrorClear),
            log: async () => {
                await this.logCustomEvent(SearchPageEvents.queryErrorClear);
                return this.logSearchEvent(SearchPageEvents.queryErrorClear);
            },
        };
    }

    public logQueryErrorClear() {
        return this.makeQueryErrorClear().log();
    }

    public makeLikeSmartSnippet() {
        return this.makeCustomEvent(SearchPageEvents.likeSmartSnippet);
    }

    public logLikeSmartSnippet() {
        return this.makeLikeSmartSnippet().log();
    }

    public makeDislikeSmartSnippet() {
        return this.makeCustomEvent(SearchPageEvents.dislikeSmartSnippet);
    }

    public logDislikeSmartSnippet() {
        return this.makeDislikeSmartSnippet().log();
    }

    public makeExpandSmartSnippet() {
        return this.makeCustomEvent(SearchPageEvents.expandSmartSnippet);
    }

    public logExpandSmartSnippet() {
        return this.makeExpandSmartSnippet().log();
    }

    public makeCollapseSmartSnippet() {
        return this.makeCustomEvent(SearchPageEvents.collapseSmartSnippet);
    }

    public logCollapseSmartSnippet() {
        return this.makeCollapseSmartSnippet().log();
    }

    public makeOpenSmartSnippetFeedbackModal() {
        return this.makeCustomEvent(SearchPageEvents.openSmartSnippetFeedbackModal);
    }

    public logOpenSmartSnippetFeedbackModal() {
        return this.makeOpenSmartSnippetFeedbackModal().log();
    }

    public makeCloseSmartSnippetFeedbackModal() {
        return this.makeCustomEvent(SearchPageEvents.closeSmartSnippetFeedbackModal);
    }

    public logCloseSmartSnippetFeedbackModal() {
        return this.makeCloseSmartSnippetFeedbackModal().log();
    }

    public makeSmartSnippetFeedbackReason(reason: SmartSnippetFeedbackReason, details?: string) {
        return this.makeCustomEvent(SearchPageEvents.sendSmartSnippetReason, {reason, details});
    }

    public logSmartSnippetFeedbackReason(reason: SmartSnippetFeedbackReason, details?: string) {
        return this.makeSmartSnippetFeedbackReason(reason, details).log();
    }

    public makeExpandSmartSnippetSuggestion(snippet: SmartSnippetSuggestionMeta | SmartSnippetDocumentIdentifier) {
        return this.makeCustomEvent(
            SearchPageEvents.expandSmartSnippetSuggestion,
            'documentId' in snippet ? snippet : {documentId: snippet}
        );
    }

    public logExpandSmartSnippetSuggestion(snippet: SmartSnippetSuggestionMeta | SmartSnippetDocumentIdentifier) {
        return this.makeExpandSmartSnippetSuggestion(snippet).log();
    }

    public makeCollapseSmartSnippetSuggestion(snippet: SmartSnippetSuggestionMeta | SmartSnippetDocumentIdentifier) {
        return this.makeCustomEvent(
            SearchPageEvents.collapseSmartSnippetSuggestion,
            'documentId' in snippet ? snippet : {documentId: snippet}
        );
    }

    public logCollapseSmartSnippetSuggestion(snippet: SmartSnippetSuggestionMeta | SmartSnippetDocumentIdentifier) {
        return this.makeCollapseSmartSnippetSuggestion(snippet).log();
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
    public logShowMoreSmartSnippetSuggestion(snippet: SmartSnippetSuggestionMeta) {
        return this.makeShowMoreSmartSnippetSuggestion(snippet).log();
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
    public logShowLessSmartSnippetSuggestion(snippet: SmartSnippetSuggestionMeta) {
        return this.makeShowLessSmartSnippetSuggestion(snippet).log();
    }

    public makeOpenSmartSnippetSource(info: PartialDocumentInformation, identifier: DocumentIdentifier) {
        return this.makeClickEvent(SearchPageEvents.openSmartSnippetSource, info, identifier);
    }

    public logOpenSmartSnippetSource(info: PartialDocumentInformation, identifier: DocumentIdentifier) {
        return this.makeOpenSmartSnippetSource(info, identifier).log();
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

    public logCopyToClipboard(info: PartialDocumentInformation, identifier: DocumentIdentifier) {
        return this.makeCopyToClipboard(info, identifier).log();
    }

    public logOpenSmartSnippetSuggestionSource(info: PartialDocumentInformation, snippet: SmartSnippetSuggestionMeta) {
        return this.makeOpenSmartSnippetSuggestionSource(info, snippet).log();
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

    public logOpenSmartSnippetInlineLink(
        info: PartialDocumentInformation,
        identifierAndLink: DocumentIdentifier & SmartSnippetLinkMeta
    ) {
        return this.makeOpenSmartSnippetInlineLink(info, identifierAndLink).log();
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

    public logOpenSmartSnippetSuggestionInlineLink(
        info: PartialDocumentInformation,
        snippetAndLink: SmartSnippetSuggestionMeta & SmartSnippetLinkMeta
    ) {
        return this.makeOpenSmartSnippetSuggestionInlineLink(info, snippetAndLink).log();
    }

    public makeRecentQueryClick() {
        return this.makeSearchEvent(SearchPageEvents.recentQueryClick);
    }

    public logRecentQueryClick() {
        return this.makeRecentQueryClick().log();
    }

    public makeClearRecentQueries() {
        return this.makeCustomEvent(SearchPageEvents.clearRecentQueries);
    }

    public logClearRecentQueries() {
        return this.makeClearRecentQueries().log();
    }

    public makeRecentResultClick(info: PartialDocumentInformation, identifier: DocumentIdentifier) {
        return this.makeCustomEvent(SearchPageEvents.recentResultClick, {info, identifier});
    }

    public logRecentResultClick(info: PartialDocumentInformation, identifier: DocumentIdentifier) {
        return this.makeRecentResultClick(info, identifier).log();
    }

    public makeClearRecentResults() {
        return this.makeCustomEvent(SearchPageEvents.clearRecentResults);
    }

    public logClearRecentResults() {
        return this.makeClearRecentResults().log();
    }

    public makeNoResultsBack() {
        return this.makeSearchEvent(SearchPageEvents.noResultsBack);
    }

    public logNoResultsBack() {
        return this.makeNoResultsBack().log();
    }

    public makeShowMoreFoldedResults(info: PartialDocumentInformation, identifier: DocumentIdentifier) {
        return this.makeClickEvent(SearchPageEvents.showMoreFoldedResults, info, identifier);
    }

    public logShowMoreFoldedResults(info: PartialDocumentInformation, identifier: DocumentIdentifier) {
        return this.makeShowMoreFoldedResults(info, identifier).log();
    }

    public makeShowLessFoldedResults() {
        return this.makeCustomEvent(SearchPageEvents.showLessFoldedResults);
    }

    public logShowLessFoldedResults() {
        return this.makeShowLessFoldedResults().log();
    }

    public makeCustomEvent(
        event: SearchPageEvents,
        metadata?: Record<string, any>,
        eventType: string = CustomEventsTypes[event]!
    ): EventBuilder<CustomEventResponse> {
        const customData = {...this.provider.getBaseMetadata(), ...metadata};
        return {
            description: this.makeDescription(event, metadata),
            log: async () => {
                const payload: CustomEventRequest = {
                    ...(await this.getBaseCustomEventRequest(customData)),
                    eventType,
                    eventValue: event,
                };

                return this.coveoAnalyticsClient.sendCustomEvent(payload);
            },
        };
    }

    public logCustomEvent(
        event: SearchPageEvents,
        metadata?: Record<string, any>,
        eventType: string = CustomEventsTypes[event]!
    ) {
        return this.makeCustomEvent(event, metadata, eventType).log();
    }

    public makeCustomEventWithType(eventValue: string, eventType: string, metadata?: Record<string, any>) {
        const customData = {...this.provider.getBaseMetadata(), ...metadata};
        return {
            description: <EventDescription>{actionCause: eventValue, customData},
            log: async () => {
                const payload: CustomEventRequest = {
                    ...(await this.getBaseCustomEventRequest(customData)),
                    eventType,
                    eventValue,
                };
                return this.coveoAnalyticsClient.sendCustomEvent(payload);
            },
        };
    }

    public logCustomEventWithType(eventValue: string, eventType: string, metadata?: Record<string, any>) {
        return this.makeCustomEventWithType(eventValue, eventType, metadata).log();
    }

    public async logSearchEvent(event: SearchPageEvents, metadata?: Record<string, any>) {
        return this.coveoAnalyticsClient.sendSearchEvent(await this.getBaseSearchEventRequest(event, metadata));
    }

    private makeDescription(actionCause: SearchPageEvents, metadata?: Record<string, any>): EventDescription {
        return {actionCause, customData: {...this.provider.getBaseMetadata(), ...metadata}};
    }

    public makeSearchEvent(event: SearchPageEvents, metadata?: Record<string, any>): EventBuilder<SearchEventResponse> {
        return {
            description: this.makeDescription(event, metadata),
            log: () => this.logSearchEvent(event, metadata),
        };
    }

    public async logClickEvent(
        event: SearchPageEvents,
        info: PartialDocumentInformation,
        identifier: DocumentIdentifier,
        metadata?: Record<string, any>
    ) {
        const payload: ClickEventRequest = {
            ...info,
            ...(await this.getBaseEventRequest({...identifier, ...metadata})),
            searchQueryUid: this.provider.getSearchUID(),
            queryPipeline: this.provider.getPipeline(),
            actionCause: event,
        };

        return this.coveoAnalyticsClient.sendClickEvent(payload);
    }

    public makeClickEvent(
        event: SearchPageEvents,
        info: PartialDocumentInformation,
        identifier: DocumentIdentifier,
        metadata?: Record<string, any>
    ): EventBuilder<ClickEventResponse> {
        return {
            description: this.makeDescription(event, {...identifier, ...metadata}),
            log: () => this.logClickEvent(event, info, identifier, metadata),
        };
    }

    private async getBaseSearchEventRequest(
        event: SearchPageEvents,
        metadata?: Record<string, any>
    ): Promise<SearchEventRequest> {
        return {
            ...(await this.getBaseEventRequest(metadata)),
            ...this.provider.getSearchEventRequestPayload(),
            searchQueryUid: this.provider.getSearchUID(),
            queryPipeline: this.provider.getPipeline(),
            actionCause: event,
        };
    }

    private async getBaseCustomEventRequest(metadata?: Record<string, any>) {
        return {
            ...(await this.getBaseEventRequest(metadata)),
            lastSearchQueryUid: this.provider.getSearchUID(),
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
}
