/* eslint-disable @cspell/spellchecker */
import {configure} from '../../../page-objects/configurator';
import {
  InterceptAliases,
  interceptQuerySuggestWithParam,
  interceptSearch,
  routeMatchers,
} from '../../../page-objects/search';
import {scope} from '../../../reporters/detailed-collector';
import {StandaloneSearchBoxActions as Actions} from './standalone-search-box-actions';
import {StandaloneSearchBoxExpectations as Expect} from './standalone-search-box-expectations';

interface StandaloneSearchBoxOptions {
  placeholder: string;
  withoutSubmitButton: boolean;
  numberOfSuggestions: number;
  redirectUrl: string;
  searchHub: string;
  pipeline: string;
  textarea: boolean;
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

const variants = [
  {variantName: 'default', textarea: false},
  {variantName: 'expandable', textarea: true},
];

describe('quantic-standalone-search-box', () => {
  const standaloneSearchBoxUrl = 's/quantic-standalone-search-box';

  function visitStandaloneSearchBox(
    options: Partial<StandaloneSearchBoxOptions> = {}
  ) {
    interceptSearch();
    cy.visit(standaloneSearchBoxUrl);
    configure(options);
  }

  variants.forEach(({variantName, textarea}) => {
    describe(`variant ${variantName} with default options`, () => {
      it('should work as expected', () => {
        scope('when loading standalone search box', () => {
          visitStandaloneSearchBox({textarea});
          mockSuggestions();

          Expect.displayInputSearchBox(true, textarea);
          Expect.displaySearchButton(true);
          Expect.placeholderContains('Search', textarea);
          Expect.inputInitialized();
        });

        scope('when setting suggestions', () => {
          const interceptAlias = '@qsWithDefaultParams';
          const params = {
            searchHub: 'default',
            pipeline: undefined,
          };
          interceptQuerySuggestWithParam(params, interceptAlias);

          Actions.focusSearchBox(textarea);
          cy.wait(interceptAlias).then(() => {
            Expect.displaySuggestionList(true);
            Expect.numberOfSuggestions(2);
          });
        });

        scope('when selecting from suggestions', () => {
          Actions.clickFirstSuggestion();
          Expect.urlContains('/global-search/%40uri#q=test');
        });

        scope('when submitting a search', () => {
          const query = 'another query';
          visitStandaloneSearchBox({textarea});

          Expect.inputInitialized();
          Actions.typeInSearchBox(query, textarea);
          Expect.displayClearButton(true);
          Actions.submitSearch();
          Expect.urlContains(
            `/global-search/%40uri#q=${encodeURIComponent(query)}`
          );
        });

        scope('when submitting using ENTER key', () => {
          const query = 'query';
          mockSuggestions();
          visitStandaloneSearchBox({textarea});

          Expect.inputInitialized();
          Actions.typeInSearchBox(query, textarea);
          Actions.pressEnter(textarea);
          Expect.displayClearButton(true);
          Expect.urlContains(
            `/global-search/%40uri#q=${encodeURIComponent(query)}`
          );
        });

        scope('when submitting script', () => {
          const query = '<script>alert("test")</script>';
          visitStandaloneSearchBox({textarea});

          Expect.inputInitialized();
          Actions.typeInSearchBox(query, textarea);
          Expect.displayClearButton(true);
          Actions.submitSearch();
          Expect.urlContains(
            `/global-search/%40uri#q=${encodeURIComponent(query)}`
          );
        });

        scope(
          'when submitting a search with a query containing a special character',
          () => {
            const query = '%test';
            visitStandaloneSearchBox({textarea});

            Expect.inputInitialized();
            Actions.typeInSearchBox(query, textarea);
            Expect.displayClearButton(true);
            Actions.submitSearch();
            Expect.urlContains(
              `/global-search/%40uri#q=${encodeURIComponent(query)}`
            );
          }
        );
      });
    });

    describe(`variant ${variantName} with custom options`, () => {
      it('should work as expected', () => {
        scope('with custom #placeholder', () => {
          visitStandaloneSearchBox({
            placeholder: 'custom placeholder',
            textarea,
          });

          Expect.displayInputSearchBox(true, textarea);
          Expect.displaySearchButton(true);
          Expect.placeholderContains('custom placeholder', textarea);
        });

        scope('with custom #withoutSubmitButton', () => {
          visitStandaloneSearchBox({
            withoutSubmitButton: true,
            textarea,
          });

          Expect.displayInputSearchBox(true, textarea);
          Expect.displaySearchButton(false);
          Expect.displaySearchIcon(true);
        });

        scope('with custom #numberOfSuggestions', () => {
          visitStandaloneSearchBox({
            numberOfSuggestions: 1,
            textarea,
          });

          Expect.inputInitialized();
          Actions.focusSearchBox(textarea);
          cy.wait(InterceptAliases.QuerySuggestions).then(() => {
            Expect.displaySuggestionList(true);
            Expect.numberOfSuggestions(1);
          });
        });

        scope('with custom #redirectUrl', () => {
          const searchFromLinkRequestTimeout = 10000;
          const query = 'test';
          visitStandaloneSearchBox({
            redirectUrl: '/full-search-example',
            textarea,
          });

          Expect.inputInitialized();
          Actions.typeInSearchBox(query, textarea);
          Expect.displayClearButton(true);
          Actions.submitSearch();
          Expect.urlContains(
            `/full-search-example#q=${encodeURIComponent(query)}`
          );
          Expect.logSearchFromLink(query, searchFromLinkRequestTimeout);
        });

        scope('with custom #searchHub', () => {
          const interceptAlias = '@qsWithSearchHub';
          const searchHub = 'test-hub';
          const requestParams = {searchHub};
          visitStandaloneSearchBox({
            searchHub,
            textarea,
          });
          interceptQuerySuggestWithParam(requestParams, interceptAlias);

          Expect.inputInitialized();
          Actions.focusSearchBox(textarea);

          Expect.fetchQuerySuggestWithParams(requestParams, interceptAlias);
        });

        scope('with custom #pipeline', () => {
          const interceptAlias = '@qsWithPipeline';
          const pipeline = 'test-pipeline';
          const requestParams = {pipeline};
          visitStandaloneSearchBox({
            pipeline,
            textarea,
          });
          interceptQuerySuggestWithParam(requestParams, interceptAlias);

          Expect.inputInitialized();
          Actions.focusSearchBox(textarea);

          Expect.fetchQuerySuggestWithParams(requestParams, interceptAlias);
        });
      });
    });
  });

  describe('Expandable textarea searchbox', () => {
    it('should support the expandable textarea features', () => {
      scope('when typing a longer text that what fits on one line', () => {
        const longQuery =
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.';
        visitStandaloneSearchBox({textarea: true});

        Expect.inputInitialized();
        Actions.focusSearchBox(true);
        Actions.keyboardTypeInSearchBox(longQuery, true);
        Expect.inputStyleMatches('white-space: pre-wrap;', true);
      });

      scope('when the textarea is not in focus', () => {
        const longQuery =
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.';
        visitStandaloneSearchBox({textarea: true});

        Expect.inputInitialized();
        Actions.focusSearchBox(true);
        Actions.keyboardTypeInSearchBox(longQuery, true);
        Actions.blurSearchBox(true);
        Expect.inputStyleMatches('white-space: no-wrap;', true);
      });
    });
  });
});
