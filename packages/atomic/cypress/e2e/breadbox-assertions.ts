import {deselectBreadcrumbAtIndex} from './breadbox-actions';
import {BreadboxSelectors} from './breadbox-selectors';
import {should} from './common-assertions';

const categoryFacetLabel = 'Atlas';
import {colorFacetLabel} from './facets/color-facet/color-facet-actions';
import {ColorFacetSelectors} from './facets/color-facet/color-facet-selectors';
import {
  FacetWithCheckboxSelector,
  FacetWithLinkSelector,
} from './facets/facet-common-assertions';
import {label} from './facets/facet/facet-actions';
import {timeframeFacetLabel} from './facets/timeframe-facet/timeframe-facet-action';

export function assertDisplayBreadcrumb(display: boolean) {
  it(`${should(display)} display the breadcrumb`, () => {
    BreadboxSelectors.wrapper().should(display ? 'be.visible' : 'not.exist');
  });
}

export function assertAriaLabel(includeOrExclude: 'inclusion' | 'exclusion') {
  it(`should have aria-label "${includeOrExclude} filter"`, () => {
    BreadboxSelectors.breadcrumbButton()
      .should('have.attr', 'aria-label')
      .and('include', `Remove ${includeOrExclude} filter on`);
  });
}

export function assertBreadcrumbLabel(label: string) {
  it(`should have the label "${label}"`, () => {
    BreadboxSelectors.breadboxLabel().contains(label);
  });
}

export function assertBreadcrumbButtonValue(label: string) {
  it(`should have the button value"${label}"`, () => {
    BreadboxSelectors.breadcrumbButtonValue().should('have.text', label);
  });
}

export function assertDisplayBreadcrumbClearAllButton(display: true) {
  it(`${should(display)} display a "Clear filter" button`, () => {
    BreadboxSelectors.clearAllButton().should(
      display ? 'be.visible' : 'not.exist'
    );
  });
}

export function assertDisplayBreadcrumbShowMore(display: boolean) {
  it(`${should(display)} display the breadcrumb show more button`, () => {
    BreadboxSelectors.breadcrumbShowMoreButton().should(
      display ? 'be.visible' : 'not.be.visible'
    );
  });
}

export function assertDisplayBreadcrumbShowLess(display: boolean) {
  it(`${should(display)} display the breadcrumb show less button`, () => {
    BreadboxSelectors.breadcrumbShowLessButton().should(
      display ? 'be.visible' : 'not.exist'
    );
  });
}

export function assertRemoveBreadcrumbShowMoreInDOM() {
  it('should not contain the breadcrumb show more button in DOM', () => {
    BreadboxSelectors.breadcrumbShowMoreButton().should('not.exist');
  });
}

export function assertDisplayBreadcrumbClearIcon() {
  it('should display a "Clear" icon next to each facetValue', () => {
    BreadboxSelectors.breadcrumbClearFacetValueButton()
      .its('length')
      .then((count) => {
        for (let i = 0; i < count; i++) {
          BreadboxSelectors.breadcrumbClearFacetValueButtonAtIndex(i).should(
            'be.visible'
          );
        }
      });
  });
}

export function assertCategoryPathInBreadcrumb(path: string[]) {
  const ellipsedPath =
    path.length > 3 ? path.slice(0, 1).concat(['...'], path.slice(-2)) : path;
  const joinedPath = ellipsedPath.join(' / ');

  it(`should display the selected path "${joinedPath}" in the breadcrumbs`, () => {
    BreadboxSelectors.breadcrumbButton().contains(
      `${categoryFacetLabel}:${joinedPath}`
    );
  });
}

function assertBreadcrumbValueText(facetSelector: string, facetLabel: string) {
  cy.getTextOfAllElements(facetSelector).then((facetValues) => {
    facetValues.forEach((element: string) => {
      BreadboxSelectors.breadcrumbButtonLabel().contains(facetLabel);
      BreadboxSelectors.breadcrumbButtonValue().contains(element);
    });
  });
}

/**
 * @deprecated use assertSelectedCheckboxFacetsInBreadcrumbAssertions instead
 */
export function assertSelectedCheckboxFacetsInBreadcrumb(
  BaseFacetSelector: FacetWithCheckboxSelector,
  facetLabelValue = label
) {
  it('should display the selected checkbox facets in the breadcrumbs', () => {
    assertSelectedCheckboxFacetsInBreadcrumbAssertions(
      BaseFacetSelector,
      facetLabelValue
    );
  });
}

export function assertExcludedCheckboxFacetsInBreadcrumb(
  BaseFacetSelector: FacetWithCheckboxSelector,
  facetLabelValue = label
) {
  it('should display the excluded checkbox facets in the breadcrumbs', () => {
    BaseFacetSelector.excludedCheckboxValue()
      .parent()
      .find('[part="value-label"]')
      .as('facetAllValuesLabel');
    assertBreadcrumbValueText('@facetAllValuesLabel', facetLabelValue);
  });
}

