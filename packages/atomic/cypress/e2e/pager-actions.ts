import {TagProps, generateComponentHTML} from '../fixtures/fixture-common';
import {TestFixture} from '../fixtures/test-fixture';
import {pagerComponent, PagerSelectors} from './pager-selectors';

export const addPager =
  (props: TagProps = {}) =>
  (env: TestFixture) => {
    env.withElement(generateComponentHTML(pagerComponent, props));
  };

function pressRelativePageButton(
  pressButton: () => void,
  relativePage: number
) {
  PagerSelectors.buttonActivePage().then((activePageButton) => {
    const activePage = parseInt(activePageButton.attr('value')!);
    pressButton();
    PagerSelectors.buttonActivePage().should(
      'have.value',
      activePage + relativePage
    );
  });
}

export function pressPagerNext() {
  pressRelativePageButton(() => PagerSelectors.buttonNext().click(), 1);
}

export function pressPagerPrevious() {
  pressRelativePageButton(() => PagerSelectors.buttonPrevious().click(), -1);
}

export function pressPagerNumber(pageNumber: number) {
  PagerSelectors.pageButton(pageNumber).click();
  PagerSelectors.buttonActivePage().should('have.value', pageNumber);
}
