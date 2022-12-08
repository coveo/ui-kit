import {
  doSortAlphanumeric,
  doSortOccurrences,
} from '../../../utils/componentUtils';
import {should} from '../../common-assertions';
import {ResultListSelectors} from '../../result-list/result-list-selectors';
import {hierarchicalField} from './category-facet-actions';
import {CategoryFacetSelectors} from './category-facet-selectors';

export type ExpectedHierarchyValues = {type: 'values'; valueLabels: string[]};
export type ExpectedHierarchyActiveValue = {
  type: 'active-value';
  valueLabel: string;
  children: ExpectedHierarchy;
};
export type ExpectedHierarchySubParent = {
  type: 'sub-parent';
  valueLabel: string;
  children: ExpectedHierarchy;
};
export type ExpectedHierarchyRoot = {
  type: 'hierarchy-root';
  children: ExpectedHierarchy;
};
export type ExpectedHierarchy =
  | ExpectedHierarchySubParent
  | ExpectedHierarchyActiveValue
  | ExpectedHierarchyValues
  | ExpectedHierarchyRoot;

export function assertNumberOfChildValues(value: number) {
  it(`should display ${value} number of idle link values`, () => {
    if (value > 0) {
      CategoryFacetSelectors.childValue().its('length').should('eq', value);
      return;
    }

    CategoryFacetSelectors.childValue().should('not.exist');
  });
}

export function assertNumberOfParentValues(value: number) {
  it(`should display ${value} number of parent values`, () => {
    CategoryFacetSelectors.activeParentValue().should(
      value > 0 ? 'be.visible' : 'not.exist'
    );

    if (value <= 1) {
      CategoryFacetSelectors.parentValue().should('not.exist');
      return;
    }

    CategoryFacetSelectors.parentValue()
      .its('length')
      .should('eq', value - 1);
  });
}

export function assertPathInUrl(path: string[]) {
  const categoryFacetListInUrl = path.join(',');
  it(`should display the selected path "${categoryFacetListInUrl}" in the url`, () => {
    const urlHash = `#cf-${hierarchicalField}=${encodeURI(
      categoryFacetListInUrl
    )}`;
    cy.url().should('include', urlHash);
  });
}

export function assertNoPathInUrl() {
  it('should not display a selected path in the url', () => {
    cy.url().should('not.include', '#cf');
  });
}

export function assertLogFacetSelect(path: string[]) {
  it('should log the facet selection to UA', () => {
    cy.expectSearchEvent('facetSelect').then((analyticsBody) => {
      expect(analyticsBody.customData).to.have.property(
        'facetValue',
        path.join(';')
      );
      expect(analyticsBody.customData).to.have.property(
        'facetField',
        hierarchicalField
      );

      expect(analyticsBody.facetState?.[0]).to.have.property(
        'state',
        'selected'
      );
      expect(analyticsBody.facetState?.[0]).to.have.property(
        'field',
        hierarchicalField
      );
      expect(analyticsBody.facetState?.[0]).to.have.property(
        'facetType',
        'hierarchical'
      );
    });
  });
}

export function assertLogFacetShowMore() {
  it('should log the facet show more results to UA', () => {
    cy.expectCustomEvent('facet').then((analyticsBody) => {
      expect(analyticsBody).to.have.property(
        'eventValue',
        'showMoreFacetResults'
      );
      expect(analyticsBody.customData).to.have.property(
        'facetField',
        hierarchicalField
      );
    });
  });
}

export function assertLogClearFacetValues() {
  it('should log the facet clear all to UA', () => {
    cy.expectSearchEvent('facetClearAll').then((analyticsBody) => {
      expect(analyticsBody?.customData).to.have.property(
        'facetField',
        hierarchicalField
      );
    });
  });
}

export function assertLogFacetShowLess() {
  it('should log the facet show less results to UA', () => {
    cy.expectCustomEvent('facet').then((analyticsBody) => {
      expect(analyticsBody).to.have.property(
        'eventValue',
        'showLessFacetResults'
      );
      expect(analyticsBody.customData).to.have.property(
        'facetField',
        hierarchicalField
      );
    });
  });
}

export function assertValuesSortedByOccurrences() {
  it('values should be ordered by occurrences', () => {
    CategoryFacetSelectors.valueCount().as('categoryFacetAllValuesCount');
    cy.getTextOfAllElements('@categoryFacetAllValuesCount').then(
      (originalValues) => {
        expect(originalValues).to.eql(doSortOccurrences(originalValues));
      }
    );
  });
}

export function assertValuesSortedAlphanumerically() {
  it('values should be ordered alphanumerically', () => {
    CategoryFacetSelectors.valueLabel().as('categoryFacetAllValuesLabel');
    cy.getTextOfAllElements('@categoryFacetAllValuesLabel').then(
      (originalValues) => {
        expect(originalValues).to.eql(doSortAlphanumeric(originalValues));
      }
    );
  });
}

