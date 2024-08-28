export class RecentQueryUtils {
  /**
   * Highlights a recent query based on the letters that match the current query.
   * @param {String} recentQuery
   * @param {String} query
   * @returns {String}
   */
  static formatRecentQuery(recentQuery, query) {
    const highlightedValue = CoveoHeadless.HighlightUtils.highlightString({
      content: recentQuery,
      openingDelimiter: '<b>',
      closingDelimiter: '</b>',
      highlights: [
        {
          offset: query.length,
          length: recentQuery.length - query.length,
        },
      ],
    });
    return highlightedValue;
  }
}
