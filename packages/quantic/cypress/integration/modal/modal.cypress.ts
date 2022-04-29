import {configure} from '../../page-objects/configurator';

import {ModalExpectations as Expect} from './modal-expectations';
import {scope} from '../../reporters/detailed-collector';
import {openModal} from '../../page-objects/actions/action-open-modal';
import {closeModal} from '../../page-objects/actions/action-close-modal';

interface ModalOptions {
  fullScreen: boolean;
  animation: 'slideToTop' | 'slideToLeft';
}

describe('quantic-modal', () => {
  const pageUrl = 's/quantic-modal';

  function visitModal(options: Partial<ModalOptions>) {
    cy.visit(pageUrl);
    configure(options);
  }

  describe('when using default options', () => {
    it('should render the modal opening with a slide to top animation covering only the container of the modal', () => {
      visitModal({});

      scope('when loading the page', () => {
        Expect.displayModal(false);
        Expect.haveSlideToTopAnimation(true);
      });

      scope('when opening the modal', () => {
        openModal();
        Expect.displayModal(true);
        Expect.displayHeader(true);
        Expect.displayContent(true);
        Expect.displayFooter(true);
        Expect.displayFullScreen(false);
      });

      scope('when closing the modal', () => {
        closeModal();
        Expect.displayModal(false);
      });
    });
  });

  describe('when using slide to left animation', () => {
    it('should render the modal opening with a slide to left animation covering only the container of the modal', () => {
      visitModal({
        animation: 'slideToLeft',
      });

      scope('when loading the page', () => {
        Expect.displayModal(false);
        Expect.haveSlideToLeftAnimation(true);
      });

      scope('when opening the modal', () => {
        openModal();
        Expect.displayModal(true);
        Expect.displayHeader(true);
        Expect.displayContent(true);
        Expect.displayFooter(true);
        Expect.displayFullScreen(false);
      });

      scope('when closing the modal', () => {
        closeModal();
        Expect.displayModal(false);
      });
    });
  });

  describe('when fullScreen is set to true', () => {
    it('should render the modal opening with a slide to top animation covering all the screen', () => {
      visitModal({
        fullScreen: true,
      });

      scope('when loading the page', () => {
        Expect.displayModal(false);
        Expect.haveSlideToTopAnimation(true);
      });

      scope('when opening the modal', () => {
        openModal();
        Expect.displayModal(true);
        Expect.displayHeader(true);
        Expect.displayContent(true);
        Expect.displayFooter(true);
        Expect.displayFullScreen(true);
      });

      scope('when closing the modal', () => {
        closeModal();
        Expect.displayModal(false);
      });
    });
  });
});
