import {TestFixture} from '../fixtures/test-fixture';
import * as CommonAssertions from './common-assertions';
import {addSmartSnippet} from './smart-snippet-actions';
import * as SmartSnippetFeedbackModalAssertions from './smart-snippet-feedback-modal-assertions';
import {
  smartSnippetFeedbackModalComponent,
  SmartSnippetFeedbackModalSelectors,
} from './smart-snippet-feedback-modal-selectors';
import {SmartSnippetSelectors} from './smart-snippet-selectors';

// TODO: click with force true is done as workaround for flakiness (with modal)
//  as Cypress sometimes sees the button as invisible. Explore if there is a better solution.
describe('Smart Snippet Feedback Modal Test Suites', () => {
  function setupOpenModal() {
    new TestFixture().with(addSmartSnippet()).init();
    SmartSnippetSelectors.feedbackDislikeButton().click({force: true});
    SmartSnippetSelectors.feedbackExplainWhy().click({force: true});
  }

  describe('after opening the modal', () => {
    beforeEach(() => {
      setupOpenModal();
    });

    SmartSnippetFeedbackModalAssertions.assertDisplayModal(true);
    SmartSnippetFeedbackModalAssertions.assertDisplayDetails(false);
    CommonAssertions.assertAccessibility(smartSnippetFeedbackModalComponent);

    it('should give the primary text color to the cancel button', () => {
      SmartSnippetFeedbackModalSelectors.cancelButton()
        .invoke('css', 'color')
        .should('eq', 'rgb(48, 63, 159)');
    });

    describe('then clicking submit', () => {
      beforeEach(() => {
        SmartSnippetFeedbackModalSelectors.submitButton().click({force: true});
      });

      SmartSnippetFeedbackModalAssertions.assertFormErrors();
      SmartSnippetFeedbackModalAssertions.assertDisplayModal(true);
    });
  });

  describe('after opening the modal then selecting some option except other', () => {
    beforeEach(() => {
      setupOpenModal();
      SmartSnippetFeedbackModalSelectors.reasonRadio()
        .first()
        .click({force: true});
    });

    SmartSnippetFeedbackModalAssertions.assertDisplayDetails(false);

    describe('then clicking submit', () => {
      beforeEach(() => {
        SmartSnippetFeedbackModalSelectors.submitButton().click({force: true});
      });

      SmartSnippetFeedbackModalAssertions.assertDisplayModal(false);
    });
  });

  describe('after opening the modal then selecting other', () => {
    beforeEach(() => {
      setupOpenModal();
      SmartSnippetFeedbackModalSelectors.reasonRadio()
        .last()
        .click({force: true});
    });

    SmartSnippetFeedbackModalAssertions.assertDisplayDetails(true);

    describe('then clicking submit', () => {
      beforeEach(() => {
        SmartSnippetFeedbackModalSelectors.submitButton().click({force: true});
      });

      SmartSnippetFeedbackModalAssertions.assertFormErrors();
      SmartSnippetFeedbackModalAssertions.assertDisplayModal(true);

      describe('then writing details and pressing submit', () => {
        beforeEach(() => {
          SmartSnippetFeedbackModalSelectors.detailsInput().type('abc', {
            force: true,
          });
          SmartSnippetFeedbackModalSelectors.submitButton().click({
            force: true,
          });
        });

        SmartSnippetFeedbackModalAssertions.assertDisplayModal(false);
      });
    });
  });

  describe('after opening the modal then clicking cancel', () => {
    beforeEach(() => {
      setupOpenModal();
      //Wait for the modal opening animation to end.
      cy.wait(1000);
      SmartSnippetFeedbackModalSelectors.cancelButton().click({force: true});
    });

    SmartSnippetFeedbackModalAssertions.assertDisplayModal(false);

    it('should focus on the explain why button', () => {
      SmartSnippetSelectors.feedbackExplainWhy().should('be.focused');
    });

    describe('then opening the modal again', () => {
      beforeEach(() => {
        SmartSnippetSelectors.feedbackExplainWhy().click({force: true});
      });

      SmartSnippetFeedbackModalAssertions.assertDisplayModal(true);
    });
  });

  describe('after opening the modal then clicking the backdrop', () => {
    beforeEach(() => {
      setupOpenModal();
      SmartSnippetFeedbackModalSelectors.backdrop().click({force: true});
    });

    SmartSnippetFeedbackModalAssertions.assertDisplayModal(false);
  });

  describe('after opening the modal, testing analytics', () => {
    beforeEach(() => {
      new TestFixture().with(addSmartSnippet()).init();
      SmartSnippetSelectors.feedbackDislikeButton().click({force: true});
      SmartSnippetSelectors.feedbackExplainWhy().click({force: true});
    });

    SmartSnippetFeedbackModalAssertions.assertLogOpenSmartSnippetFeedbackModal();

    describe('after clicking cancel', () => {
      beforeEach(() => {
        SmartSnippetFeedbackModalSelectors.cancelButton().click({force: true});
      });

      SmartSnippetFeedbackModalAssertions.assertLogCloseSmartSnippetFeedbackModal();

      describe('then opening the modal again', () => {
        beforeEach(() => {
          SmartSnippetSelectors.feedbackExplainWhy().click({force: true});
        });

        SmartSnippetFeedbackModalAssertions.assertLogOpenSmartSnippetFeedbackModal();
      });
    });

    describe('after clicking the backdrop', () => {
      beforeEach(() => {
        SmartSnippetFeedbackModalSelectors.backdrop().click({force: true});
      });

      SmartSnippetFeedbackModalAssertions.assertLogCloseSmartSnippetFeedbackModal();
    });

    describe('after selecting an option and clicking submit', () => {
      beforeEach(() => {
        SmartSnippetFeedbackModalSelectors.reasonRadio()
          .first()
          .click({force: true});
        SmartSnippetFeedbackModalSelectors.submitButton().click({force: true});
      });

      SmartSnippetFeedbackModalAssertions.assertLogSendSpecificSmartSnippetFeedback();
    });

    describe('after selecting other, typing a reason and clicking submit', () => {
      beforeEach(() => {
        SmartSnippetFeedbackModalSelectors.reasonRadio()
          .last()
          .click({force: true});
        SmartSnippetFeedbackModalSelectors.detailsInput().type('abc', {
          force: true,
        });
        SmartSnippetFeedbackModalSelectors.submitButton().click({force: true});
      });

      SmartSnippetFeedbackModalAssertions.assertLogSendDetailedSmartSnippetFeedback();
    });
  });
});
