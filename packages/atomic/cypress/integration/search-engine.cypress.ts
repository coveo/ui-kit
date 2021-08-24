import {
  buildSearchEngine,
  buildStandaloneSearchBox,
  getSampleSearchEngineConfiguration,
  loadSearchAnalyticsActions,
  SearchEngine,
} from '@coveo/headless';
import {RouteAlias, setupIntercept} from '../utils/setupComponent';

describe('search engine tests', () => {
  let engine: SearchEngine;

  beforeEach(() => {
    engine = buildSearchEngine({
      configuration: getSampleSearchEngineConfiguration(),
    });

    setupIntercept();
  });

  describe('#executeFirstSearch', () => {
    it('when passed no arguments, it logs an interfaceLoad analytics event', () => {
      engine.executeFirstSearch();

      cy.wait(RouteAlias.analytics).then(({request}) => {
        const analyticsBody = request.body;
        expect(analyticsBody).to.have.property('actionCause', 'interfaceLoad');
      });
    });

    it('when passed an analytics action, it logs the passed action', () => {
      const {logSearchFromLink} = loadSearchAnalyticsActions(engine);
      engine.executeFirstSearch(logSearchFromLink());

      cy.wait(RouteAlias.analytics).then(({request}) => {
        const analyticsBody = request.body;
        expect(analyticsBody).to.have.property('actionCause', 'searchFromLink');
      });
    });
  });

  describe('#executeFirstSearchAfterStandaloneSearchBoxRedirect', () => {
    it(`when a search is executed from a standalone search box,
    passing the analytics object logs a searchFromLink`, () => {
      const searchBox = buildStandaloneSearchBox(engine, {
        options: {redirectionUrl: '/search-page'},
      });

      searchBox.submit();

      engine.executeFirstSearchAfterStandaloneSearchBoxRedirect(
        searchBox.state.analytics
      );

      cy.wait(RouteAlias.analytics).then(({request}) => {
        const analyticsBody = request.body;
        expect(analyticsBody).to.have.property('actionCause', 'searchFromLink');
      });
    });

    it(`when a suggestion is selected from a standalone search box,
    passing the analytics object logs a omniboxFromLink`, () => {
      const searchBox = buildStandaloneSearchBox(engine, {
        options: {redirectionUrl: '/search-page'},
      });

      searchBox.selectSuggestion('hello');
      engine.executeFirstSearchAfterStandaloneSearchBoxRedirect(
        searchBox.state.analytics
      );

      cy.wait(RouteAlias.analytics).then(({request}) => {
        const analyticsBody = request.body;
        expect(analyticsBody).to.have.property(
          'actionCause',
          'omniboxFromLink'
        );
      });
    });
  });
});
