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
} from './searchPageEvents';
import {NoopAnalytics} from '../client/noopAnalytics';
import {formatOmniboxMetadata} from '../formatting/format-omnibox-metadata';

export interface SearchPageClientProvider {
    getBaseMetadata: () => Record<string, any>;
    getSearchEventRequestPayload: () => Omit<SearchEventRequest, 'actionCause' | 'searchQueryUid'>;
    getSearchUID: () => string;
    getPipeline: () => string;
    getOriginLevel1: () => string;
    getOriginLevel2: () => string;
    getOriginLevel3: () => string;
    getLanguage: () => string;
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

    public logBreadcrumbFacet(
        metadata: FacetMetadata | FacetRangeMetadata | CategoryFacetMetadata,
        facetState: FacetStateMetadata[]
    ) {
        return this.logFacetSearchEvent(SearchPageEvents.breadcrumbFacet, metadata, facetState);
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

    public logFacetClearAll(meta: FacetBaseMeta, facetState: FacetStateMetadata[]) {
        return this.logFacetSearchEvent(SearchPageEvents.facetClearAll, meta, facetState);
    }

    public logFacetSearch(meta: FacetBaseMeta, facetState: FacetStateMetadata[]) {
        return this.logFacetSearchEvent(SearchPageEvents.facetSearch, meta, facetState);
    }

    public logFacetSelect(meta: FacetMetadata, facetState: FacetStateMetadata[]) {
        return this.logFacetSearchEvent(SearchPageEvents.facetSelect, meta, facetState);
    }

    public logFacetDeselect(meta: FacetMetadata, facetState: FacetStateMetadata[]) {
        return this.logFacetSearchEvent(SearchPageEvents.facetDeselect, meta, facetState);
    }

    public logFacetExclude(meta: FacetMetadata, facetState: FacetStateMetadata[]) {
        return this.logFacetSearchEvent(SearchPageEvents.facetExclude, meta, facetState);
    }

    public logFacetUnexclude(meta: FacetMetadata, facetState: FacetStateMetadata[]) {
        return this.logFacetSearchEvent(SearchPageEvents.facetUnexclude, meta, facetState);
    }

    public logFacetSelectAll(meta: FacetBaseMeta, facetState: FacetStateMetadata[]) {
        return this.logFacetSearchEvent(SearchPageEvents.facetSelectAll, meta, facetState);
    }

    public logFacetUpdateSort(meta: FacetSortMeta, facetState: FacetStateMetadata[]) {
        return this.logFacetSearchEvent(SearchPageEvents.facetUpdateSort, meta, facetState);
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

    public logCustomEvent(event: SearchPageEvents, metadata?: Record<string, any>) {
        const customData = {...this.provider.getBaseMetadata(), ...metadata};

        const payload: CustomEventRequest = {
            ...this.getBaseCustomEventRequest(customData),
            eventType: CustomEventsTypes[event]!,
            eventValue: event,
        };

        return this.coveoAnalyticsClient.sendCustomEvent(payload);
    }

    public logCustomEventWithType(eventValue: string, eventType: string, metadata?: Record<string, any>) {
        const customData = {...this.provider.getBaseMetadata(), ...metadata};

        const payload: CustomEventRequest = {
            ...this.getBaseCustomEventRequest(customData),
            eventType,
            eventValue,
        };
        return this.coveoAnalyticsClient.sendCustomEvent(payload);
    }

    public logSearchEvent(event: SearchPageEvents, metadata?: Record<string, any>) {
        return this.coveoAnalyticsClient.sendSearchEvent(this.getBaseSearchEventRequest(event, metadata));
    }

    public logClickEvent(
        event: SearchPageEvents,
        info: PartialDocumentInformation,
        identifier: DocumentIdentifier,
        metadata?: Record<string, any>
    ) {
        const payload: ClickEventRequest = {
            ...info,
            ...this.getBaseEventRequest({...identifier, ...metadata}),
            searchQueryUid: this.provider.getSearchUID(),
            queryPipeline: this.provider.getPipeline(),
            actionCause: event,
        };

        return this.coveoAnalyticsClient.sendClickEvent(payload);
    }

    public logFacetSearchEvent(
        event: SearchPageEvents,
        metadata: Record<string, any>,
        facetState: FacetStateMetadata[]
    ) {
        const payload = {
            ...this.getBaseSearchEventRequest(event, metadata),
            facetState,
        };

        return this.coveoAnalyticsClient.sendSearchEvent(payload);
    }

    private getBaseSearchEventRequest(event: SearchPageEvents, metadata?: Record<string, any>): SearchEventRequest {
        return {
            ...this.getBaseEventRequest(metadata),
            ...this.provider.getSearchEventRequestPayload(),
            searchQueryUid: this.provider.getSearchUID(),
            queryPipeline: this.provider.getPipeline(),
            actionCause: event,
        };
    }

    private getBaseCustomEventRequest(metadata?: Record<string, any>) {
        return {
            ...this.getBaseEventRequest(metadata),
            lastSearchQueryUid: this.provider.getSearchUID(),
        };
    }

    private getBaseEventRequest(metadata?: Record<string, any>) {
        const customData = {...this.provider.getBaseMetadata(), ...metadata};
        return {
            ...this.getOrigins(),
            customData,
            language: this.provider.getLanguage(),
        };
    }

    private getOrigins() {
        return {
            originLevel1: this.provider.getOriginLevel1(),
            originLevel2: this.provider.getOriginLevel2(),
            originLevel3: this.provider.getOriginLevel3(),
        };
    }
}
