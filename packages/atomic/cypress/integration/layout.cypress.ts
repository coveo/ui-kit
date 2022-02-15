import {RouteAlias, setupIntercept} from '../utils/setupComponent';

describe('Layouts', () => {
  it('should compare screenshot of a search layout', () => {
    setupIntercept();
    cy.visit('/index.html');
    cy.wait(RouteAlias.analytics);
    cy.wait(1000);
    cy.get('atomic-search-interface').compareSnapshot('search-layout', 0.15);
  });
});
