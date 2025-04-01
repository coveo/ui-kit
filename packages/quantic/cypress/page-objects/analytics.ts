export const enum AnalyticsModeEnum {
  legacy = 'legacy',
  next = 'next',
}

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
