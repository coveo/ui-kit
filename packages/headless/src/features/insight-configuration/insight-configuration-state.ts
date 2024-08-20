import dayjs from 'dayjs';

export const getInsightConfigurationInitialState =
  (): InsightConfigurationState => ({
    insightId: '',
    search: {
      locale: 'en-US',
      timezone: dayjs.tz.guess(),
    },
  });

export interface InsightConfigurationState {
  /**
   * The unique identifier of the target insight configuration.
   */
  insightId: string;
  /**
   * The configuration for the insight search.
   */
  search: {
    /**
     * The locale of the current user. Must comply with IETF’s BCP 47 definition: https://www.rfc-editor.org/rfc/bcp/bcp47.txt.
     */
    locale: string;
    /**
     * The [tz database](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) identifier of the time zone to use to correctly interpret dates in the query expression, facets, and result items.
     * By default, the timezone will be [guessed](https://day.js.org/docs/en/timezone/guessing-user-timezone).
     */
    timezone: string;
  };
}
