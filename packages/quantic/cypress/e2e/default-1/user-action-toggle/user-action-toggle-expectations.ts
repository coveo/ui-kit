import {should} from '../../common-selectors';
import {
  UserActionToggleSelector,
  UserActionToggleSelectors,
} from './user-action-toggle-selectors';

function userActionToggleExpectations(selector: UserActionToggleSelector) {
  return {
    displayUserActionToggle: (display: boolean) => {
      selector
        .userActionToggle()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the user action toggle`);
    },

    displayUserActionToggleIcon: (display: boolean) => {
      selector
        .userActionToggleIcon()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the user action toggle icon`);
    },

    userActionToggleContains: (label: string) => {
      selector
        .userActionToggle()
        .contains(label)
        .logDetail(`The user action button should contain "${label}"`);
    },

    userActionModalTitleContains: (label: string) => {
      selector
        .userActionModalTitle()
        .should('exist')
        .contains(label)
        .logDetail(`The user action modal title should contain "${label}"`);
    },

    displayModal: (display: boolean) => {
      selector
        .modal()
        .should('exist')
        .should(display ? 'not.have.class' : 'have.class', 'modal_hidden')
        .logDetail(`${should(display)} display the user action modal`);
    },

    displayModalFullScreen: (fullScreen: boolean) => {
      selector
        .modal()
        .should('exist')
        .should(fullScreen ? 'have.class' : 'not.have.class', 'full-screen')
        .should(fullScreen ? 'not.have.class' : 'have.class', 'part-screen')
        .logDetail(
          `${should(fullScreen)} display the modal on full screen mode`
        );
    },

    displayUserActionTimeline: (display: boolean) => {
      selector
        .userActionTimeline()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the user action timeline`);
    },
  };
}

export const UserActionToggleExpectations = {
  ...userActionToggleExpectations(UserActionToggleSelectors),
};
