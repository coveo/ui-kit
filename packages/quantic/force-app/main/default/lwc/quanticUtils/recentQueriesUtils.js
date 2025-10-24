// TODO SFINT-6408: [v4] Remove RecentQueryUtils from QuanticUtils once deprecated usage is fully removed.
export class RecentQueryUtils {
  /**
   * Highlights a recent query based on the letters that match the current query.
   * @param {String} recentQuery
   * @param {String} query
   * @returns {String}
   */
  static formatRecentQuery(recentQuery, query) {
    try {
      const headlessBundle = Object.values(window.coveoHeadless)[0].bundle;
      const highlightedValue = headlessBundle.HighlightUtils.highlightString({
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
    } catch (e) {
      console.warn('Unable to highlight recent query text.');
      console.warn(e);
      return recentQuery;
    }
  }
}
