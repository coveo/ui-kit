import {should} from '../common-assertions';
import {
  BaseFacetSelector,
  FacetWithCheckboxSelector,
  FacetWithLinkSelector,
} from '../facets/facet-common-assertions';
import {BreadboxSelectors} from './breadbox-selectors';
import {TestFixture} from '../../fixtures/test-fixture';
import {unselectBreadcrumbAtIndex} from './breadbox-actions';
import {ColorFacetSelectors} from '../facets/color-facet/color-facet-selectors';
import {CategoryFacetSelectors} from '../facets/category-facet/category-facet-selectors';

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

export function assertDisplayBreadcrumbClearIcon() {
  it('should display a "Clear" icon next to each facetValue', () => {
    BreadboxSelectors.breadcrumbClearFacetValueButton()
      .its('length')
      .then((count) => {
        console.log(count);
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
  console.log(path);

  it(`should display the selected path "${joinedPath}" in the breadcrumbs`, () => {
    BreadboxSelectors.breadcrumbButton().first().contains(joinedPath);
  });
}

export function assertSelectedCheckboxFacetsInBreadcrumb(
  BaseFacetSelector: FacetWithCheckboxSelector
) {
  it('should display the selected checkbox facets in the breadcrumbs', () => {
    BreadboxSelectors.breadcrumbButtonValue().as('breadcrumbAllValues');
    BaseFacetSelector.selectedCheckboxValue()
      .parent()
      .find('[part="value-label"]')
      .as('facetAllValuesLabel');
    cy.getTextOfAllElements('@breadcrumbAllValues').then((breadcrumbValues) => {
      console.log(breadcrumbValues);
      cy.getTextOfAllElements('@facetAllValuesLabel').then((facetValues) => {
        expect(breadcrumbValues).to.eqls(facetValues);
      });
    });
  });
}

export function assertSelectedLinkFacetsInBreadcrumb(
  FacetWithLinkSelector: FacetWithLinkSelector
) {
  it('should display the selected link facets in the breadcrumbs', () => {
    BreadboxSelectors.breadcrumbButtonValue().as('breadcrumbAllValues');
    FacetWithLinkSelector.selectedLinkValue()
      .parent()
      .find('[part="value-label"]')
      .as('facetAllValuesLabel');
    cy.getTextOfAllElements('@breadcrumbAllValues').then((breadcrumbValues) => {
      console.log(breadcrumbValues);
      cy.getTextOfAllElements('@facetAllValuesLabel').then((facetValues) => {
        expect(breadcrumbValues).to.eqls(facetValues);
      });
    });
  });
}

export function assertSelectedColorFacetsInBreadcrumb() {
  it('should display the selected color facets in the breadcrumbs', () => {
    BreadboxSelectors.breadcrumbButtonValue().as('breadcrumbAllValues');
    ColorFacetSelectors.selectedBoxValue()
      .parent()
      .find('[part="value-label"]')
      .as('facetAllValuesLabel');
    cy.getTextOfAllElements('@breadcrumbAllValues').then((breadcrumbValues) => {
      cy.getTextOfAllElements('@facetAllValuesLabel').then((originalValues) => {
        expect(breadcrumbValues).to.eql(originalValues);
      });
    });
  });
}

export function assertUnselectCheckboxFacet(
  BaseFacetSelector: BaseFacetSelector,
  index: number
) {
  it('should be unselected after removing from breadcrumb list', () => {
    BreadboxSelectors.breadcrumbValueAtIndex(index)
      .invoke('text')
      .then((value) => {
        unselectBreadcrumbAtIndex(index);
        BaseFacetSelector.valueLabel()
          .contains(value)
          .parent()
          .parent()
          .find('[part="value-checkbox"]')
          .should('have.attr', 'aria-checked', 'false');
      });
  });
}

export function assertUnselectCategoryFacet(index: number) {
  it('should be unselected after removing from breadcrumb list', () => {
    unselectBreadcrumbAtIndex(index);
    CategoryFacetSelectors.activeParentValue().should('not.exist');
  });
}

export function assertUnselectLinkFacet(
  FacetWithLinkSelector: FacetWithLinkSelector,
  index: number
) {
  it('should be unselected after removing from breadcrumb list', () => {
    BreadboxSelectors.breadcrumbValueAtIndex(index)
      .invoke('text')
      .then((value) => {
        unselectBreadcrumbAtIndex(index);
        FacetWithLinkSelector.selectedLinkValue()
          .contains(value)
          .parent()
          .parent()
          .find('[part="value-link"]')
          .should('have.attr', 'aria-pressed', 'false');
      });
  });
}

export function assertUnselectColorFacet(index: number) {
  it('should be unselected after removing from breadcrumb list', () => {
    BreadboxSelectors.breadcrumbValueAtIndex(index)
      .invoke('text')
      .then((value) => {
        unselectBreadcrumbAtIndex(index);
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
    cy.wait(TestFixture.interceptAliases.UA).then((intercept) => {
      const analyticsBody = intercept.request.body;
      expect(analyticsBody).to.have.property('actionCause', 'breadcrumbFacet');
      expect(analyticsBody.customData).to.have.property(
        'categoryFacetField',
        field
      );
    });
  });
}

export function assertBreadcrumbDisplayLength(number: number) {
  it(`should display ${number} number of values in breadcrumb`, () => {
    BreadboxSelectors.breadcrumbButton().its('length').should('eq', number);
  });
}
