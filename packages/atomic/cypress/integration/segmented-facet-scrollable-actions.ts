import {
  TagProps,
  TestFixture,
  generateComponentHTML,
  addElement,
} from '../fixtures/test-fixture';
import {segmentedFacetComponent} from './facets/segmented-facet/segmented-facet-selectors';
import {
  scrollableComponent,
  ScrollableSelectors,
} from './segmented-facet-scrollable-selectors';

type direction = 'right' | 'left';

let scrollable!: HTMLElement;

function appendSegmentedFacet(facetProps: TagProps) {
  scrollable.append(
    generateComponentHTML('atomic-segmented-facet', facetProps)
  );
}

export const addScrollable =
  (facetProps: TagProps = {}) =>
  (env: TestFixture) => {
    scrollable = generateComponentHTML('atomic-segmented-facet-scrollable');
    appendSegmentedFacet(facetProps);
    addElement(env, scrollable);
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
  cy.get(scrollableComponent).trigger('wheel');
}
