import {CaseAssistClient, SearchEventResponse} from 'coveo.analytics';
import {
  StateNeededByCaseAssistAnalytics,
  configureCaseAssistAnalytics,
} from '../../api/analytics/case-assist-analytics';
import {
  PreparableAnalyticsAction,
  makePreparableAnalyticsAction,
} from './analytics-utils';

export type CaseAssistAction = PreparableAnalyticsAction<
  void,
  StateNeededByCaseAssistAnalytics
>;

export const makeCaseAssistAnalyticsAction = (
  prefix: string,
  log: (
    client: CaseAssistClient,
    state: StateNeededByCaseAssistAnalytics
  ) => Promise<void | SearchEventResponse> | void
): PreparableAnalyticsAction<void, StateNeededByCaseAssistAnalytics> => {
  return makePreparableAnalyticsAction(
    prefix,
    async ({
      getState,
      analyticsClientMiddleware,
      preprocessRequest,
      logger,
    }) => {
      const client = configureCaseAssistAnalytics({
        state: getState(),
        logger,
        analyticsClientMiddleware,
        preprocessRequest,
      });
      return {
        log: async () => {
          const response = await log(client, getState());
          logger.info(
            {client: client.coveoAnalyticsClient, response},
            'Analytics response'
          );
        },
      };
    }
  );
};
