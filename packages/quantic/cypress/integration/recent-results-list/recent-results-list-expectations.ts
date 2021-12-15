import {InterceptAliases} from '../../page-objects/search';
import {logUaEvent} from '../common-expectations';
import {should} from '../common-selectors';
import {
  RecentResultsListSelectors,
  RecentResultsListSelector,
} from './recent-results-list-selectors';

const urlResult = 'https://github.com/coveo/ui-kit/';

function recentResultsListExpectations(selector: RecentResultsListSelector) {
  return {
    displayPlaceholder: (display: boolean) => {
      selector
        .placeholder()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the placeholder`);
    },
    displayLabel: (display: boolean) => {
      selector
        .label()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the label`);
    },
    displayResults: (display: boolean) => {
      selector
        .results()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display results`);
    },
    displayResult: (value: string, display: boolean) => {
      selector
        .result(value)
        .should(display ? 'exist' : 'not.exist')
        .logDetail(
          `${should(display)} display recent result with value: "${value}"`
        );
    },
    displayEmptyList: (display: boolean) => {
      selector
        .emptyList()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display empty list`);
    },
    numberOfResults: (length: number) => {
      selector
        .results()
        .should('have.length', length)
        .logDetail(`should display ${length} results in the list`);
    },
    lastResultContains: (result: string) => {
      selector
        .lastResult()
        .contains(result)
        .logDetail(`The last added result should contain "${result}"`);
    },
    labelContains: (label: string) => {
      selector
        .label()
        .contains(label)
        .logDetail(`The label should contain "${label}"`);
    },
    hrefContainsAtResult: (value: string) => {
      selector
        .result(value)
        .should('have.attr', 'href')
        .then((href) => expect(href).to.equal(urlResult))
        .logDetail(
          `The result link should contain attribute href equal to "${urlResult}"`
        );
    },
    targetContainsAtResult: (value: string, target: string) => {
      selector
        .result(value)
        .should('have.attr', 'target')
        .then((_target) => expect(_target).to.equal(target))
        .logDetail(
          `The result link should contain attribute target equal to "${target}"`
        );
    },
    logDocumentOpen: (resultTitle: string) => {
      logUaEvent(InterceptAliases.UA.DocumentOpen, 'documentOpen', {
        actionCause: 'documentOpen',
        documentTitle: resultTitle,
        documentUri: urlResult,
      });
    },
  };
}

export const RecentResultsListExpectations = {
  ...recentResultsListExpectations(RecentResultsListSelectors),
};
