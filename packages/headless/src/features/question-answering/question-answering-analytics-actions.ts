import {AnalyticsType, makeAnalyticsAction} from '../analytics/analytics-utils';

export const logExpandSmartSnippet = makeAnalyticsAction(
  'analytics/smartSnippet/expand',
  AnalyticsType.Custom,
  (_client, _state) => {
    // TODO;
  }
);

export const logCollapseSmartSnippet = makeAnalyticsAction(
  'analytics/smartSnippet/collapse',
  AnalyticsType.Custom,
  (_client, _state) => {
    // TODO;
  }
);

export const logSmartSnippetPositiveFeedback = makeAnalyticsAction(
  'analytics/smartSnippet/feedback/positive',
  AnalyticsType.Custom,
  (_client, _state) => {
    // TODO;
  }
);

export const logSmartSnippetNegativeFeedback = makeAnalyticsAction(
  'analytics/smartSnippet/feedback/negative',
  AnalyticsType.Custom,
  (_client, _state) => {
    // TODO;
  }
);

export const logSmartSnippetExplanationFeedback = makeAnalyticsAction(
  'analytics/smartSnippet/feedback/explanation',
  AnalyticsType.Custom,
  (_client, _state) => {
    // TODO;
  }
);
