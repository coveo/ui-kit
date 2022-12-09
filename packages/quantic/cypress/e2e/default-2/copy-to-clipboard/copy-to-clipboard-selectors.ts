import {ComponentSelector, CypressSelector} from '../../common-selectors';

export const copyToClpboardComponent = 'c-quantic-result-copy-to-clipboard';

export interface CopyToClipboardSelector extends ComponentSelector {
  copyToClipboardButton: () => CypressSelector;
  copyToClipboardTooltip: () => CypressSelector;
}

export const CopyToClipboardSelectors: CopyToClipboardSelector = {
  get: () => cy.get(copyToClpboardComponent),

  copyToClipboardButton: () =>
    CopyToClipboardSelectors.get().find('lightning-button-icon-stateful'),
  copyToClipboardTooltip: () =>
    CopyToClipboardSelectors.get().find('.slds-popover'),
};
