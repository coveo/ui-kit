import {
  generateComponentHTML,
  TagProps,
  TestFixture,
} from '../../../fixtures/test-fixture';
import {FacetSelectors} from '../facet/facet-selectors';
import {PopoverSelectors} from './popover-selector';

export const addPopover =
  (facetProps: TagProps = {}) =>
  (env: TestFixture) => {
    const scrollable = generateComponentHTML('atomic-popover');
    scrollable.append(generateComponentHTML('atomic-facet', facetProps));
    env.withElement(scrollable);
  };

export const addPopoverTwoFacets =
  (firstFacetProps: TagProps = {}, secondFacetProps: TagProps = {}) =>
  (env: TestFixture) => {
    const scrollable = generateComponentHTML('atomic-popover');
    scrollable.append(generateComponentHTML('atomic-facet', firstFacetProps));
    scrollable.append(generateComponentHTML('atomic-facet', secondFacetProps));
    env.withElement(scrollable);
  };

export const addPopoverNoFacets = () => (env: TestFixture) => {
  const scrollable = generateComponentHTML('atomic-popover');
  env.withElement(scrollable);
};

export function clickPopoverButton() {
  PopoverSelectors.button().click();
}

export function clickFacetValue(text: string) {
  FacetSelectors.checkboxValueWithText(text).click();
}
