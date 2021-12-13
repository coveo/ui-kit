import {
  generateComponentHTML,
  TestFixture,
} from '../../../fixtures/test-fixture';
import * as CommonAssertions from '../../common-assertions';
import {
  addResultList,
  buildTemplateWithoutSections,
} from '../result-list-actions';
import {
  fieldsListComponent,
  FieldsListSelectors,
} from './result-fields-list.selector';
import {resultTextComponent} from './result-text-selectors';

const rem = 16;
const separatorWidth = rem * 2;

const addInResultListFixture = (
  numChild: number,
  childrenShouldFit: boolean
) => {
  const childWidth = 128;
  const rowHeight = rem;
  const numRows = 2;

  const numChildPerRow = Math.ceil(numChild / numRows);
  const numSeparatorPerLine = numChildPerRow - 1;
  const minRowWidth =
    numChildPerRow * childWidth + numSeparatorPerLine * separatorWidth;
  const totalHeight = numRows * rowHeight;

  const container = generateComponentHTML('div', {
    style: `
     display: inline-block;
     line-height: ${rowHeight}px;
     width: ${minRowWidth - (childrenShouldFit ? 0 : 1)}px;
     height: ${totalHeight}px;`.replace('\n', ''),
  });

  const fieldsListComponentHTMLElement =
    generateComponentHTML(fieldsListComponent);
  [...Array(numChild).keys()].forEach(() => {
    const someText = generateComponentHTML(resultTextComponent, {
      field: 'afieldwithsometext',
      style: `width: ${childWidth}px;`,
    });
    fieldsListComponentHTMLElement.appendChild(someText);
  });
  container.appendChild(fieldsListComponentHTMLElement);

  return new TestFixture()
    .with(addResultList(buildTemplateWithoutSections(container)))
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
      new TestFixture()
        .withElement(generateComponentHTML(fieldsListComponent))
        .init();
    });

    CommonAssertions.assertRemovesComponent(() => cy.get(fieldsListComponent));
    CommonAssertions.assertConsoleError();
  });

  it('should display all children if it has the space to do so', () => {
    addInResultListFixture(5, true);
    FieldsListSelectors.firstInResult().children().should('be.visible');
  });

  it('should hide some children if there is not enough space to display all of them', () => {
    addInResultListFixture(5, false);
    FieldsListSelectors.firstInResult()
      .children()
      .filter(':hidden')
      .should('have.length.above', 0);
  });

  it('should hide dividers at end of row', () => {
    addInResultListFixture(5, false);
    FieldsListSelectors.firstInResult()
      .children()
      .filter('.hide-divider')
      .should('have.length.above', 0);
  });
});
