import {doSortOccurrences} from '../../../utils/componentUtils';
import {SegmentedFacetSelectors} from './segmented-facet-selectors';

export function assertNumberOfSelectedBoxValues(value: number) {
  it(`should display ${value} number of selected box values`, () => {
    if (value > 0) {
      SegmentedFacetSelectors.selectedBoxValue()
        .its('length')
        .should('eq', value);
      return;
    }

    SegmentedFacetSelectors.selectedBoxValue().should('not.exist');
  });
}

export function assertNumberOfIdleBoxValues(value: number) {
  it(`should display ${value} number of idle box values`, () => {
    if (value > 0) {
      SegmentedFacetSelectors.idleBoxValue().its('length').should('eq', value);
      return;
    }

    SegmentedFacetSelectors.idleBoxValue().should('not.exist');
  });
}

export function assertLogFacetSelect(field: string, index: number) {
  it('should log the facet select results to UA ', () => {
    cy.expectSearchEvent('facetSelect').then((analyticsBody) => {
      expect(analyticsBody.customData).to.have.property('facetField', field);
      expect(analyticsBody.facetState![0]).to.have.property(
        'state',
        'selected'
      );
      expect(analyticsBody.facetState![0]).to.have.property('field', field);

      SegmentedFacetSelectors.facetValueLabelAtIndex(index)
        .invoke('text')
        .then((txt: string) => {
          expect(analyticsBody.customData).to.have.property('facetValue', txt);
        });
    });
  });
}

export function assertLabelExists(exists: boolean) {
  it(`should have label that exists:  "${exists}"`, () => {
    SegmentedFacetSelectors.labelButton().should(
      exists ? 'exist' : 'not.exist'
    );
  });
}

export function assertValuesSortedByOccurrences() {
  it('values should be ordered by occurrences', () => {
    SegmentedFacetSelectors.valueCount().as('facetAllValuesCount');
    cy.getTextOfAllElements('@facetAllValuesCount').then((originalValues) => {
      expect(originalValues).to.eql(
        doSortOccurrences(originalValues as string[])
      );
    });
  });
}
