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

export function assertDisplayCorrectionButton(display: boolean) {
  it(`${should(display)} display a manual correction button`, () => {
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
