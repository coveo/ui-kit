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
    cy.expectSearchEvent('facetSelect').then((analyticsBody) => {
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
    cy.expectSearchEvent('facetSelect').then((analyticsBody) => {
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
    const urlHash = `#nf-${field.toLowerCase()}=${encodeURI(value)}`;
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

export function assertCurrencyFormat() {
  it('should display correct currency format CA$', () => {
    NumericFacetSelectors.valueLabel().as('facetAllValuesLabel');
    cy.getTextOfAllElements('@facetAllValuesLabel').then((originalValues) => {
      originalValues.forEach((e: string) => {
        const [start, end] = e.split(' to ');
        expect(start).contains('CA$');
        expect(end).contains('CA$');
        expect(start.split('$')[0]).eq('CA');
      });
    });
  });
}

export function assertUnitFormatKgLong() {
  it('should display correct unit format "kilogram"', () => {
    NumericFacetSelectors.valueLabel().as('facetAllValuesLabel');
    cy.getTextOfAllElements('@facetAllValuesLabel').then((originalValues) => {
      originalValues.forEach((e: string) => {
        const [start, end] = e.split(' to ');
        expect(start).contains('kilogram');
        expect(end).contains('kilogram');
        expect(start.split(' ')[1]).contains('kilogram');
      });
    });
  });
}

export function assertUnitFormatKgNarrow() {
  it('should display correct unit format "kg"', () => {
    NumericFacetSelectors.valueLabel().as('facetAllValuesLabel');
    cy.getTextOfAllElements('@facetAllValuesLabel').then((originalValues) => {
      originalValues.forEach((e: string) => {
        const [start, end] = e.split(' to ');
        expect(start).contains('kg');
        expect(end).contains('kg');
        expect(start.slice(-2)).eq('kg');
      });
    });
  });
}

export function assertFormatNumberMinimumIntegerDigits(digit: number) {
  it(`should display the minimum ${digit} number of integer digits`, () => {
    NumericFacetSelectors.valueLabel().as('facetAllValuesLabel');
    cy.getTextOfAllElements('@facetAllValuesLabel').then((originalValues) => {
      originalValues.forEach((e: string) => {
        const [start, end] = e.split(' to ');
        expect(countCharacter(start)).least(digit);
        expect(countCharacter(end)).least(digit);
      });
    });
  });
}

export function assertFormatNumberMinimumMaxFractionDigits(
  min: number,
  max: number
) {
  it(`should display the minimum ${min} number and max ${max} of fraction digits`, () => {
    NumericFacetSelectors.valueLabel().as('facetAllValuesLabel');
    cy.getTextOfAllElements('@facetAllValuesLabel').then((originalValues) => {
      originalValues.forEach((e: string) => {
        const [start, end] = e.replaceAll(',', '').split(' to ');

        expect(start).to.eq(
          convertToNumberWithMaxMinFractionDigit(Number(start), min, max)
        );
        expect(end).to.eq(
          convertToNumberWithMaxMinFractionDigit(Number(end), min, max)
        );
      });
    });
  });
}

export function assertFormatNumberMinimumMaxSignificantDigits(
  min: number,
  max: number
) {
  it(`should display the minimum ${min} number and max ${max} of significant digits`, () => {
    NumericFacetSelectors.valueLabel().as('facetAllValuesLabel');
    cy.getTextOfAllElements('@facetAllValuesLabel').then((originalValues) => {
      originalValues.forEach((e: string) => {
        const [start, end] = e.replaceAll(',', '').split(' to ');
        expect(start).to.eq(
          convertToNumberWithMaxMinSignificantDigit(Number(start), min, max)
        );
        expect(end).to.eq(
          convertToNumberWithMaxMinSignificantDigit(Number(end), min, max)
        );
      });
    });
  });
}

function countCharacter(e: string) {
  return e.replaceAll(',', '').length;
}

function convertToNumberWithMaxMinFractionDigit(
  num: number,
  min: number,
  max: number
) {
  return num.toLocaleString(undefined, {
    minimumFractionDigits: min,
    maximumFractionDigits: max,
  });
}

function convertToNumberWithMaxMinSignificantDigit(
  num: number,
  min: number,
  max: number
) {
  return num.toLocaleString(undefined, {
    minimumSignificantDigits: min,
    maximumSignificantDigits: max,
  });
}
