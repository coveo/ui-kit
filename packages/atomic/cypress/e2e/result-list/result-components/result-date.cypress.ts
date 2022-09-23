import {
  generateComponentHTML,
  TagProps,
  TestFixture,
} from '../../../fixtures/test-fixture';
import * as CommonAssertions from '../../common-assertions';
import {addResultList, buildTemplateWithSections} from '../result-list-actions';
import {
  resultDateComponent,
  ResultDateSelectors,
} from './result-date-selectors';

interface ResultDateProps {
  field?: string;
  format?: string;
}

const addResultDateInResultList = (props: ResultDateProps = {}) =>
  addResultList(
    buildTemplateWithSections({
      bottomMetadata: generateComponentHTML(
        resultDateComponent,
        props as TagProps
      ),
    })
  );

describe('Result Date Component', () => {
  describe('when not used inside a result template', () => {
    beforeEach(() => {
      new TestFixture()
        .withElement(generateComponentHTML(resultDateComponent))
        .init();
    });

    CommonAssertions.assertRemovesComponent(ResultDateSelectors.shadow);
    CommonAssertions.assertConsoleError();
  });

  describe('when the field does not exist for the result', () => {
    beforeEach(() => {
      new TestFixture()
        .with(addResultDateInResultList({field: 'thisfielddoesnotexist'}))
        .init();
    });

    CommonAssertions.assertRemovesComponent(ResultDateSelectors.firstInResult);
    CommonAssertions.assertConsoleError(false);
  });

  describe('when the field value is not a date', () => {
    beforeEach(() => {
      const field = 'my-field';
      new TestFixture()
        .with(addResultDateInResultList({field}))
        .withCustomResponse((response) =>
          response.results.forEach((result) => (result.raw[field] = 'Abc'))
        )
        .init();
    });

    CommonAssertions.assertRemovesComponent(ResultDateSelectors.firstInResult);
    CommonAssertions.assertConsoleError();
  });

  describe('when the field is valid', () => {
    const field = 'my-creation-date';
    const apiDate = '2021/09/03@10:31:23';
    const format = 'YYYY-MM-DD';
    beforeEach(() => {
      new TestFixture()
        .with(addResultDateInResultList({field, format}))
        .withCustomResponse((response) =>
          response.results.forEach((result) => (result.raw[field] = apiDate))
        )
        .init();
    });

    it('should render the field value formatted correctly', () => {
      ResultDateSelectors.firstInResult().should('have.text', '2021-09-03');
    });

    CommonAssertions.assertAccessibility(ResultDateSelectors.firstInResult);
  });
});
