import CoveoAnalyticsClient, { AnalyticsClient, ClientOptions } from "./analytics";
import { SearchEventRequest, EventBaseRequest, ClickEventRequest, CustomEventRequest, DocumentInformation } from "../events";
import { keysOf } from "./measurementProtocolMapper";

export enum SearchPageEvents {
    /**
     * Identifies the search event that gets logged when the initial query is performed as a result of loading a search interface.
     */
    interfaceLoad = 'interfaceLoad',
    /**
     * Identifies the search event that gets logged when a new tab is selected in the search interface.
     */
    interfaceChange = 'interfaceChange',
    /**
     * Identifies the search event that gets logged when `enableAutoCorrection: true` and the query is automatically corrected.
     */
    didyoumeanAutomatic = 'didyoumeanAutomatic',
    /**
     * Identifies the search event that gets logged when the query suggestion with the corrected term is selected and successfully updates the query.
     */
    didyoumeanClick = 'didyoumeanClick',
    /**
     * Identifies the search event that gets logged when a sorting method is selected.
     */
    resultsSort = 'resultsSort',
    /**
     * Identifies the search event that gets logged when a submit button is selected on a search box.
     */
    searchboxSubmit = 'searchboxSubmit',
    /**
     * Identifies the search event that gets logged when a clear button is selected on a search box.
     */
    searchboxClear = 'searchboxClear',
    /**
     * The search-as-you-type event that gets logged when a query is automatically generated, and results are displayed while a user is entering text in the search box before they voluntarily submit the query.
     */
    searchboxAsYouType = 'searchboxAsYouType',
    /**
     * The event that gets logged when a breadcrumb facet is selected and the query is updated.
     */
    breadcrumbFacet = 'breadcrumbFacet',
    /**
     * Identifies the search event that gets logged when the event to clear the current breadcrumbs is triggered.
     */
    breadcrumbResetAll = 'breadcrumbResetAll',
    /**
     * Identifies the click event that gets logged when the Quick View element is selected and a Quick View modal of the document is displayed.
     */
    documentQuickview = 'documentQuickview',
    /**
     * Identifies the click event that gets logged when a user clicks on a search result to open an item.
     */
    documentOpen = 'documentOpen',
    /**
     * Identifies the search event that gets logged when a user clicks a query suggestion based on the usage analytics recorded queries.
     */
    omniboxAnalytics = 'omniboxAnalytics',
    /**
     * Identifies the search event that gets logged when a suggested search query is selected from a standalone searchbox.
     */
    omniboxFromLink = 'omniboxFromLink',
}

interface SearchPageClientProvider {
    getBaseMetadata: () => Record<string, any>;
    getSearchEventRequestPayload: () => Omit<SearchEventRequest, 'actionCause'| 'searchQueryUid'>
    getSearchUID: () => string;
}

export interface FacetMetadata {
    facetId: string;
    facetField: string;
    facetValue: string;
    facetTitle: string;
}

export interface FacetRangeMetadata extends Omit<FacetMetadata, 'facetValue'> {
    facetRangeStart: string;
    facetRangeEnd: string;
    facetRangeEndInclusive: boolean;
}

export interface CategoryFacetMetadata {
    categoryFacetId: string;
    categoryFacetField: string;
    categoryFacetPath: string[];
    categoryFacetTitle: string;
}

export interface OmniboxSuggestionsMetadata {
    suggestionRanking: number;
    partialQueries: string;
    suggestions: string;
    partialQuery: string;
}

export interface DocumentIdentifier {
    contentIDKey: string;
    contentIDValue: string;
}

export class CoveoSearchPageClient {
    public coveoAnalyticsClient: CoveoAnalyticsClient;

    constructor(private opts: Partial<ClientOptions>, private provider: SearchPageClientProvider) {
        this.coveoAnalyticsClient = new CoveoAnalyticsClient(opts)
    }

    public logInterfaceLoad() {
        return this.logSearchEvent(SearchPageEvents.interfaceLoad);
    }

    public logInterfaceChange(metadata: { interfaceChangeTo: string }) {
        return this.logSearchEvent(SearchPageEvents.interfaceChange, metadata);
    }

    public logDidYouMeanAutomatic() {
        return this.logSearchEvent(SearchPageEvents.didyoumeanAutomatic);
    }

    public logDidYouMeanClick() {
        return this.logSearchEvent(SearchPageEvents.didyoumeanClick);
    }

    public logResultsSort(metadata: { resultsSortBy: string }) {
        return this.logSearchEvent(SearchPageEvents.resultsSort, metadata)
    }

    public logSearchboxSubmit() {
        return this.logSearchEvent(SearchPageEvents.searchboxSubmit);
    }

    public logSearchboxClear() {
        return this.logSearchEvent(SearchPageEvents.searchboxClear)
    }

    public logSearchboxAsYouType() {
        return this.logSearchEvent(SearchPageEvents.searchboxAsYouType)
    }

    public logBreadcrumbFacet<T extends FacetMetadata | FacetRangeMetadata | CategoryFacetMetadata>(metadata: T) {
        return this.logSearchEvent(SearchPageEvents.breadcrumbFacet, metadata)
    }

    public logBreadcrumbResetAll() {
        return this.logSearchEvent(SearchPageEvents.breadcrumbResetAll)
    }

    public logDocumentQuickview(info: DocumentInformation, identifier: DocumentIdentifier) {
        return this.logClickEvent(SearchPageEvents.documentQuickview, info, identifier)
    }

    public logDocumentOpen(info: DocumentInformation, identifier: DocumentIdentifier) {
        return this.logClickEvent(SearchPageEvents.documentOpen, info, identifier)
    }

    public logOmniboxAnalytics(meta: OmniboxSuggestionsMetadata) {
        return this.logSearchEvent(SearchPageEvents.omniboxAnalytics, meta)
    }

    public logOmniboxFromLink(meta: OmniboxSuggestionsMetadata) {
        return this.logSearchEvent(SearchPageEvents.omniboxFromLink, meta)
    }

    private logSearchEvent(eventType: SearchPageEvents, metadata?: Record<string, any>) {
        const meta = { ...this.provider.getBaseMetadata(), ...metadata }

        const payload: SearchEventRequest = {
            ...this.provider.getSearchEventRequestPayload(),
            searchQueryUid: this.provider.getSearchUID(),
            customData: meta,
            actionCause: eventType,
        }

        return this.coveoAnalyticsClient.sendSearchEvent(payload)
    }

    private logClickEvent(eventType: SearchPageEvents, info: DocumentInformation, identifier: DocumentIdentifier, metadata?: Record<string, any>) {
        const meta = {
            ...identifier,
            ...metadata
        }

        const payload: ClickEventRequest = {
            ...info,
            searchQueryUid: this.provider.getSearchUID(),
            actionCause: eventType,
            customData: meta,
        }

        return this.coveoAnalyticsClient.sendClickEvent(payload)
    }
}
