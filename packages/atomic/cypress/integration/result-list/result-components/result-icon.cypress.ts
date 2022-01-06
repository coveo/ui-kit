import {
  generateComponentHTML,
  TestFixture,
} from '../../../fixtures/test-fixture';
import * as CommonAssertions from '../../common-assertions';
import {
  addFieldValueInResponse,
  addResultList,
  buildTemplateWithSections,
} from '../result-list-actions';
import * as IconAssertions from '../../icon-assertions';
import {
  resultIconComponent,
  ResultIconSelectors,
} from './result-icon-selectors';

const addResultIconInResultList = () =>
  addResultList(
    buildTemplateWithSections({
      visual: generateComponentHTML(resultIconComponent),
    })
  );

describe('Result Icon Component', () => {
  describe('when not used inside a result template', () => {
    beforeEach(() => {
      new TestFixture()
        .withElement(generateComponentHTML(resultIconComponent))
        .init();
    });

    CommonAssertions.assertRemovesComponent(() => cy.get(resultIconComponent));
    CommonAssertions.assertConsoleError();
  });

  describe('when the "filetype" field value matches user.svg', () => {
    beforeEach(() => {
      new TestFixture()
        .with(addResultIconInResultList())
        .with(addFieldValueInResponse('filetype', 'box'))
        .with(addFieldValueInResponse('objecttype', 'Hello, World!'))
        .init();
    });

    IconAssertions.assertRendersIcon(
      () => ResultIconSelectors.svg().first(),
      'user'
    );

    CommonAssertions.assertAccessibility(ResultIconSelectors.firstInResult);
  });

  describe('when the "objecttype" field value matches picklist_type.svg', () => {
    beforeEach(() => {
      new TestFixture()
        .with(addResultIconInResultList())
        .with(addFieldValueInResponse('filetype', 'Hello, World!'))
        .with(addFieldValueInResponse('objecttype', 'board'))
        .init();
    });

    IconAssertions.assertRendersIcon(
      () => ResultIconSelectors.svg().first(),
      'picklist_type'
    );
  });

  describe('when neither the "objecttype" nor "filetype" field value matches an icon', () => {
    beforeEach(() => {
      new TestFixture()
        .with(addResultIconInResultList())
        .with(addFieldValueInResponse('filetype', 'Hello, World!'))
        .with(addFieldValueInResponse('objecttype', 'Hello, World!'))
        .init();
    });

    IconAssertions.assertRendersIcon(
      () => ResultIconSelectors.svg().first(),
      'custom'
    );
  });
});
