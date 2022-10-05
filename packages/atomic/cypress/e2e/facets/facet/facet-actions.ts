import {TestFixture, addTag, TagProps} from '../../../fixtures/test-fixture';
import {FacetSelectors} from './facet-selectors';

export const defaultNumberOfValues = 8;
export const label = 'The Authors';
export const field = 'author';

export const addFacet =
  (props: TagProps = {}) =>
  (env: TestFixture) =>
    addTag(env, 'atomic-facet', props);

export function selectIdleBoxValueAt(index: number) {
  FacetSelectors.idleBoxValueLabel()
    .eq(index)
    .then((idleValueLabel) => {
      const text = idleValueLabel.text();
      cy.wrap(idleValueLabel).click();
      FacetSelectors.selectedBoxValueWithText(text).should('exist');
    });
}
