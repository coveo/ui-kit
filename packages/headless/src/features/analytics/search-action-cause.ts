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
  didYouMeanAutomatic = 'didYouMeanAutomatic',
  /**
   * Identifies the search event that gets logged when the query suggestion with the corrected term is selected and successfully updates the query.
   */
  didYouMeanClick = 'didYouMeanClick',
  /**
   * Identifies the search event that gets logged when a sorting method is selected.
   */
  resultsSort = 'resultsSort',
  /**
   * Identifies the search event that gets logged when a submit button is selected on a search box.
   */
  searchboxSubmit = 'searchboxSubmit',
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
   * Identifies the click event that gets logged when a user clicks a search result to open an item.
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
   * Identifies the search event that gets logged when the search page loads with a query, such as when a user clicks a link pointing to a search results page with a query or enters a query in a standalone search box that points to a search page.
   */
  searchFromLink = 'searchFromLink',
  /**
   * Identifies the custom event that gets logged when a user action triggers a new query set in the effective query pipeline on the search page.
   */
  triggerQuery = 'query',
  /**
   * Identifies the search cause that gets logged for pagination and other user navigation that do not express a new search intent.
   */
  browseResults = 'browseResults',
  /**
   * Identifies the search event that gets logged when a static filter check box is deselected and the query is updated.
   */
  staticFilterDeselect = 'staticFilterDeselect',
  /**
   * Identifies the search event that gets logged when the Clear Facet button is selected.
   */
  facetClearAll = 'facetClearAll',
  /**
   * Identifies the search event that gets logged when a facet check box is selected and the query is updated.
   */
  facetSelect = 'facetSelect',
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
   * Identifies the search event that gets logged when the document suggestions are fetched.
   */
  documentSuggestion = 'documentSuggestion',
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
  //eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
  queryError = 'query',
  /**
   * Identifies the search event that gets logged when a user action (that is not a query) reloads the Recommendations panel with new recommendations.
   */
  recommendationInterfaceLoad = 'recommendationInterfaceLoad',
  /**
   * Identifies the custom event that gets logged when a user identifies a smart snippet answer as relevant.
   */
  likeSmartSnippet = 'likeSmartSnippet',
  /**
   * Identifies the custom event that gets logged when a user identifies a smart snippet answer as irrelevant.
   */
  dislikeSmartSnippet = 'dislikeSmartSnippet',
  /**
   * Identifies the custom event that gets logged when a user expand a smart snippet answer.
   */
  expandSmartSnippet = 'expandSmartSnippet',
  /**
   * Identifies the custom event that gets logged when a user collapse a smart snippet answer.
   */
  collapseSmartSnippet = 'collapseSmartSnippet',
  /**
   * Identifies the custom event that gets logged when a user open a smart snippet explanation modal for feedback.
   */
  openSmartSnippetFeedbackModal = 'openSmartSnippetFeedbackModal',
  /**
   * Identifies the custom event that gets logged when a user close a smart snippet explanation modal for feedback.
   */
  closeSmartSnippetFeedbackModal = 'closeSmartSnippetFeedbackModal',
  /**
   * Identifies the custom event that gets logged when a user sends an explanation for a smart snippet irrelevant answer.
   */
  sendSmartSnippetReason = 'sendSmartSnippetReason',
  /**
   * Identifies the custom event that gets logged when a snippet suggestion for a related question is expanded.
   */
  expandSmartSnippetSuggestion = 'expandSmartSnippetSuggestion',
  /**
   * Identifies the custom event that gets logged when a snippet suggestion for a related question is collapsed.
   */
  collapseSmartSnippetSuggestion = 'collapseSmartSnippetSuggestion',
  /**
   * Identifies the custom event that gets logged when a user clicks the source of an answer in a smart snippet.
   */
  openSmartSnippetSource = 'openSmartSnippetSource',
  /**
   * Identifies the custom event that gets logged when a user clicks the source of a snippet suggestion for a related question.
   */
  openSmartSnippetSuggestionSource = 'openSmartSnippetSuggestionSource',
  /**
   * Identifies the click event that gets logged when a user clicks the Show More link under a search result that support the folding component.
   */
  showMoreFoldedResults = 'showMoreFoldedResults',
  /**
   * Identifies the custom event that gets logged when a user clicks the Show Less link under a search result that support the folding component.
   */
  showLessFoldedResults = 'showLessFoldedResults',
  /**
   * Identifies the click event that gets logged when a user clicks the Copy To Clipboard result action.
   */
  copyToClipboard = 'copyToClipboard',
  /**
   * Identifies the click event that gets logged when a user clicks the Send As Email result action.
   */
  caseSendEmail = 'Case.SendEmail',
  /**
   * Identifies the click event that gets logged when a user clicks the Post To Feed result action.
   */
  feedItemTextPost = 'FeedItem.TextPost',
  /**
   * Identifies the click event that gets logged when a user clicks the Attach To Case result action.
   */
  caseAttach = 'caseAttach',
  /**
   * Identifies the custom event that gets logged when a user clicks the Detach From Case result action.
   */
  caseDetach = 'caseDetach',
  /**
   * Identifies the cause of a search request being retried in order to regenerate an answer stream that failed.
   */
  retryGeneratedAnswer = 'retryGeneratedAnswer',
  /**
   * Identifies the custom event that gets logged when a user identifies a generated answer as relevant.
   */
  likeGeneratedAnswer = 'likeGeneratedAnswer',
  /**
   * Identifies the custom event that gets logged when a user identifies a generated answer as irrelevant.
   */
  dislikeGeneratedAnswer = 'dislikeGeneratedAnswer',
  /**
   * Identifies the custom event that gets logged when a user opens a generated answer citation.
   */
  openGeneratedAnswerSource = 'openGeneratedAnswerSource',
  /**
   * Identified the custom event that gets logged when a generated answer stream is completed.
   */
  generatedAnswerStreamEnd = 'generatedAnswerStreamEnd',
  /**
   * Identifies the search event that gets logged when the query context is updated as a result of updating one of the case context fields.
   */
  contextChanged = 'contextChanged',
  /**
   * Identifies the custom event that gets logged when a user hovers over a generated answer citation.
   */
  generatedAnswerSourceHover = 'generatedAnswerSourceHover',
  /**
   * Identifies the custom event that gets logged when a user submits feedback on a generated answer.
   */
  generatedAnswerFeedbackSubmit = 'generatedAnswerFeedbackSubmit',
  /**
   * Identifies the custom event that gets logged when a user deactivates the RGA feature.
   */
  generatedAnswerHideAnswers = 'generatedAnswerHideAnswers',
  /**
   * Identifies the custom event that gets logged when a user activates the RGA feature.
   */
  generatedAnswerShowAnswers = 'generatedAnswerShowAnswers',
  /**
   * Identifies the custom event that gets logged when a user expands a generated answer.
   */
  generatedAnswerExpand = 'generatedAnswerExpand',
  /**
   * Identifies the custom event that gets logged when a user collapses a generated answer.
   */
  generatedAnswerCollapse = 'generatedAnswerCollapse',
  /**
   * Identifies the custom event that gets logged when a user clicks the copy to clipboard button of a generated answer.
   */
  generatedAnswerCopyToClipboard = 'generatedAnswerCopyToClipboard',
  /**
   * Identifies the custom event that gets logged when the user opens the full search page from the insight panel.
   */
  expandToFullUI = 'expandToFullUI',
  /**
   * Identifies the custom event that gets logged when the user clicks the create article button.
   */
  createArticle = 'createArticle',
  /**
   * Identifies the search event that gets logged when the user selects a recent query.
   */
  recentQueriesClick = 'recentQueriesClick',
  /**
   * Identifies the custom event that gets logged when the user clears the recent queries.
   */
  clearRecentQueries = 'clearRecentQueries',
}
