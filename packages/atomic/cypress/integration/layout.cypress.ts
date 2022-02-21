import {RouteAlias, setupIntercept} from '../utils/setupComponent';

describe('Layouts', () => {
  it('should compare screenshots', () => {
    setupIntercept();
    cy.visit('/tests/search-layout.html');
    cy.wait(RouteAlias.analytics);
    cy.get('atomic-search-interface.hydrated').should('be.visible');
    cy.percySnapshot('Search layout', {widths: [500, 1200]});
  });
});
