import {configure} from '../../../page-objects/configurator';

import {NumericFacetExpectations as Expect} from './numeric-facet-expectations';
import {InterceptAliases, interceptSearch} from '../../../page-objects/search';

interface NumericFacetOptions {
  field: string;
  label: string;
  numberOfValues: number;
  sortCriteria: string;
  rangeAlgorithm: string;
  withInput: string;
  isCollapsed: boolean;
}

describe('Numeric Facet Test Suite', () => {
  const pageUrl = 's/quantic-numeric-facet';

  const defaultField = 'ytlikecount';
  const defaultLabel = 'Youtube Likes';
  const defaultNumberOfValues = 8;

  const defaultSettings = {
    field: defaultField,
    label: defaultLabel,
    numberOfValues: defaultNumberOfValues,
  };

  function visitNumericFacetPage(
    options: Partial<NumericFacetOptions> = {},
    waitForSearch = true
  ) {
    interceptSearch();
    cy.visit(pageUrl);
    configure(options);
    if (waitForSearch) {
      cy.wait(InterceptAliases.Search);
    }
  }

  function loadFromUrlHash(
    options: Partial<NumericFacetOptions> = {},
    urlHash: string
  ) {
    interceptSearch();
    cy.visit(`${pageUrl}#${urlHash}`);
    configure(options);
    cy.wait(InterceptAliases.Search);
  }

  describe('with default numeric facet', () => {
    it('should work as expected', () => {
      visitNumericFacetPage(defaultSettings);

      Expect.logNumericFacetLoad();
      Expect.isRendered(true);
      Expect.displayLabel(true);
      Expect.displaySearchForm(false);
      Expect.displayClearFilterButton(false);
      Expect.numberOfValues(defaultNumberOfValues);
      Expect.numberOfSelectedCheckboxValues(0);
    });
    describe('when selecting a value', () => {
      it('should', () => {
        visitNumericFacetPage(defaultSettings);
      });
    });
  });
});
