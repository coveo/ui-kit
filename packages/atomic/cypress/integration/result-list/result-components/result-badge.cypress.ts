import {
  generateComponentHTML,
  TagProps,
  TestFixture,
} from '../../../fixtures/test-fixture';
import * as CommonAssertions from '../../common-assertions';
import {addResultList, buildTemplateWithSections} from '../result-list-actions';
import {
  resultBadgeComponent,
  ResultBadgeSelectors,
} from './result-badge-selectors';

export interface ResultBadgeProps {
  field?: string;
  label?: string;
}

const addResultBadgeInResultList = (props: ResultBadgeProps = {}) =>
  addResultList(
    buildTemplateWithSections({
      bottomMetadata: generateComponentHTML(
        resultBadgeComponent,
        props as TagProps
      ),
    })
  );

describe('Result Badge Component', () => {
  describe('outside of a result template', () => {
    describe('with a field', () => {
      beforeEach(() => {
        new TestFixture()
          .withElement(generateComponentHTML(resultBadgeComponent))
          .init();
      });

      CommonAssertions.assertRemovesComponent(() =>
        cy.get(resultBadgeComponent)
      );
      CommonAssertions.assertConsoleError();
    });
  });

  describe('in a result template', () => {
    describe('with a field', () => {
      describe('when the field does not exist for the result', () => {
        beforeEach(() => {
          new TestFixture()
            .with(addResultBadgeInResultList({field: 'thisfielddoesnotexist'}))
            .init();
        });

        CommonAssertions.assertRemovesComponent(
          ResultBadgeSelectors.firstInResult
        );
      });

      describe('when the field value is valid', () => {
        const field = 'my-field';
        const rawText = 'hello-world';
        const localizedText = 'Hello, World!';
        beforeEach(() => {
          new TestFixture()
            .with(addResultBadgeInResultList({field}))
            .withCustomResponse((response) => {
              response.results.forEach(
                (result) => (result.raw[field] = rawText)
              );
            })
            .withFieldCaptions(field, {[rawText]: localizedText})
            .init();
        });

        it('renders the localized text', () => {
          ResultBadgeSelectors.resultText().should('have.text', localizedText);
        });
      });

      describe('with text', () => {
        const rawText = 'hello-world';
        const localizedText = 'Hello, World!';
        beforeEach(() => {
          new TestFixture()
            .with(addResultBadgeInResultList({label: rawText}))
            .withTranslation({[rawText]: localizedText})
            .init();
        });

        it('renders the localized text', () => {
          ResultBadgeSelectors.text().should('have.text', localizedText);
        });
      });
    });
  });
});
