import {RouteAlias, setupIntercept} from '../utils/setupComponent';

describe('Layouts', () => {
  it('should compare screenshot of a search layout on desktop', () => {
    cy.viewport('macbook-13');
    setupIntercept();
    cy.visit('/tests/search-layout.html');
    cy.wait(RouteAlias.analytics);
    cy.wait(1000);
    cy.get('atomic-search-interface').compareSnapshot(
      'search-layout-desktop',
      0.1
    );
  });

  it('should compare screenshot of a search layout on mobile', () => {
    cy.viewport('iphone-8');
    setupIntercept();
    cy.visit('/tests/search-layout.html');
    cy.wait(RouteAlias.analytics);
    cy.wait(1000);
    cy.get('atomic-search-interface').compareSnapshot(
      'search-layout-mobile',
      0.1
    );
  });
});
