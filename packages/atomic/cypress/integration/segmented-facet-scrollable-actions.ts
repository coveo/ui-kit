import {
  TagProps,
  TestFixture,
  generateComponentHTML,
} from '../fixtures/test-fixture';
import {
  scrollableComponent,
  ScrollableSelectors,
} from './segmented-facet-scrollable-selectors';

type direction = 'right' | 'left';

export const addScrollable =
  (facetProps: TagProps = {}) =>
  (env: TestFixture) => {
    const scrollable = generateComponentHTML(
      'atomic-segmented-facet-scrollable'
    );
    scrollable.append(
      generateComponentHTML('atomic-segmented-facet', facetProps)
    );
    env.withElement(scrollable);
  };

export function clickArrow(direction: direction) {
  direction === 'left'
    ? ScrollableSelectors.leftArrow().click()
    : ScrollableSelectors.rightArrow().click();
}

export function scroll(direction: direction, msDuration: number) {
  ScrollableSelectors.horizontalScroll().scrollTo(direction, {
    duration: msDuration,
  });
  cy.get(scrollableComponent).then(([el]) =>
    el.dispatchEvent(new Event('wheel'))
  );
}
