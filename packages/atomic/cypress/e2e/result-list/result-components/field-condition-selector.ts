import {ResultListSelectors} from '../../result-list/result-list-selectors';

export const fieldConditionComponent = 'atomic-field-condition';
export const FieldConditionSelectors = {
  shadow: () => cy.get(fieldConditionComponent).shadow(),
  firstInResult: () =>
    ResultListSelectors.firstResult().find(fieldConditionComponent),
};
