import {generateComponentHTML} from '../../../fixtures/test-fixture';
import {
  interceptSearchResponse,
  setUpPage,
} from '../../../utils/setupComponent';
import {
  addTranslations,
  executeFirstSearch,
  setFieldCaptions,
} from '../../search-interface-utils.cypress';
import {
  generateResultList,
  generateResultTemplate,
  getFirstResult,
} from '../result-list-v1-selectors';
import {ResultBadgeSelectors} from './result-badge-selectors';

describe('Result Badge Component', () => {
  describe('outside of a result template', () => {
    function setupResultBadgePage(
      props: Record<string, string | number>,
      executeSearch = true
    ) {
      setUpPage(
        generateComponentHTML(ResultBadgeSelectors.component, props).outerHTML,
        executeSearch
      );
    }

    function getResultBadge() {
      return cy.get(ResultBadgeSelectors.component).shadow();
    }

    describe('with a field', () => {
      beforeEach(() => {
        setupResultBadgePage({field: 'title'});
      });

      it.skip('should remove the component from the DOM', () => {
        cy.get(ResultBadgeSelectors.component).should('not.exist');
      });

      it('should log a console error', () => {
        getResultBadge().find('atomic-component-error').should('exist');
      });
    });
  });

  describe('in a result template', () => {
    function setupResultBadgePage(
      props: Record<string, string | number>,
      executeSearch = true
    ) {
      setUpPage(
        generateResultList(
          generateResultTemplate({
            badges: generateComponentHTML(ResultBadgeSelectors.component, props)
              .outerHTML,
          })
        ),
        executeSearch
      );
    }

    function getFirstResultBadge() {
      return getFirstResult().find(ResultBadgeSelectors.component);
    }

    describe('with a field', () => {
      describe('when the field does not exist for the result', () => {
        beforeEach(() => {
          setupResultBadgePage({
            field: 'thisfielddoesnotexist',
          });
        });

        it.skip('should remove the component from the DOM', () => {
          getFirstResultBadge().should('not.exist');
        });
      });

      describe('when the field value is valid', () => {
        const field = 'my-field';
        const rawText = 'hello-world';
        const localizedText = 'Hello, World!';
        beforeEach(() => {
          setupResultBadgePage({field}, false);
          interceptSearchResponse((response) => {
            response.results.forEach((result) => (result.raw[field] = rawText));
          });
          setFieldCaptions(field, {[rawText]: localizedText});
          executeFirstSearch();
        });

        it('renders the localized text', () => {
          getFirstResultBadge()
            .find('atomic-result-text', {includeShadowDom: true})
            .should('have.text', localizedText);
        });
      });

      describe('with text', () => {
        const rawText = 'hello-world';
        const localizedText = 'Hello, World!';
        beforeEach(() => {
          setupResultBadgePage({label: rawText}, false);
          addTranslations({[rawText]: localizedText});
          executeFirstSearch();
        });

        it.skip('renders the localized text', () => {
          getFirstResultBadge()
            .find('atomic-text', {includeShadowDom: true})
            .shadow()
            .should('have.text', localizedText);
        });
      });
    });
  });
});
