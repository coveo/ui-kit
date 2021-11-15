import {configure} from '../../page-objects/configurator';
import {InterceptAliases, interceptSearch} from '../../page-objects/search';
import {scope} from '../../reporters/detailed-collector';
import {BreadcrumbManagerActions as Actions} from './breadcrumb-manager-actions';
import {BreadcrumbManagerExpectations as Expect} from './breadcrumb-manager-expectations';

describe('quantic-breadcrumb-manager', () => {
  const breadcrumbManagertUrl = 's/quantic-breadcrumb-manager';

  function visitBreadcrumbManager(waitForSearch = true) {
    interceptSearch();
    cy.visit(breadcrumbManagertUrl);
    configure();
    if (waitForSearch) {
      cy.wait(InterceptAliases.Search);
    }
  }

  function loadFromUrlHash(urlHash: string) {
    interceptSearch();
    cy.visit(`${breadcrumbManagertUrl}#${urlHash}`);
    configure();
  }

  describe('with default values', () => {
    it('should work as expected', () => {
      visitBreadcrumbManager();

      scope('when selecting values in numeric facet', () => {
        Expect.numerciFacet.displayBreadcrumb(false);
        Expect.displayClearFilters(false);

        Actions.numerciFacet.checkFirstValue();

        Expect.displayClearFilters(true);
        Expect.numerciFacet.displayBreadcrumb(true);
        Expect.numerciFacet.displayLabel(true);
        Expect.numerciFacet.labelContains('Youtube Likes');
        Expect.numerciFacet.displayValues(true);
        Expect.numerciFacet.numberOfValues(1);

        scope('when selecting more values', () => {
          Actions.numerciFacet.checkValueAt(1);
          Expect.numerciFacet.displayValues(true);
          Expect.numerciFacet.numberOfValues(2);

          Actions.numerciFacet.checkValueAt(2);
          Expect.numerciFacet.displayValues(true);
          Expect.numerciFacet.numberOfValues(3);
        });
      });
    });
  });
  describe('when loading from URL', () => {
    it('should work as expected', () => {
      const path = 'Africa,Togo';
      const url = `cf[geographicalhierarchy]=${path}`;

      loadFromUrlHash(url);
      Expect.displayBreadcrumbManager(true);
      Expect.categoryFacet.displayBreadcrumb(true);
      Expect.categoryFacet.displayLabel(true);
      Expect.categoryFacet.labelContains('Country');
      Expect.categoryFacet.displayValues(true);
      Expect.categoryFacet.numberOfValues(1);
    });
  });
});
