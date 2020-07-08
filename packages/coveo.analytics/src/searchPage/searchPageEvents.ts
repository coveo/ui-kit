import {DocumentInformation} from '../events';

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
    /**
     * Identifies the custom event that gets logged when the Results per page component is selected.
     */
    pagerResize = 'pagerResize',
    /**
     * Identifies the custom event that gets logged when a page number is selected and more items are loaded.
     */
    pagerNumber = 'pagerNumber',
    /**
     * Identifies the custom event that gets logged when the Next Page link is selected and more items are loaded.
     */
    pagerNext = 'pagerNext',
    /**
     * Identifies the custom event that gets logged when the Previous Page link is selected and more items are loaded.
     */
    pagerPrevious = 'pagerPrevious',
    /**
     * Identifies the custom event that gets logged when the user scrolls to the bottom of the item page and more results are loaded.
     */
    pagerScrolling = 'pagerScrolling',
    /**
     * Identifies the search event that gets logged when the Clear Facet button is selected.
     */
    facetClearAll = 'facetClearAll',
    /**
     * Identifies the custom event that gets logged when a query is being typed into the facet search box.
     */
    facetSearch = 'facetSearch',
    /**
     * Identifies the search event that gets logged when a facet check box is selected and the query is updated.
     */
    facetSelect = 'facetSelect',
    /**
     * Identifies the search event that gets logged when all filters on a facet are selected.
     */
    facetSelectAll = 'facetSelectAll',
    /**
     * Identifies the search event that gets logged when a facet check box is deselected and the query is updated.
     */
    facetDeselect = 'facetDeselect',
    /**
     * Identifies the search event that gets logged when a user clicks a facet value to filter out results containing the facet value.
     */
    facetExclude = 'facetExclude',
    /**
     * Identifies the search event that gets logged when a user clicks a facet value to not filter out results containing the facet value.
     */
    facetUnexclude = 'facetUnexclude',
    /**
     * Identifies the search event that gets logged when the sort criteria on a facet is updated.
     */
    facetUpdateSort = 'facetUpdateSort',
    /**
     * The custom event that gets logged when an end-user expands a facet to see additional values.
     */
    facetShowMore = 'showMoreFacetResults',
    /**
     * The custom event that gets logged when an end-user collapses a facet to see less values.
     */
    facetShowLess = 'showLessFacetResults',
    /**
     * Identifies the custom event that gets logged when a user query encounters an error during execution.
     */
    queryError = 'query',
    /**
     * Identifies the search and custom event that gets logged when a user clicks the Go Back link after an error page.
     */
    queryErrorBack = 'errorBack',
    /**
     * Identifies the search and custom event that gets logged when a user clears the query box after an error page.
     */
    queryErrorClear = 'errorClearQuery',
    /**
     * Identifies the search and custom event that gets logged when a user clicks the Retry link after an error page.
     */
    queryErrorRetry = 'errorRetry',
}

export const CustomEventsTypes: Partial<Record<SearchPageEvents, string>> = {
    [SearchPageEvents.triggerNotify]: 'queryPipelineTriggers',
    [SearchPageEvents.triggerExecute]: 'queryPipelineTriggers',
    [SearchPageEvents.triggerQuery]: 'queryPipelineTriggers',
    [SearchPageEvents.triggerRedirect]: 'queryPipelineTriggers',
    [SearchPageEvents.queryError]: 'errors',
    [SearchPageEvents.queryErrorBack]: 'errors',
    [SearchPageEvents.queryErrorClear]: 'errors',
    [SearchPageEvents.queryErrorRetry]: 'errors',
    [SearchPageEvents.pagerNext]: 'getMoreResults',
    [SearchPageEvents.pagerPrevious]: 'getMoreResults',
    [SearchPageEvents.pagerNumber]: 'getMoreResults',
    [SearchPageEvents.pagerResize]: 'getMoreResults',
    [SearchPageEvents.pagerScrolling]: 'getMoreResults',
    [SearchPageEvents.facetSearch]: 'facet',
    [SearchPageEvents.facetShowLess]: 'facet',
    [SearchPageEvents.facetShowMore]: 'facet',
};

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
    interfaceChangeTo: string;
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

export interface PagerResizeMetadata {
    currentResultsPerPage: number;
}

export interface PagerMetadata {
    pagerNumber: number;
}

export interface FacetBaseMeta {
    facetId: string;
    facetField: string;
    facetTitle: string;
}

export interface FacetMetadata extends FacetBaseMeta {
    facetValue: string;
}

export interface FacetRangeMetadata extends FacetBaseMeta {
    facetRangeStart: string;
    facetRangeEnd: string;
}

export interface FacetSortMeta extends FacetBaseMeta {
    criteria: string;
}

export interface QueryErrorMeta {
    query: string;
    aq: string;
    cq: string;
    dq: string;
    errorType: string;
    errorMessage: string;
}

export type PartialDocumentInformation = Omit<DocumentInformation, 'actionCause' | 'searchQueryUid'>;
