import {should} from './common-assertions';
import {ScrollableSelectors} from './segmented-facet-scrollable-selectors';

export function assertDisplayScrollable(display: boolean) {
  it(`${should(display)} display the scrollable`, () => {
    ScrollableSelectors.wrapper().should(display ? 'be.visible' : 'not.exist');
    ScrollableSelectors.horizontalScroll().should(
      display ? 'be.visible' : 'not.exist'
    );
  });
}

export function assertDisplayArrows(
  displayLeftArrow: boolean,
  displayRightArrow: boolean
) {
  it(`${should(displayLeftArrow)} display the left arrow and ${should(
    displayRightArrow
  )} the right arrow`, () => {
    ScrollableSelectors.leftArrow().should(
      displayLeftArrow ? 'not.have.class' : 'have.class',
      'invisible'
    );
    ScrollableSelectors.rightArrow().should(
      displayRightArrow ? 'not.have.class' : 'have.class',
      'invisible'
    );
  });
}
