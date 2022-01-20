import {TestFixture} from '../../fixtures/test-fixture';
import {
  BaseFacetSelector,
  FacetWithCheckboxSelector,
  FacetWithLinkSelector,
  FacetWithSearchSelector,
  FacetWithShowMoreLessSelector,
} from './facet-common-assertions';

export function selectIdleCheckboxValueAt(
  FacetWithCheckboxSelector: FacetWithCheckboxSelector,
  index: number
) {
  FacetWithCheckboxSelector.idleCheckboxValueLabel()
    .eq(index)
    .then((idleCheckboxValueLabel) => {
      const hasAriaLabel = !!idleCheckboxValueLabel.attr('aria-label');
      const text = hasAriaLabel
        ? idleCheckboxValueLabel.attr('aria-label')!
        : idleCheckboxValueLabel.text();
      FacetWithCheckboxSelector.idleCheckboxValueLabel()
        .filter(
          hasAriaLabel ? `[aria-label="${text}"]` : `:contains("${text}")`
        )
        .its('length')
        .should(
          'eq',
          1,
          'There should not be any other value similar to this one.'
        );
      cy.wrap(idleCheckboxValueLabel).click();
      FacetWithCheckboxSelector.checkboxValueWithText(text).should(
        'have.attr',
        'aria-checked',
        'true'
      );
    });
}

export function selectIdleLinkValueAt(
  FacetWithLinkSelector: FacetWithLinkSelector,
  index: number
) {
  FacetWithLinkSelector.idleLinkValueLabel()
    .eq(index)
    .then((idleLinkValueLabel) => {
      const hasAriaLabel = !!idleLinkValueLabel.attr('aria-label');
      const text = hasAriaLabel
        ? idleLinkValueLabel.attr('aria-label')!
        : idleLinkValueLabel.text();
      FacetWithLinkSelector.idleLinkValueLabel()
        .filter(
          hasAriaLabel ? `[aria-label="${text}"]` : `:contains("${text}")`
        )
        .its('length')
        .should(
          'eq',
          1,
          'There should not be any other value similar to this one.'
        );
      cy.wrap(idleLinkValueLabel).click();
      FacetWithLinkSelector.selectedLinkValueWithText(text).should('exist');
    });
}

export function typeFacetSearchQuery(
  FacetWithSearchSelector: FacetWithSearchSelector,
  query: string,
  shouldFindResults: boolean
) {
  // https://github.com/cypress-io/cypress/issues/5827
  Array.from(query).forEach((character) => {
    FacetWithSearchSelector.searchInput()
      .should('not.be.disabled')
      .type(character, {force: true, delay: 300});
  });
  if (shouldFindResults) {
    FacetWithSearchSelector.valueHighlight()
      .first()
      .contains(query, {matchCase: false});
  } else {
    FacetWithSearchSelector.noMatches().contains(query);
  }
}
export function pressShowMore(
  FacetShowMoreSelector: BaseFacetSelector & FacetWithShowMoreLessSelector
) {
  FacetShowMoreSelector.values()
    .children()
    .its('length')
    .then((valuesCount) => {
      FacetShowMoreSelector.showMoreButton().click();
      FacetShowMoreSelector.values()
        .children()
        .should('have.length.greaterThan', valuesCount);
    });
}

export function pressShowLess(
  FacetShowLessSelector: BaseFacetSelector & FacetWithShowMoreLessSelector
) {
  FacetShowLessSelector.values()
    .children()
    .its('length')
    .then((valuesCount) => {
      FacetShowLessSelector.showLessButton().click();
      FacetShowLessSelector.values()
        .children()
        .should('have.length.lessThan', valuesCount);
    });
}

export function pressLabelButton(
  BaseFacetSelector: BaseFacetSelector,
  shouldBecomeCollapsed: boolean
) {
  BaseFacetSelector.labelButton().click();
  BaseFacetSelector.values().should(
    shouldBecomeCollapsed ? 'not.exist' : 'exist'
  );
}

export function pressClearButton(BaseFacetSelector: BaseFacetSelector) {
  BaseFacetSelector.clearButton().click();
  BaseFacetSelector.clearButton().should('not.exist');
}

export function pressClearSearchButton(
  FacetWithSearchSelector: FacetWithSearchSelector
) {
  FacetWithSearchSelector.searchClearButton().click();
  FacetWithSearchSelector.searchClearButton().should('not.exist');
}
