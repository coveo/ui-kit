import {TestFixture} from '../../fixtures/test-fixture';
import {
  FacetWithCheckboxSelector,
  FacetWithLinkSelector,
  FacetWithSearchSelector,
} from './facet-common-assertions';

export function selectIdleCheckboxValueAt(
  FacetWithCheckboxSelector: FacetWithCheckboxSelector,
  index: number
) {
  FacetWithCheckboxSelector.idleCheckboxValue().eq(index).click();
}

export function selectIdleLinkValueAt(
  FacetWithLinkSelector: FacetWithLinkSelector,
  index: number
) {
  FacetWithLinkSelector.idleLinkValue().eq(index).click();
}

export function typeFacetSearchQuery(
  FacetWithSearchSelector: FacetWithSearchSelector,
  query: string
) {
  const characters = Array.from(query);
  characters.forEach((character, index) => {
    // https://github.com/cypress-io/cypress/issues/5827
    FacetWithSearchSelector.searchInput()
      .should('not.be.disabled')
      .type(character, {force: true, delay: 300});
    cy.wait(TestFixture.interceptAliases.FacetSearch);
    console.log('hmm', index, characters.length);
    if (index < characters.length - 1) {
      cy.wait(TestFixture.interceptAliases.UA);
    }
  });
}
