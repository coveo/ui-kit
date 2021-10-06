import {
  generateComponentHTML,
  TagProps,
  TestFixture,
} from '../../../fixtures/test-fixture';
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

      it.skip('should remove the component from the DOM', () => {
        cy.get(resultBadgeComponent).should('not.exist');
      });

      it.skip('should log a console error', () => {
        ResultBadgeSelectors.shadow()
          .find('atomic-component-error')
          .should('exist');
      });
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

        it.skip('should remove the component from the DOM', () => {
          ResultBadgeSelectors.firstInResult().should('not.exist');
        });
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
          ResultBadgeSelectors.firstInResult()
            .find('atomic-result-text', {includeShadowDom: true})
            .should('have.text', localizedText);
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
          ResultBadgeSelectors.firstInResult()
            .find('atomic-text', {includeShadowDom: true})
            .shadow()
            .should('have.text', localizedText);
        });
      });
    });
  });
});
