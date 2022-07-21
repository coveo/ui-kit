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
