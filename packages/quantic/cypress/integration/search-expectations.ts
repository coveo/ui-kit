import {InterceptAliases} from '../page-objects/search';

export const SearchExpectations = {
  sortedBy: (sortCriteria: string) => {
    cy.wait(InterceptAliases.Search).then((interception) => {
      expect(interception.request?.body?.sortCriteria).to.equal(sortCriteria);
    });
  },
};
