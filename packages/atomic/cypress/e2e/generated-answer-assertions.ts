import {TestFixture} from '../fixtures/test-fixture';
import {AnalyticsTracker} from '../utils/analyticsUtils';
import {should} from './common-assertions';

export function assertLogOpenGeneratedAnswerSource(log: boolean) {
  it(`${should(log)} log a openGeneratedAnswerSource click event`, () => {
    if (log) {
      cy.expectCustomEvent('generatedAnswer', 'openGeneratedAnswerSource');
    } else {
      cy.wait(50);
      cy.wrap(AnalyticsTracker)
        .invoke('getLastCustomEvent')
        .should('not.exist');
    }
  });
}

export function assertAnswerStyle(expected: string) {
  cy.wait(TestFixture.interceptAliases.Search).should((firstSearch) => {
    expect(
      firstSearch.request.body.pipelineRuleParameters.genqa.responseFormat
    ).to.have.property('answerStyle', expected);
  });
}
