import {setUpPage} from '../../utils/setupComponent';
import {createAliasNavigation, PagerSelectors} from '../pager-selectors';
import {withAnySectionnableResultList} from './result-list-utils';
import {
  ResultListSelectors,
  generateResultList,
  generateResultTemplate,
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
    setUpPage(generateResultList());
    cy.get(ResultListSelectors.component)
      .find(ResultListSelectors.result)
      .should('have.length.above', 0);
  });

  describe('when no first search has yet been executed', () => {
    beforeEach(() => {
      setUpPage(generateResultList(), false);
    });

    it('should render placeholder components', () => {
      cy.get(ResultListSelectors.component)
        .find(ResultListSelectors.placeholder)
        .should('be.visible');
    });
  });

  describe('when an initial search is executed', () => {
    it('should render the correct number of results', () => {
      setUpPage(generateResultList());
      cy.get(ResultListSelectors.component)
        .find(ResultListSelectors.result)
        .should('have.length', 10);
    });
  });

  describe('when multiple searches are executed', () => {
    it('should update the results', () => {
      let firstResultHtml: string;
      setUpPage(
        `${generateResultList()}<${PagerSelectors.pager}></${
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

  describe('with elements to measure line height', () => {
    const lineHeightSelector = '#line-height-el';

    function generateLineHeightElement() {
      return `<div
        id="${lineHeightSelector.slice(1)}"
        style="background-color: red; width: var(--line-height, 0); height: var(--line-height, 0);"
      ></div>`;
    }

    before(() => {
      setUpPage(
        generateResultList(
          generateResultTemplate({
            title: generateLineHeightElement(),
            excerpt: generateLineHeightElement(),
            bottomMetadata: generateLineHeightElement(),
          })
        )
      );
      cy.get('.list-wrapper:not(.placeholder)');
    });

    withAnySectionnableResultList(() => {
      it('should expose --line-height in the title section', () => {
        getFirstResult()
          .find(ResultListSelectors.sections.title)
          .find(lineHeightSelector)
          .should('be.visible');
      });

      it('should expose --line-height in the excerpt section', () => {
        getFirstResult()
          .find(ResultListSelectors.sections.excerpt)
          .find(lineHeightSelector)
          .should('be.visible');
      });

      it('should expose --line-height in the bottom-metadata section', () => {
        getFirstResult()
          .find(ResultListSelectors.sections.bottomMetadata)
          .find(lineHeightSelector)
          .should('be.visible');
      });
    });
  });

  describe('with a full result template', () => {
    function generateSimpleTextElement() {
      return '<span>I will not use meaningless placeholder text for testing</span>';
    }

    before(() => {
      setUpPage(
        generateResultList(
          generateResultTemplate({
            visual: generateSimpleTextElement(),
            badges: generateSimpleTextElement(),
            actions: generateSimpleTextElement(),
            title: generateSimpleTextElement(),
            titleMetadata: generateSimpleTextElement(),
            emphasized: generateSimpleTextElement(),
            excerpt: generateSimpleTextElement(),
            bottomMetadata: generateSimpleTextElement(),
          })
        )
      );
    });

    withAnySectionnableResultList(() => {
      it.skip('should pass accessibility tests', () => {
        cy.checkA11y();
      });
    });
  });
});
