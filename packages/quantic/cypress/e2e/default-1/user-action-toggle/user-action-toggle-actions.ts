import {
  UserActionToggleSelector,
  UserActionToggleSelectors,
} from './user-action-toggle-selectors';

const userActionToggleActions = (selector: UserActionToggleSelector) => {
  return {
    clickUserActionToggleButton: () =>
      selector
        .userActionToggle()
        .click({force: true})
        .logAction('When clicking the user action toggle'),

    clickUserActionCloseButton: () =>
      selector
        .userActionModalCloseButton()
        .click()
        .logAction('When clicking the user action modal close button'),
  };
};

export const UserActionToggleActions = {
  ...userActionToggleActions(UserActionToggleSelectors),
};
