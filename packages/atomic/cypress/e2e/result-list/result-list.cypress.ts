import {pagerComponent, PagerSelectors} from '../pager-selectors';
import {withAnySectionnableResultList} from './result-list-utils';
import {
  resultListComponent,
  ResultListSelectors,
} from './result-list-selectors';
import {generateComponentHTML, TestFixture} from '../../fixtures/test-fixture';
import {
  addFoldedResultList,
  addResultList,
  buildTemplateWithSections,
} from './result-list-actions';
import * as CommonAssertions from '../common-assertions';
import {
  foldedResultListComponent,
  FoldedResultListSelectors,
} from './folded-result-list-selectors';
import {getSearchInterface} from '../search-interface-utils';

const foldedResultListConfig = {
  componentSelectors: FoldedResultListSelectors,
  componentTag: foldedResultListComponent,
  addResultFn: addFoldedResultList,
  title: 'Folded result List Component',
};

const resultListConfig = {
  componentSelectors: ResultListSelectors,
  componentTag: resultListComponent,
  addResultFn: addResultList,
  title: 'Result List Component',
};

const configs = [foldedResultListConfig, resultListConfig] as const;

configs.forEach(({componentSelectors, componentTag, addResultFn, title}) => {
  describe(title, () => {
    it('should load', () => {
      new TestFixture().with(addResultFn()).init();
      componentSelectors.result().should('have.length.above', 0);
    });

    describe('when no first search has yet been executed', () => {
      beforeEach(() => {
        new TestFixture()
          .withoutFirstAutomaticSearch()
          .with(addResultFn())
          .init();
      });

      it('should render placeholder components', () => {
        componentSelectors.placeholder().should('be.visible');
      });
    });

    describe('when an initial search is executed', () => {
      it('should render the correct number of results', () => {
        new TestFixture().with(addResultFn()).init();
        componentSelectors.result().should('have.length', 10);
      });
    });

    describe('when injecting a result list after an initial search is executed', () => {
      beforeEach(() => {
        new TestFixture().init();
        getSearchInterface((searchInterface) => {
          const resultListEl = document.createElement('atomic-result-list');
          searchInterface.appendChild(resultListEl);
          cy.wait(200);
        });
      });

      CommonAssertions.assertConsoleError(false);
    });

    describe('when multiple searches are executed', () => {
      beforeEach(() => {
        new TestFixture()
          .with(addResultFn())
          .withElement(generateComponentHTML(pagerComponent))
          .init();
      });

      it('should update the results', () => {
        let firstResultHtml: string;

        componentSelectors.firstResult().then((element) => {
          firstResultHtml = element[0].innerHTML;
        });

        PagerSelectors.buttonNext().click();
        cy.wait(500);

        componentSelectors.firstResult().should((element) => {
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
            addResultFn(
              buildTemplateWithSections({
                title: generateLineHeightElement(),
                excerpt: generateLineHeightElement(),
                bottomMetadata: generateLineHeightElement(),
              })
            )
          )
          .init();
        componentSelectors.shadow().find('.list-wrapper:not(.placeholder)');
      });

      withAnySectionnableResultList(
        (display, imageSize, density) => {
          it('should expose --line-height in the title section', () => {
            componentSelectors.sections
              .title()
              .find(lineHeightSelector)
              .should('be.visible');
          });

          it('should expose --line-height in the excerpt section', () => {
            componentSelectors.sections
              .excerpt()
              .find(lineHeightSelector)
              .should('be.visible');
          });

          it('should expose --line-height in the bottom-metadata section', () => {
            componentSelectors.sections
              .bottomMetadata()
              .find(lineHeightSelector)
              .should('be.visible');
          });

          if (!(componentTag === 'atomic-folded-result-list')) {
            it(`should pass the display-${display} class to the list root`, () => {
              componentSelectors
                .root()
                .should('have.class', `display-${display}`);
            });
          }

          it(`should pass the image-${imageSize} class to the list root`, () => {
            componentSelectors
              .root()
              .should('have.class', `image-${imageSize}`);
          });

          it(`should pass the density-${density} class to the list root`, () => {
            componentSelectors
              .root()
              .should('have.class', `density-${density}`);
          });
        },
        {folded: componentTag === 'atomic-folded-result-list'}
      );
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
            addResultFn(
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

      withAnySectionnableResultList(
        () => {
          CommonAssertions.assertAccessibility(componentTag);
        },
        {
          densities: ['normal'],
          imageSizes: ['icon', 'small'],
          folded: componentTag === 'atomic-folded-result-list',
        }
      );
    });
  });
});

describe('deprecated image prop on result-list', () => {
  it('should use image prop if defined', () => {
    new TestFixture()
      .with(addResultList(undefined, {image: 'large'}))
      .withoutFirstAutomaticSearch()
      .init();

    ResultListSelectors.shadow().find('.image-large').should('exist');
  });

  it('should use image-size prop if defined', () => {
    new TestFixture()
      .with(addResultList(undefined, {'image-size': 'small'}))
      .withoutFirstAutomaticSearch()
      .init();

    ResultListSelectors.shadow().find('.image-small').should('exist');
  });
  it('should prioritize image-size over image prop if both are defined', () => {
    new TestFixture()
      .with(addResultList(undefined, {'image-size': 'small', image: 'large'}))
      .withoutFirstAutomaticSearch()
      .init();

    ResultListSelectors.shadow().find('.image-small').should('exist');
    ResultListSelectors.shadow().find('.image-large').should('not.exist');
  });
});
