import {should} from '../common-assertions';
import {
  BaseFacetSelector,
  FacetWithCheckboxSelector,
  FacetWithLinkSelector,
} from '../facets/facet-common-assertions';
import {BreadboxSelectors} from './breadbox-selectors';
import {TestFixture} from '../../fixtures/test-fixture';
import {deselectBreadcrumbAtIndex} from './breadbox-actions';
import {ColorFacetSelectors} from '../facets/color-facet/color-facet-selectors';
import {CategoryFacetSelectors} from '../facets/category-facet/category-facet-selectors';
import {label} from '../facets/facet/facet-actions';
import {timeframeFacetLabel} from '../facets/timeframe-facet/timeframe-facet-action';
import {colorFacetLabel} from '../facets/color-facet/color-facet-actions';
import {categoryFacetLabel} from '../facets/category-facet/category-facet-actions';

export function assertDisplayBreadcrumb(display: boolean) {
  it(`${should(display)} display the breadcrumb`, () => {
    BreadboxSelectors.wrapper().should(display ? 'be.visible' : 'not.exist');
  });
}

export function assertBreadcrumbLabel(label: string) {
  it(`should have the label "${label}"`, () => {
    BreadboxSelectors.breadboxLabel().contains(label);
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
      `${categoryFacetLabel}${joinedPath}`
    );
  });
}

function assertBreadcrumbValueText(facetSelector: string, facetLabel: string) {
  cy.getTextOfAllElements(facetSelector).then((facetValues) => {
    facetValues.forEach((element: string) => {
      BreadboxSelectors.breadcrumbButton().contains(`${facetLabel}${element}`);
    });
  });
}

export function assertSelectedCheckboxFacetsInBreadcrumb(
  BaseFacetSelector: FacetWithCheckboxSelector,
  facetLabelValue = label
) {
  it('should display the selected checkbox facets in the breadcrumbs', () => {
    BaseFacetSelector.selectedCheckboxValue()
      .parent()
      .find('[part="value-label"]')
      .as('facetAllValuesLabel');
    assertBreadcrumbValueText('@facetAllValuesLabel', facetLabelValue);
  });
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
  BaseFacetSelector: BaseFacetSelector,
  index: number
) {
  it('should be deselected after removing from breadcrumb list', () => {
    BreadboxSelectors.breadcrumbValueAtIndex(index)
      .invoke('text')
      .then((value) => {
        deselectBreadcrumbAtIndex(index);
        BaseFacetSelector.valueLabel()
          .contains(value)
          .parent()
          .parent()
          .find('[part="value-checkbox"]')
          .should('have.attr', 'aria-checked', 'false');
      });
  });
}

export function assertDeselectCategoryFacet(index: number) {
  it('should be deselected after removing from breadcrumb list', () => {
    deselectBreadcrumbAtIndex(index);
    CategoryFacetSelectors.activeParentValue().should('not.exist');
  });
}

export function assertDeselectLinkFacet(
  FacetWithLinkSelector: FacetWithLinkSelector,
  index: number
) {
  it('should be deselected after removing from breadcrumb list', () => {
    BreadboxSelectors.breadcrumbValueAtIndex(index)
      .invoke('text')
      .then((value) => {
        deselectBreadcrumbAtIndex(index);
        FacetWithLinkSelector.selectedLinkValue()
          .contains(value)
          .parent()
          .parent()
          .find('[part="value-link"]')
          .should('have.attr', 'aria-pressed', 'false');
      });
  });
}

export function assertDeselectColorFacet(index: number) {
  it('should be deselected after removing from breadcrumb list', () => {
    BreadboxSelectors.breadcrumbValueAtIndex(index)
      .invoke('text')
      .then((value) => {
        deselectBreadcrumbAtIndex(index);
        ColorFacetSelectors.valueLabel()
          .contains(value)
          .parent()
          .parent()
          .find('[part="value-box"]')
          .should('have.attr', 'aria-pressed', 'false');
      });
  });
}

export function assertLogBreadcrumbFacet(field: string) {
  it('should log the breadcrumb facet to UA', () => {
    cy.wait(TestFixture.interceptAliases.UA).then((intercept) => {
      const analyticsBody = intercept.request.body;
      expect(analyticsBody).to.have.property('actionCause', 'breadcrumbFacet');
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
    cy.wait(TestFixture.interceptAliases.UA).then((intercept) => {
      const analyticsBody = intercept.request.body;
      expect(analyticsBody).to.have.property(
        'actionCause',
        'breadcrumbResetAll'
      );
    });
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

export function assertFocusBreadcrumb(index: number) {
  it(`Should focus on the breadcrumb at index ${index}`, () => {
    BreadboxSelectors.breadcrumbButton().eq(index).should('be.focused');
  });
}

export function assertFocusClearAll() {
  it('Should focus on the clear all button', () => {
    BreadboxSelectors.clearAllButton().should('be.focused');
  });
}
