import {configure} from '../../page-objects/configurator';
import {
  InterceptAliases,
  interceptQuerySuggestWithParam,
  interceptSearch,
  routeMatchers,
} from '../../page-objects/search';
import {StandaloneSearchBoxExpectations as Expect} from './standalone-search-box-expectations';
import {StandaloneSearchBoxActions as Actions} from './standalone-search-box-actions';
import {scope} from '../../reporters/detailed-collector';

interface StandaloneSearchBoxOptions {
  placeholder: string;
  withoutSubmitButton: boolean;
  numberOfSuggestions: number;
  redirectUrl: string;
  searchHub: string;
  pipeline: string;
}

function mockSuggestions() {
  cy.intercept(routeMatchers.querySuggest, (req) => {
    req.continue((res) => {
      res.body.completions = [
        {
          expression: 'test',
          highlighted: '[test]',
        },
        {
          expression: 'test 2',
          highlighted: '[test][2]',
        },
      ];
      res.body.responseId = 21322434;
      res.send();
    });
  }).as(InterceptAliases.QuerySuggestions.substring(1));
}

describe('quantic-standalone-search-box', () => {
  const standaloneSearchBoxUrl = 's/quantic-standalone-search-box';

  function visitStandaloneSearchBox(
    options: Partial<StandaloneSearchBoxOptions> = {}
  ) {
    interceptSearch();
    cy.visit(standaloneSearchBoxUrl);
    configure(options);
  }

  describe('with default option', () => {
    it('should work as expected', () => {
      scope('when loading standalone search box', () => {
        visitStandaloneSearchBox();
        mockSuggestions();

        Expect.displayInputSearchBox(true);
        Expect.displaySearchButton(true);
        Expect.placeholderContains('Search');
        Expect.inputInitialized();
      });

      scope('when setting suggestions', () => {
        Actions.focusSearchBox();
        cy.wait(InterceptAliases.QuerySuggestions).then(() => {
          Expect.displaySuggestionList(true);
          Expect.numberOfSuggestions(2);
        });
      });

      scope('when selecting from suggestions', () => {
        Actions.clickFirstSuggestion();
        Expect.inputContains('test');
      });

      scope('when submitting a search', () => {
        const query = 'test';
        visitStandaloneSearchBox();

        Expect.inputInitialized();
        Actions.typeInSearchBox(query);
        Expect.displayClearButton(true);
        Actions.submitSearch();
        Expect.urlHashContains(`/global-search/%40uri#q=${encodeURI(query)}`);
      });

      scope('when submitting using ENTER key', () => {
        const query = 'query';
        mockSuggestions();
        visitStandaloneSearchBox();

        Expect.inputInitialized();
        Actions.typeInSearchBox(query);
        Actions.pressEnter();
        Expect.displayClearButton(true);
        Expect.urlHashContains(`/global-search/%40uri#q=${encodeURI(query)}`);
      });

      scope('when submitting script', () => {
        const query = '<script>alert("test")</script>';
        visitStandaloneSearchBox();

        Expect.inputInitialized();
        Actions.typeInSearchBox(query);
        Expect.displayClearButton(true);
        Actions.submitSearch();
        Expect.urlHashContains(`/global-search/%40uri#q=${encodeURI(query)}`);
      });
    });
  });

  describe('with custom option', () => {
    it('should work as expected', () => {
      scope('with custom #placeholder', () => {
        visitStandaloneSearchBox({
          placeholder: 'custom placeholder',
        });

        Expect.displayInputSearchBox(true);
        Expect.displaySearchButton(true);
        Expect.placeholderContains('custom placeholder');
      });

      scope('with custom #withoutSubmitButton', () => {
        visitStandaloneSearchBox({
          withoutSubmitButton: true,
        });

        Expect.displayInputSearchBox(true);
        Expect.displaySearchButton(false);
        Expect.displaySearchIcon(true);
      });

      scope('with custom #numberOfSuggestions', () => {
        visitStandaloneSearchBox({
          numberOfSuggestions: 1,
        });

        Expect.inputInitialized();
        Actions.focusSearchBox();
        cy.wait(InterceptAliases.QuerySuggestions).then(() => {
          Expect.displaySuggestionList(true);
          Expect.numberOfSuggestions(1);
        });
      });

      scope('with custom #redirectUrl', () => {
        const query = 'test';
        visitStandaloneSearchBox({
          redirectUrl: '/full-search-example',
        });

        Expect.inputInitialized();
        Actions.typeInSearchBox(query);
        Expect.displayClearButton(true);
        Actions.submitSearch();
        Expect.urlHashContains(`/full-search-example#q=${encodeURI(query)}`);
        Expect.logSearchFromLink(query);
      });

      scope('with custom #searchHub', () => {
        const interceptAlias = '@qsWithSearchHub';
        const searchHub = 'test-hub';
        const requestParams = {searchHub};
        visitStandaloneSearchBox({
          searchHub,
        });
        interceptQuerySuggestWithParam(requestParams, interceptAlias);

        Expect.inputInitialized();
        Actions.focusSearchBox();

        Expect.fetchQuerySuggestWithParams(requestParams, interceptAlias);
      });

      scope('with custom #pipeline', () => {
        const interceptAlias = '@qsWithPipeline';
        const pipeline = 'test-pipeline';
        const requestParams = {pipeline};
        visitStandaloneSearchBox({
          pipeline,
        });
        interceptQuerySuggestWithParam(requestParams, interceptAlias);

        Expect.inputInitialized();
        Actions.focusSearchBox();

        Expect.fetchQuerySuggestWithParams(requestParams, interceptAlias);
      });
    });
  });
});
