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
   * Identifies the search event that gets logged when the search page loads with a query, such as when a user clicks a link pointing to a search results page with a query or enters a query in a standalone search box that points to a search page.
   */
  searchFromLink = 'searchFromLink',
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
   * Identifies the custom event that gets logged when a user undoes a query set in the effective query pipeline on the search page.
   */
  undoTriggerQuery = 'undoQuery',
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
   * Identifies the search event that gets logged when the clearing all selected values of a static filter.
   */
  staticFilterClearAll = 'staticFilterClearAll',
  /**
   * Identifies the search event that gets logged when a static filter check box is selected and the query is updated.
   */
  staticFilterSelect = 'staticFilterSelect',
  /**
   * Identifies the search event that gets logged when a static filter check box is deselected and the query is updated.
   */
  staticFilterDeselect = 'staticFilterDeselect',
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
  //eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
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
  /**
   * Identifies the custom event that gets logged when a user performs a query that returns recommendations in the Recommendations panel.
   */
  recommendation = 'recommendation',
  /**
   * Identifies the search event that gets logged when a user action (that is not a query) reloads the Recommendations panel with new recommendations.
   */
  recommendationInterfaceLoad = 'recommendationInterfaceLoad',
  /**
   * Identifies the click event that gets logged when a user clicks a recommendation in the Recommendations panel.
   */
  recommendationOpen = 'recommendationOpen',
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
   * Identifies the custom event that gets logged when the user presses "show more" on a snippet suggestion for a related question.
   *
   * @deprecated
   */
  showMoreSmartSnippetSuggestion = 'showMoreSmartSnippetSuggestion',
  /**
   * Identifies the custom event that gets logged when the user presses "show less" on a snippet suggestion for a related question.
   *
   * @deprecated
   */
  showLessSmartSnippetSuggestion = 'showLessSmartSnippetSuggestion',
  /**
   * Identifies the custom event that gets logged when a user clicks on the source of an answer in a smart snippet.
   */
  openSmartSnippetSource = 'openSmartSnippetSource',
  /**
   * Identifies the custom event that gets logged when a user clicks on the source of a snippet suggestion for a related question.
   */
  openSmartSnippetSuggestionSource = 'openSmartSnippetSuggestionSource',
  /**
   * Identifies the custom event that gets logged when a user clicks on a link in the answer of a smart snippet.
   */
  openSmartSnippetInlineLink = 'openSmartSnippetInlineLink',
  /**
   * Identifies the custom event that gets logged when a user clicks on a link in the snippet suggestion for a related question.
   */
  openSmartSnippetSuggestionInlineLink = 'openSmartSnippetSuggestionInlineLink',
  /**
   * Identifies the search event that gets logged when a recent queries list item gets clicked.
   */
  recentQueryClick = 'recentQueriesClick',
  /**
   * Identifies the custom event that gets logged when a recent queries list gets cleared.
   */
  clearRecentQueries = 'clearRecentQueries',
  /**
   * Identifies the custom event that gets logged when a recently clicked results list item gets clicked.
   */
  recentResultClick = 'recentResultClick',
  /**
   * Identifies the custom event that gets logged when a recently clicked results list gets cleared.
   */
  clearRecentResults = 'clearRecentResults',
  /**
   * Identifies the search event that gets logged when a user clicks the Cancel last action link when no results are returned following their last action.
   */
  noResultsBack = 'noResultsBack',
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

  historyForward = 'historyForward',

  historyBackward = 'historyBackward',
  /**
   * Identifies the search event that gets logged when the query context is updated as a result of updating one of the case context fields.
   */
  contextChanged = 'contextChanged',
  /**
   * Identifies the search event that gets logged when a user clicks a rephrase button in a generated answer.
   */
  rephraseGeneratedAnswer = 'rephraseGeneratedAnswer',
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
}
