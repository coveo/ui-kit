import {HighlightKeyword} from '@coveo/headless';
import {
  generateComponentHTML,
  TagProps,
  TestFixture,
} from '../../../fixtures/test-fixture';
import {addResultList} from '../result-list-actions';
import {
  resultTextComponent,
  ResultTextSelectors,
} from './result-text-selectors';

interface ResultTextProps {
  field?: string | number;
  default?: string;
  'should-highlight'?: string;
}

const addResultTextInResultList = (props: ResultTextProps = {}) =>
  addResultList({
    bottomMetadata: generateComponentHTML(
      resultTextComponent,
      props as TagProps
    ),
  });

describe('Result Text Component', () => {
  describe('when not used inside a result template', () => {
    beforeEach(() => {
      new TestFixture()
        .withElement(generateComponentHTML(resultTextComponent))
        .init();
    });

    it.skip('should remove the component from the DOM', () => {
      cy.get(resultTextComponent).should('not.exist');
    });

    it('should log a console error', () => {
      cy.get(resultTextComponent)
        .find('atomic-component-error')
        .should('exist');
    });
  });

  describe('when the field does not exist for the result but the "default" prop is set', () => {
    const defaultText = 'Test default';
    beforeEach(() => {
      new TestFixture()
        .with(
          addResultTextInResultList({
            default: defaultText,
            field: 'thisfielddoesnotexist',
          })
        )
        .init();
    });

    it('should render an "atomic-text" component with the default value', () => {
      ResultTextSelectors.firstInResult()
        .find('atomic-text')
        .shadow()
        .should('have.text', defaultText);
    });
  });

  describe('when the field does not exist for the result and the "default" prop is not set', () => {
    beforeEach(() => {
      new TestFixture()
        .with(addResultTextInResultList({field: 'thisfielddoesnotexist'}))
        .init();
    });

    it('should remove the component from the DOM', () => {
      ResultTextSelectors.firstInResult().should('not.exist');
    });
  });

  describe('when the field value is not a string', () => {
    beforeEach(() => {
      new TestFixture()
        .with(addResultTextInResultList({field: 420}))
        .withCustomResponse((response) =>
          response.results.forEach((result) => (result.raw['420'] = 'Abc'))
        )
        .init();
    });

    it.skip('should remove the component from the DOM', () => {
      ResultTextSelectors.firstInResult().should('not.exist');
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
      new TestFixture()
        .with(
          addResultTextInResultList({
            field: field,
            'should-highlight': shouldHighlight.toString(),
          })
        )
        .withCustomResponse((response) =>
          response.results.forEach((result) => {
            result.raw[field] = rawValue;
            if (highlightsAvailable) {
              (result as any)[`${field}Highlights`] = [highlight];
            }
          })
        )
        .withFieldCaptions(field, {[rawValue]: localizedValue})
        .init();
    }

    describe('when the "shouldHighlight" prop is true and when highlights are available for the field', () => {
      beforeEach(() => {
        setupExistingFieldValue(true, true);
      });

      it('should render the highlighted text', () => {
        ResultTextSelectors.firstInResult().should('have.text', rawValue);
        ResultTextSelectors.firstInResult()
          .find('[part="highlight"]')
          .should('have.text', highlightedValue);
      });
    });

    describe('when the "shouldHighlight" prop is false', () => {
      beforeEach(() => {
        setupExistingFieldValue(false, true);
      });

      it('should render text value with localization', () => {
        ResultTextSelectors.firstInResult().should('have.text', localizedValue);
        ResultTextSelectors.firstInResult()
          .find('[part="highlight"]')
          .should('not.exist');
      });

      it.skip('should render an "atomic-text" component with the localized value', () => {
        ResultTextSelectors.firstInResult()
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
        ResultTextSelectors.firstInResult().should('have.text', localizedValue);
        ResultTextSelectors.highlight().should('not.exist');
      });

      it.skip('should render an "atomic-text" component with the localized value', () => {
        ResultTextSelectors.firstInResult()
          .find('atomic-text')
          .shadow()
          .should('have.text', localizedValue);
      });
    });
  });
});
