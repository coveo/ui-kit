export const enum AnalyticsModeEnum {
  legacy = 'ua',
  next = 'ep',
}

export type AnalyticsMode = 'ua' | 'ep';

export const analyticsModeTest = [
  {
    mode: AnalyticsModeEnum.legacy,
    label: 'when legacy analytics are sent',
  },
  {
    mode: AnalyticsModeEnum.next,
    label: 'when next analytics are sent',
  },
];
