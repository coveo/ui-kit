import QuanticPlaceholder from 'c/quanticPlaceholder';
import {cleanup, createTestComponent} from 'c/testUtils';

const selectors = {
  resultListContainer: '.placeholder__result-container',
  resultListRow: '.placeholder__result-row',
  cardContainer: '.placeholder__card-container',
  cardRow: '.placeholder__card-row',
};

describe('c-quantic-placeholder', () => {
  afterEach(() => {
    cleanup();
  });

  describe('without options', () => {
    it('should not display', () => {
      const element = createTestComponent(
        QuanticPlaceholder,
        'c-quantic-placeholder',
        {}
      );

      expect(element.shadowRoot.firstChild).toBeNull();
    });
  });

  describe.each([
    ['resultList', selectors.resultListContainer, selectors.resultListRow],
    ['card', selectors.cardContainer, selectors.cardRow],
  ])('with %s variant', (variant, containerSelector, rowSelector) => {
    it.each([[1], [5], [10]])('should display %d rows', (rows) => {
      const element = createTestComponent(
        QuanticPlaceholder,
        'c-quantic-placeholder',
        {
          variant: variant,
          numberOfRows: rows,
        }
      );

      expect(
        element.shadowRoot.querySelector(containerSelector)
      ).not.toBeNull();
      expect(element.shadowRoot.querySelectorAll(rowSelector)).toHaveLength(
        rows
      );
    });
  });
});