export function assertSelectedCheckboxFacetsInBreadcrumbAssertions(
  BaseFacetSelector: FacetWithCheckboxSelector,
  facetLabelValue = label
) {
  BaseFacetSelector.selectedCheckboxValue()
    .parent()
    .find('[part="value-label"]')
    .as('facetAllValuesLabel');
  assertBreadcrumbValueText('@facetAllValuesLabel', facetLabelValue);
}

export function assertSelectedLinkFacetsInBreadcrumb(
  FacetWithLinkSelector: FacetWithLinkSelector,
  facetLabelValue = timeframeFacetLabel
) {
  it('should display the selected link facets in the breadcrumbs', () => {
    FacetWithLinkSelector.selectedLinkValue()
      .parent()
      .find('[part="value-label"]')
      .as('facetAllValuesLabel');
    assertBreadcrumbValueText('@facetAllValuesLabel', facetLabelValue);
  });
}

export function assertSelectedColorFacetsInBreadcrumb(
  facetLabelValue = colorFacetLabel
) {
  it('should display the selected color facets in the breadcrumbs', () => {
    ColorFacetSelectors.selectedBoxValue()
      .parent()
      .find('[part="value-label"]')
      .as('facetAllValuesLabel');
    assertBreadcrumbValueText('@facetAllValuesLabel', facetLabelValue);
  });
}

export function assertDeselectCheckboxFacet(
  FacetWithCheckboxSelector: FacetWithCheckboxSelector,
  index: number
) {
  it('should be deselected after removing from breadcrumb list', () => {
    BreadboxSelectors.breadcrumbValueAtIndex(index)
      .invoke('text')
      .then((value) => {
        deselectBreadcrumbAtIndex(index);
        FacetWithCheckboxSelector.checkboxValueWithText(value).should(
          'have.attr',
          'aria-checked',
          'false'
        );
      });
  });
}

export function assertDeselectLinkFacet(
  FacetWithLinkSelector: FacetWithLinkSelector,
  index: number
) {
  it('should be deselected after removing from breadcrumb list', () => {
    BreadboxSelectors.breadcrumbValueAtIndex(index)
      .invoke('text')
      .then((text) => {
        deselectBreadcrumbAtIndex(index);
        FacetWithLinkSelector.selectedLinkValueWithText(text).should(
          'not.exist'
        );
      });
  });
}

export function assertLogBreadcrumbFacet(field: string) {
  it('should log the breadcrumb facet to UA', () => {
    cy.expectSearchEvent('breadcrumbFacet').then((analyticsBody) => {
      expect(analyticsBody.customData).to.have.property('facetField', field);
    });
  });
}

export function assertLogBreadcrumbCategoryFacet(field: string) {
  it('should log the breadcrumb facet to UA', () => {
    cy.expectSearchEvent('breadcrumbFacet').then((analyticsBody) => {
      expect(analyticsBody?.customData).to.have.property(
        'categoryFacetField',
        field
      );
    });
  });
}

export function assertLogBreadcrumbClearAll() {
  it('should log the breadcrumb facet clearAll to UA', () => {
    cy.expectSearchEvent('breadcrumbResetAll');
  });
}

export function assertBreadcrumbDisplayLength(number: number) {
  it(`should display ${number} number of values in breadcrumb`, () => {
    BreadboxSelectors.breadcrumbButton().its('length').should('eq', number);
  });
}

export function assertDisplayAllBreadcrumb(display: boolean) {
  it(`should  ${display ? '' : 'not'} display all values in breadcrumb`, () => {
    BreadboxSelectors.breadcrumbButton()
      .parent()
      .parent()
      .find('li[style="display: none;"]')
      .should(display ? 'not.exist' : 'exist');
  });
}

export function assertFocusShowMore() {
  it('Should focus on the show more button', () => {
    BreadboxSelectors.breadcrumbShowMoreButton().should('be.focused');
  });
}

export function assertFocusBreadcrumb(index: number | string) {
  it(`Should focus on the breadcrumb at index ${index}`, () => {
    function assert(indexAsNumber: number) {
      BreadboxSelectors.breadcrumbButton()
        .eq(indexAsNumber)
        .should('be.focused');
    }
    if (typeof index === 'string') {
      cy.get<number>(index).then((indexAsNumber) => assert(indexAsNumber));
    } else {
      assert(index);
    }
  });
}

export function assertFocusClearAll() {
  it('Should focus on the clear all button', () => {
    BreadboxSelectors.clearAllButton().should('be.focused');
  });
}
