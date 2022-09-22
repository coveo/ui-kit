import {should} from './common-assertions';
import {DidYouMeanSelectors} from './did-you-mean-selectors';

export function assertDisplayAutoCorrected(display: boolean) {
  it(`${should(display)} display auto corrected text`, () => {
    DidYouMeanSelectors.noResults().should(
      display ? 'be.visible' : 'not.exist'
    );
    DidYouMeanSelectors.autoCorrected().should(
      display ? 'be.visible' : 'not.exist'
    );
  });
}

export function assertDisplayQueryTriggered(display: boolean) {
  it(`${should(display)} display query triggered text`, () => {
    DidYouMeanSelectors.showingResultsFor().should(
      display ? 'be.visible' : 'not.exist'
    );
    DidYouMeanSelectors.searchInsteadFor().should(
      display ? 'be.visible' : 'not.exist'
    );
  });
}

export function assertDisplayDidYouMeanWithButton(display: boolean) {
  it(`${should(
    display
  )} display "did you mean" text with a manual correction button`, () => {
    DidYouMeanSelectors.didYouMean().should(
      display ? 'be.visible' : 'not.exist'
    );
    DidYouMeanSelectors.correctionButton().should(
      display ? 'be.visible' : 'not.exist'
    );
  });
}

export function assertDisplayUndoButton(display: boolean) {
  it(`${should(display)} display a undo button`, () => {
    DidYouMeanSelectors.undoButton().should(
      display ? 'be.visible' : 'not.exist'
    );
  });
}

export function assertLogDidYouMeanClick() {
  it('should log didyoumeanClick to UA', () => {
    cy.expectSearchEvent('didyoumeanClick');
  });
}

export function assertLogQueryTriggerUndo(undoneQuery: string) {
  it('should log the undoQuery to UA', () => {
    cy.expectSearchEvent('undoQuery').then((payload) =>
      expect(payload.customData).to.have.property('undoneQuery', undoneQuery)
    );
  });
}

export function assertHasAutoCorrectOriginalQuery(originalQuery: string) {
  it(`should display the original query ("${originalQuery}")`, () => {
    DidYouMeanSelectors.noResultsOriginalQuery().should(($el) =>
      expect($el.text()).to.equal(originalQuery)
    );
  });
}

export function assertHasAutoCorrectNewQuery(newQuery: string) {
  it(`should display the correction of an automatically corrected query ("${newQuery}")`, () => {
    DidYouMeanSelectors.autoCorrectedNewQuery().should(($el) =>
      expect($el.text()).to.equal(newQuery)
    );
  });
}

export function assertHasManualCorrectNewQuery(newQuery: string) {
  it(`should display a manual correction button with the new query ("${newQuery}")`, () => {
    DidYouMeanSelectors.correctionButton().should(($el) =>
      expect($el.text()).to.equal(newQuery)
    );
  });
}

export function assertHasTriggerOriginalQuery(originalQuery: string) {
  it(`should display an undo button with the original query ("${originalQuery}")`, () => {
    DidYouMeanSelectors.undoButton().should(($el) =>
      expect($el.text()).to.equal(originalQuery)
    );
  });
}

export function assertHasTriggerNewQuery(newQuery: string) {
  it(`should display the correction of a query trigger ("${newQuery}")`, () => {
    DidYouMeanSelectors.showingResultsForNewQuery().should(($el) =>
      expect($el.text()).to.equal(newQuery)
    );
  });
}
