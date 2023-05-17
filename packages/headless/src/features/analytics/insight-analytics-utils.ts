import {CoveoInsightClient, SearchEventResponse} from 'coveo.analytics';
import {
  InsightAnalyticsProvider,
  StateNeededByInsightAnalyticsProvider,
  configureInsightAnalytics,
} from '../../api/analytics/insight-analytics';
import {StateNeededBySearchAnalyticsProvider} from '../../api/analytics/search-analytics';
import {ThunkExtraArguments} from '../../app/thunk-extra-arguments';
import {
  AnalyticsType,
  PreparableAnalyticsAction,
  WrappedAnalyticsType,
  makePreparableAnalyticsAction,
} from './analytics-utils';

export interface AsyncThunkInsightAnalyticsOptions<
  T extends Partial<StateNeededByInsightAnalyticsProvider>
> {
  state: T;
  extra: ThunkExtraArguments;
}

export type InsightAction<T extends AnalyticsType = AnalyticsType.Search> =
  PreparableAnalyticsAction<
    {analyticsType: T},
    StateNeededByInsightAnalyticsProvider
  >;

export const makeInsightAnalyticsAction = <EventType extends AnalyticsType>(
  prefix: string,
  analyticsType: EventType,
  log: (
    client: CoveoInsightClient,
    state: StateNeededByInsightAnalyticsProvider
  ) => Promise<void | SearchEventResponse> | void | null,
  provider: (
    getState: () => StateNeededByInsightAnalyticsProvider
  ) => InsightAnalyticsProvider = (getState) =>
    new InsightAnalyticsProvider(getState)
): PreparableAnalyticsAction<
  WrappedAnalyticsType<EventType>,
  StateNeededBySearchAnalyticsProvider
> => {
  return makePreparableAnalyticsAction(
    prefix,
    async ({
      getState,
      analyticsClientMiddleware,
      preprocessRequest,
      logger,
    }) => {
      const client = configureInsightAnalytics({
        getState,
        logger,
        analyticsClientMiddleware,
        preprocessRequest,
        provider: provider(getState),
      });
      return {
        log: async () => {
          const response = await log(client, getState());
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
