import {configure, reset} from '../../page-objects/configurator';
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
          for (let index = 1; index <= 4; index++) {
            Actions.numerciFacet.checkValueAt(index);

            Expect.numerciFacet.displayValues(true);
            Expect.numerciFacet.numberOfValues(index + 1);
            Expect.numerciFacet.displayShowMore(false);
          }

          Actions.numerciFacet.checkValueAt(5);

          Expect.numerciFacet.displayValues(true);
          Expect.numerciFacet.numberOfValues(5);
          Expect.numerciFacet.displayShowMore(true);

          Actions.clickShowMoreNumericFacetBreadcrumb();

          Expect.numerciFacet.numberOfValues(6);
          Expect.numerciFacet.displayShowMore(false);
        });

        scope('when clearing a value', () => {
          Actions.clickFirstValueNumericFacetBreadcrumb();
          cy.wait(InterceptAliases.Search);

          Expect.numerciFacet.numberOfValues(5);
        });
      });

      scope('when selecting values in time frame facet', () => {
        Expect.dateFacet.displayBreadcrumb(false);

        Actions.timeFrameFacet.selectValue('Past 6 months');
        cy.wait(InterceptAliases.Search);

        Expect.dateFacet.displayBreadcrumb(true);
        Expect.dateFacet.displayLabel(true);
        Expect.dateFacet.labelContains('Date');
        Expect.dateFacet.numberOfValues(1);
        Expect.dateFacet.breadcrumbValueLabelAtIndexContains('Past 6 months');

        Actions.timeFrameFacet.selectValue('Past year');
        cy.wait(InterceptAliases.Search);

        Expect.dateFacet.displayBreadcrumb(true);
        Expect.dateFacet.displayLabel(true);
        Expect.dateFacet.numberOfValues(1);
        Expect.dateFacet.breadcrumbValueLabelAtIndexContains('Past year');
      });

      scope('when clearing all filters', () => {
        Actions.clickClearFilters();

        Expect.numerciFacet.displayBreadcrumb(false);
        Expect.dateFacet.displayBreadcrumb(false);
      });

      scope('when selecting values in category facet', () => {
        Expect.categoryFacet.displayBreadcrumb(false);

        Actions.categoryFacet.selectChildValue('North America');

        Expect.categoryFacet.displayBreadcrumb(true);
        Expect.categoryFacet.displayLabel(true);
        Expect.categoryFacet.labelContains('Country');
        Expect.categoryFacet.displayValues(true);
        Expect.categoryFacet.numberOfValues(1);
        Expect.categoryFacet.breadcrumbValueLabelAtIndexContains(
          'North America'
        );

        Actions.categoryFacet.selectChildValue('Canada');
        cy.wait(InterceptAliases.Search);

        Expect.categoryFacet.numberOfValues(1);
        Expect.categoryFacet.breadcrumbValueLabelAtIndexContains(
          'North America / C'
        );

        Actions.categoryFacet.selectChildValue('British Columbia');
        cy.wait(InterceptAliases.Search);

        Expect.categoryFacet.numberOfValues(1);
        Expect.categoryFacet.breadcrumbValueLabelAtIndexContains(
          'North America / C'
        );
      });

      scope('when selecting values in facet', () => {
        Actions.clickClearFilters();

        Actions.facet.selectFirstLinkValue();

        Expect.facet.displayBreadcrumb(true);
        Expect.facet.labelContains('File Type');
        Expect.facet.displayValues(true);
        Expect.facet.numberOfValues(1);
        Expect.facet.breadcrumbValueLabelAtIndexContains('txt');

        Actions.facet.clickShowMoreButton();
        cy.wait(InterceptAliases.Search);

        Actions.facet.selectLastLinkValue();
        cy.wait(InterceptAliases.Search);

        Expect.facet.numberOfValues(1);
      });
    });
  });
  describe('when loading from URL', () => {
    it('should work as expected', () => {
      scope('with one filter', () => {
        const path = 'Africa,Togo';
        const url = `cf[geographicalhierarchy]=${path}`;

        loadFromUrlHash(url);
        Expect.displayBreadcrumbManager(true);
        Expect.categoryFacet.displayBreadcrumb(true);
        Expect.categoryFacet.displayLabel(true);
        Expect.categoryFacet.labelContains('Country');
        Expect.categoryFacet.displayValues(true);
        Expect.categoryFacet.numberOfValues(1);
        Expect.numerciFacet.displayBreadcrumb(false);
        Expect.facet.displayBreadcrumb(false);
        Expect.dateFacet.displayBreadcrumb(false);
        Expect.displayClearFilters(true);
      });

      reset();

      scope('with 3 filters', () => {
        const path = 'North America,Canada';
        const timeframeRange = 'past-6-month..now';
        const fileType = 'txt';
        const url = `cf[geographicalhierarchy]=${path}&f[filetype]=${fileType}&df[date]=${timeframeRange}`;

        loadFromUrlHash(url);
        Expect.facet.displayBreadcrumb(true);
        Expect.facet.displayLabel(true);
        Expect.facet.labelContains('File Type');
        Expect.facet.displayValues(true);
        Expect.facet.numberOfValues(1);
        Expect.facet.breadcrumbValueLabelAtIndexContains('txt');

        Expect.dateFacet.displayBreadcrumb(true);
        Expect.dateFacet.displayLabel(true);
        Expect.dateFacet.labelContains('Date');
        Expect.dateFacet.displayValues(true);
        Expect.dateFacet.numberOfValues(1);
        Expect.dateFacet.breadcrumbValueLabelAtIndexContains('Past 6 months');
        Expect.categoryFacet.displayBreadcrumb(true);
        Expect.categoryFacet.displayLabel(true);
        Expect.categoryFacet.labelContains('Country');
        Expect.categoryFacet.displayValues(true);
        Expect.categoryFacet.numberOfValues(1);
        Expect.categoryFacet.breadcrumbValueLabelAtIndexContains(
          'North America / C'
        );

        Expect.displayClearFilters(true);
      });
    });
  });
});
