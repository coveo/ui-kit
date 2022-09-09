import {
  TestFixture,
  TagProps,
  generateComponentHTML,
} from '../../../fixtures/test-fixture';

export const label = 'Popover Facet';

export const addPopover =
  (facetTag: string, facetProps: TagProps = {}) =>
  (env: TestFixture) => {
    const popover = generateComponentHTML('atomic-popover');
    const facet = generateComponentHTML(facetTag, facetProps);
    popover.appendChild(facet);
    env.withElement(popover);
  };
