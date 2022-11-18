import {TestFixture} from '../fixtures/test-fixture';
import * as CommonAssertions from './common-assertions';
import {addSmartSnippet} from './smart-snippet-actions';
import * as SmartSnippetFeedbackModalAssertions from './smart-snippet-feedback-modal-assertions';
import {
  smartSnippetFeedbackModalComponent,
  SmartSnippetFeedbackModalSelectors,
} from './smart-snippet-feedback-modal-selectors';
import {SmartSnippetSelectors} from './smart-snippet-selectors';

describe('Smart Snippet Feedback Modal Test Suites', () => {
  function setupOpenModal() {
    new TestFixture().with(addSmartSnippet()).init();
    SmartSnippetSelectors.feedbackDislikeButton().click();
    SmartSnippetSelectors.feedbackExplainWhy().click();
  }

  describe('after opening the modal', () => {
    before(() => {
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
      before(() => {
        SmartSnippetFeedbackModalSelectors.submitButton().click();
      });

      SmartSnippetFeedbackModalAssertions.assertFormErrors();
      SmartSnippetFeedbackModalAssertions.assertDisplayModal(true);
    });
  });

  describe('after opening the modal then selecting some option except other', () => {
    before(() => {
      setupOpenModal();
      SmartSnippetFeedbackModalSelectors.reasonRadio().first().click();
    });

    SmartSnippetFeedbackModalAssertions.assertDisplayDetails(false);

    describe('then clicking submit', () => {
      before(() => {
        SmartSnippetFeedbackModalSelectors.submitButton().click();
      });

      SmartSnippetFeedbackModalAssertions.assertDisplayModal(false);
    });
  });

  describe('after opening the modal then selecting other', () => {
    before(() => {
      setupOpenModal();
      SmartSnippetFeedbackModalSelectors.reasonRadio().last().click();
    });

    SmartSnippetFeedbackModalAssertions.assertDisplayDetails(true);

    describe('then clicking submit', () => {
      before(() => {
        SmartSnippetFeedbackModalSelectors.submitButton().click();
      });

      SmartSnippetFeedbackModalAssertions.assertFormErrors();
      SmartSnippetFeedbackModalAssertions.assertDisplayModal(true);

      describe('then writing details and pressing submit', () => {
        before(() => {
          SmartSnippetFeedbackModalSelectors.detailsInput().type('abc', {
            force: true,
          });
          SmartSnippetFeedbackModalSelectors.submitButton().click();
        });

        SmartSnippetFeedbackModalAssertions.assertDisplayModal(false);
      });
    });
  });

  describe('after opening the modal then clicking cancel', () => {
    before(() => {
      setupOpenModal();
      SmartSnippetFeedbackModalSelectors.cancelButton().click();
    });

    SmartSnippetFeedbackModalAssertions.assertDisplayModal(false);

    it('should focus on the explain why button', () => {
      SmartSnippetSelectors.feedbackExplainWhy().should('be.focused');
    });

    describe('then opening the modal again', () => {
      before(() => {
        SmartSnippetSelectors.feedbackExplainWhy().click();
      });

      SmartSnippetFeedbackModalAssertions.assertDisplayModal(true);
    });
  });

  describe('after opening the modal then clicking the backdrop', () => {
    before(() => {
      setupOpenModal();
      SmartSnippetFeedbackModalSelectors.backdrop().click();
    });

    SmartSnippetFeedbackModalAssertions.assertDisplayModal(false);
  });

  describe('after opening the modal, testing analytics', () => {
    beforeEach(() => {
      new TestFixture().with(addSmartSnippet()).init();
      SmartSnippetSelectors.feedbackDislikeButton().click();
      SmartSnippetSelectors.feedbackExplainWhy().click();
    });

    SmartSnippetFeedbackModalAssertions.assertLogOpenSmartSnippetFeedbackModal();

    describe('after clicking cancel', () => {
      beforeEach(() => {
        SmartSnippetFeedbackModalSelectors.cancelButton().click();
      });

      SmartSnippetFeedbackModalAssertions.assertLogCloseSmartSnippetFeedbackModal();

      describe('then opening the modal again', () => {
        beforeEach(() => {
          SmartSnippetSelectors.feedbackExplainWhy().click();
        });

        SmartSnippetFeedbackModalAssertions.assertLogOpenSmartSnippetFeedbackModal();
      });
    });

    describe('after clicking the backdrop', () => {
      beforeEach(() => {
        SmartSnippetFeedbackModalSelectors.backdrop().click();
      });

      SmartSnippetFeedbackModalAssertions.assertLogCloseSmartSnippetFeedbackModal();
    });

    describe('after selecting an option and clicking submit', () => {
      beforeEach(() => {
        SmartSnippetFeedbackModalSelectors.reasonRadio().first().click();
        SmartSnippetFeedbackModalSelectors.submitButton().click();
      });

      SmartSnippetFeedbackModalAssertions.assertLogSendSpecificSmartSnippetFeedback();
    });

    describe('after selecting other, typing a reason and clicking submit', () => {
      beforeEach(() => {
        SmartSnippetFeedbackModalSelectors.reasonRadio().last().click();
        SmartSnippetFeedbackModalSelectors.detailsInput().type('abc', {
          force: true,
        });
        SmartSnippetFeedbackModalSelectors.submitButton().click();
      });

      SmartSnippetFeedbackModalAssertions.assertLogSendDetailedSmartSnippetFeedback();
    });
  });
});
