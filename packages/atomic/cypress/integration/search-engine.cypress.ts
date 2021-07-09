import {
  buildSearchEngine,
  getSampleSearchEngineConfiguration,
} from '@coveo/headless';
import {RouteAlias, setupIntercept} from '../utils/setupComponent';

describe('search engine tests', () => {
  it('calling #executeFirstSearch logs an interfaceLoad analytics event', () => {
    const engine = buildSearchEngine({
      configuration: getSampleSearchEngineConfiguration(),
    });

    setupIntercept();

    engine.executeFirstSearch();

    cy.wait(RouteAlias.analytics).then(({request}) => {
      const analyticsBody = request.body;
      expect(analyticsBody).to.have.property('actionCause', 'interfaceLoad');
    });
  });
});
