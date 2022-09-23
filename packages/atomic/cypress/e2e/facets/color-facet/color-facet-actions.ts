import {TestFixture, addTag, TagProps} from '../../../fixtures/test-fixture';
import {ColorFacetSelectors} from './color-facet-selectors';

export const colorFacetDefaultNumberOfValues = 8;
export const colorFacetLabel = 'File Type';
export const colorFacetField = 'filetype';

export const addColorFacet =
  (props: TagProps = {}) =>
  (env: TestFixture) =>
    addTag(env, 'atomic-color-facet', props);

export function selectIdleBoxValueAt(index: number) {
  ColorFacetSelectors.idleBoxValueLabel()
    .eq(index)
    .then((idleValueLabel) => {
      const text = idleValueLabel.text();
      cy.wrap(idleValueLabel).click();
      ColorFacetSelectors.selectedBoxValueWithText(text).should('exist');
    });
}
