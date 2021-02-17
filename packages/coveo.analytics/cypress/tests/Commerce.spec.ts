import {getCollectEndpoint, getQueryParameters} from './VisitOptions';

describe('coveo.analytics', () => {
    it('successfully sends a single pageview to the collect endpoint', () => {
        cy.intercept(getCollectEndpoint()).as('collect');

        cy.on('uncaught:exception', (err, runnable) => {
            cy.error(err);
            // returning false here prevents Cypress from
            // failing the test
            return false;
        });

        cy.visit('http://localhost:8080', {
            qs: getQueryParameters(),
        });

        cy.wait('@collect').its('response.statusCode').should('equal', 200);
        cy.get('@collect').its('response.body').should('have.property', 'visitorId');
    });
});
