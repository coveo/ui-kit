import {setUpPage} from '../../../utils/setupComponent';
import {revertFormatedDateFacet} from '../date-facet/date-facet-actions';
import {
  dateFacetComponent,
  facetComponent,
  FacetSelector,
  numericFacetComponent,
} from './facet-selectors';
import {revertFormatedNumericFacet} from '../numeric-facet/numeric-facet-actions';

export const facetField = 'author';
export const facetLabel = 'Author';
export const facetNumberOfValues = 8;

export interface FacetSetupOptions {
  field: string;
  label: string;
  attributes: string;
  executeFirstSearch: boolean;
}

export function setupFacet(options: Partial<FacetSetupOptions> = {}) {
  const setupOptions: FacetSetupOptions = {
    attributes: '',
    executeFirstSearch: true,
    field: facetField,
    label: facetLabel,
    ...options,
  };
  setUpPage(
    `<atomic-breadcrumb-manager></atomic-breadcrumb-manager>     
  <atomic-facet field="${setupOptions.field}" label="${setupOptions.label}" ${setupOptions.attributes}></atomic-facet>`,
    setupOptions.executeFirstSearch
  );
}

export function should(should: boolean) {
  return should ? 'should' : 'should not';
}

export function selectFacetValueAt(
  index: number,
  field = facetField,
  type = facetComponent
) {
  FacetSelector.facetValueLabelAtIndex(index, field, type).click();
}

export function selectShowMoreButton(
  field = facetField,
  type = facetComponent
) {
  FacetSelector.showMoreButton(field, type).click();
}

export function selectShowLessButton(
  field = facetField,
  type = facetComponent
) {
  FacetSelector.showLessButton(field, type).click();
}

export function selectClearAllFacetsButton(
  field = facetField,
  type = facetComponent
) {
  FacetSelector.facetClearAllFilter(field, type).click();
}

export function assertDisplayFacet(display: boolean) {
  it(`${should(display)} display the facet`, () => {
    FacetSelector.wrapper().should(display ? 'be.visible' : 'not.exist');
  });
}

export function convertFacetValueToAPIformat(
  value: string,
  type = facetComponent,
  valueSeparator = 'to'
) {
  value = value.trim();
  valueSeparator = valueSeparator ? valueSeparator : 'to';
  const splitByValue = ` ${valueSeparator} `;
  const start = value.split(splitByValue)[0];
  const end = value.split(splitByValue)[1];

  switch (type) {
    case numericFacetComponent: {
      const formtedStart = revertFormatedNumericFacet(start);
      const formatedEnd = revertFormatedNumericFacet(end);
      return `${formtedStart}..${formatedEnd}`;
    }
    case dateFacetComponent: {
      const formtedStart = `${revertFormatedDateFacet(start)}@00:00:00`;
      const formatedEnd = `${revertFormatedDateFacet(end)}@00:00:00`;
      return `${formtedStart}..${formatedEnd}`;
    }
    default:
      return value;
  }
}
