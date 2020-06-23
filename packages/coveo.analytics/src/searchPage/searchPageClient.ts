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
} from './searchPageEvents';
import {NoopAnalytics} from '../client/noopAnalytics';

export interface SearchPageClientProvider {
    getBaseMetadata: () => Record<string, any>;
    getSearchEventRequestPayload: () => Omit<SearchEventRequest, 'actionCause' | 'searchQueryUid'>;
    getSearchUID: () => string;
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
        return this.logSearchEvent(SearchPageEvents.omniboxAnalytics, meta);
    }

    public logOmniboxFromLink(meta: OmniboxSuggestionsMetadata) {
        return this.logSearchEvent(SearchPageEvents.omniboxFromLink, meta);
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

    public logCustomEvent(event: SearchPageEvents, metadata?: Record<string, any>) {
        const customData = {...this.provider.getBaseMetadata(), ...metadata};

        const payload: CustomEventRequest = {
            eventType: CustomEventsTypes[event]!,
            eventValue: event,
            lastSearchQueryUid: this.provider.getSearchUID(),
            customData,
        };

        return this.coveoAnalyticsClient.sendCustomEvent(payload);
    }

    public logSearchEvent(event: SearchPageEvents, metadata?: Record<string, any>) {
        const customData = {...this.provider.getBaseMetadata(), ...metadata};

        const payload: SearchEventRequest = {
            ...this.provider.getSearchEventRequestPayload(),
            searchQueryUid: this.provider.getSearchUID(),
            customData,
            actionCause: event,
        };

        return this.coveoAnalyticsClient.sendSearchEvent(payload);
    }

    public logClickEvent(
        event: SearchPageEvents,
        info: PartialDocumentInformation,
        identifier: DocumentIdentifier,
        metadata?: Record<string, any>
    ) {
        const customData = {
            ...this.provider.getBaseMetadata(),
            ...identifier,
            ...metadata,
        };

        const payload: ClickEventRequest = {
            ...info,
            searchQueryUid: this.provider.getSearchUID(),
            actionCause: event,
            customData,
        };

        return this.coveoAnalyticsClient.sendClickEvent(payload);
    }
}
