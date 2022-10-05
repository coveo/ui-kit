import {ComponentSelector, CypressSelector} from '../../common-selectors';

export const ariaLiveComponent = 'c-quantic-aria-live';
export const summaryComponent = 'c-quantic-summary';
export const noResultsComponent = 'c-quantic-no-results';
export const queryErrorComponent = 'c-quantic-query-error';

export interface AriaLiveSelector extends ComponentSelector {
  regions: () => CypressSelector;
  specificRegion: (name: string) => CypressSelector;
  summaryComponent: () => CypressSelector;
  noResultsComponent: () => CypressSelector;
  queryErrorComponent: () => CypressSelector;
}

export const AriaLiveSelectors: AriaLiveSelector = {
  get: () => cy.get(ariaLiveComponent),

  regions: () => AriaLiveSelectors.get().get('div[role="region"]'),
  specificRegion: (name: string) =>
    AriaLiveSelectors.get().find(`div[role="region"][data-key="${name}"]`),
  summaryComponent: () =>
    cy.get(summaryComponent).find('.slds-rich-text-editor__output'),
  noResultsComponent: () =>
    cy.get(noResultsComponent).find('.slds-rich-text-editor__output'),
  queryErrorComponent: () =>
    cy.get(queryErrorComponent).find('div.slds-text-heading_medium'),
};