export function assertFirstChildContains(value: string) {
  it(`first child value should contain ${value}`, () => {
    CategoryFacetSelectors.childValue().first().contains(value);
  });
}

export function assertNumberOfSearchResults(numberOfResults: number) {
  it(`should have ${numberOfResults} search results`, () => {
    ResultListSelectors.result().should('have.length', numberOfResults);
  });
}

export function assertDisplaySearchInput(display: boolean) {
  it(`${should(display)} display a the facet search input`, () => {
    CategoryFacetSelectors.searchInput().should(
      display ? 'be.visible' : 'not.exist'
    );
  });
}

export function assertNumberOfFacetSearchResults(value: number) {
  it(`should display ${value} number of facet search results`, () => {
    if (value > 0) {
      CategoryFacetSelectors.searchResult().its('length').should('eq', value);
      return;
    }

    CategoryFacetSelectors.searchResult().should('not.exist');
  });
}

export function assertDisplayAllCategoriesButton(display: boolean) {
  it(`${should(display)} display an "All Categories" button`, () => {
    CategoryFacetSelectors.allCategoriesButton().should(
      display ? 'be.visible' : 'not.exist'
    );
  });
}

export function assertHierarchy(expectedHierarchy: ExpectedHierarchy) {
  function expectMatchHierarchy(
    containerElement: HTMLUListElement,
    hierarchy: ExpectedHierarchy
  ) {
    const buttons = Array.from(
      containerElement.children as HTMLCollectionOf<HTMLLIElement>
    ).map((el) => Array.from(el.children)[0] as HTMLButtonElement);
    const nextContainer = containerElement.querySelector('ul');

    const getValueLabel = (button: HTMLButtonElement) =>
      button.querySelector<HTMLElement>('[part~="value-label"]')!.innerText;

    switch (hierarchy.type) {
      case 'hierarchy-root':
        expect(Array.from(containerElement.part)).to.contain(
          'parents',
          'the root container must have the correct part'
        );
        expect(buttons).to.have.lengthOf(
          1,
          'the root container must only contain one button'
        );
        expect(Array.from(buttons[0].part)).to.contain(
          'all-categories-button',
          'the root button must contain the correct part'
        );
        if (hierarchy.children) {
          expect(nextContainer).not.to.equal(
            null,
            'the root container must contain another container'
          );
          expectMatchHierarchy(nextContainer!, hierarchy.children);
        }
        break;
      case 'sub-parent':
        expect(Array.from(containerElement.part)).to.contain(
          'sub-parents',
          'a sub-parents container must contain the correct part'
        );
        expect(buttons).to.have.lengthOf(
          1,
          'a sub-parents container must only contain one button'
        );
        expect(Array.from(buttons[0].part)).to.contain(
          'parent-button',
          'a sub-parents button must contain the correct part'
        );
        expect(buttons[0].innerText).to.contain(
          hierarchy.valueLabel,
          'a sub-parents button must contain the correct text'
        );
        if (hierarchy.children) {
          expect(nextContainer).not.to.equal(
            null,
            'a sub-parents container must contain another container'
          );
          expectMatchHierarchy(nextContainer!, hierarchy.children);
        }
        break;
      case 'active-value':
        expect(Array.from(containerElement.part)).to.contain(
          'sub-parents',
          'a active value container must contain the correct part'
        );
        expect(buttons).to.have.lengthOf(
          1,
          'a active value container must only contain one button'
        );
        expect(Array.from(buttons[0].part)).to.contain(
          'active-parent',
          'a active value button must contain the correct part'
        );
        expect(getValueLabel(buttons[0])).to.equal(
          hierarchy.valueLabel,
          'a active value button must contain the correct text'
        );
        if (hierarchy.children) {
          expect(nextContainer).not.to.equal(
            null,
            'a active value container must contain another container'
          );
          expectMatchHierarchy(nextContainer!, hierarchy.children);
        }
        break;
      case 'values':
        expect(Array.from(containerElement.part)).to.contain(
          'values',
          'a values container must contain the correct part'
        );
        expect(buttons.length).to.be.gte(
          hierarchy.valueLabels.length,
          `this values container must contain at-least ${hierarchy.valueLabels.length} buttons`
        );
        buttons.forEach((button) => {
          expect(Array.from(button.part)).to.contain(
            'value-link',
            'a values container button must contain the correct part'
          );
        });
        hierarchy.valueLabels.forEach((valueLabel) => {
          expect(buttons.map(getValueLabel)).to.contain(
            valueLabel,
            `this values container must contain a button with the text "${valueLabel}"`
          );
        });
        expect(nextContainer).to.equal(
          null,
          'a values container must not contain another container'
        );
        break;
    }
  }

  it('should have the correct hierarchy', () => {
    CategoryFacetSelectors.wrapper().should(([wrapper]) =>
      expectMatchHierarchy(wrapper!.querySelector('ul')!, expectedHierarchy)
    );
  });
}
