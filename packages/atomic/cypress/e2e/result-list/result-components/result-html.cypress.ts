import {
  generateComponentHTML,
  TagProps,
  TestFixture,
} from '../../../fixtures/test-fixture';
import * as CommonAssertions from '../../common-assertions';
import {addResultList, buildTemplateWithSections} from '../result-list-actions';
import {
  resultHtmlComponent,
  ResultHtmlSelectors,
} from './result-html-selectors';

interface ResultHtmlProps {
  field?: string;
  sanitize?: boolean;
}

const addResultHTMLInResultList = (props: ResultHtmlProps = {}) =>
  addResultList(
    buildTemplateWithSections({
      bottomMetadata: generateComponentHTML(
        resultHtmlComponent,
        props as TagProps
      ),
    })
  );

describe('Result Html Component', () => {
  describe('when not used inside a result template', () => {
    beforeEach(() => {
      new TestFixture()
        .withElement(generateComponentHTML(resultHtmlComponent))
        .init();
    });

    CommonAssertions.assertRemovesComponent();
  });

  describe('when the field does not exist for the result', () => {
    beforeEach(() => {
      new TestFixture()
        .with(
          addResultHTMLInResultList({
            field: 'thisfielddoesnotexist',
          })
        )
        .init();
    });

    CommonAssertions.assertConsoleError(false);
  });

  describe('when the field value is not a string', () => {
    const field = 'hello';
    beforeEach(() => {
      new TestFixture()
        .with(addResultHTMLInResultList({field}))
        .withCustomResponse((response) =>
          response.results.forEach((result) => (result.raw[field] = 1337))
        )
        .init();
    });
    CommonAssertions.assertConsoleError(false);
  });

  describe('when the field value exists & is an HTML string', () => {
    const field = 'hello_world';
    const rawValue = '<img src="google.com" onerror="console.log()" />';
    function setupExistingFieldValue(sanitize: boolean) {
      new TestFixture()
        .with(
          addResultHTMLInResultList({
            field: field,
            sanitize,
          })
        )
        .withCustomResponse((response) =>
          response.results.forEach((result) => {
            result.raw[field] = rawValue;
          })
        )
        .init();
    }

    describe('when the "sanitize" prop is true', () => {
      beforeEach(() => {
        setupExistingFieldValue(true);
      });

      it('should render the HTML sanitized', () => {
        ResultHtmlSelectors.atomicHTML()
          .shadow()
          .find('img')
          .should('not.have.attr', 'onerror');
      });
    });

    describe('when the "sanitize" prop is false', () => {
      beforeEach(() => {
        setupExistingFieldValue(false);
      });

      it('should render the HTML as is', () => {
        ResultHtmlSelectors.atomicHTML()
          .shadow()
          .find('img')
          .should('have.attr', 'onerror');
      });
    });
  });
});
