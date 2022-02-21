import {RouteAlias, setupIntercept} from '../utils/setupComponent';

describe('Layouts', () => {
  it('should compare screenshots', () => {
    setupIntercept();
    cy.visit('/tests/search-layout.html');
    cy.wait(RouteAlias.analytics);
    cy.wait(1000);
    cy.contains('atomic-search-interface');
    cy.percySnapshot('Search layout', {widths: [500, 1200]});
  });
});
