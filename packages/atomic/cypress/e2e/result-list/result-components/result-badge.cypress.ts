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

const addResultBadgeInResultList = (
  props: ResultBadgeProps = {},
  slot?: HTMLElement
) => {
  const resultBadgeEl = generateComponentHTML(
    resultBadgeComponent,
    props as TagProps
  );
  if (slot) {
    resultBadgeEl.appendChild(slot);
  }
  return addResultList(
    buildTemplateWithSections({
      bottomMetadata: resultBadgeEl,
    })
  );
};

describe('Result Badge Component', () => {
  describe('outside of a result template', () => {
    describe('with a field', () => {
      beforeEach(() => {
        new TestFixture()
          .withElement(generateComponentHTML(resultBadgeComponent))
          .init();
      });

      CommonAssertions.assertRemovesComponent();
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

        CommonAssertions.assertConsoleError(false);
      });

      describe('when the field value is a string', () => {
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
          ResultBadgeSelectors.resultText().find('atomic-text').shadow().should('contain.text', localizedText);
        });
        it('should be accessible', () => {
          CommonAssertions.assertAccessibility(
            ResultBadgeSelectors.firstInResult
          );
        });
      });

      describe('when a label is specified', () => {
        const rawText = 'hello-world';
        const localizedText = 'Hello, World!';
        beforeEach(() => {
          new TestFixture()
            .with(addResultBadgeInResultList({label: rawText}))
            .withTranslation({[rawText]: localizedText})
            .init();
        });

        it('renders the localized text', () => {
          ResultBadgeSelectors.text().should('contain.text', localizedText);
        });
      });

      describe('when a slot is specified', () => {
        beforeEach(() => {
          new TestFixture()
            .with(
              addResultBadgeInResultList({}, generateComponentHTML('canvas'))
            )
            .init();
        });

        it('should render the specified element', () => {
          ResultBadgeSelectors.labelPart()
            .find('slot')
            .should((el) => {
              expect(
                el
                  .get()[0]
                  .assignedElements()
                  .find((el) => el.tagName === 'CANVAS')
              ).not.to.be.undefined;
            });
        });
      });
    });
  });
});
