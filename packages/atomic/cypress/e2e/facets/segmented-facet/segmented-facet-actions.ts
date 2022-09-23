import {TestFixture, addTag, TagProps} from '../../../fixtures/test-fixture';
import {SegmentedFacetSelectors} from './segmented-facet-selectors';

export const defaultNumberOfValues = 6;
export const label = 'The Authors';
export const field = 'author';

export const addSegmentedFacet =
  (props: TagProps = {}) =>
  (env: TestFixture) =>
    addTag(env, 'atomic-segmented-facet', props);

export function selectIdleBoxValueAt(index: number) {
  SegmentedFacetSelectors.idleBoxValueLabel()
    .eq(index)
    .then((idleValueLabel) => {
      const text = idleValueLabel.text();
      cy.wrap(idleValueLabel).click();
      SegmentedFacetSelectors.selectedBoxValueWithText(text).should('exist');
    });
}
