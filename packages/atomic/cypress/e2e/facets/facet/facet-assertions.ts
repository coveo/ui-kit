import {FacetValueState} from '@coveo/headless';
import {
  doSortAlphanumeric,
  doSortAlphanumericDescending,
  doSortOccurrences,
} from '../../../utils/componentUtils';
import {FacetSelectors} from './facet-selectors';

export function assertNumberOfSelectedBoxValues(value: number) {
  it(`should display ${value} number of selected box values`, () => {
    if (value > 0) {
      FacetSelectors.selectedBoxValue().its('length').should('eq', value);
      return;
    }

    FacetSelectors.selectedBoxValue().should('not.exist');
  });
}

export function assertNumberOfIdleBoxValues(value: number) {
  it(`should display ${value} number of idle box values`, () => {
    if (value > 0) {
      FacetSelectors.idleBoxValue().its('length').should('eq', value);
      return;
    }

    FacetSelectors.idleBoxValue().should('not.exist');
  });
}

export function assertLogFacetAction(
  field: string,
  index: number,
  action: FacetValueState
) {
  it('should log the facet select results to UA ', () => {
    cy.expectSearchEvent('facetSelect').then((analyticsBody) => {
      expect(analyticsBody.customData).to.have.property('facetField', field);
      expect(analyticsBody.facetState![0]).to.have.property('state', action);
      expect(analyticsBody.facetState![0]).to.have.property('field', field);

      FacetSelectors.facetValueLabelAtIndex(index)
        .invoke('text')
        .then((txt: string) => {
          expect(analyticsBody.customData).to.have.property('facetValue', txt);
        });
    });
  });
}

export function assertLogFacetSelect(field: string, index: number) {
  assertLogFacetAction(field, index, 'selected');
}

export function assertLogFacetExclude(field: string, index: number) {
  assertLogFacetAction(field, index, 'excluded');
}

export function assertLogFacetClearAll(facetId: string) {
  it('should log the facet clear all event to UA', () => {
    cy.expectSearchEvent('facetClearAll')
      .should('have.property', 'customData')
      .should('have.property', 'facetId', facetId);
  });
}

export function assertValuesSortedAlphanumerically() {
  it('values should be ordered alphanumerically', () => {
    FacetSelectors.valueLabel().as('facetAllValuesLabel');
    cy.getTextOfAllElements('@facetAllValuesLabel').then((originalValues) => {
      expect(originalValues).to.eql(
        doSortAlphanumeric(originalValues as string[])
      );
    });
  });
}

export function assertValuesSortedAlphanumericallyDescending() {
  it('values should be ordered alphanumerically descending', () => {
    FacetSelectors.valueLabel().as('facetAllValuesLabel');
    cy.getTextOfAllElements('@facetAllValuesLabel').then((originalValues) => {
      expect(originalValues).to.eql(
        doSortAlphanumericDescending(originalValues as string[])
      );
    });
  });
}

export function assertValuesSortedByOccurrences() {
  it('values should be ordered by occurrences', () => {
    FacetSelectors.valueCount().as('facetAllValuesCount');
    cy.getTextOfAllElements('@facetAllValuesCount').then((originalValues) => {
      expect(originalValues).to.eql(
        doSortOccurrences(originalValues as string[])
      );
    });
  });
}

export function assertLogFacetShowMore(field: string) {
  it('should log the facet show more results to UA', () => {
    cy.expectCustomEvent('facet').then((analyticsBody) => {
      expect(analyticsBody).to.have.property(
        'eventValue',
        'showMoreFacetResults'
      );
      expect(analyticsBody.customData).to.have.property('facetField', field);
    });
  });
}

export function assertLogFacetShowLess(field: string) {
  it('should log the facet show less results to UA', () => {
    cy.expectCustomEvent('facet').then((analyticsBody) => {
      expect(analyticsBody).to.have.property(
        'eventValue',
        'showLessFacetResults'
      );
      expect(analyticsBody.customData).to.have.property('facetField', field);
    });
  });
}
