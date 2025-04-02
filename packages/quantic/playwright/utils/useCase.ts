export type UseCase = 'search' | 'insight';

export const enum useCaseEnum {
  search = 'search',
  insight = 'insight',
}

export const useCaseTestCases = [
  {
    value: useCaseEnum.search,
    label: 'in the search use case',
  },
  {
    value: useCaseEnum.insight,
    label: 'in the insight use case',
  },
];
