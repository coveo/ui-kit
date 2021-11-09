import {InterceptAliases} from '../../../page-objects/search';
import {logUaEvent} from '../../common-expectations';
import {should} from '../../common-selectors';
import {
  BaseFacetSelector,
  FacetWithValuesSelector,
} from '../facet-common-selectors';
import {
  TimeframeFacetSelectors,
  WithDateRangeSelector,
} from './timeframe-facet-selectors';

function baseTimeframeFacetExpectations(selector: BaseFacetSelector) {
  return {
    displayLabel: (display: boolean) =>
      selector
        .label()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`The facet label ${should(display)} be displayed.`),

    labelContains: (value: string) =>
      selector
        .label()
        .should('contain', value)
        .logDetail(`The facet label should contain "${value}".`),

    displayCollapseButton: (display: boolean) =>
      selector
        .collapseButton()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`The collapse button ${should(display)} be displayed.`),

    displayExpandButton: (display: boolean) =>
      selector
        .expandButton()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`The expand button ${should(display)} be displayed.`),

    displayPlaceholder: (display: boolean) =>
      selector
        .placeholder()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`The facet placeholder ${should(display)} be displayed.`),

    valuesEqual: (values: string[]) =>
      selector
        .valueLabel()
        .then((elements) => {
          const actualValueLabels = Cypress.$.makeArray(elements).map(
            (element) => element.innerText
          );
          expect(actualValueLabels).to.deep.equal(values);
        })
        .logDetail(
          `The facet values should strictly equal: ${values
            .map((v) => `"${v}"`)
            .join(', ')}.`
        ),

    displayValues: (display: boolean) =>
      selector
        .values()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`The facet values ${should(display)} be displayed.`),

    numberOfValues: (value: number) =>
      selector
        .values()
        .should('have.length', value)
        .logDetail(`The facet should have ${value} values.`),

    displayClearButton: (display: boolean) =>
      selector
        .clearFilterButton()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`The clear filter button ${should(display)} be displayed.`),

    urlHashContains: (field: string, range: string) => {
      const expectedHash = `#df[${field}]=${range}`;
      cy.url()
        .should('include', expectedHash)
        .logDetail(`The URL hash should contain "${expectedHash}"`);
    },

    urlHashIsEmpty: () =>
      cy.url().should('match', /#?$/).logDetail('The URL hash should be empty'),
  };
}

function timeframeFacetWithValuesExpectations(
  selector: FacetWithValuesSelector
) {
  return {
    numberOfSelectedValues: (value: number) =>
      selector
        .selectedValue()
        .should('have.length', value)
        .logDetail(`The facet should have ${value} selected values.`),

    selectedValueContains: (value: string) =>
      selector
        .selectedValue()
        .should('contain', value)
        .logDetail(`The selected value should be "${value}".`),

    logSelectedValue: (field: string, range: string) =>
      logUaEvent(
        InterceptAliases.UA.Facet.Select,
        'facetSelect',
        {actionCause: 'facetSelect'},
        {facetField: field, facetValue: range}
      ),

    logClearFilter: (field: string) =>
      logUaEvent(
        InterceptAliases.UA.Facet.ClearAll,
        'facetClearAll',
        {actionCause: 'facetClearAll'},
        {facetField: field}
      ),
  };
}

function timeframeWithRangeExpectations(selector: WithDateRangeSelector) {
  return {
    displayStartInput: (display: boolean) =>
      selector
        .startInput()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`The start input ${should(display)} be displayed.`),

    startInputContains: (value: string) =>
      selector
        .startInput()
        .invoke('val')
        .then((text) => expect(text).to.be.equal(value))
        .logDetail(`start input should contain "${value}"`),

    displayEndInput: (display: boolean) =>
      selector
        .endInput()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`The end input ${should(display)} be displayed.`),

    endInputContains: (value: string) =>
      selector
        .endInput()
        .invoke('val')
        .then((text) => expect(text).to.be.equal(value))
        .logDetail(`end input should contain "${value}"`),

    displayApplyButton: (display: boolean) =>
      selector
        .applyButton()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`The apply button ${should(display)} be displayed.`),

    validationError: (message: string) =>
      selector
        .validationError()
        .should('contain', message)
        .logDetail(`should display validation error "${message}"`),

    numberOfValidationErrors: (value: number) =>
      selector
        .validationError()
        .should('have.length', value)
        .logDetail(`should display ${value} validation errors`),
  };
}

export const TimeframeFacetExpectations = {
  ...baseTimeframeFacetExpectations(TimeframeFacetSelectors),
  ...timeframeFacetWithValuesExpectations(TimeframeFacetSelectors),
  ...timeframeWithRangeExpectations(TimeframeFacetSelectors),
};
