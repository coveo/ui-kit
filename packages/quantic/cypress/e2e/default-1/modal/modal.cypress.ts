import {closeModal} from '../../../page-objects/actions/action-close-modal';
import {openModal} from '../../../page-objects/actions/action-open-modal';
import {configure} from '../../../page-objects/configurator';
import {scope} from '../../../reporters/detailed-collector';
import {ModalExpectations as Expect} from './modal-expectations';

interface ModalOptions {
  fullScreen: boolean;
  animation: string;
}

const invalidAnimationError = (value: string) => {
  return `"${value}" is an invalid value for the animation property. animation can only be set to "slideToTop" or "slideToLeft".`;
};

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

  describe('when setting an invalid animation', () => {
    it('should render an error message', () => {
      const invalidAnimation = 'invalid animation';
      visitModal({
        animation: invalidAnimation,
      });

      scope('when loading the page', () => {
        Expect.displayRenderingError(
          true,
          invalidAnimationError(invalidAnimation)
        );
      });
    });
  });
});
