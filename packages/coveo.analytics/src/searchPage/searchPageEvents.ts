import { DocumentInformation } from "../events";

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
    /**
     * Identifies the custom event that gets logged when a user action triggers a notification set in the effective query pipeline on the search page.
     */
    triggerNotify = 'notify',
    /**
     * Identifies the custom event that gets logged when a user action executes a JavaScript function set in the effective query pipeline on the search page.
     */
    triggerExecute = 'execute',
    /**
     * Identifies the custom event that gets logged when a user action triggers a new query set in the effective query pipeline on the search page.
     */
    triggerQuery = 'query',
    /**
     * Identifies the custom event that gets logged when a user action redirects them to a URL set in the effective query pipeline on the search page.
     */
    triggerRedirect = 'redirect',
}

export const CustomEventsTypes: Partial<Record<SearchPageEvents, string>> = {
    [SearchPageEvents.triggerNotify]: 'queryPipelineTriggers',
    [SearchPageEvents.triggerExecute]: 'queryPipelineTriggers',
    [SearchPageEvents.triggerQuery]: 'queryPipelineTriggers',
    [SearchPageEvents.triggerRedirect]: 'queryPipelineTriggers'
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

export interface InterfaceChangeMetadata {
    interfaceChangeTo: string
}

export interface ResultsSortMetadata {
    resultsSortBy: string;
}

export interface TriggerNotifyMetadata {
    notification: string;
}

export interface TriggerExecuteMetadata {
    executed: string;
}

export interface TriggerRedirectMetadata {
    redirectedTo: string;
}

export type PartialDocumentInformation = Omit<DocumentInformation, 'actionCause' | 'searchQueryUid'>
