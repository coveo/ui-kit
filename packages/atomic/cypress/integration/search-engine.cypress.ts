import {
  buildSearchEngine,
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

  it('calling #executeFirstSearch with no arguments logs an interfaceLoad analytics event', () => {
    engine.executeFirstSearch();

    cy.wait(RouteAlias.analytics).then(({request}) => {
      const analyticsBody = request.body;
      expect(analyticsBody).to.have.property('actionCause', 'interfaceLoad');
    });
  });

  it('calling #executeFirstSearch with an analytics action logs the passed action', () => {
    const {logSearchFromLink} = loadSearchAnalyticsActions(engine);
    engine.executeFirstSearch(logSearchFromLink());

    cy.wait(RouteAlias.analytics).then(({request}) => {
      const analyticsBody = request.body;
      expect(analyticsBody).to.have.property('actionCause', 'interfaceLoad');
    });
  });
});
