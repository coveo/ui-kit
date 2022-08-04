import {
  generateComponentHTML,
  TagProps,
  TestFixture,
} from '../../../fixtures/test-fixture';
import {PopoverSelectors} from './popover-selector';

export const addPopover =
  (facetProps: TagProps = {}) =>
  (env: TestFixture) => {
    const scrollable = generateComponentHTML('atomic-popover');
    scrollable.append(generateComponentHTML('atomic-facet', facetProps));
    env.withElement(scrollable);
  };

export function clickPopoverButton() {
  PopoverSelectors.button().click();
}
