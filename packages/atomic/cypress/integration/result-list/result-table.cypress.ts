import {generateComponentHTML, TestFixture} from '../../fixtures/test-fixture';
import {getDeepText} from '../../utils/elementUtils';
import {resultTextComponent} from './result-components/result-text-selectors';
import {addResultTable} from './result-table-actions';
import {ResultTableSelectors} from './result-table-selectors';

describe('Result List (Table) Component', () => {
  describe('when no first search has yet been executed', () => {
    beforeEach(() => {
      new TestFixture()
        .withoutFirstAutomaticSearch()
        .with(
          addResultTable([{label: 'a', content: generateComponentHTML('span')}])
        )
        .init();
    });

    it('should render placeholder components', () => {
      ResultTableSelectors.placeholder().should('be.visible');
    });
  });

  describe('with no columns', () => {
    beforeEach(() => {
      new TestFixture().with(addResultTable([])).init();
    });

    // CommonAssertions.assertConsoleError();
  });

  describe('with two distinct columns', () => {
    const columns = [
      {
        label: 'first',
        content: generateComponentHTML('span', {title: 'a'}),
      },
      {
        label: 'second',
        content: generateComponentHTML('span', {title: 'b'}),
      },
    ];
    beforeEach(() => {
      new TestFixture().with(addResultTable(columns)).init();
    });

    it('renders labels in their corresponding header', () => {
      ResultTableSelectors.headers().then((elements) => {
        const actualHeaderText = Array.from(elements).map((element) =>
          getDeepText(element)
        );
        const expectedHeaderText = columns.map((col) => col.label);
        expect(actualHeaderText).to.deep.eq(expectedHeaderText);
      });
    });

    it('renders columns in the correct order', () => {
      ResultTableSelectors.firstRowCellsContent().then((elements) => {
        const actualCellContent = Array.from(elements).map(
          (element) => element.innerHTML
        );
        const expectedCellContent = columns.map((col) => col.content.outerHTML);
        expect(actualCellContent).to.deep.eq(expectedCellContent);
      });
    });
  });

  describe('with a column containing a result template component', () => {
    const field = 'train';
    const fieldValue = 'Orient Express';
    const columns = [
      {
        label: 'I like trains',
        content: generateComponentHTML(resultTextComponent, {field}),
      },
    ];
    beforeEach(() => {
      new TestFixture()
        .with(addResultTable(columns))
        .withCustomResponse((response) => {
          response.results[0].raw[field] = fieldValue;
        })
        .init();
    });

    it('renders result template components', () => {
      ResultTableSelectors.firstRowCellsContent().then(([cell]) =>
        expect(getDeepText(cell)).to.contain(fieldValue)
      );
    });
  });
});
