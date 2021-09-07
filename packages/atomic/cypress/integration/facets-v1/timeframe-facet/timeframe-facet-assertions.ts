import {TestFixture} from '../../../fixtures/test-fixture';
import {should} from '../../common-assertions';
import {TimeframeFacetSelectors} from './timeframe-facet-selectors';

export function assertDisplayRangeInput(display: boolean) {
  it(`${should(display)} display the range input`, () => {
    TimeframeFacetSelectors.rangeInput().should(
      display ? 'be.visible' : 'not.exist'
    );
  });
}

export function assertDisplayApplyButton(display: boolean) {
  it(`${should(display)} display Apply button"`, () => {
    TimeframeFacetSelectors.applyButton().should(
      display ? 'be.visible' : 'not.exist'
    );
  });
}

export function assertDisplayInputWarning(length: number, message?: string) {
  it('should display the correct warning when user click Apply button', () => {
    TimeframeFacetSelectors.inputInvalid().should('have.length', length);
    TimeframeFacetSelectors.inputInvalid()
      .invoke('prop', 'validationMessage')
      .then((warning) => {
        expect(warning).to.contains(
          message ? message : 'Please fill out this field.'
        );
      });
  });
}

export function assertMinInputValue(value: number) {
  it(`should display Min value of "${value}"`, () => {
    TimeframeFacetSelectors.startDate().should('have.value', value);
  });
}

export function assertMaxInputValue(value: number) {
  it(`should display Max value of "${value}"`, () => {
    TimeframeFacetSelectors.endDate().should('have.value', value);
  });
}

export function assertLogTimeframeFacetSelect(
  field: string,
  unit: string,
  period = 'past',
  amount = 1
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
        formatDefaultNumericFacetValue(period, amount, unit)
      );
    });
  });
}

export function assertLogTimeframeInputRange(field: string) {
  it('should log the facet select results to UA ', () => {
    cy.wait(TestFixture.interceptAliases.UA).then((intercept) => {
      const analyticsBody = intercept.request.body;
      expect(analyticsBody).to.have.property('actionCause', 'facetSelect');
      expect(analyticsBody.customData).to.have.property('facetField', field);
      expect(analyticsBody.customData)
        .to.have.property('facetId')
        .to.match(/_input/);
      expect(analyticsBody.facetState[0]).to.have.property('state', 'selected');
      expect(analyticsBody.facetState[0]).to.have.property('field', field);
    });
  });
}

function formatDefaultNumericFacetValue(
  period: string,
  amount: number,
  unit: string
) {
  const rangeValue =
    period === 'past'
      ? `${period}-${amount}-${unit}..now`
      : `now..${period}-${amount}-${unit}`;
  return rangeValue;
}

export function assertFacetValueContainsText(index: number, value: string) {
  it('Should contains facetValue', () => {
    TimeframeFacetSelectors.facetValueLabelAtIndex(index)
      .invoke('text')
      .then((txt: string) => {
        expect(txt).contains(value);
      });
  });
}
