import {doSortAlphanumeric} from '../../../utils/componentUtils';
import {ColorFacetSelectors} from './color-facet-selectors';

export function assertNumberOfSelectedBoxValues(value: number) {
  it(`should display ${value} number of selected box values`, () => {
    if (value > 0) {
      ColorFacetSelectors.selectedBoxValue().its('length').should('eq', value);
      return;
    }

    ColorFacetSelectors.selectedBoxValue().should('not.exist');
  });
}

export function assertNumberOfIdleBoxValues(value: number) {
  it(`should display ${value} number of idle box values`, () => {
    if (value > 0) {
      ColorFacetSelectors.idleBoxValue().its('length').should('eq', value);
      return;
    }

    ColorFacetSelectors.idleBoxValue().should('not.exist');
  });
}

export function assertLogColorFacetSelect(field: string, index: number) {
  it('should log the facet select results to UA ', () => {
    cy.expectSearchEvent('facetSelect').then((analyticsBody) => {
      expect(analyticsBody.customData).to.have.property('facetField', field);
      expect(analyticsBody.facetState[0]).to.have.property('state', 'selected');
      expect(analyticsBody.facetState[0]).to.have.property('field', field);

      ColorFacetSelectors.facetValueLabelAtIndex(index)
        .invoke('text')
        .then((txt: string) => {
          expect(analyticsBody.customData).to.have.property('facetValue', txt);
        });
    });
  });
}

export function assertValuesSortedAlphanumerically() {
  it('values should be ordered alphanumerically', () => {
    ColorFacetSelectors.valueLabel().as('facetAllValuesLabel');
    cy.getTextOfAllElements('@facetAllValuesLabel').then((originalValues) => {
      expect(originalValues).to.eql(doSortAlphanumeric(originalValues));
    });
  });
}

export function assertButtonBackgroundColor(text: string, color: string) {
  it(`should have ${color} background color for ${text}`, () => {
    ColorFacetSelectors.boxValueWithText(text).should(($el) => {
      expect($el).to.have.css('background-color', color);
    });
  });
}
