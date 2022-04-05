import {TestFixture} from '../fixtures/test-fixture';
import {addQueryError} from './query-error-actions';
import * as CommonAssertions from './common-assertions';
import {QueryErrorSelectors} from './query-error-selectors';

describe('Query Error Test Suites', () => {
  describe("when there's an error", () => {
    beforeEach(() => {
      new TestFixture().with(addQueryError()).withError().init();
    });

    CommonAssertions.assertAriaLiveMessage('wrong');

    it('should display an error title', () => {
      QueryErrorSelectors.errorTitle()
        .should('exist')
        .should('be.visible')
        .contains('Something went wrong');
    });

    it('should display an error description', () => {
      QueryErrorSelectors.errorDescription()
        .should('exist')
        .should('be.visible')
        .contains('If the problem persists contact the administrator.');
    });

    it('should display an icon', () => {
      QueryErrorSelectors.icon().should('exist').should('be.visible');
    });

    it('should render a show more info button that displays error information on click', () => {
      QueryErrorSelectors.moreInfoMessage().should('not.exist');

      QueryErrorSelectors.moreInfoBtn().should('exist').click();
      QueryErrorSelectors.moreInfoMessage()
        .should('exist')
        .contains('statusText": "I\'m a Teapot"');
    });
  });
});
