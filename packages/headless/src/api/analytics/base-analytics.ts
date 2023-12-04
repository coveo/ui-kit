import {SearchPageClientProvider} from 'coveo.analytics';
import {SearchEventRequest} from 'coveo.analytics/dist/definitions/events';
import {ContextSetting} from '../../features/context/context-state';
import {getSearchHubInitialState} from '../../features/search-hub/search-hub-state';
import {ContextPayload} from '../../product-listing.index';
import {
  ConfigurationSection,
  ContextSection,
  PipelineSection,
  QuerySection,
  SearchHubSection,
} from '../../state/state-sections';
import {VERSION} from '../../utils/version';

export const getLanguage = (state: ConfigurationSection) => {
  const langKey = state.configuration.search.locale.split('-')[0];
  if (!langKey || langKey.length !== 2) {
    return 'en';
  }
  return langKey;
};

export type StateNeededByBaseAnalyticsProvider = ConfigurationSection &
  Partial<SearchHubSection & PipelineSection & QuerySection & ContextSection>;

export abstract class BaseAnalyticsProvider<
  T extends StateNeededByBaseAnalyticsProvider,
> implements SearchPageClientProvider
{
  protected readonly state: T;
  constructor(protected getState: () => T) {
    this.state = getState();
  }

  public abstract getSearchUID(): string;
  public abstract getPipeline(): string;
  public abstract getSearchEventRequestPayload(): Omit<
    SearchEventRequest,
    'actionCause' | 'searchQueryUid'
  >;

  public getLanguage() {
    return getLanguage(this.state);
  }

  public getBaseMetadata() {
    const {context} = this.state;
    const contextValues = context?.contextValues || {};
    const formattedObject: Record<string, string | string[]> = {};
    return this.state.configuration.analytics.analyticsMode === 'legacy'
      ? legacyBaseMetadata(contextValues, formattedObject)
      : nextBaseMetadata(
          contextValues,
          context?.contextSettings ?? {},
          formattedObject
        );
  }

  public getOriginContext() {
    return this.state.configuration.analytics.originContext;
  }

  public getOriginLevel1() {
    return this.state.searchHub || getSearchHubInitialState();
  }

  public getOriginLevel2() {
    return this.state.configuration.analytics.originLevel2;
  }

  public getOriginLevel3() {
    return this.state.configuration.analytics.originLevel3;
  }

  public getIsAnonymous() {
    return this.state.configuration.analytics.anonymous;
  }
}

function legacyBaseMetadata(
  contextValues: ContextPayload,
  formattedObject: Record<string, string | string[]>
) {
  for (const [key, value] of Object.entries(contextValues)) {
    const formattedKey = `context_${key}`;
    formattedObject[formattedKey] = value;
  }
  formattedObject['coveoHeadlessVersion'] = VERSION;
  return formattedObject;
}

function nextBaseMetadata(
  contextValues: ContextPayload,
  contextSettings: ContextSetting,
  formattedObject: Record<string, string | string[]>
) {
  const contextValueEntries = Object.entries(contextValues).filter(
    ([key]) => contextSettings[key]?.useForReporting
  );
  for (const [key, value] of contextValueEntries) {
    const formattedKey = `context_${key}`;
    formattedObject[formattedKey] = value;
  }
  formattedObject['coveoHeadlessVersion'] = VERSION;
  return formattedObject;
}
