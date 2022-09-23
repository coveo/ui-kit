import {InterceptAliases} from '../../page-objects/search';
import {ConsoleExpectations} from '../console-expectations';
import {SearchExpectations} from '../search-expectations';
import {
  ResultsPerPageSelector,
  ResultsPerPageSelectors,
} from './results-per-page-selectors';

function resultsPerPageExpectations(selector: ResultsPerPageSelector) {
  return {
    displayChoices: (display: boolean) => {
      selector.choice().should(display ? 'exist' : 'not.exist');
    },

    choicesEqual: (choices: number[]) => {
      selector.choice().then((elements) => {
        const displayedChoices = Cypress.$.makeArray(elements).map((element) =>
          parseInt(element.innerText)
        );

        expect(displayedChoices).to.deep.equal(choices);
      });
    },

    selectedChoiceEqual: (value: number) => {
      selector.selected().should('contain', value.toString());
    },

    logSelected: (value: number) => {
      cy.wait(InterceptAliases.UA.Pager.Resize).then((interception) => {
        const analyticsBody = interception.request.body;
        expect(analyticsBody).to.have.property('eventType', 'getMoreResults');
        expect(analyticsBody).to.have.property('eventValue', 'pagerResize');

        const customData = analyticsBody.customData;
        expect(customData).to.have.property('currentResultsPerPage', value);
      });
    },
  };
}

export const ResultsPerPageExpectations = {
  ...resultsPerPageExpectations(ResultsPerPageSelectors),
  console: {
    ...ConsoleExpectations,
  },
  search: {
    ...SearchExpectations,
  },
};
