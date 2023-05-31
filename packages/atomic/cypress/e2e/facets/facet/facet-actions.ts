import {TestFixture, addTag, TagProps} from '../../../fixtures/test-fixture';
import {FacetSelectors} from './facet-selectors';

export const defaultNumberOfValues = 8;
export const label = 'The objecttype';
export const field = 'objecttype';

export const addFacet =
  (props: TagProps = {}) =>
  (env: TestFixture) =>
    addTag(env, 'atomic-facet', props);

export function selectIdleBoxValueAt(index: number) {
  FacetSelectors.idleBoxValueLabel()
    .eq(index)
    .then((idleValueLabel) => {
      const text = idleValueLabel.text();
      cy.wrap(idleValueLabel).click().wait(2000);
      FacetSelectors.selectedBoxValueWithText(text).should('exist');
    });
}
