import {TestFixture, addTag, TagProps} from '../../../fixtures/test-fixture';
import {FacetSelectors} from './facet-selectors';

export const defaultNumberOfValues = 8;
export const label = 'The Authors';
export const field = 'author';

export const addFacet = (props: TagProps = {}) => (env: TestFixture) =>
  addTag(env, 'atomic-facet-v1', props);

export function selectIdleCheckboxValueAt(index: number) {
  FacetSelectors.idleCheckboxValue().eq(index).click();
}

export function selectIdleLinkValueAt(index: number) {
  FacetSelectors.idleLinkValue().eq(index).click();
}

export function selectIdleBoxValueAt(index: number) {
  FacetSelectors.idleBoxValue().eq(index).click();
}

export function typeFacetSearchQuery(query: string) {
  const characters = Array.from(query);
  characters.forEach((character, index) => {
    // https://github.com/cypress-io/cypress/issues/5827
    FacetSelectors.searchInput()
      .should('not.be.disabled')
      .type(character, {force: true, delay: 100});
    cy.wait(TestFixture.interceptAliases.FacetSearch);
    if (index < characters.length) {
      cy.wait(TestFixture.interceptAliases.UA);
    }
  });
}
