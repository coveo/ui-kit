import {should} from '../common-selectors';
import {resultListSelector, resultListSelectors} from './resultList-selectors';

function resultListExpectations(selector: resultListSelector) {
  return {
    displayPlaceholder: (display: boolean) => {
      selector
        .resultListresultList()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the placeholder`);
    },
    displayResults: (display: boolean) => {
      selector
        .results()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display results`);
    },
    fieldsIncluded: (display: boolean) => {
      selector
        .resultListresultList()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display `);
    },
  };
}

export const resultListExpectations = {
  ...resultListExpectations(resultListSelectors),
};
