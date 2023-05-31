import {
  TestFixture,
  TagProps,
  generateComponentHTML,
} from '../../../fixtures/test-fixture';

export const label = 'Popover Facet';

export const addPopover =
  (facetTag: string, facetProps: TagProps = {}, children?: HTMLElement[]) =>
  (env: TestFixture) => {
    const popover = generateComponentHTML('atomic-popover');
    const facet = generateComponentHTML(facetTag, facetProps);
    if (children) {
      facet.append(...children);
    }
    popover.appendChild(facet);
    env.withElement(popover);
  };
