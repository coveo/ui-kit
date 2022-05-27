import {
  AnalyticsConfiguration,
  SearchEngineConfiguration,
} from '@coveo/headless';
import {AnalyticsClientSendEventHook} from '@coveo/headless/node_modules/coveo.analytics';
import {getAtomicEnvironment} from '../../global/environment';
import {ObservableMap} from '@stencil/store';
import {AtomicStore, getAllFacets} from '../../utils/store';

type AnalyticsPayload = Parameters<AnalyticsClientSendEventHook>[1];

export function getAnalyticsConfig(
  searchEngineConfig: SearchEngineConfiguration,
  enabled: boolean,
  store: ObservableMap<AtomicStore>
): AnalyticsConfiguration {
  const analyticsClientMiddleware = (
    event: string,
    payload: AnalyticsPayload
  ) => augmentAnalytics(event, payload, store, searchEngineConfig);

  const defaultConfiguration: AnalyticsConfiguration = {
    analyticsClientMiddleware,
    enabled,
    ...(document.referrer && {originLevel3: document.referrer}),
    documentLocation: document.location.href,
  };

  if (searchEngineConfig.analytics) {
    return {
      ...defaultConfiguration,
      ...searchEngineConfig.analytics,
    };
  }
  return defaultConfiguration;
}

function augmentAnalytics(
  event: string,
  payload: AnalyticsPayload,
  store: ObservableMap<AtomicStore>,
  config: SearchEngineConfiguration
) {
  let result = augmentWithExternalMiddleware(event, payload, config);
  result = augmentAnalyticsWithAtomicVersion(result);
  result = augmentAnalyticsWithFacetTitles(result, store);
  return result;
}

function augmentWithExternalMiddleware(
  event: string,
  payload: AnalyticsPayload,
  config: SearchEngineConfiguration
) {
  if (config.analytics?.analyticsClientMiddleware) {
    return config.analytics.analyticsClientMiddleware(event, payload);
  }
  return payload;
}

function augmentAnalyticsWithAtomicVersion(payload: AnalyticsPayload) {
  if (payload.customData) {
    payload.customData.coveoAtomicVersion = getAtomicEnvironment().version;
  }
  return payload;
}

function augmentAnalyticsWithFacetTitles(
  payload: AnalyticsPayload,
  store: ObservableMap<AtomicStore>
) {
  const allFacets = getAllFacets(store);
  const getAtomicFacetLabelOrOriginalTitle = (
    facetId: string,
    originalTitle: string
  ) => (allFacets[facetId] ? allFacets[facetId].label : originalTitle);

  if (payload.facetState) {
    payload.facetState = payload.facetState.map(
      (analyticsFacetState: {id: string; title: string}) => {
        const {id, title: originalTitle} = analyticsFacetState;
        return {
          ...analyticsFacetState,
          title: getAtomicFacetLabelOrOriginalTitle(id, originalTitle),
        };
      }
    );
  }

  if (
    payload.customData &&
    payload.customData.facetTitle &&
    payload.customData.facetId &&
    payload.customData.facetTitle
  ) {
    payload.customData.facetTitle = getAtomicFacetLabelOrOriginalTitle(
      payload.customData.facetId,
      payload.customData.facetTitle
    );
  }
  return payload;
}
