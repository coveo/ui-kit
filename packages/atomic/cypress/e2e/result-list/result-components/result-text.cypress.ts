import {HighlightKeyword, Result} from '@coveo/headless';
import {
  generateComponentHTML,
  TagProps,
  TestFixture,
} from '../../../fixtures/test-fixture';
import * as CommonAssertions from '../../common-assertions';
import {addResultList, buildTemplateWithSections} from '../result-list-actions';
import {
  resultTextComponent,
  ResultTextSelectors,
} from './result-text-selectors';

interface ResultTextProps {
  field?: string;
  default?: string;
  'should-highlight'?: string;
}

const addResultTextInResultList = (props: ResultTextProps = {}) =>
  addResultList(
    buildTemplateWithSections({
      bottomMetadata: generateComponentHTML(
        resultTextComponent,
        props as TagProps
      ),
    })
  );

describe('Result Text Component', () => {
  describe('when not used inside a result template', () => {
    beforeEach(() => {
      new TestFixture()
        .withElement(generateComponentHTML(resultTextComponent))
        .init();
    });

    CommonAssertions.assertRemovesComponent(ResultTextSelectors.shadow);
    CommonAssertions.assertConsoleError();
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

    CommonAssertions.assertRemovesComponent(ResultTextSelectors.firstInResult);
  });

  describe('when the field value is not a string', () => {
    const field = 'hello';
    beforeEach(() => {
      new TestFixture()
        .with(addResultTextInResultList({field}))
        .withCustomResponse((response) =>
          response.results.forEach((result) => (result.raw[field] = 1337))
        )
        .init();
    });

    CommonAssertions.assertRemovesComponent(ResultTextSelectors.firstInResult);
    CommonAssertions.assertConsoleError(false);
  });

  describe('when the field value is multi value', () => {
    const field = 'hello';
    beforeEach(() => {
      new TestFixture()
        .with(addResultTextInResultList({field}))
        .withCustomResponse((response) =>
          response.results.forEach(
            (result) => (result.raw[field] = ['a', 'b', 'c'])
          )
        )
        .init();
    });

    CommonAssertions.assertRemovesComponent(ResultTextSelectors.firstInResult);
    CommonAssertions.assertConsoleErrorMessage(
      'atomic-result-text cannot be used with multi value field'
    );
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
              (result as Result & Record<string, HighlightKeyword[]>)[
                `${field}Highlights`
              ] = [highlight];
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
        ResultTextSelectors.highlight().should('have.text', highlightedValue);
      });

      CommonAssertions.assertAccessibility(ResultTextSelectors.firstInResult);
    });

    describe('when the "shouldHighlight" prop is false', () => {
      beforeEach(() => {
        setupExistingFieldValue(false, true);
      });

      it('should render text value with localization', () => {
        ResultTextSelectors.firstInResult().should('have.text', localizedValue);
        ResultTextSelectors.highlight().should('not.exist');
      });

      it('should render text value with localization', () => {
        ResultTextSelectors.firstInResult().should('have.text', localizedValue);
        ResultTextSelectors.highlight().should('not.exist');
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
    });
  });
});
