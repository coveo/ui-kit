import {TestFixture} from '../fixtures/test-fixture';
import {
  addDidYouMean,
  addDidYouMeanCorrectionToNextQuery,
  addQueryTriggerCorrectionToNextQuery,
} from './did-you-mean-actions';
import * as DidYouMeanAssertions from './did-you-mean-assertions';
import {DidYouMeanSelectors} from './did-you-mean-selectors';
import {addQuerySummary} from './query-summary-actions';
import * as QuerySummaryAssertions from './query-summary-assertions';
import {addSearchBox} from './search-box/search-box-actions';
import {SearchBoxSelectors} from './search-box/search-box-selectors';

describe('Did You Mean Test Suites', () => {
  const originalQuery = 'test';
  const newQuery = 'shrimp';

  function commonSetup(env: TestFixture) {
    env.with(addSearchBox()).with(addQuerySummary()).with(addDidYouMean());
  }

  function search() {
    SearchBoxSelectors.textArea().type(`${originalQuery}{enter}`, {
      force: true,
      delay: 200,
    });
  }

  describe('with an automatic query correction', () => {
    beforeEach(() => {
      new TestFixture().with(commonSetup).init();
      addDidYouMeanCorrectionToNextQuery(newQuery, true);
      search();
    });

    QuerySummaryAssertions.assertHasQuery(newQuery);
    DidYouMeanAssertions.assertHasAutoCorrectOriginalQuery(originalQuery);
    DidYouMeanAssertions.assertHasAutoCorrectNewQuery(newQuery);
    DidYouMeanAssertions.assertDisplayAutoCorrected(true);
    DidYouMeanAssertions.assertDisplayDidYouMeanWithButton(false);
    DidYouMeanAssertions.assertDisplayQueryTriggered(false);
    DidYouMeanAssertions.assertDisplayUndoButton(false);
  });

  describe('with a manual query correction', () => {
    beforeEach(() => {
      new TestFixture().with(commonSetup).init();
      addDidYouMeanCorrectionToNextQuery(newQuery, false);
      search();
    });

    QuerySummaryAssertions.assertHasQuery(originalQuery);
    DidYouMeanAssertions.assertHasManualCorrectNewQuery(newQuery);
    DidYouMeanAssertions.assertDisplayAutoCorrected(false);
    DidYouMeanAssertions.assertDisplayDidYouMeanWithButton(true);
    DidYouMeanAssertions.assertDisplayQueryTriggered(false);
    DidYouMeanAssertions.assertDisplayUndoButton(false);

    describe('after pressing on the correction button', () => {
      beforeEach(() => {
        DidYouMeanSelectors.correctionButton().click();
      });
      QuerySummaryAssertions.assertHasQuery(newQuery);
      DidYouMeanAssertions.assertDisplayAutoCorrected(false);
      DidYouMeanAssertions.assertDisplayDidYouMeanWithButton(false);
      DidYouMeanAssertions.assertDisplayQueryTriggered(false);
      DidYouMeanAssertions.assertDisplayUndoButton(false);
    });
  });

  describe('after correcting a query', () => {
    beforeEach(() => {
      new TestFixture().with(commonSetup).init();
      addDidYouMeanCorrectionToNextQuery(newQuery, false);
      search();
      DidYouMeanSelectors.correctionButton().click();
    });

    DidYouMeanAssertions.assertLogDidYouMeanClick();
  });

  describe('with a query trigger', () => {
    beforeEach(() => {
      new TestFixture().with(commonSetup).init();
      addQueryTriggerCorrectionToNextQuery(newQuery);
      search();
    });

    QuerySummaryAssertions.assertHasQuery(newQuery);
    DidYouMeanAssertions.assertHasTriggerOriginalQuery(originalQuery);
    DidYouMeanAssertions.assertHasTriggerNewQuery(newQuery);
    DidYouMeanAssertions.assertDisplayDidYouMeanWithButton(false);
    DidYouMeanAssertions.assertDisplayQueryTriggered(true);
    DidYouMeanAssertions.assertDisplayUndoButton(true);

    describe('after pressing on the undo button', () => {
      beforeEach(() => {
        DidYouMeanSelectors.undoButton().click();
      });

      QuerySummaryAssertions.assertHasQuery(originalQuery);
      DidYouMeanAssertions.assertDisplayAutoCorrected(false);
      DidYouMeanAssertions.assertDisplayDidYouMeanWithButton(false);
      DidYouMeanAssertions.assertDisplayQueryTriggered(false);
      DidYouMeanAssertions.assertDisplayUndoButton(false);
    });
  });

  describe('after undoing a query', () => {
    beforeEach(() => {
      new TestFixture().with(commonSetup).init();
      addQueryTriggerCorrectionToNextQuery(newQuery);
      search();
      DidYouMeanSelectors.undoButton().click();
    });

    DidYouMeanAssertions.assertLogQueryTriggerUndo(newQuery);
  });
});
