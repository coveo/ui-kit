import {
  generateComponentHTML,
  TagProps,
  TestFixture,
} from '../../../fixtures/test-fixture';
import * as CommonAssertions from '../../common-assertions';
import {
  addResultList,
  buildTemplateWithoutSections,
} from '../result-list-actions';
import {
  resultLocalizedTextComponent,
  ResultLocalizedTextSelectors,
} from './result-localized-text-selectors';

const addResultLocalizedTextInResultList = (props: TagProps) =>
  addResultList(
    buildTemplateWithoutSections(
      generateComponentHTML(resultLocalizedTextComponent, props)
    )
  );

describe('Result Localized Text Component', () => {
  describe('when not used inside a result template', () => {
    beforeEach(() => {
      new TestFixture()
        .withElement(generateComponentHTML(resultLocalizedTextComponent))
        .init();
    });

    CommonAssertions.assertRemovesComponent(
      ResultLocalizedTextSelectors.shadow
    );
    CommonAssertions.assertConsoleError();
  });

  describe('when the i18n resource does not exist', () => {
    beforeEach(() => {
      new TestFixture()
        .with(
          addResultLocalizedTextInResultList({
            'locale-key': 'this_does_not_exist',
          })
        )
        .init();
    });

    it('output the key directly', () => {
      ResultLocalizedTextSelectors.firstInResult().should(
        'have.text',
        'this_does_not_exist'
      );
    });
    CommonAssertions.assertConsoleError(false);
  });

  describe('when the i18n resource does exist', () => {
    const setup = (props: TagProps) =>
      new TestFixture()
        .withCustomResponse((r) => {
          r.results.forEach((result) => {
            result.raw['somefield'] = 'somevalue';
            result.raw['countsingular'] = 1;
            result.raw['countplural'] = 2;
          });
          return r;
        })
        .with(
          addResultLocalizedTextInResultList({
            'locale-key': 'foo',
            'field-somefield': 'replace_me',
            ...props,
          })
        )
        .withTranslation({
          foo: 'foo {{replace_me}}',
          foo_other: 'foo v4 plural {{replace_me}}',
        });

    it('output the singular key', () => {
      setup({'field-count': 'countsingular'}).init();
      ResultLocalizedTextSelectors.firstInResult().should(
        'have.text',
        'foo somevalue'
      );
    });

    it('output the plural key', () => {
      setup({'field-count': 'countplural'}).init();

      ResultLocalizedTextSelectors.firstInResult().should(
        'have.text',
        'foo v4 plural somevalue'
      );
    });
  });
});
