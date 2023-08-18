import {
  generateComponentHTML,
  TagProps,
  TestFixture,
} from '../../../fixtures/test-fixture';
import * as CommonAssertions from '../../common-assertions';
import {addResultList, buildTemplateWithSections} from '../result-list-actions';
import {
  resultNumberComponent,
  ResultNumberSelectors,
} from './result-number-selectors';

interface ResultNumberProps {
  field?: string;
}

const addResultNumberInResultList = (
  props: ResultNumberProps = {},
  slot?: HTMLElement
) => {
  const resultLinkEl = generateComponentHTML(
    resultNumberComponent,
    props as TagProps
  );
  if (slot) {
    resultLinkEl.appendChild(slot);
  }
  return addResultList(
    buildTemplateWithSections({bottomMetadata: resultLinkEl})
  );
};

describe('Result Number Component', () => {
  describe('when not used inside a result template', () => {
    beforeEach(() => {
      new TestFixture()
        .withElement(generateComponentHTML(resultNumberComponent))
        .init();
    });

    CommonAssertions.assertRemovesComponent();
  });

  describe('when the field does not exist for the result', () => {
    beforeEach(() => {
      new TestFixture()
        .with(addResultNumberInResultList({field: 'thisfielddoesnotexist'}))
        .init();
    });

    CommonAssertions.assertConsoleError(false);
  });

  describe('when the field value cannot be parsed to a number', () => {
    beforeEach(() => {
      const field = 'my-field';
      new TestFixture()
        .with(addResultNumberInResultList({field}))
        .withCustomResponse((response) =>
          response.results.forEach((result) => (result.raw[field] = 'Abc'))
        )
        .init();
    });

    CommonAssertions.assertRemovesComponent(
      ResultNumberSelectors.firstInResult
    );
    CommonAssertions.assertConsoleError();
  });

  describe('when the field value is valid', () => {
    function prepareExistingFieldValue(value: number) {
      return new TestFixture()
        .with(addResultNumberInResultList({field: 'my-field'}))
        .withCustomResponse((response) =>
          response.results.forEach((result) => (result.raw['my-field'] = value))
        );
    }

    describe('when the value is under 1000', () => {
      const value = 666;
      beforeEach(() => {
        prepareExistingFieldValue(value).init();
      });

      it('should render the component', () => {
        ResultNumberSelectors.firstInResult().should('have.text', value);
      });
    });

    describe('when the value is equal or above 1000', () => {
      const value = 1234.5;

      it('should correctly display values in french', () => {
        prepareExistingFieldValue(value).withLanguage('fr').init();
        ResultNumberSelectors.firstInResult().should(
          'have.text',
          '1\u202f234,5'
        );
      });

      it('should correctly display values in english', () => {
        prepareExistingFieldValue(value).withLanguage('en').init();
        ResultNumberSelectors.firstInResult().should('have.text', '1,234.5');
      });
      it('should be accessible', () => {
        CommonAssertions.assertAccessibility(
          ResultNumberSelectors.firstInResult
        );
      });
    });

    describe('with a format', () => {
      const value = 1234.5678;
      function setupResultNumberWithFormat(slot: HTMLElement) {
        new TestFixture()
          .with(addResultNumberInResultList({field: 'my-field'}, slot))
          .withCustomResponse((response) =>
            response.results.forEach(
              (result) => (result.raw['my-field'] = value)
            )
          )
          .init();
      }

      describe('with a number format', () => {
        function setupNumberFormat(options: {
          minimumIntegerDigits?: number;
          minimumFractionDigits?: number;
          maximumFractionDigits?: number;
          minimumSignificantDigits?: number;
          maximumSignificantDigits?: number;
        }) {
          setupResultNumberWithFormat(
            generateComponentHTML(ResultNumberSelectors.formats.numberFormat, {
              ...(options.minimumIntegerDigits !== undefined && {
                'minimum-integer-digits': options.minimumIntegerDigits,
              }),
              ...(options.minimumFractionDigits !== undefined && {
                'minimum-fraction-digits': options.minimumFractionDigits,
              }),
              ...(options.maximumFractionDigits !== undefined && {
                'maximum-fraction-digits': options.maximumFractionDigits,
              }),
              ...(options.minimumSignificantDigits !== undefined && {
                'minimum-significant-digits': options.minimumSignificantDigits,
              }),
              ...(options.maximumSignificantDigits !== undefined && {
                'maximum-significant-digits': options.maximumSignificantDigits,
              }),
            })
          );
        }

        it('supports minimum digits', () => {
          setupNumberFormat({
            minimumIntegerDigits: 5,
            minimumFractionDigits: 6,
          });
          ResultNumberSelectors.firstInResult().should(
            'have.text',
            '01,234.567800'
          );
        });

        it('supports maximum fraction digits', () => {
          setupNumberFormat({
            maximumFractionDigits: 2,
          });
          ResultNumberSelectors.firstInResult().should('have.text', '1,234.57');
        });

        it('supports minimum significant digits', () => {
          setupNumberFormat({
            minimumSignificantDigits: 9,
          });
          ResultNumberSelectors.firstInResult().should(
            'have.text',
            '1,234.56780'
          );
        });

        it('supports maximum significant digits', () => {
          setupNumberFormat({maximumSignificantDigits: 5});
          ResultNumberSelectors.firstInResult().should('have.text', '1,234.6');
        });
      });

      describe('with a unit format', () => {
        function setupUnitFormat(unit: string, display: string) {
          setupResultNumberWithFormat(
            generateComponentHTML(ResultNumberSelectors.formats.unitFormat, {
              unit,
              'unit-display': display,
            })
          );
        }

        it('can display a long value', () => {
          setupUnitFormat('liter', 'long');
          ResultNumberSelectors.firstInResult().should(
            'have.text',
            '1,234.568 liters'
          );
        });

        it('can display a short value', () => {
          setupUnitFormat('liter', 'short');
          ResultNumberSelectors.firstInResult().should(
            'have.text',
            '1,234.568 L'
          );
        });

        it('can display a narrow value', () => {
          setupUnitFormat('liter', 'narrow');
          ResultNumberSelectors.firstInResult().should(
            'have.text',
            '1,234.568L'
          );
        });
      });

      describe('with a currency format', () => {
        function setupCurrencyFormat(currency: string) {
          setupResultNumberWithFormat(
            generateComponentHTML(
              ResultNumberSelectors.formats.currencyFormat,
              {
                currency,
              }
            )
          );
        }

        it('can display US dollars', () => {
          setupCurrencyFormat('USD');
          ResultNumberSelectors.firstInResult().should(
            'have.text',
            '$1,234.57'
          );
        });

        it('can display euros', () => {
          setupCurrencyFormat('EUR');
          ResultNumberSelectors.firstInResult().should(
            'have.text',
            '€1,234.57'
          );
        });

        it('can display japanese yen', () => {
          setupCurrencyFormat('JPY');
          ResultNumberSelectors.firstInResult().should('have.text', '¥1,235');
        });
      });
    });
  });
});
