import {
  generateComponentHTML,
  TagProps,
  TestFixture,
} from '../../../fixtures/test-fixture';
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

    it.skip('should remove the component from the DOM', () => {
      cy.get(resultDateComponent).should('not.exist');
    });

    it.skip('should log a console error', () => {
      cy.get(resultDateComponent)
        .find('atomic-component-error')
        .should('exist');
    });
  });

  describe('when the field does not exist for the result', () => {
    beforeEach(() => {
      new TestFixture()
        .with(addResultDateInResultList({field: 'thisfielddoesnotexist'}))
        .init();
    });

    it('should remove the component from the DOM', () => {
      ResultDateSelectors.firstInResult().should('not.exist');
    });
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

    it('should remove the component from the DOM', () => {
      ResultDateSelectors.firstInResult().should('not.exist');
    });
  });

  describe('when the field is valid', () => {
    const field = 'my-creation-date';
    const apiDate = '2021/09/03@10:31:23';
    function setupFieldDateField(format: string) {
      new TestFixture()
        .with(addResultDateInResultList({field, format}))
        .withCustomResponse((response) =>
          response.results.forEach((result) => (result.raw[field] = apiDate))
        )
        .init();
    }

    describe('when the format is invalid', () => {
      beforeEach(() => {
        setupFieldDateField('yyyy-MM-DD');
      });

      it.skip('should remove the component from the DOM', () => {
        ResultDateSelectors.firstInResult().should('not.exist');
      });
    });

    describe('when the format is valid', () => {
      beforeEach(() => {
        setupFieldDateField('YYYY-MM-DD');
      });

      it('should render the field value formatted correctly', () => {
        ResultDateSelectors.firstInResult().should('have.text', '2021-09-03');
      });
    });
  });
});
