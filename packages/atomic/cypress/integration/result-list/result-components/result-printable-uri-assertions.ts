import {should} from '../../common-assertions';
import {ResultPrintableUriSelectors} from './result-printable-uri-selectors';

export function assertFocusLink(index: number) {
  it(`Should focus on the link at index ${index}`, () => {
    ResultPrintableUriSelectors.links().eq(index).should('be.focused');
  });
}

export function assertDisplayEllipsis(display: boolean) {
  it(`${should(display)} display an ellipsis`, () => {
    ResultPrintableUriSelectors.ellipsisButton().should(
      display ? 'be.visible' : 'not.exist'
    );
  });
}

export function assertDisplayParentsCount(numberOfParentsToDisplay: number) {
  it(`should only display ${numberOfParentsToDisplay} values`, () => {
    ResultPrintableUriSelectors.links()
      .its('length')
      .should('eq', numberOfParentsToDisplay);
  });
}
