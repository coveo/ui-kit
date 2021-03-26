import {setUpPage, setUpPageNoSearch} from '../utils/setupComponent';
import {createAliasNavigation} from './pager-selectors';

export const ResultListSelectors = {
  component: 'atomic-result-list',
  placeholder: 'atomic-result-list-placeholder',
  result: 'atomic-result',
};

const resultListComponent = (slot = '') =>
  `<atomic-result-list>${slot}</atomic-result-list>`;

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
    cy.get(ResultListSelectors.component).should('be.visible');
  });

  describe('when no first search has yet been executed', () => {
    beforeEach(() => {
      setUpPageNoSearch(resultListComponent());
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
      setUpPage(`${resultListComponent()}<atomic-pager></atomic-pager>`);
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

  describe('when a result template contains an error', () => {
    it('should render an "atomic-component-error" component', () => {
      setUpPage(
        resultListComponent(
          `<atomic-result-template>
            <b>i have no template element</b>
          </atomic-result-template>`
        )
      );
      cy.get(ResultListSelectors.component)
        .find('atomic-result-template')
        .shadow()
        .find('atomic-component-error')
        .should('be.visible');
    });
  });
});
