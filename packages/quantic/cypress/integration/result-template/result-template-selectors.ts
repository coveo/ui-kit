import {ComponentSelector, CypressSelector} from '../common-selectors';

export const resultTemplateComponent = 'c-quantic-result-template';

export interface ResultTemplateSelector extends ComponentSelector {
  slotByName: (name: string) => CypressSelector;
}

export const ResultTemplateSelectors: ResultTemplateSelector = {
  get: () => cy.get(resultTemplateComponent),

  slotByName: (name: string) =>
    ResultTemplateSelectors.get().find(`div[slot="${name}"]`),
};
