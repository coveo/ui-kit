import {getQueryAlias} from '../../../page-objects/search';
import {should} from '../../common-selectors';
import {EventExpectations} from '../../event-expectations';
import {ResultListSelector, ResultListSelectors} from './result-list-selectors';

export function resultListExpectations(selector: ResultListSelector) {
  return {
    displayPlaceholder: (display: boolean) => {
      selector
        .placeholder()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the placeholder`);
    },
    displayResults: (display: boolean) => {
      selector
        .results()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display results`);
    },
    resultsEqual: (resultsAlias: string) => {
      cy.get<Array<{Title: string; clickUri: string}>>(resultsAlias).then(
        (results) => {
          selector
            .resultLinks()
            .then((elements) => {
              return Cypress.$.makeArray(elements).map(
                (element) => element.innerText
              );
            })
            .should(
              'deep.equal',
              results.map((result) => result.Title || result.clickUri)
            )
            .logDetail('should render the received results');
        }
      );
    },
    requestFields: (expectedFieldsToInclude: string[], useCase: string) => {
      cy.wait(getQueryAlias(useCase))
        .then((interception) => {
          const fieldsToInclude = interception.request.body.fieldsToInclude;
          expectedFieldsToInclude.forEach((field) =>
            expect(fieldsToInclude).to.include(field)
          );
        })
        .logDetail('fields to include should be in the request');
    },
  };
}

export const ResultListExpectations = {
  ...resultListExpectations(ResultListSelectors),
  events: {
    ...EventExpectations,
  },
};
