import {
  generateComponentHTML,
  TagProps,
  TestFixture,
} from '../../../fixtures/test-fixture';
import * as CommonAssertions from '../../common-assertions';
import {addResultList, buildTemplateWithSections} from '../result-list-actions';
import {
  resultTimespanComponent,
  ResultTimespanSelectors,
} from './result-timespan-selectors';

const addResultTimespanInResultList = (props: TagProps) =>
  addResultList(
    buildTemplateWithSections({
      bottomMetadata: generateComponentHTML(resultTimespanComponent, props),
    })
  );

describe('Result Timespan Component', () => {
  describe('when not used inside a result template', () => {
    beforeEach(() => {
      new TestFixture()
        .withElement(generateComponentHTML(resultTimespanComponent))
        .init();
    });

    CommonAssertions.assertRemovesComponent();
  });

  describe('when the field does not exist for the result', () => {
    beforeEach(() => {
      new TestFixture()
        .with(addResultTimespanInResultList({field: 'thisfielddoesnotexist'}))
        .init();
    });

    CommonAssertions.assertRemovesComponent(
      ResultTimespanSelectors.firstInResult
    );
    CommonAssertions.assertConsoleError();
  });

  describe('when the field value is not a number', () => {
    beforeEach(() => {
      const field = 'my-field';
      new TestFixture()
        .with(addResultTimespanInResultList({field}))
        .withCustomResponse((response) =>
          response.results.forEach((result) => (result.raw[field] = 'Abc'))
        )
        .init();
    });

    CommonAssertions.assertRemovesComponent(
      ResultTimespanSelectors.firstInResult
    );
    CommonAssertions.assertConsoleError();
  });

  describe('when the field value is a duration', () => {
    const setup = (props: Record<string, unknown>) => {
      const field = 'my-field';
      new TestFixture()
        .with(addResultTimespanInResultList({field, ...props}))
        .withCustomResponse((response) =>
          response.results.forEach((result) => (result.raw[field] = '3600'))
        )
        .init();
    };

    it('displays with the proper HH:mm:ss by default in milliseconds', () => {
      setup({unit: 'ms'});
      ResultTimespanSelectors.firstInResult().should('have.text', '00:00:03');
    });

    it('displays with the proper HH:mm:ss by default in seconds', () => {
      setup({unit: 's'});
      ResultTimespanSelectors.firstInResult().should('have.text', '01:00:00');
    });

    it('displays with the proper approximation by default in minutes', () => {
      setup({unit: 'm'});
      ResultTimespanSelectors.firstInResult().should(
        'have.text',
        'About a day'
      );
    });

    it('displays with the proper approximation by default in hours', () => {
      setup({unit: 'h'});
      ResultTimespanSelectors.firstInResult().should(
        'have.text',
        'About 5 months'
      );
    });

    it('displays with the proper approximation by default in days', () => {
      setup({unit: 'd'});
      ResultTimespanSelectors.firstInResult().should(
        'have.text',
        'About 10 years'
      );
    });

    it('displays the configured format', () => {
      setup({unit: 'ms', format: 'H [hours,] m [minutes and] s [seconds]'});
      ResultTimespanSelectors.firstInResult().should(
        'have.text',
        '0 hours, 0 minutes and 3 seconds'
      );
    });
  });
});
