import {
  addTag,
  generateComponentHTML,
  TagProps,
  TestFixture,
} from '../../../fixtures/test-fixture';
import {
  fieldConditionComponent,
  FieldConditionSelectors,
} from './field-condition-selector';
import * as CommonAssertions from '../../common-assertions';
import {
  addResultList,
  buildTemplateWithoutSections,
} from '../result-list-actions';

const addInResultListFixture = (props: TagProps) => {
  return new TestFixture()
    .with(
      addResultList(
        buildTemplateWithoutSections([
          generateComponentHTML(fieldConditionComponent, props),
        ])
      )
    )
    .withCustomResponse((response) => {
      response.results.forEach((result) => {
        result.raw.afieldthatexist = 'a value that exist';
        result.raw.anotherfieldthatexist = 'another value that exist';
      });
    })
    .init();
};

describe('Field Condition Component', () => {
  describe('when not used inside a result template', () => {
    beforeEach(() => {
      new TestFixture()
        .with((e) => addTag(e, fieldConditionComponent, {}))
        .init();
    });

    it('should be removed from the DOM', () => {
      cy.get(fieldConditionComponent).should('not.exist');
    });
    CommonAssertions.assertConsoleError();
  });

  it('the "if-defined" prop should let the element render in the DOM if present', () => {
    addInResultListFixture({'if-defined': 'afieldthatexist'});
    FieldConditionSelectors.firstInResult().should('exist');
  });

  it('the "if-defined" props should remove the element from the DOM if absent', () => {
    addInResultListFixture({'if-defined': 'afieldthatdoesnotexists'});
    FieldConditionSelectors.firstInResult().should('not.exist');
  });

  it('the "must-match" prop should let the element render in the DOM if the value match', () => {
    addInResultListFixture({
      'must-match-afieldthatexist': 'a value that exist',
    });
    FieldConditionSelectors.firstInResult().should('exist');
  });

  it('the "must-match" prop should remove the element from the DOM the value does not match', () => {
    addInResultListFixture({
      'must-match-afieldthatexist': 'a value that does not exist',
    });
    FieldConditionSelectors.firstInResult().should('not.exist');
  });

  it('the "must-match" prop should remove the element from the DOM if absent', () => {
    addInResultListFixture({
      'must-match-afieldthatdoesnotexists': 'a value that does not exist',
    });
    FieldConditionSelectors.firstInResult().should('not.exist');
  });

  describe('when all the conditions are fulfilled', () => {
    it('should render the component', () => {
      addInResultListFixture({
        'if-defined': 'afieldthatexist',
        'must-match-anotherfieldthatexist': 'another value that exist',
      });
      FieldConditionSelectors.firstInResult().should('exist');
    });
  });

  describe('when any of the conditions is unfulfilled', () => {
    it('should remove the component from the DOM', () => {
      addInResultListFixture({
        'if-defined': 'afieldthatexist',
        'must-match-anotherfieldthatexist': 'another value that does not exist',
      });
      FieldConditionSelectors.firstInResult().should('not.exist');
    });
  });
});
