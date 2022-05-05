import CoveoAnalyticsClient, {ClientOptions, AnalyticsClient} from '../client/analytics';
import {SearchEventRequest, ClickEventRequest, CustomEventRequest} from '../events';
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
} from './searchPageEvents';
import {NoopAnalytics} from '../client/noopAnalytics';
import {formatOmniboxMetadata} from '../formatting/format-omnibox-metadata';

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
}

export interface SearchPageClientOptions extends ClientOptions {
    enableAnalytics: boolean;
}

export class CoveoSearchPageClient {
    public coveoAnalyticsClient: AnalyticsClient;

    constructor(private opts: Partial<SearchPageClientOptions>, private provider: SearchPageClientProvider) {
        this.coveoAnalyticsClient =
            opts.enableAnalytics === false ? new NoopAnalytics() : new CoveoAnalyticsClient(opts);
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

    public logInterfaceLoad() {
        return this.logSearchEvent(SearchPageEvents.interfaceLoad);
    }

    public logRecommendationInterfaceLoad() {
        return this.logSearchEvent(SearchPageEvents.recommendationInterfaceLoad);
    }

    public logRecommendation() {
        return this.logCustomEvent(SearchPageEvents.recommendation);
    }

    public logRecommendationOpen(info: PartialDocumentInformation, identifier: DocumentIdentifier) {
        return this.logClickEvent(SearchPageEvents.recommendationOpen, info, identifier);
    }

    public logStaticFilterClearAll(meta: StaticFilterMetadata) {
        return this.logSearchEvent(SearchPageEvents.staticFilterClearAll, meta);
    }

    public logStaticFilterSelect(meta: StaticFilterToggleValueMetadata) {
        return this.logSearchEvent(SearchPageEvents.staticFilterSelect, meta);
    }

    public logStaticFilterDeselect(meta: StaticFilterToggleValueMetadata) {
        return this.logSearchEvent(SearchPageEvents.staticFilterDeselect, meta);
    }

    public logFetchMoreResults() {
        return this.logCustomEvent(SearchPageEvents.pagerScrolling, {type: 'getMoreResults'});
    }

    public logInterfaceChange(metadata: InterfaceChangeMetadata) {
        return this.logSearchEvent(SearchPageEvents.interfaceChange, metadata);
    }

    public logDidYouMeanAutomatic() {
        return this.logSearchEvent(SearchPageEvents.didyoumeanAutomatic);
    }

    public logDidYouMeanClick() {
        return this.logSearchEvent(SearchPageEvents.didyoumeanClick);
    }

    public logResultsSort(metadata: ResultsSortMetadata) {
        return this.logSearchEvent(SearchPageEvents.resultsSort, metadata);
    }

    public logSearchboxSubmit() {
        return this.logSearchEvent(SearchPageEvents.searchboxSubmit);
    }

    public logSearchboxClear() {
        return this.logSearchEvent(SearchPageEvents.searchboxClear);
    }

    public logSearchboxAsYouType() {
        return this.logSearchEvent(SearchPageEvents.searchboxAsYouType);
    }

    public logBreadcrumbFacet(metadata: FacetMetadata | FacetRangeMetadata | CategoryFacetMetadata) {
        return this.logSearchEvent(SearchPageEvents.breadcrumbFacet, metadata);
    }

    public logBreadcrumbResetAll() {
        return this.logSearchEvent(SearchPageEvents.breadcrumbResetAll);
    }

    public logDocumentQuickview(info: PartialDocumentInformation, identifier: DocumentIdentifier) {
        return this.logClickEvent(SearchPageEvents.documentQuickview, info, identifier);
    }

    public logDocumentOpen(info: PartialDocumentInformation, identifier: DocumentIdentifier) {
        return this.logClickEvent(SearchPageEvents.documentOpen, info, identifier);
    }

    public logOmniboxAnalytics(meta: OmniboxSuggestionsMetadata) {
        return this.logSearchEvent(SearchPageEvents.omniboxAnalytics, formatOmniboxMetadata(meta));
    }

    public logOmniboxFromLink(meta: OmniboxSuggestionsMetadata) {
        return this.logSearchEvent(SearchPageEvents.omniboxFromLink, formatOmniboxMetadata(meta));
    }

    public logSearchFromLink() {
        return this.logSearchEvent(SearchPageEvents.searchFromLink);
    }

    public logTriggerNotify(meta: TriggerNotifyMetadata) {
        return this.logCustomEvent(SearchPageEvents.triggerNotify, meta);
    }

    public logTriggerExecute(meta: TriggerExecuteMetadata) {
        return this.logCustomEvent(SearchPageEvents.triggerExecute, meta);
    }

    public logTriggerQuery() {
        const meta = {query: this.provider.getSearchEventRequestPayload().queryText};
        return this.logCustomEvent(SearchPageEvents.triggerQuery, meta);
    }

    public logTriggerRedirect(meta: TriggerRedirectMetadata) {
        const allMeta = {...meta, query: this.provider.getSearchEventRequestPayload().queryText};
        return this.logCustomEvent(SearchPageEvents.triggerRedirect, allMeta);
    }

    public logPagerResize(meta: PagerResizeMetadata) {
        return this.logCustomEvent(SearchPageEvents.pagerResize, meta);
    }

    public logPagerNumber(meta: PagerMetadata) {
        return this.logCustomEvent(SearchPageEvents.pagerNumber, meta);
    }

    public logPagerNext(meta: PagerMetadata) {
        return this.logCustomEvent(SearchPageEvents.pagerNext, meta);
    }

    public logPagerPrevious(meta: PagerMetadata) {
        return this.logCustomEvent(SearchPageEvents.pagerPrevious, meta);
    }

    public logPagerScrolling() {
        return this.logCustomEvent(SearchPageEvents.pagerScrolling);
    }

    public logFacetClearAll(meta: FacetBaseMeta) {
        return this.logSearchEvent(SearchPageEvents.facetClearAll, meta);
    }

    public logFacetSearch(meta: FacetBaseMeta) {
        return this.logSearchEvent(SearchPageEvents.facetSearch, meta);
    }

    public logFacetSelect(meta: FacetMetadata) {
        return this.logSearchEvent(SearchPageEvents.facetSelect, meta);
    }

    public logFacetDeselect(meta: FacetMetadata) {
        return this.logSearchEvent(SearchPageEvents.facetDeselect, meta);
    }

    public logFacetExclude(meta: FacetMetadata) {
        return this.logSearchEvent(SearchPageEvents.facetExclude, meta);
    }

    public logFacetUnexclude(meta: FacetMetadata) {
        return this.logSearchEvent(SearchPageEvents.facetUnexclude, meta);
    }

    public logFacetSelectAll(meta: FacetBaseMeta) {
        return this.logSearchEvent(SearchPageEvents.facetSelectAll, meta);
    }

    public logFacetUpdateSort(meta: FacetSortMeta) {
        return this.logSearchEvent(SearchPageEvents.facetUpdateSort, meta);
    }

    public logFacetShowMore(meta: FacetBaseMeta) {
        return this.logCustomEvent(SearchPageEvents.facetShowMore, meta);
    }

    public logFacetShowLess(meta: FacetBaseMeta) {
        return this.logCustomEvent(SearchPageEvents.facetShowLess, meta);
    }

    public logQueryError(meta: QueryErrorMeta) {
        return this.logCustomEvent(SearchPageEvents.queryError, meta);
    }

    public async logQueryErrorBack() {
        await this.logCustomEvent(SearchPageEvents.queryErrorBack);
        return this.logSearchEvent(SearchPageEvents.queryErrorBack);
    }

    public async logQueryErrorRetry() {
        await this.logCustomEvent(SearchPageEvents.queryErrorRetry);
        return this.logSearchEvent(SearchPageEvents.queryErrorRetry);
    }

    public async logQueryErrorClear() {
        await this.logCustomEvent(SearchPageEvents.queryErrorClear);
        return this.logSearchEvent(SearchPageEvents.queryErrorClear);
    }

    public logLikeSmartSnippet() {
        return this.logCustomEvent(SearchPageEvents.likeSmartSnippet);
    }

    public logDislikeSmartSnippet() {
        return this.logCustomEvent(SearchPageEvents.dislikeSmartSnippet);
    }

    public logExpandSmartSnippet() {
        return this.logCustomEvent(SearchPageEvents.expandSmartSnippet);
    }

    public logCollapseSmartSnippet() {
        return this.logCustomEvent(SearchPageEvents.collapseSmartSnippet);
    }

    public logOpenSmartSnippetFeedbackModal() {
        return this.logCustomEvent(SearchPageEvents.openSmartSnippetFeedbackModal);
    }

    public logCloseSmartSnippetFeedbackModal() {
        return this.logCustomEvent(SearchPageEvents.closeSmartSnippetFeedbackModal);
    }

    public logSmartSnippetFeedbackReason(reason: SmartSnippetFeedbackReason, details?: string) {
        return this.logCustomEvent(SearchPageEvents.sendSmartSnippetReason, {reason, details});
    }

    public logExpandSmartSnippetSuggestion(snippet: SmartSnippetSuggestionMeta | SmartSnippetDocumentIdentifier) {
        return this.logCustomEvent(
            SearchPageEvents.expandSmartSnippetSuggestion,
            'documentId' in snippet ? snippet : {documentId: snippet}
        );
    }

    public logCollapseSmartSnippetSuggestion(snippet: SmartSnippetSuggestionMeta | SmartSnippetDocumentIdentifier) {
        return this.logCustomEvent(
            SearchPageEvents.collapseSmartSnippetSuggestion,
            'documentId' in snippet ? snippet : {documentId: snippet}
        );
    }

    public logShowMoreSmartSnippetSuggestion(snippet: SmartSnippetSuggestionMeta) {
        return this.logCustomEvent(SearchPageEvents.showMoreSmartSnippetSuggestion, snippet);
    }

    public logShowLessSmartSnippetSuggestion(snippet: SmartSnippetSuggestionMeta) {
        return this.logCustomEvent(SearchPageEvents.showLessSmartSnippetSuggestion, snippet);
    }

    public logOpenSmartSnippetSource(info: PartialDocumentInformation, identifier: DocumentIdentifier) {
        return this.logClickEvent(SearchPageEvents.openSmartSnippetSource, info, identifier);
    }

    public logRecentQueryClick() {
        return this.logSearchEvent(SearchPageEvents.recentQueryClick);
    }

    public logClearRecentQueries() {
        return this.logCustomEvent(SearchPageEvents.clearRecentQueries);
    }

    public logRecentResultClick(info: PartialDocumentInformation, identifier: DocumentIdentifier) {
        return this.logCustomEvent(SearchPageEvents.recentResultClick, {info, identifier});
    }

    public logClearRecentResults() {
        return this.logCustomEvent(SearchPageEvents.clearRecentResults);
    }

    public logNoResultsBack() {
        return this.logSearchEvent(SearchPageEvents.noResultsBack);
    }

    public logShowMoreFoldedResults(info: PartialDocumentInformation, identifier: DocumentIdentifier) {
        return this.logClickEvent(SearchPageEvents.showMoreFoldedResults, info, identifier);
    }

    public logShowLessFoldedResults() {
        return this.logCustomEvent(SearchPageEvents.showLessFoldedResults);
    }

    public async logCustomEvent(event: SearchPageEvents, metadata?: Record<string, any>) {
        const customData = {...this.provider.getBaseMetadata(), ...metadata};

        const payload: CustomEventRequest = {
            ...(await this.getBaseCustomEventRequest(customData)),
            eventType: CustomEventsTypes[event]!,
            eventValue: event,
        };

        return this.coveoAnalyticsClient.sendCustomEvent(payload);
    }

    public async logCustomEventWithType(eventValue: string, eventType: string, metadata?: Record<string, any>) {
        const customData = {...this.provider.getBaseMetadata(), ...metadata};

        const payload: CustomEventRequest = {
            ...(await this.getBaseCustomEventRequest(customData)),
            eventType,
            eventValue,
        };
        return this.coveoAnalyticsClient.sendCustomEvent(payload);
    }

    public async logSearchEvent(event: SearchPageEvents, metadata?: Record<string, any>) {
        return this.coveoAnalyticsClient.sendSearchEvent(await this.getBaseSearchEventRequest(event, metadata));
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
}
