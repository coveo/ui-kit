import {ResultListSelectors} from '../result-list-selectors';

export const resultIconComponent = 'atomic-result-icon';

export const ResultIconSelectors = {
  shadow: () => cy.get(resultIconComponent).shadow(),
  firstInResult: () =>
    ResultListSelectors.firstResult().find(resultIconComponent),
  svg: () =>
    ResultIconSelectors.firstInResult().find('svg', {includeShadowDom: true}),
};
