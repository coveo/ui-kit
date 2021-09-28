import {createAliasNavigation, PagerSelectors} from '../pager-selectors';
import {withAnySectionnableResultList} from './result-list-utils';
import {ResultListSelectors} from './result-list-selectors';
import {generateComponentHTML, TestFixture} from '../../fixtures/test-fixture';
import {addResultList, buildTemplateWithSections} from './result-list-actions';

describe('Result List Component', () => {
  it('should load', () => {
    new TestFixture().with(addResultList()).init();
    ResultListSelectors.result().should('have.length.above', 0);
  });

  describe('when no first search has yet been executed', () => {
    beforeEach(() => {
      new TestFixture()
        .withoutFirstAutomaticSearch()
        .with(addResultList())
        .init();
    });

    it('should render placeholder components', () => {
      ResultListSelectors.placeholder().should('be.visible');
    });
  });

  describe('when an initial search is executed', () => {
    it('should render the correct number of results', () => {
      new TestFixture().with(addResultList()).init();
      ResultListSelectors.result().should('have.length', 10);
    });
  });

  describe('when multiple searches are executed', () => {
    beforeEach(() => {
      new TestFixture()
        .with(addResultList())
        .withElement(generateComponentHTML(PagerSelectors.pager))
        .init();
      createAliasNavigation();
    });

    it('should update the results', () => {
      let firstResultHtml: string;

      ResultListSelectors.firstResult().then((element) => {
        firstResultHtml = element[0].innerHTML;
      });

      cy.get('@nextButton').click();
      cy.wait(500);

      ResultListSelectors.firstResult().should((element) => {
        const secondResultHtml = element[0].innerHTML;
        expect(secondResultHtml).not.to.equal(firstResultHtml);
      });
    });
  });

  describe('with elements to measure line height', () => {
    const lineHeightSelector = '#line-height-el';

    function generateLineHeightElement() {
      return generateComponentHTML('div', {
        id: lineHeightSelector.slice(1),
        style:
          'background-color: red; width: var(--line-height, 0); height: var(--line-height, 0);',
      });
    }

    before(() => {
      new TestFixture()
        .with(
          addResultList(
            buildTemplateWithSections({
              title: generateLineHeightElement(),
              excerpt: generateLineHeightElement(),
              bottomMetadata: generateLineHeightElement(),
            })
          )
        )
        .init();
      ResultListSelectors.shadow().find('.list-wrapper:not(.placeholder)');
    });

    withAnySectionnableResultList(() => {
      it('should expose --line-height in the title section', () => {
        ResultListSelectors.sections
          .title()
          .find(lineHeightSelector)
          .should('be.visible');
      });

      it('should expose --line-height in the excerpt section', () => {
        ResultListSelectors.sections
          .excerpt()
          .find(lineHeightSelector)
          .should('be.visible');
      });

      it('should expose --line-height in the bottom-metadata section', () => {
        ResultListSelectors.sections
          .bottomMetadata()
          .find(lineHeightSelector)
          .should('be.visible');
      });
    });
  });

  describe('with a full result template', () => {
    function generateSimpleTextElement() {
      const element = generateComponentHTML('span');
      element.innerText =
        'I will not use meaningless placeholder text for testing';
      return element;
    }

    before(() => {
      new TestFixture()
        .with(
          addResultList(
            buildTemplateWithSections({
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
        )
        .init();
    });

    withAnySectionnableResultList(() => {
      it.skip('should pass accessibility tests', () => {
        cy.checkA11y();
      });
    });
  });
});
