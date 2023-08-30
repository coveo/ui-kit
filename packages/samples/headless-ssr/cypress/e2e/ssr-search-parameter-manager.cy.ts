import {ConsoleAliases, spyOnConsole, waitForHydration} from './ssr-e2e-utils';

const searchStateKey = 'search-state';

describe('headless ssr with search parameter manager example', () => {
  describe('when loading a page without search parameters, after hydration', () => {
    beforeEach(() => {
      spyOnConsole();
      cy.visit('/');
      waitForHydration();
    });

    it('should not update the search parameters', () => {
      cy.url().should((href) =>
        expect(new URL(href).searchParams.size).to.equal(0)
      );
    });

    describe('after submitting a search', () => {
      const query = 'abc';
      beforeEach(() =>
        cy.get('.search-box input').focus().type(`${query}{enter}`)
      );

      describe('after the url was updated', () => {
        beforeEach(() =>
          cy
            .url()
            .should((href) =>
              expect(new URL(href).searchParams.has(searchStateKey)).to.equal(
                true
              )
            )
        );

        it('should have the correct search parameters', () => {
          cy.url().should((href) => {
            const searchState = new URL(href).searchParams.get(searchStateKey);
            expect(searchState && JSON.parse(searchState)).to.deep.equal({
              q: query,
            });
          });
        });

        it('has only two history states', () => {
          cy.go('back');
          cy.go('back');
          cy.url().should('eq', 'about:blank');
        });

        describe('after pressing the back button', () => {
          beforeEach(() => cy.go('back'));

          it('should remove the search parameters', () => {
            cy.url().should((href) =>
              expect(new URL(href).searchParams.size).to.be.equal(0)
            );
          });

          it('should update the page', () => {
            cy.get('.search-box input').should('have.value', '');
          });

          it('should not log an error nor warning', () => {
            cy.get(ConsoleAliases.error).should('not.be.called');
            cy.get(ConsoleAliases.warn).should('not.be.called');
          });
        });
      });
    });
  });

  describe('when loading a page with search parameters', () => {
    const query = 'def';
    function getInitialUrl() {
      const searchParams = new URLSearchParams({
        [searchStateKey]: JSON.stringify({q: query}),
      });
      return `/?${searchParams.toString()}`;
    }

    it('renders page in SSR as expected', () => {
      cy.intercept('/**', (req) => {
        req.continue((resp) => {
          const dom = new DOMParser().parseFromString(resp.body, 'text/html');
          expect(dom.querySelector('.search-box input')).to.have.value(query);
        });
      });
      cy.visit(getInitialUrl());
      waitForHydration();
    });

    describe('after hydration', () => {
      beforeEach(() => {
        cy.visit(getInitialUrl());
        waitForHydration();
      });

      it("doesn't update the page", () => {
        cy.wait(1000);
        cy.get('.search-box input').should('have.value', query);
      });

      it('should not update the parameters', () => {
        cy.wait(1000);
        cy.url().should((href) => {
          expect(href.endsWith(getInitialUrl())).to.equal(true);
        });
      });

      it('has only one history state', () => {
        cy.go('back');
        cy.url().should('eq', 'about:blank');
      });
    });
  });

  describe('when loading a page with invalid search parameters', () => {
    function getInitialUrl() {
      const searchParams = new URLSearchParams({
        [searchStateKey]: JSON.stringify({q: ''}),
      });
      return `/?${searchParams.toString()}`;
    }

    it('renders page in SSR as expected', () => {
      cy.intercept('/**', (req) => {
        req.continue((resp) => {
          const dom = new DOMParser().parseFromString(resp.body, 'text/html');
          expect(dom.querySelector('.search-box input')).to.have.value('');
        });
      });
      cy.visit(getInitialUrl());
      waitForHydration();
    });

    describe('after hydration', () => {
      beforeEach(() => {
        cy.visit(getInitialUrl());
        waitForHydration();
      });

      it("doesn't update the page", () => {
        cy.wait(1000);
        cy.get('.search-box input').should('have.value', '');
      });

      it('should correct the parameters', () => {
        cy.url().should((href) => {
          expect(new URL(href).searchParams.size).to.equal(0);
        });
      });

      it('has only one history state', () => {
        cy.go('back');
        cy.url().should('eq', 'about:blank');
      });
    });
  });
});
