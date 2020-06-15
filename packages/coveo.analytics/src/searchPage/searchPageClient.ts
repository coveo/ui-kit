import CoveoAnalyticsClient, { ClientOptions } from '../client/analytics';
import { SearchEventRequest, ClickEventRequest, CustomEventRequest } from '../events';
import { SearchPageEvents, OmniboxSuggestionsMetadata, FacetMetadata, FacetRangeMetadata, CategoryFacetMetadata, DocumentIdentifier, InterfaceChangeMetadata, ResultsSortMetadata, PartialDocumentInformation, CustomEventsTypes, TriggerNotifyMetadata, TriggerExecuteMetadata, TriggerRedirectMetadata } from './searchPageEvents';


export interface SearchPageClientProvider {
    getBaseMetadata: () => Record<string, any>;
    getSearchEventRequestPayload: () => Omit<SearchEventRequest, 'actionCause' | 'searchQueryUid'>
    getSearchUID: () => string;
}

export class CoveoSearchPageClient {
    public coveoAnalyticsClient: CoveoAnalyticsClient;

    constructor(private opts: Partial<ClientOptions>, private provider: SearchPageClientProvider) {
        this.coveoAnalyticsClient = new CoveoAnalyticsClient(opts)
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
        return this.logSearchEvent(SearchPageEvents.breadcrumbResetAll)
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
        return this.logCustomEvent(SearchPageEvents.triggerNotify, meta)
    }

    public logTriggerExecute(meta: TriggerExecuteMetadata) {
        return this.logCustomEvent(SearchPageEvents.triggerExecute, meta)
    }

    public logTriggerQuery() {
        const meta = { query: this.provider.getSearchEventRequestPayload().queryText }
        return this.logCustomEvent(SearchPageEvents.triggerQuery, meta)
    }

    public logTriggerRedirect(meta: TriggerRedirectMetadata) {
        const allMeta = { ...meta, query: this.provider.getSearchEventRequestPayload().queryText }
        return this.logCustomEvent(SearchPageEvents.triggerRedirect, allMeta)
    }

    public logCustomEvent(event: SearchPageEvents, metadata?: Record<string, any>) {
        const customData = { ...this.provider.getBaseMetadata(), ...metadata }

        const payload: CustomEventRequest = {
            eventType: CustomEventsTypes[event]!,
            eventValue: event,
            lastSearchQueryUid: this.provider.getSearchUID(),
            customData
        };

        return this.coveoAnalyticsClient.sendCustomEvent(payload)
    }

    public logSearchEvent(event: SearchPageEvents, metadata?: Record<string, any>) {
        const customData = { ...this.provider.getBaseMetadata(), ...metadata }

        const payload: SearchEventRequest = {
            ...this.provider.getSearchEventRequestPayload(),
            searchQueryUid: this.provider.getSearchUID(),
            customData,
            actionCause: event,
        }

        return this.coveoAnalyticsClient.sendSearchEvent(payload)
    }

    public logClickEvent(event: SearchPageEvents, info: PartialDocumentInformation, identifier: DocumentIdentifier, metadata?: Record<string, any>) {
        const customData = {
            ...this.provider.getBaseMetadata(),
            ...identifier,
            ...metadata
        }

        const payload: ClickEventRequest = {
            ...info,
            searchQueryUid: this.provider.getSearchUID(),
            actionCause: event,
            customData,
        };

        return this.coveoAnalyticsClient.sendClickEvent(payload);
    }
}
