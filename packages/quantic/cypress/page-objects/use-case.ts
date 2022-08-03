export const enum useCaseEnum {
  search = 'search',
  insight = 'insight',
}

export const uesCaseParamTest = [
  {
    useCase: useCaseEnum.search,
    label: 'with search use case',
    waitForSearch: true,
  },
  {
    useCase: useCaseEnum.insight,
    label: 'with insight use case',
    waitForSearch: false,
  },
];
