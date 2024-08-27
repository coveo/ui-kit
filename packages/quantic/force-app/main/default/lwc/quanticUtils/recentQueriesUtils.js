export class RecentQueryUtils {
  /**
   * Highlights a recent query based on the letters that match the current query.
   * @param {String} recentQuery
   * @param {String} query
   * @returns {String}
   */
  static formatRecentQuery(recentQuery, query) {
    const startIndex = recentQuery.indexOf(query);
    if (startIndex === -1) {
      return recentQuery;
    }

    const highlights = [
      {
        offset: startIndex,
        length: query.length,
      },
    ];

    return CoveoHeadless.HighlightUtils.highlightString({
      content: recentQuery,
      openingDelimiter: '<b>',
      closingDelimiter: '</b>',
      highlights: highlights,
    });
  }
}
