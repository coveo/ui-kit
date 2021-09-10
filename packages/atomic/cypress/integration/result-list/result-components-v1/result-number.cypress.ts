import {generateComponentHTML} from '../../../fixtures/test-fixture';
import {
  interceptSearchResponse,
  setUpPage,
} from '../../../utils/setupComponent';
import {
  executeFirstSearch,
  setLanguage,
} from '../../search-interface-utils.cypress';
import {
  generateResultList,
  generateResultTemplate,
  getFirstResult,
} from '../result-list-v1-selectors';
import {ResultNumberSelectors} from './result-number-selectors';

describe('Result Number Component', () => {
  function setupResultNumberPage(
    props: Record<string, string | number>,
    executeSearch = true,
    slot = ''
  ) {
    const component = generateComponentHTML(
      ResultNumberSelectors.component,
      props
    );
    component.innerHTML = slot;
    setUpPage(
      generateResultList(
        generateResultTemplate({
          bottomMetadata: component.outerHTML,
        })
      ),
      executeSearch
    );
  }

  function getFirstResultNumber() {
    return getFirstResult().find(ResultNumberSelectors.component);
  }

  describe('when not used inside a result template', () => {
    beforeEach(() => {
      setUpPage(
        generateComponentHTML(ResultNumberSelectors.component).outerHTML
      );
    });

    it.skip('should remove the component from the DOM', () => {
      cy.get(ResultNumberSelectors.component).should('not.exist');
    });

    it('should log a console error', () => {
      cy.get(ResultNumberSelectors.component)
        .find('atomic-component-error')
        .should('exist');
    });
  });

  describe('when the field does not exist for the result', () => {
    beforeEach(() => {
      setupResultNumberPage({
        field: 'thisfielddoesnotexist',
      });
    });

    it.skip('should remove the component from the DOM', () => {
      getFirstResultNumber().should('not.exist');
    });
  });

  describe('when the field value cannot be parsed to a number', () => {
    beforeEach(() => {
      const field = 'my-field';
      setupResultNumberPage(
        {
          field,
        },
        false
      );
      interceptSearchResponse((response) =>
        response.results.forEach((result) => (result.raw[field] = 'Abc'))
      );
      executeFirstSearch();
    });

    it.skip('should remove the component from the DOM', () => {
      getFirstResultNumber().should('not.exist');
    });
  });

  describe('when the field value is valid', () => {
    function setupExistingFieldValue(value: number) {
      setupResultNumberPage(
        {
          field: 'my-field',
        },
        false
      );
      interceptSearchResponse((response) =>
        response.results.forEach((result) => (result.raw['my-field'] = value))
      );
      executeFirstSearch();
    }

    describe('when the value is under 1000', () => {
      const value = 666;
      beforeEach(() => {
        setupExistingFieldValue(value);
      });

      it('should render the component', () => {
        getFirstResultNumber().should('have.text', value);
      });
    });

    describe('when the value is equal or above 1000', () => {
      const value = 1234;
      beforeEach(() => {
        setupExistingFieldValue(value);
      });

      it("the rendered value should respect the interface's language", () => {
        setLanguage('fr');
        getFirstResultNumber().should('have.text', '1\u202f234');
        setLanguage('en');
        getFirstResultNumber().should('have.text', '1,234');
      });
    });

    describe('with a format', () => {
      const value = 1234.5678;
      function setupResultNumberWithFormat(slot: string) {
        setupResultNumberPage(
          {
            field: 'my-field',
          },
          false,
          slot
        );
        interceptSearchResponse((response) =>
          response.results.forEach((result) => (result.raw['my-field'] = value))
        );
        executeFirstSearch();
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
            }).outerHTML
          );
        }

        it('supports minimum digits', () => {
          setupNumberFormat({
            minimumIntegerDigits: 5,
            minimumFractionDigits: 6,
          });
          getFirstResultNumber().should('have.text', '01,234.567800');
        });

        it('supports maximum fraction digits', () => {
          setupNumberFormat({
            maximumFractionDigits: 2,
          });
          getFirstResultNumber().should('have.text', '1,234.57');
        });

        it('supports minimum significant digits', () => {
          setupNumberFormat({
            minimumSignificantDigits: 9,
          });
          getFirstResultNumber().should('have.text', '1,234.56780');
        });

        it('supports maximum significant digits', () => {
          setupNumberFormat({maximumSignificantDigits: 5});
          getFirstResultNumber().should('have.text', '1,234.6');
        });
      });

      describe('with a unit format', () => {
        function setupUnitFormat(unit: string, display: string) {
          setupResultNumberWithFormat(
            generateComponentHTML(ResultNumberSelectors.formats.unitFormat, {
              unit,
              'unit-display': display,
            }).outerHTML
          );
        }

        it('can display a long value', () => {
          setupUnitFormat('liter', 'long');
          getFirstResultNumber().should('have.text', '1,234.568 liters');
        });

        it('can display a short value', () => {
          setupUnitFormat('liter', 'short');
          getFirstResultNumber().should('have.text', '1,234.568 L');
        });

        it('can display a narrow value', () => {
          setupUnitFormat('liter', 'narrow');
          getFirstResultNumber().should('have.text', '1,234.568L');
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
            ).outerHTML
          );
        }

        it('can display US dollars', () => {
          setupCurrencyFormat('USD');
          getFirstResultNumber().should('have.text', '$1,234.57');
        });

        it('can display euros', () => {
          setupCurrencyFormat('EUR');
          getFirstResultNumber().should('have.text', '€1,234.57');
        });

        it('can display japanese yen', () => {
          setupCurrencyFormat('JPY');
          getFirstResultNumber().should('have.text', '¥1,235');
        });
      });
    });
  });
});
