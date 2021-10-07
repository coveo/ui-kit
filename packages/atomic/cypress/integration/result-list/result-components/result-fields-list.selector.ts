import {ResultListSelectors} from '../../result-list/result-list-selectors';

export const fieldsListComponent = 'atomic-result-fields-list';
export const FieldsListSelectors = {
  shadow: () => cy.get(fieldsListComponent).shadow(),
  firstInResult: () =>
    ResultListSelectors.firstResult().find(fieldsListComponent),
};
