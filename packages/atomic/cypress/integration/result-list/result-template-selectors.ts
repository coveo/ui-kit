import {ResultListSelectors} from './result-list-selectors';

export const resultTemplateComponent = 'atomic-result-template';

export const ResultTemplateSelectors = {
  shadow: () => cy.get('atomic-result-template').shadow(),
  customContent: () =>
    ResultListSelectors.firstResult().find('#template-content'),
};
