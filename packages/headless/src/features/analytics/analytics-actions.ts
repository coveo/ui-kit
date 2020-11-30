import {createAsyncThunk, AsyncThunkAction} from '@reduxjs/toolkit';
import {
  AnalyticsProvider,
  configureAnalytics,
  StateNeededByAnalyticsProvider,
} from '../../api/analytics/analytics';
import {SearchPageEvents} from 'coveo.analytics/dist/definitions/searchPage/searchPageEvents';
import {SearchAppState} from '../../state/search-app-state';
import {validatePayloadSchema} from '../../utils/validate-payload';
import {StringValue, RecordValue} from '@coveo/bueno';
import {CoveoSearchPageClient, SearchPageClientProvider} from 'coveo.analytics';
import {SearchEventResponse} from 'coveo.analytics/dist/definitions/events';
import {getAdvancedSearchQueriesInitialState} from '../advanced-search-queries/advanced-search-queries-state';
import {ThunkExtraArguments} from '../../app/store';

export interface AsyncThunkAnalyticsOptions<
  T extends Partial<StateNeededByAnalyticsProvider>
> {
  state: T;
  extra: ThunkExtraArguments;
}

export const searchPageState = (getState: () => unknown) =>
  getState() as SearchAppState;

export enum AnalyticsType {
  Search,
  Custom,
  Click,
}

export type SearchAction = AsyncThunkAction<
  {analyticsType: AnalyticsType.Search},
  void | {},
  AsyncThunkAnalyticsOptions<StateNeededByAnalyticsProvider>
>;

export type CustomAction = AsyncThunkAction<
  {analyticsType: AnalyticsType.Custom},
  {},
  {}
>;

export type ClickAction = AsyncThunkAction<
  {analyticsType: AnalyticsType.Click},
  {},
  {}
>;

export const makeAnalyticsAction = <T extends AnalyticsType>(
  prefix: string,
  analyticsType: T,
  log: (
    client: CoveoSearchPageClient,
    state: Partial<SearchAppState>
  ) => Promise<void | SearchEventResponse> | void,
  provider: (state: Partial<SearchAppState>) => SearchPageClientProvider = (
    s
  ) => new AnalyticsProvider(s as StateNeededByAnalyticsProvider)
) => {
  return createAsyncThunk<
    {analyticsType: T},
    void,
    AsyncThunkAnalyticsOptions<StateNeededByAnalyticsProvider>
  >(
    prefix,
    async (_, {getState, extra: {analyticsClientMiddleware, logger}}) => {
      const state = searchPageState(getState);
      const client = configureAnalytics({
        state,
        logger,
        analyticsClientMiddleware,
        provider: provider(state),
      });
      const response = await log(client, state);
      logger.info(
        {client: client.coveoAnalyticsClient, response},
        'Analytics response'
      );
      return {analyticsType};
    }
  );
};

export interface GenericSearchEventPayload<T = unknown> {
  /** The identifier of the search action (e.g., `interfaceLoad`). */
  evt: SearchPageEvents | string;
  /** The event metadata. */
  meta?: Record<string, T>;
}

/**
 * Logs a generic search event.
 * @param p (GenericSearchEventPayload) The search event payload.
 */
export const logGenericSearchEvent = (p: GenericSearchEventPayload) =>
  makeAnalyticsAction(
    'analytics/generic/search',
    AnalyticsType.Search,
    (client) => {
      validatePayloadSchema(p, {
        evt: new StringValue({required: true, emptyAllowed: false}),
        meta: new RecordValue(),
      });
      const {evt, meta} = p;
      return client.logSearchEvent(evt as SearchPageEvents, meta);
    }
  )();

/**
 * Logs an interface load event.
 */
export const logInterfaceLoad = makeAnalyticsAction(
  'analytics/interface/load',
  AnalyticsType.Search,
  (client) => client.logInterfaceLoad()
);

/**
 * Logs an interface change event.
 */
export const logInterfaceChange = makeAnalyticsAction(
  'analytics/interface/change',
  AnalyticsType.Search,
  (client, state) =>
    client.logInterfaceChange({
      interfaceChangeTo:
        state.advancedSearchQueries?.cq ||
        getAdvancedSearchQueriesInitialState().cq,
    })
);
