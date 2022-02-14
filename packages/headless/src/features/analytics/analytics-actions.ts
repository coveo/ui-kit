import {
  validatePayload,
  requiredNonEmptyString,
  nonEmptyString,
} from '../../utils/validate-payload';
import {Result} from '../../api/search/search/result';
import {
  AnalyticsType,
  AsyncThunkAnalyticsOptions,
  documentIdentifier,
  makeAnalyticsAction,
  partialDocumentInformation,
  validateResultPayload,
} from './analytics-utils';
import {OmniboxSuggestionMetadata} from '../query-suggest/query-suggest-analytics-actions';
import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import {
  CoveoSearchPageClient,
  SearchPageClientProvider,
  SearchPageEvents,
  EventBuilder,
  EventDescription,
} from 'coveo.analytics';
import {
  AnalyticsProvider,
  configureAnalytics,
  StateNeededByAnalyticsProvider,
} from '../../api/analytics/analytics';
import {SearchAppState} from '../..';
import {ConfigurationSection} from '../../state/state-sections';

const searchPageState = (getState: () => unknown) =>
  getState() as SearchAppState;

export interface SearchEventPayload {
  /** The identifier of the search action (e.g., `interfaceLoad`). */
  evt: SearchPageEvents | string;
  /** The event metadata. */
  meta?: Record<string, unknown>;
}

export interface ClickEventPayload {
  evt: SearchPageEvents | string;
  result: Result;
}

export interface CustomEventPayload {
  /**
   * The event cause identifier of the custom action
   */
  evt: SearchPageEvents | string;
  /**
   * The event type identifier of the custom action
   */
  type: string;
  /** The event metadata. */
  meta?: Record<string, unknown>;
}

const validateEvent = (p: {evt: string; type?: string}) =>
  validatePayload(p, {
    evt: requiredNonEmptyString,
    type: nonEmptyString,
  });

export interface LogSearchEventActionCreatorPayload {
  /**
   * The identifier of the search action (e.g., `interfaceLoad`).
   * */
  evt: string;
  /**
   * The event metadata.
   * */
  meta?: Record<string, unknown>;
}

export const logSearchEvent = (p: LogSearchEventActionCreatorPayload) =>
  makeAnalyticsAction(
    'analytics/generic/search',
    AnalyticsType.Search,
    (client) => {
      validateEvent(p);
      const {evt, meta} = p;
      return client.logSearchEvent(evt as SearchPageEvents, meta);
    }
  )();

export interface LogClickEventActionCreatorPayload {
  /**
   * The identifier of the click action (e.g., `documentOpen`).
   * */
  evt: string;

  /**
   * The result associated with the click event.
   */
  result: Result;
}

export const logClickEvent = (p: LogClickEventActionCreatorPayload) =>
  makeAnalyticsAction(
    'analytics/generic/click',
    AnalyticsType.Click,
    (client, state) => {
      validateResultPayload(p.result);
      validateEvent(p);

      return client.logClickEvent(
        p.evt as SearchPageEvents,
        partialDocumentInformation(p.result, state),
        documentIdentifier(p.result)
      );
    }
  )();

export interface LogCustomEventActionCreatorPayload {
  /**
   * The event cause identifier of the custom action
   */
  evt: string;
  /**
   * The event type identifier of the custom action
   */
  type: string;
  /**
   * The event metadata.
   * */
  meta?: Record<string, unknown>;
}

export const logCustomEvent = (p: LogCustomEventActionCreatorPayload) =>
  makeAnalyticsAction(
    'analytics/generic/custom',
    AnalyticsType.Custom,
    (client) => {
      validateEvent(p);
      return client.logCustomEventWithType(p.evt, p.type, p.meta);
    }
  )();

export const logInterfaceLoad = makeAnalyticsAction(
  'analytics/interface/load',
  AnalyticsType.Search,
  (client) => client.logInterfaceLoad()
);

export const logInterfaceChange = makeAnalyticsAction(
  'analytics/interface/change',
  AnalyticsType.Search,
  (client, state) =>
    client.logInterfaceChange({
      interfaceChangeTo: state.configuration.analytics.originLevel2,
    })
);

export const logSearchFromLink = makeAnalyticsAction(
  'analytics/interface/searchFromLink',
  AnalyticsType.Search,
  (client) => client.logSearchFromLink()
);

export const logOmniboxFromLink = (metadata: OmniboxSuggestionMetadata) =>
  makeAnalyticsAction(
    'analytics/interface/omniboxFromLink',
    AnalyticsType.Search,
    (client) => client.logOmniboxFromLink(metadata)
  )();

export const analyticsDescription = createAction<EventDescription>(
  'analytics/description'
);

export const temp__makeAnalyticsAction = <T extends AnalyticsType>(
  prefix: string,
  analyticsType: T,
  builder: (
    client: CoveoSearchPageClient,
    state: ConfigurationSection & Partial<SearchAppState>
  ) => EventBuilder,
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
    async (
      _,
      {
        getState,
        extra: {analyticsClientMiddleware, preprocessRequest, logger},
        dispatch,
      }
    ) => {
      const state = searchPageState(getState);
      const client = configureAnalytics({
        state,
        logger,
        analyticsClientMiddleware,
        preprocessRequest,
        provider: provider(state),
      });
      const {description, exec} = builder(client, state);
      dispatch(analyticsDescription(description));
      await exec();
      return {
        analyticsType,
      };
    }
  );
};
