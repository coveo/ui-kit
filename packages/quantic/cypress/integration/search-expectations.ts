import {InterceptAliases} from '../page-objects/search';

export const SearchExpectations = {
  numberOfResults: (value: number) => {
    cy.wait(InterceptAliases.Search).then((interception) =>
      expect(interception.response?.body.results.length).to.equal(
        value,
        `search response should contain ${value} results`
      )
    );
  },
};
