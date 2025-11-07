import dayjs from 'dayjs/esm/index.js';
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
  'relative-time'?: boolean;
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

    CommonAssertions.assertRemovesComponent();
  });

  describe('when the field does not exist for the result', () => {
    beforeEach(() => {
      new TestFixture()
        .with(addResultDateInResultList({field: 'thisfielddoesnotexist'}))
        .init();
    });

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

    CommonAssertions.assertRemovesComponent();
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

    it('should be accessible', () => {
      CommonAssertions.assertAccessibility(ResultDateSelectors.firstInResult);
    });
  });

  describe('when using relative time', () => {
    const field = 'my-creation-date';
    const format = 'YYYY-MM-DD';

    const setup = (apiDate: string) => {
      new TestFixture()
        .with(addResultDateInResultList({field, format, 'relative-time': true}))
        .withCustomResponse((response) =>
          response.results.forEach((result) => (result.raw[field] = apiDate))
        )
        .init();
    };

    [
      {in: dayjs().subtract(1, 'day').toISOString(), out: 'Yesterday'},
      {in: dayjs().add(1, 'day').toISOString(), out: 'Tomorrow'},
      {in: dayjs().toISOString(), out: 'Today'},
    ].forEach((testCase) => {
      it(`should render the field value for ${testCase.out} correctly`, () => {
        setup(testCase.in);
        ResultDateSelectors.firstInResult().should('have.text', testCase.out);
      });
    });
  });
});
