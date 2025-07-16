export enum LegacySearchPageEvents {
  /**
   * Identifies the custom event that gets logged when the Results per page component is selected.
   */
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
}
