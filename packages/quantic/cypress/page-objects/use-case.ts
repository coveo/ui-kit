export const enum useCaseEnum {
  search = 'search',
  insight = 'insight',
}

export const useCaseParamTest = [
  {
    useCase: useCaseEnum.search,
    label: 'with search use case',
  },
  {
    useCase: useCaseEnum.insight,
    label: 'with insight use case',
  },
];
const insightInterfaceExpectations = () => {
  return {
    isInitialized: () => {
      cy.get('input[type="hidden"]')
        .invoke('attr', 'is-initialized')
        .should('eq', 'true');
    },
  };
};

export const InsightInterfaceExpectations = {
  ...insightInterfaceExpectations(),
};
