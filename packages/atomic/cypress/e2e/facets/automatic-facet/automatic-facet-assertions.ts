import {
  BaseFacetSelector,
  FacetWithCheckboxSelector,
} from '../facet-common-assertions';
import {automaticFacetComponent} from './automatic-facet-selectors';

export function assertLabelIsNotEmpty(BaseFacetSelector: BaseFacetSelector) {
  it('should have a label', () => {
    BaseFacetSelector.labelButton().should('not.be.empty');
  });
}

export function assertValueAtIndex(
  FacetWithCheckboxSelector: FacetWithCheckboxSelector & BaseFacetSelector,
  index: number
) {
  it(`should go to index ${index}`, () => {
    FacetWithCheckboxSelector.selectedCheckboxValue().eq(index);
  });
}

export function assertLogFacetSelect() {
  it('should log the facet select results to UA ', () => {
    cy.expectSearchEvent('facetSelect').then((analyticsBody) => {
      cy.get(automaticFacetComponent)
        .invoke('attr', 'field')
        .then((value) => {
          expect(analyticsBody.customData).to.have.property(
            'facetField',
            value
          );
          expect(analyticsBody.facetState![0]).to.have.property('field', value);
        });
      expect(analyticsBody.facetState![0]).to.have.property(
        'state',
        'selected'
      );
    });
  });
}

export function assertLogClearFacetValues() {
  it('should log the facet clear all to UA', () => {
    cy.expectSearchEvent('facetClearAll').then((analyticsBody) => {
      cy.get(automaticFacetComponent)
        .invoke('attr', 'field')
        .then((value) => {
          expect(analyticsBody.customData).to.have.property(
            'facetField',
            value
          );
        });
    });
  });
}

export function assertLabel(
  BaseFacetSelector: BaseFacetSelector,
  labelValue: string,
  fieldOrLabel: string
) {
  it(`should have the ${fieldOrLabel} value as the value`, () => {
    BaseFacetSelector.labelButton().contains(labelValue);
  });
}
