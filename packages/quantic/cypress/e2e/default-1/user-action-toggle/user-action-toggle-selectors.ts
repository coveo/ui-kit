import {ComponentSelector, CypressSelector} from '../../common-selectors';

export const userActionToggleComponent = 'c-quantic-user-action-toggle';

export interface UserActionToggleSelector extends ComponentSelector {
  userActionToggle: () => CypressSelector;
  userActionToggleIcon: () => CypressSelector;
  userActionModalCloseButton: () => CypressSelector;
  userActionModalTitle: () => CypressSelector;
  modal: () => CypressSelector;
  modalContent: () => CypressSelector;
  modalHeader: () => CypressSelector;
  userActionTimeline: () => CypressSelector;
}

export const UserActionToggleSelectors: UserActionToggleSelector = {
  get: () => cy.get(userActionToggleComponent),

  userActionToggle: () =>
    UserActionToggleSelectors.get().find('[data-cy="ua-toggle-button"]'),
  modal: () => UserActionToggleSelectors.get().find('[data-cy="modal"]'),
  userActionToggleIcon: () =>
    UserActionToggleSelectors.get().find('[data-cy="ua-toggle-icon"]'),
  userActionModalCloseButton: () =>
    UserActionToggleSelectors.get().find('[data-cy="ua-modal-close"]'),
  userActionModalTitle: () =>
    UserActionToggleSelectors.get().find('[data-cy="ua-modal-header"]'),
  modalContent: () => UserActionToggleSelectors.get(),
  modalHeader: () => UserActionToggleSelectors.get(),
  userActionTimeline: () =>
    UserActionToggleSelectors.get().find('[data-cy="ua-timeline"]'),
};
