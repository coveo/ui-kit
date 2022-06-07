import {SearchPageClientProvider} from 'coveo.analytics';
import {getSearchHubInitialState} from '../../features/search-hub/search-hub-state';
import {
  ConfigurationSection,
  ContextSection,
  PipelineSection,
  QuerySection,
  SearchHubSection,
} from '../../state/state-sections';
import {VERSION} from '../../utils/version';
import {SearchEventRequest} from 'coveo.analytics/dist/definitions/events';

export const getLanguage = (state: ConfigurationSection) => {
  const langKey = state.configuration.search.locale.split('-')[0];
  if (!langKey || langKey.length !== 2) {
    return 'en';
  }
  return langKey;
};

export type StateNeededByBaseAnalyticsProvider = ConfigurationSection &
  Partial<SearchHubSection & PipelineSection & QuerySection & ContextSection>;

export abstract class BaseAnalyticsProvider
  implements SearchPageClientProvider
{
  constructor(
    private stateNeededByBaseAnalyticsProvider: StateNeededByBaseAnalyticsProvider
  ) {}

  public abstract getSearchUID(): string;
  public abstract getPipeline(): string;
  public abstract getSearchEventRequestPayload(): Omit<
    SearchEventRequest,
    'actionCause' | 'searchQueryUid'
  >;

  public getLanguage() {
    return getLanguage(this.stateNeededByBaseAnalyticsProvider);
  }

  public getBaseMetadata() {
    const {context} = this.stateNeededByBaseAnalyticsProvider;
    const contextValues = context?.contextValues || {};
    const formattedObject: Record<string, string | string[]> = {};
    for (const [key, value] of Object.entries(contextValues)) {
      const formattedKey = `context_${key}`;
      formattedObject[formattedKey] = value;
    }
    formattedObject['coveoHeadlessVersion'] = VERSION;
    return formattedObject;
  }

  public getOriginContext() {
    return this.stateNeededByBaseAnalyticsProvider.configuration.analytics
      .originContext;
  }

  public getOriginLevel1() {
    return (
      this.stateNeededByBaseAnalyticsProvider.searchHub ||
      getSearchHubInitialState()
    );
  }

  public getOriginLevel2() {
    return this.stateNeededByBaseAnalyticsProvider.configuration.analytics
      .originLevel2;
  }

  public getOriginLevel3() {
    return this.stateNeededByBaseAnalyticsProvider.configuration.analytics
      .originLevel3;
  }

  public getIsAnonymous() {
    return this.stateNeededByBaseAnalyticsProvider.configuration.analytics
      .anonymous;
  }
}
