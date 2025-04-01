import {ComponentSelector, CypressSelector} from '../../common-selectors';

export const modalComponent = 'c-quantic-modal';

export interface ModalSelector extends ComponentSelector {
  modal: () => CypressSelector;
  modalHeader: () => CypressSelector;
  modalContent: () => CypressSelector;
  modalFooter: () => CypressSelector;
  renderingError: () => CypressSelector;
}

export const ModalSelectors: ModalSelector = {
  get: () => cy.get(modalComponent),

  modal: () => ModalSelectors.get().find('.modal'),
  modalHeader: () => ModalSelectors.get().find('.modal-header'),
  modalContent: () => ModalSelectors.get().find('.modal-content'),
  modalFooter: () => ModalSelectors.get().find('.modal-footer'),
  renderingError: () => ModalSelectors.get().find('.error-message'),
};
