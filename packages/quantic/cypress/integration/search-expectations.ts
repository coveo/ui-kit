import {baselineAlias, InterceptAliases} from '../page-objects/search';

export const SearchExpectations = {
  sortedBy: (sortCriteria: string) => {
    cy.wait(InterceptAliases.Search).then((interception) => {
      expect(interception.request?.body?.sortCriteria).to.equal(sortCriteria);
    });
  },

  numberOfResults: (value: number) => {
    cy.wait(InterceptAliases.Search).then((interception) =>
      expect(interception.response?.body.results.length).to.equal(
        value,
        `search response should contain ${value} results`
      )
    );
  },

  constantExpressionEqual: (expression: string | undefined) => {
    cy.wait(InterceptAliases.Search).then((interception) => {
      expect(interception.request.body.cq).to.equal(
        expression,
        `search request constant query expression should be '${expression}'`
      );
    });
  },

  numberOfSearchRequests: (expected: number) => {
    cy.get(baselineAlias).then((baseline) => {
      cy.get(`${InterceptAliases.Search}.all`)
        .should('have.length', Number(baseline) + expected)
        .logDetail(`should send ${expected} search requests`);
    });
  },
};
