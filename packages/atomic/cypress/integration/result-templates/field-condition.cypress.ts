import {
  addTag,
  generateComponentHTML,
  TestFixture,
} from '../../fixtures/test-fixture';
import {fieldConditionComponent} from './field-condition/field-condition-selector';
import * as CommonAssertions from '../common-assertions';
import {
  addResultList,
  buildTemplateWithoutSections,
} from '../result-list/result-list-actions';

describe('Field Condition Component', () => {
  describe('when not used inside a result template', () => {
    beforeEach(() => {
      new TestFixture()
        .with((e) => addTag(e, fieldConditionComponent, {}))
        .init();
    });

    CommonAssertions.assertRemovedFromDOM(fieldConditionComponent);
    CommonAssertions.assertConsoleError();
  });

  describe('when used inside a result template', () => {
    beforeEach(() => {
      new TestFixture().with(
        addResultList(
          buildTemplateWithoutSections([
            generateComponentHTML(fieldConditionComponent),
          ])
        )
      );
    });
  });

  it('the "if-defined" prop should add a condition to the component', () => {
    new TestFixture()
      .with(
        addResultList(
          buildTemplateWithoutSections([
            generateComponentHTML(fieldConditionComponent, {
              'if-defined': 'something',
            }),
          ])
        )
      )
      .withCustomResponse((response) => {
        response.results.forEach(
          (result) => (result.raw.filetype = 'something')
        );
      });
  });

  it.skip('the "if-not-defined" prop should add a condition to the component');

  it.skip('the "must-match-x" prop should add a condition to the component');

  it.skip(
    'the "must-not-match-x" prop should add a condition to the component'
  );

  it.skip('the "conditions" prop should add a condition(s) to the component');

  describe('when all the conditions are fulfilled', () => {
    it.skip('should render the component');
  });

  describe('when any of the conditions is unfulfilled', () => {
    it.skip('should remove the component from the DOM');
  });
});
