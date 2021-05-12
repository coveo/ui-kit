import {
  convertDateFormatLabel,
  convertDateToFacetValue,
  dateField,
  DateRange,
  dateRanges,
} from './date-facet-actions';
import {convertFacetValueToAPIformat} from '../facet/facet-actions';
import {dateFacetComponent, FacetSelector} from '../facet/facet-selectors';

export function assertDateFacetValueOnUrl(
  index = 0,
  field = dateField,
  type = dateFacetComponent,
  valueSeparator = 'to'
) {
  it('should reflected selected facetValue on Url', () => {
    FacetSelector.facetValueLabelAtIndex(index, field, type)
      .invoke('text')
      .then((txt) => {
        const facetValueInApiFormat = convertFacetValueToAPIformat(
          txt,
          type,
          valueSeparator
        );
        const urlHash = `#df[${field.toLowerCase()}]=${encodeURI(
          facetValueInApiFormat
        )}`;
        cy.url().should('include', urlHash);
      });
  });
}

export function assertDateRangeDisplay(ranges = dateRanges) {
  it('should generate all manually specified ranges', () => {
    FacetSelector.valueLabels(dateField, dateFacetComponent).as(
      'dateFacetAllValueLabels'
    );
    cy.getTextOfAllElements('@dateFacetAllValueLabels').then((elements) => {
      ranges.forEach((r: DateRange) => {
        const facetValueConverted = convertDateToFacetValue(r);
        expect(elements).to.include(facetValueConverted);
      });
    });
  });
}

export function assertCustomDateFormatRangeAtIndex(
  dateRange: DateRange,
  dateFormat = 'DD/MMM/YYYY',
  index = 0,
  field = dateField
) {
  it(`Date facet at index ${index} should generate correct format ${dateFormat}`, () => {
    const formatedStart = convertDateFormatLabel(dateRange.start);
    const formatedEnd = convertDateFormatLabel(dateRange.end);
    const formatedLabel = `${formatedStart} to ${formatedEnd}`;
    FacetSelector.facetValueAtIndex(index, field, dateFacetComponent).should(
      'contain.text',
      formatedLabel
    );
  });
}
