import {RouteAlias, setupIntercept} from '../utils/setupComponent';

describe('External Test Suite', () => {
  describe('when modifying state of a component (search box) that is a child of an atomic-external component', () => {
    before(() => {
      setupIntercept();
      cy.visit('examples/external.html');
      cy.wait(RouteAlias.search);

      cy.get('atomic-external > atomic-search-box')
        .shadow()
        .find('input')
        .type('hello{enter}');
    });

    it("other components' state under the same atomic-external should be affected", () => {
      cy.get('atomic-external > atomic-query-summary')
        .shadow()
        .invoke('text')
        .should('contain', 'hello');
    });

    it("other components' state under the linked atomic-search-interface should be affected", () => {
      cy.get('atomic-search-interface#interface-2 > atomic-query-summary')
        .shadow()
        .invoke('text')
        .should('contain', 'hello');
    });

    it("other components' state under a different atomic-search-interface should not be affected", () => {
      cy.get('atomic-search-interface#interface-1 > atomic-query-summary')
        .shadow()
        .invoke('text')
        .should('not.contain', 'hello');
    });
  });
});
