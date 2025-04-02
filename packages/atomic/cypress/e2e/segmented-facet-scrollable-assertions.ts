import {should} from './common-assertions';
import {ScrollableSelectors} from './segmented-facet-scrollable-selectors';

export function assertDisplayScrollable(display: boolean) {
  it(`${should(display)} display the scrollable`, () => {
    ScrollableSelectors.wrapper()
      .invoke('outerHeight')
      .should(display ? 'be.gt' : 'be.eq', 0);
  });
}

export function assertDisplayArrows(
  displayLeftArrow: boolean,
  displayRightArrow: boolean
) {
  it(`${should(displayLeftArrow)} display the left arrow and ${should(
    displayRightArrow
  )} display the right arrow`, () => {
    ScrollableSelectors.leftArrowWrapper().should(
      displayLeftArrow ? 'not.have.class' : 'have.class',
      'invisible'
    );
    ScrollableSelectors.rightArrowWrapper().should(
      displayRightArrow ? 'not.have.class' : 'have.class',
      'invisible'
    );
  });
}
