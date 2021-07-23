import {TestFixture} from '../../../fixtures/test-fixture';
import {should} from '../../common-assertions';
import {NumericFacetSelectors} from './numeric-facet-selectors';

export function assertDisplayRangeInput(display: boolean) {
  it(`${should(display)} display the range input`, () => {
    NumericFacetSelectors.rangeInput().should(
      display ? 'be.visible' : 'not.exist'
    );
  });
}

export function assertDisplayApplyButton(display: boolean) {
  it(`${should(display)} display Apply button"`, () => {
    NumericFacetSelectors.applyButton().should(
      display ? 'be.visible' : 'not.exist'
    );
  });
}

export function assertDisplayInputWarning(length: number, message?: string) {
  it('should display the correct warning when user click Apply button', () => {
    NumericFacetSelectors.inputInvalid().should('have.length', length);
    NumericFacetSelectors.inputInvalid()
      .invoke('prop', 'validationMessage')
      .should('equal', message ? message : 'Please fill out this field.');
  });
}

export function assertMinInputValue(value: number) {
  it(`should display Min value of "${value}"`, () => {
    NumericFacetSelectors.minInput().should('have.value', value);
  });
}

export function assertMaxInputValue(value: number) {
  it(`should display Max value of "${value}"`, () => {
    NumericFacetSelectors.maxInput().should('have.value', value);
  });
}

function formatDefaultNumericFacetValue(value: string) {
  value = value.trim();
  const valueSeparator = 'to';
  const splitByValue = ` ${valueSeparator} `;
  const start = value.split(splitByValue)[0].replace(/,/g, '');
  const end = value.split(splitByValue)[1].replace(/,/g, '');
  return `${start}..${end}`;
}

export function assertLogNumericFacetInputSubmit(
  field: string,
  min: number,
  max: number
) {
  it('should log the facet select results to UA ', () => {
    cy.wait(TestFixture.interceptAliases.UA).then((intercept) => {
      const analyticsBody = intercept.request.body;
      expect(analyticsBody).to.have.property('actionCause', 'facetSelect');
      expect(analyticsBody.customData).to.have.property('facetField', field);
      expect(analyticsBody.facetState[0]).to.have.property('state', 'selected');
      expect(analyticsBody.facetState[0]).to.have.property('field', field);
      expect(analyticsBody.customData).to.have.property(
        'facetValue',
        `${min}..${max}`
      );
    });
  });
}

export function assertLogNumericFacetSelect(field: string, index: number) {
  it('should log the facet select results to UA ', () => {
    cy.wait(TestFixture.interceptAliases.UA).then((intercept) => {
      const analyticsBody = intercept.request.body;
      expect(analyticsBody).to.have.property('actionCause', 'facetSelect');
      expect(analyticsBody.customData).to.have.property('facetField', field);
      expect(analyticsBody.facetState[0]).to.have.property('state', 'selected');
      expect(analyticsBody.facetState[0]).to.have.property('field', field);

      NumericFacetSelectors.facetValueLabelAtIndex(index)
        .invoke('text')
        .then((txt: string) => {
          expect(analyticsBody.customData).to.have.property(
            'facetValue',
            formatDefaultNumericFacetValue(txt)
          );
        });
    });
  });
}

export function assertValueSortedByDescending() {
  it('values should be ordered descending', () => {
    NumericFacetSelectors.valueLabel().as('facetAllValuesLabel');
    cy.getTextOfAllElements('@facetAllValuesLabel').then((originalValues) => {
      originalValues = originalValues
        .concat()
        .map((value: string) => value.replaceAll(',', ''));

      const sortDescendingValue = [...originalValues].sort(
        (a, b) => b.split(' to ')[1] - a.split(' to ')[1]
      );
      expect(originalValues).to.eql(sortDescendingValue);
    });
  });
}

export function assertURLHash(field: string, value: string) {
  it('should display range value on UrlHash', () => {
    const urlHash = `#nf[${field.toLowerCase()}]=${encodeURI(value)}`;
    cy.url().should('include', urlHash);
  });
}

export function assertEqualRange() {
  it('should generate an even range', () => {
    NumericFacetSelectors.valueLabel().as('facetAllValuesLabel');
    cy.getTextOfAllElements('@facetAllValuesLabel').then((originalValues) => {
      const fixRange = getEvenRangeValue(originalValues[0]);
      originalValues = originalValues.concat().forEach((e: string) => {
        expect(getEvenRangeValue(e)).to.eq(fixRange);
      });
    });
  });
}

function getEvenRangeValue(value: string) {
  const start = Number(value.split(' to ')[0].replaceAll(',', ''));
  const end = Number(value.split(' to ')[1].replaceAll(',', ''));
  return end - start;
}
