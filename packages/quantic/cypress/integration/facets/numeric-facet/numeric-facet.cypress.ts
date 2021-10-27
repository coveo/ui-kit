import {configure} from '../../../page-objects/configurator';

import {FacetSelectors} from './numeric-facet-selectors';
import {FacetExpectations as Expect} from './numeric-facet-expectations';
import {
  extractFacetValues,
  InterceptAliases,
  interceptSearch,
  interceptSearchIndefinitely,
  interceptSearchWithError,
} from '../../../page-objects/search';
import {
  checkFirstValue,
  checkLastValue,
  selectFirstLinkValue,
  selectLastLinkValue,
} from './numeric-facet-actions';

interface FacetOptions {
  field: string;
  label: string;
  numberOfValues: number;
  sortCriteria: string;
  noSearch: boolean;
  isCollapsed: boolean;
  displayValuesAs: string;
}

describe('Numeric Facet Test Suite', () => {
  const pageUrl = 's/quantic-numeric-facet';

  const defaultField = 'ytlikecounty';
  const defaultLabel = 'Youtube Likes';
  const defaultNumberOfValues = 8;

  const indexFacetValuesAlias = '@indexFacetValues';

  function visitFacetPage(options: Partial<FacetOptions> = {}) {
    interceptSearch();

    cy.visit(pageUrl);
    configure(options);
  }

  function loadFromUrlHash(
    options: Partial<FacetOptions> = {},
    urlHash: string
  ) {
    interceptSearch();

    cy.visit(`${pageUrl}#${urlHash}`);
    configure(options);
  }

  function aliasFacetValues() {
    cy.wait(InterceptAliases.Search).then((interception) => {
      const indexValues = extractFacetValues(interception.response);
      cy.wrap(indexValues).as(indexFacetValuesAlias.substring(1));
    });
  }
});
