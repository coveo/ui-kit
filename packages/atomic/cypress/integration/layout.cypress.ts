import {RouteAlias, setupIntercept} from '../utils/setupComponent';

describe('Layouts', () => {
  it('should compare screenshot of a search layout on desktop', () => {
    cy.viewport('macbook-13');
    setupIntercept();
    cy.visit('/layouts/search.html');
    cy.wait(RouteAlias.analytics);
    cy.get('atomic-search-interface').compareSnapshot(
      'search-layout-desktop',
      0.1
    );
  });

  it('should compare screenshot of a search layout on mobile', () => {
    cy.viewport('iphone-8');
    setupIntercept();
    cy.visit('/layouts/search.html');
    cy.wait(RouteAlias.analytics);
    cy.get('atomic-search-interface').compareSnapshot(
      'search-layout-mobile',
      0.1
    );
  });
});
