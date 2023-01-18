import {should} from '../../common-selectors';
import {ModalSelector, ModalSelectors} from './modal-selectors';

function modalExpectations(selector: ModalSelector) {
  return {
    displayModal: (display: boolean) => {
      selector
        .modal()
        .should('exist')
        .should(display ? 'not.have.class' : 'have.class', 'modal_hidden')
        .logDetail(`${should(display)} display the modal.`);
    },

    displayHeader: (display: boolean) => {
      selector
        .modalHeader()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the modal header.`);
    },

    displayContent: (display: boolean) => {
      selector
        .modalContent()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the modal content.`);
    },

    displayFooter: (display: boolean) => {
      selector
        .modalFooter()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the modal footer.`);
    },

    displayFullScreen: (fullScreen: boolean) => {
      selector
        .modal()
        .should('exist')
        .should(fullScreen ? 'have.class' : 'not.have.class', 'full-screen')
        .should(fullScreen ? 'not.have.class' : 'have.class', 'part-screen')
        .logDetail(`${should(fullScreen)} display the modal on full screen.`);
    },

    haveSlideToTopAnimation: (slideToTopAnimation: boolean) => {
      selector
        .modal()
        .should('exist')
        .should(
          slideToTopAnimation ? 'have.class' : 'not.have.class',
          'hidden-modal_slide-to-top'
        )
        .should(
          slideToTopAnimation ? 'not.have.class' : 'have.class',
          'hidden-modal_slide-to-left'
        )
        .should(
          slideToTopAnimation ? 'not.have.class' : 'have.class',
          'hidden-modal_slide-to-right'
        )
        .logDetail(
          `${should(slideToTopAnimation)} have slide to top animation.`
        );
    },

    haveSlideToLeftAnimation: (slideToLeftAnimation: boolean) => {
      selector
        .modal()
        .should('exist')
        .should(
          slideToLeftAnimation ? 'have.class' : 'not.have.class',
          'hidden-modal_slide-to-left'
        )
        .should(
          slideToLeftAnimation ? 'not.have.class' : 'have.class',
          'hidden-modal_slide-to-top'
        )
        .should(
          slideToLeftAnimation ? 'not.have.class' : 'have.class',
          'hidden-modal_slide-to-right'
        )
        .logDetail(
          `${should(slideToLeftAnimation)} have slide to left animation.`
        );
    },

    haveSlideToRightAnimation: (slideToRightAnimation: boolean) => {
      selector
        .modal()
        .should('exist')
        .should(
          slideToRightAnimation ? 'have.class' : 'not.have.class',
          'hidden-modal_slide-to-right'
        )
        .should(
          slideToRightAnimation ? 'not.have.class' : 'have.class',
          'hidden-modal_slide-to-top'
        )
        .should(
          slideToRightAnimation ? 'not.have.class' : 'have.class',
          'hidden-modal_slide-to-left'
        )
        .logDetail(
          `${should(slideToRightAnimation)} have slide to right animation.`
        );
    },

    displayRenderingError: (display: boolean, error: string) => {
      selector
        .renderingError()
        .should(display ? 'exist' : 'not.exist')
        .should(display ? 'contain' : 'not.contain', error)
        .logDetail(`${should(display)} display a rendering error`);
    },
  };
}

export const ModalExpectations = {
  ...modalExpectations(ModalSelectors),
};
