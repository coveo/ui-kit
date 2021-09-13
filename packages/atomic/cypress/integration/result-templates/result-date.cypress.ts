import {generateComponentHTML} from '../../fixtures/test-fixture';
import {interceptSearchResponse, setUpPage} from '../../utils/setupComponent';
import {executeFirstSearch} from '../search-interface-utils';
import {
  generateResultList,
  generateResultTemplate,
  getFirstResult,
} from '../result-list/result-list-selectors';
import {ResultDateSelectors} from './result-date-selectors';

describe('Result Date Component', () => {
  function setupResultDatePage(
    props: Record<string, string | number>,
    executeSearch = true
  ) {
    setUpPage(
      generateResultList(
        generateResultTemplate({
          bottomMetadata: generateComponentHTML(
            ResultDateSelectors.component,
            props
          ).outerHTML,
        })
      ),
      executeSearch
    );
  }

  function getFirstResultDate() {
    return getFirstResult().find(ResultDateSelectors.component);
  }

  describe('when not used inside a result template', () => {
    beforeEach(() => {
      setUpPage(generateComponentHTML(ResultDateSelectors.component).outerHTML);
    });

    it.skip('should remove the component from the DOM', () => {
      cy.get(ResultDateSelectors.component).should('not.exist');
    });

    it.skip('should log a console error', () => {
      cy.get(ResultDateSelectors.component)
        .find('atomic-component-error')
        .should('exist');
    });
  });

  describe('when the field does not exist for the result', () => {
    beforeEach(() => {
      setupResultDatePage({
        field: 'thisfielddoesnotexist',
      });
    });

    it('should remove the component from the DOM', () => {
      getFirstResultDate().should('not.exist');
    });
  });

  describe('when the field value is not a date', () => {
    beforeEach(() => {
      const field = 'my-field';
      setupResultDatePage(
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

    it('should remove the component from the DOM', () => {
      getFirstResultDate().should('not.exist');
    });
  });

  describe('when the field is valid', () => {
    const field = 'my-creation-date';
    const apiDate = '2021/09/03@10:31:23';
    function setupFieldDateField(format: string) {
      setupResultDatePage(
        {
          field,
          format,
        },
        false
      );
      interceptSearchResponse((response) =>
        response.results.forEach((result) => (result.raw[field] = apiDate))
      );
      executeFirstSearch();
    }

    describe('when the format is invalid', () => {
      beforeEach(() => {
        setupFieldDateField('yyyy-MM-DD');
      });

      it.skip('should remove the component from the DOM', () => {
        getFirstResultDate().should('not.exist');
      });
    });

    describe('when the format is valid', () => {
      beforeEach(() => {
        setupFieldDateField('YYYY-MM-DD');
      });

      it('should render the field value formatted correctly', () => {
        getFirstResultDate().should('have.text', '2021-09-03');
      });
    });
  });
});
