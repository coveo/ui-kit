import {baselineAlias, getQueryAlias} from '../page-objects/search';

export const SearchExpectations = {
  numberOfResults: (value: number, useCase: string) => {
    cy.wait(getQueryAlias(useCase)).then((interception) =>
      expect(interception.response?.body.results.length).to.equal(
        value,
        `search response should contain ${value} results`
      )
    );
  },

  numberOfSearchRequests: (expected: number, useCase: string) => {
    cy.get(baselineAlias).then((baseline) => {
      cy.get(`${getQueryAlias(useCase)}.all`)
        .should('have.length', Number(baseline) + expected)
        .logDetail(`should send ${expected} search requests`);
    });
  },
};
