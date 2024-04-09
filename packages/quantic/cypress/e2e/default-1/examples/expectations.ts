import {completeSearchRequest} from '../../common-expectations';
import {should} from '../../common-selectors';
import {Selector, SelectorsFactory} from './selectors';

export const searchInterfaceComponent = 'c-quantic-search-interface';
export const insightInterfaceComponent = 'c-quantic-insight-interface';

function expectations(selector: Selector) {
  return {
    displaySearchbox: (display: boolean) => {
      selector
        .searchbox()
        .should(display ? 'be.visible' : 'not.be.visible')
        .logDetail(`${should(display)} display the searchbox`);
    },

    displayFacets: (display: boolean) => {
      selector
        .facetsContainer()
        .should(display ? 'be.visible' : 'not.be.visible')
        .logDetail(`${should(display)} display the facets container`);
    },

    displaySort: (display: boolean) => {
      selector
        .sort()
        .should(display ? 'be.visible' : 'not.be.visible')
        .logDetail(`${should(display)} display the sort`);
    },

    displayPager: (display: boolean) => {
      selector
        .pager()
        .should(display ? 'be.visible' : 'not.be.visible')
        .logDetail(`${should(display)} display the pager`);
    },

    displaySummary: (display: boolean) => {
      selector
        .summary()
        .should(display ? 'be.visible' : 'not.be.visible')
        .logDetail(`${should(display)} display the summary`);
    },

    displayRefineToggle: (display: boolean) => {
      selector
        .refineToggle()
        .should(display ? 'be.visible' : 'not.be.visible')
        .logDetail(`${should(display)} display the refine toggle button`);
    },

    displayResults: () => {
      selector
        .result()
        .should('have.length.greaterThan', 1)
        .logDetail('display the results');
    },

    summaryContainsText: (expectedText: string) => {
      selector
        .summary()
        .should('contain', expectedText)
        .logDetail(`summary should contain the text '${expectedText}'`);
    },
  };
}

export const SearchExpectations = {
  ...expectations(SelectorsFactory(searchInterfaceComponent)),
  completeSearchRequest,
};

export const InsightExpectations = {
  ...expectations(SelectorsFactory(insightInterfaceComponent)),
  completeSearchRequest,
};
