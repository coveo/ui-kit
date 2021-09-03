import {generateComponentHTML} from '../../../fixtures/test-fixture';
import {
  interceptSearchResponse,
  setUpPage,
} from '../../../utils/setupComponent';
import {executeFirstSearch} from '../../search-interface-utils.cypress';
import {
  generateResultList,
  generateResultTemplate,
  getFirstResult,
} from '../result-list-v1-selectors';
import {ResultLinkSelectors} from './result-link-selectors';

describe('Result Link Component', () => {
  function setupResultLinkPage(
    props: Record<string, string | number>,
    executeSearch = true,
    slot = ''
  ) {
    const component = generateComponentHTML(
      ResultLinkSelectors.component,
      props
    );
    component.innerHTML = slot;
    setUpPage(
      generateResultList(
        generateResultTemplate({
          title: component.outerHTML,
        })
      ),
      executeSearch
    );
  }

  function getFirstResultLink() {
    return getFirstResult().find(ResultLinkSelectors.component);
  }

  describe('when not used inside a result template', () => {
    beforeEach(() => {
      setUpPage(generateComponentHTML(ResultLinkSelectors.component).outerHTML);
    });

    it.skip('should remove the component from the DOM', () => {
      cy.get(ResultLinkSelectors.component).should('not.exist');
    });

    it('should log a console error', () => {
      cy.get(ResultLinkSelectors.component)
        .find('atomic-component-error')
        .should('exist');
    });
  });

  describe('when used inside a result template', () => {
    const clickUri = 'https://somefakewebsite.com/abc';
    const title = 'Abc result';
    function setupResultLink(
      target?: '_self' | '_blank' | '_parent' | '_top',
      slot = ''
    ) {
      setupResultLinkPage(
        {
          ...(target !== undefined ? {target} : {}),
        },
        false,
        slot
      );
      interceptSearchResponse((response) =>
        response.results.forEach((result) => {
          result.clickUri = clickUri;
          result.title = title;
        })
      );
      executeFirstSearch();
    }

    it('the "target" prop should set the target on the "a" tag', () => {
      setupResultLink('_parent');
      getFirstResultLink().find('a').should('have.attr', 'target', '_parent');
    });

    it('the "href" attribute of the "a" tag should be the result\'s clickUri', () => {
      setupResultLink();
      getFirstResultLink().find('a').should('have.attr', 'href', clickUri);
    });

    describe('when there is a slot', () => {
      const slottedComponent = 'canvas';
      beforeEach(() => {
        setupResultLink(
          undefined,
          generateComponentHTML(slottedComponent).outerHTML
        );
      });

      it('should render the slot inside of the "a" tag', () => {
        getFirstResultLink().find(slottedComponent).should('exist');
      });
    });

    describe('when there is not slot', () => {
      beforeEach(() => {
        setupResultLink();
      });

      it('should render an "atomic-result-text" component containing the title', () => {
        getFirstResultLink().should('have.text', title);
      });
    });
  });
});
