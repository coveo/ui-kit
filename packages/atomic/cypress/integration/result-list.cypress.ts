import {setUpPage} from '../utils/setupComponent';
import {createAliasNavigation, PagerSelectors} from './pager-selectors';
import {
  ResultListSelectors,
  resultListComponent,
} from './result-list-selectors';

describe('Result List Component', () => {
  function getFirstResult() {
    return cy
      .get(ResultListSelectors.component)
      .find(ResultListSelectors.result)
      .first()
      .shadow();
  }

  it('should load', () => {
    setUpPage(resultListComponent());
    cy.get(ResultListSelectors.component)
      .find(ResultListSelectors.result)
      .should('have.length.above', 0);
  });

  describe('when no first search has yet been executed', () => {
    beforeEach(() => {
      setUpPage(resultListComponent(), false);
    });

    it('should render a placeholder component', () => {
      cy.get(ResultListSelectors.component)
        .find(ResultListSelectors.placeholder)
        .should('be.visible');
    });
  });

  describe('when an initial search is executed', () => {
    it('should render the correct number of results', () => {
      setUpPage(resultListComponent());
      cy.get(ResultListSelectors.component)
        .find(ResultListSelectors.result)
        .should('have.length', 10);
    });
  });

  describe('when multiple searches are executed', () => {
    it('should update the results', () => {
      let firstResultHtml: string;
      setUpPage(
        `${resultListComponent()}<${PagerSelectors.pager}></${
          PagerSelectors.pager
        }>`
      );
      createAliasNavigation();

      getFirstResult().then((element) => {
        firstResultHtml = element[0].innerHTML;
      });

      cy.get('@nextButton').click();
      cy.wait(500);

      getFirstResult().should((element) => {
        const secondResultHtml = element[0].innerHTML;
        expect(secondResultHtml).not.to.equal(firstResultHtml);
      });
    });
  });
});
