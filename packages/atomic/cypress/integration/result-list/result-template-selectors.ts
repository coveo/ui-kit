import {ResultListSelectors} from './result-list-selectors';
import {ResultTableSelectors} from './result-table-selectors';

export const resultTemplateComponent = 'atomic-result-template';

export const ResultTemplateSelectors = {
  shadow: () => cy.get('atomic-result-template').shadow(),
  customContentInList: () =>
    ResultListSelectors.firstResult().find('#template-content'),
  customContentIntable: () =>
    ResultTableSelectors.firstRowCellsContent().find('#template-content'),
  tableElements: () =>
    ResultListSelectors.firstResult().find('atomic-table-element'),
};
