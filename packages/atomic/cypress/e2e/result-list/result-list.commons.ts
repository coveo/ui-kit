import {
  generateComponentHTML,
  TagProps,
  TestFixture,
} from '../../fixtures/test-fixture';
import * as CommonAssertions from '../common-assertions';
import {pagerComponent, PagerSelectors} from '../pager-selectors';
import {getSearchInterface} from '../search-interface-utils';
import {buildTemplateWithSections} from './result-list-actions';
import {ResultListSelectors} from './result-list-selectors';
import {withAnySectionnableResultList} from './result-list-utils';

export default (
  componentSelectors:
    | typeof ResultListSelectors,
  componentTag: string,
  addResultFn: (
    template?: HTMLElement,
    tags?: TagProps
  ) => (fixture: TestFixture) => void,
  title: string
) => {
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

    // TODO: Address this during the atomic-result-list lit migration
    describe.skip('when injecting a result list after an initial search is executed', () => {
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
          firstResultHtml = element[0];
        });

        PagerSelectors.buttonNext().click();
        cy.wait(500);

        componentSelectors.firstResult().should((element) => {
          const secondResultHtml = element[0];
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
            'background-color: red; width: calc(1.125rem* 1.5); height: calc(1.125rem* 1.5);',
        });
      }

      beforeEach(() => {
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
          it('should be fine', () => {
            //should expose --line-height in the title section
            componentSelectors.sections
              .title()
              .find(lineHeightSelector)
              .should('be.visible');

            //should expose --line-height in the excerpt section
            componentSelectors.sections
              .excerpt()
              .find(lineHeightSelector)
              .should('be.visible');

            //should expose --line-height in the bottom-metadata section
            componentSelectors.sections
              .bottomMetadata()
              .find(lineHeightSelector)
              .should('be.visible');

            if (!(componentTag === 'atomic-folded-result-list')) {
              //should pass the display-${display} class to the list root
              componentSelectors
                .root()
                .should('have.class', `display-${display}`);
            }

            //should pass the image-${imageSize} class to the list root
            componentSelectors
              .root()
              .should('have.class', `image-${imageSize}`);

            //should pass the density-${density} class to the list root
            componentSelectors
              .root()
              .should('have.class', `density-${density}`);
          });
        },
        {componentTag, useBeforeEach: true}
      );
    });

    describe('with a full result template', () => {
      function generateSimpleTextElement() {
        const element = generateComponentHTML('span');
        element.innerText =
          'I will not use meaningless placeholder text for testing';
        return element;
      }

      beforeEach(() => {
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

     /*  withAnySectionnableResultList(
        () => {
          CommonAssertions.assertAccessibility(componentTag);
        },
        {
          densities: ['normal'],
          imageSizes: ['icon', 'small'],
          componentTag,
          useBeforeEach: true,
        }
      ); */
    });
  });
};
