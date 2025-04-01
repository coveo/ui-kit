import {configure} from '../../../page-objects/configurator';
import {InterceptAliases, interceptSearch} from '../../../page-objects/search';
import {scope} from '../../../reporters/detailed-collector';
import {AriaLiveExpectations as Expect} from './aria-live-expectations';

const defaultExpectedRegions = ['noresult', 'summary', 'queryerror'];

describe('quantic-aria-live', () => {
  const pageUrl = 's/quantic-aria-live';

  function visitAriaLive(waitForSearch = true) {
    interceptSearch();
    cy.visit(pageUrl);
    configure({});
    if (waitForSearch) {
      cy.wait(InterceptAliases.Search);
    }
  }

  function loadFromUrlHash(urlHash: string) {
    interceptSearch();
    cy.visit(`${pageUrl}#${urlHash}`);
    configure({});
    cy.wait(InterceptAliases.Search);
  }

  describe('with default options', () => {
    it('should work as expected', () => {
      visitAriaLive();

      scope('when loading the page', () => {
        Expect.numberOfRegions(defaultExpectedRegions.length);

        defaultExpectedRegions.forEach((region) =>
          Expect.displayRegion(region, true)
        );
      });

      scope('when the default empty query is executed', () => {
        Expect.displayRegion('summary');

        Expect.summaryRegionContainsSummaryText();
      });
    });
  });

  describe('summary region', () => {
    it('should include the quantic summary text and the query text', () => {
      const query = 'accessibility';
      const url = `q=${query}`;
      loadFromUrlHash(url);

      Expect.displayRegion('summary');
      Expect.summaryRegionContainsSummaryText();
      Expect.regionContains('summary', query);
    });
  });

  describe('noresults region', () => {
    it('should match the no results title and include the query', () => {
      /* cspell:disable-next-line */
      const queryForNoResults = 'asdfgfdfsdf';
      const url = `q=${queryForNoResults}`;
      loadFromUrlHash(url);

      Expect.displayRegion('noresult');
      Expect.noResultsRegionContainsNoResultsText();
      Expect.regionContains('noresult', queryForNoResults);
    });
  });

  describe('queryerror region', () => {
    it('should match the title of the quantic-query-error component', () => {
      const genericErrorMessage = 'Something went wrong';
      const tabForQueryError = 'TriggerQueryError';
      const url = `tab=${tabForQueryError}`;
      loadFromUrlHash(url);

      Expect.displayRegion('queryerror');
      Expect.queryErrorRegionContainsQueryErrorText();
      Expect.regionContains('queryerror', genericErrorMessage);
    });
  });
});
