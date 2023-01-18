import {configure} from '../../../page-objects/configurator';
import {scope} from '../../../reporters/detailed-collector';
import {UserActionToggleActions as Actions} from './user-action-toggle-actions';
import {UserActionToggleExpectations as Expect} from './user-action-toggle-expectations';

interface UserActionToggleOptions {
  ticketCreationDate: string;
}

const userActionModalTite = 'User Actions';

describe('quantic-user-action-toggle', () => {
  const pageUrl = 's/quantic-user-action-toggle';

  function visitPage(options: Partial<UserActionToggleOptions> = {}) {
    cy.visit(pageUrl);
    configure(options);
  }

  describe('when using default options', () => {
    it('should render the user action toggle component', () => {
      visitPage();

      scope('when loading the page', () => {
        Expect.displayUserActionToggle(true);
        Expect.displayUserActionToggleIcon(true);
        Expect.displayModal(false);
      });

      scope('when opening the user action modal', () => {
        Actions.clickUserActionToggleButton();
        Expect.displayModal(true);
        Expect.displayModalFullScreen(false);
        Expect.userActionModalTitleContains(userActionModalTite);
        Expect.displayUserActionTimeline(true);
      });

      scope('when closing the user action modal', () => {
        Actions.clickUserActionCloseButton();
        Expect.displayModal(false);
      });
    });
  });
});
