import {
  CoveoSearchPageClient,
  EventBuilder,
  SearchPageClientProvider,
} from 'coveo.analytics';
import {
  SearchAnalyticsProvider,
  StateNeededBySearchAnalyticsProvider,
  configureAnalytics,
} from '../../api/analytics/search-analytics';
import {
  AnalyticsType,
  PreparableAnalyticsAction,
  SearchAction,
  WrappedAnalyticsType,
  makePreparableAnalyticsAction,
} from './analytics-utils';

export const makeNoopAnalyticsAction = <T extends AnalyticsType>(
  analyticsType: T
) => makeAnalyticsAction('analytics/noop', analyticsType, () => null);

export const noopSearchAnalyticsAction = (): SearchAction =>
  makeNoopAnalyticsAction(AnalyticsType.Search);

export const makeAnalyticsAction = <
  EventType extends AnalyticsType,
  StateNeeded extends StateNeededBySearchAnalyticsProvider = StateNeededBySearchAnalyticsProvider
>(
  prefix: string,
  analyticsType: EventType,
  getBuilder: (
    client: CoveoSearchPageClient,
    state: StateNeeded
  ) => Promise<EventBuilder | null> | null,
  provider: (getState: () => StateNeeded) => SearchPageClientProvider = (
    getState
  ) => new SearchAnalyticsProvider(getState)
): PreparableAnalyticsAction<WrappedAnalyticsType<EventType>, StateNeeded> => {
  return makePreparableAnalyticsAction(
    prefix,
    async ({
      getState,
      analyticsClientMiddleware,
      preprocessRequest,
      logger,
    }) => {
      const client = configureAnalytics({
        getState,
        logger,
        analyticsClientMiddleware,
        preprocessRequest,
        provider: provider(getState),
      });
      const builder = await getBuilder(client, getState());
      return {
        description: builder?.description,
        log: async ({state}) => {
          const response = await builder?.log({
            searchUID: provider(() => state).getSearchUID(),
          });
          logger.info(
            {client: client.coveoAnalyticsClient, response},
            'Analytics response'
          );
          return {analyticsType};
        },
      };
    }
  );
};
