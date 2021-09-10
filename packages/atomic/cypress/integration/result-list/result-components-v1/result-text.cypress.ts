import {HighlightKeyword} from '@coveo/headless';
import {generateComponentHTML} from '../../../fixtures/test-fixture';
import {
  interceptSearchResponse,
  setUpPage,
} from '../../../utils/setupComponent';
import {
  executeFirstSearch,
  setFieldCaptions,
} from '../../search-interface-utils.cypress';
import {
  generateResultList,
  generateResultTemplate,
  getFirstResult,
} from '../result-list-v1-selectors';
import {ResultTextSelectors} from './result-text-selectors';

describe('Result Text Component', () => {
  function setupResultTextPage(
    props: Record<string, string | number>,
    executeSearch = true
  ) {
    setUpPage(
      generateResultList(
        generateResultTemplate({
          bottomMetadata: generateComponentHTML(
            ResultTextSelectors.component,
            props
          ).outerHTML,
        })
      ),
      executeSearch
    );
  }

  function getFirstResultText() {
    return getFirstResult().find(ResultTextSelectors.component);
  }

  describe('when not used inside a result template', () => {
    beforeEach(() => {
      setUpPage(generateComponentHTML(ResultTextSelectors.component).outerHTML);
    });

    it.skip('should remove the component from the DOM', () => {
      cy.get(ResultTextSelectors.component).should('not.exist');
    });

    it('should log a console error', () => {
      cy.get(ResultTextSelectors.component)
        .find('atomic-component-error')
        .should('exist');
    });
  });

  describe('when the field does not exist for the result but the "default" prop is set', () => {
    const defaultText = 'Test default';
    beforeEach(() => {
      setupResultTextPage({
        default: defaultText,
        field: 'thisfielddoesnotexist',
      });
    });

    it('should render an "atomic-text" component with the default value', () => {
      getFirstResultText()
        .find('atomic-text')
        .shadow()
        .should('have.text', defaultText);
    });
  });

  describe('when the field does not exist for the result and the "default" prop is not set', () => {
    beforeEach(() => {
      setupResultTextPage({
        field: 'thisfielddoesnotexist',
      });
    });

    it('should remove the component from the DOM', () => {
      getFirstResultText().should('not.exist');
    });
  });

  describe('when the field value is not a string', () => {
    beforeEach(() => {
      setupResultTextPage(
        {
          field: 420,
        },
        false
      );
      interceptSearchResponse((response) =>
        response.results.forEach((result) => (result.raw['420'] = 'Abc'))
      );
      executeFirstSearch();
    });

    it.skip('should remove the component from the DOM', () => {
      getFirstResultText().should('not.exist');
    });
  });

  describe('when the field value exists & is a string', () => {
    const field = 'hello_world';
    const rawValue = 'Hello World!';
    const localizedValue = 'Welcome!';
    const highlight: HighlightKeyword = {offset: 6, length: 5};
    const highlightedValue = rawValue.slice(
      highlight.offset,
      highlight.offset + highlight.length
    );
    function setupExistingFieldValue(
      shouldHighlight: boolean,
      highlightsAvailable: boolean
    ) {
      setupResultTextPage(
        {
          field: field,
          'should-highlight': shouldHighlight.toString(),
        },
        false
      );
      interceptSearchResponse((response) =>
        response.results.forEach((result) => {
          result.raw[field] = rawValue;
          if (highlightsAvailable) {
            (result as any)[`${field}Highlights`] = [highlight];
          }
        })
      );
      setFieldCaptions(field, {[rawValue]: localizedValue});
      executeFirstSearch();
    }

    describe('when the "shouldHighlight" prop is true and when highlights are available for the field', () => {
      beforeEach(() => {
        setupExistingFieldValue(true, true);
      });

      it('should render the highlighted text', () => {
        getFirstResultText().should('have.text', rawValue);
        getFirstResultText()
          .find('[part="highlight"]')
          .should('have.text', highlightedValue);
      });
    });

    describe('when the "shouldHighlight" prop is false', () => {
      beforeEach(() => {
        setupExistingFieldValue(false, true);
      });

      it('should render text value with localization', () => {
        getFirstResultText().should('have.text', localizedValue);
        getFirstResultText().find('[part="highlight"]').should('not.exist');
      });

      it.skip('should render an "atomic-text" component with the localized value', () => {
        getFirstResultText()
          .find('atomic-text')
          .shadow()
          .should('have.text', localizedValue);
      });
    });

    describe('when when highlights are unavailable for the field', () => {
      beforeEach(() => {
        setupExistingFieldValue(true, false);
      });

      it('should render text value with localization', () => {
        getFirstResultText().should('have.text', localizedValue);
        getFirstResultText()
          .find(ResultTextSelectors.highlight)
          .should('not.exist');
      });

      it.skip('should render an "atomic-text" component with the localized value', () => {
        getFirstResultText()
          .find('atomic-text')
          .shadow()
          .should('have.text', localizedValue);
      });
    });
  });
});
