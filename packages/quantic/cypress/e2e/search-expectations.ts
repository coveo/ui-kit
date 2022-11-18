import {baselineAlias, getQueryAlias} from '../page-objects/search';

export const SearchExpectations = {
  sortedBy: (sortCriteria: string, useCase: string) => {
    cy.wait(getQueryAlias(useCase)).then((interception) => {
      expect(interception.request?.body?.sortCriteria).to.equal(sortCriteria);
    });
  },

  numberOfResults: (value: number, useCase: string) => {
    cy.wait(getQueryAlias(useCase)).then((interception) =>
      expect(interception.response?.body.results.length).to.equal(
        value,
        `search response should contain ${value} results`
      )
    );
  },

  constantExpressionEqual: (
    expression: string | undefined,
    useCase: string
  ) => {
    cy.wait(getQueryAlias(useCase)).then((interception) => {
      expect(interception.request.body.cq).to.equal(
        expression,
        `search request constant query expression should be '${expression}'`
      );
    });
  },

  numberOfSearchRequests: (expected: number, useCase: string) => {
    cy.get(baselineAlias).then((baseline) => {
      cy.get(`${getQueryAlias(useCase)}.all`)
        .should('have.length', Number(baseline) + expected)
        .logDetail(`should send ${expected} search requests`);
    });
  },
};
