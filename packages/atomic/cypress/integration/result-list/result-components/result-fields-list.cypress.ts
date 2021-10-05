import {
  addTag,
  generateComponentHTML,
  TestFixture,
} from '../../../fixtures/test-fixture';
import * as CommonAssertions from '../../common-assertions';
import {addResultList, buildTemplateWithSections} from '../result-list-actions';
import {
  fieldsListComponent,
  FieldsListSelectors,
} from './result-fields-list.selector';
import {resultTextComponent} from './result-text-selectors';

const addInResultListFixture = (numChild: number) => {
  const fieldsListComponentHTMLElement =
    generateComponentHTML(fieldsListComponent);
  [...Array(numChild).keys()].forEach(() => {
    const someText = generateComponentHTML(resultTextComponent, {
      field: 'afieldwithsometext',
    });
    fieldsListComponentHTMLElement.appendChild(someText);
  });

  return new TestFixture()
    .with(
      addResultList(
        buildTemplateWithSections({
          bottomMetadata: [fieldsListComponentHTMLElement],
        })
      )
    )
    .withCustomResponse((response) => {
      response.results.forEach((result) => {
        result.raw.afieldwithsometext = 'Some text';
      });
    })
    .init();
};

describe('Result Fields Component', () => {
  describe('when not used inside a result template', () => {
    beforeEach(() => {
      new TestFixture().with((e) => addTag(e, fieldsListComponent, {})).init();
    });

    it('should be removed from the DOM', () => {
      cy.get(fieldsListComponent).should('not.exist');
    });
    CommonAssertions.assertConsoleError();
  });

  it('should display all children if it has the space to do so', () => {
    addInResultListFixture(5);
    FieldsListSelectors.firstInResult().children().should('be.visible');
  });

  it('should hide some children if there is not enough space to display all of them', () => {
    addInResultListFixture(50);
    FieldsListSelectors.firstInResult()
      .children()
      .filter(':hidden')
      .should('have.length.above', 0);
  });

  it('should hide dividers at end of row', () => {
    addInResultListFixture(50);
    FieldsListSelectors.firstInResult()
      .children()
      .filter('.hide-divider')
      .should('have.length.above', 0);
  });
});
