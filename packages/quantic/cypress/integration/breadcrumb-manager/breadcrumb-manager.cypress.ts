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
        Expect.numericFacetBreadcrumb.displayBreadcrumb(false);
        Expect.displayClearFilters(false);

        Actions.numericFacet.checkFirstValue();

        Expect.displayClearFilters(true);
        Expect.numericFacetBreadcrumb.displayBreadcrumb(true);
        Expect.numericFacetBreadcrumb.displayLabel(true);
        Expect.numericFacetBreadcrumb.labelContains('Youtube Likes');
        Expect.numericFacetBreadcrumb.displayValues(true);
        Expect.numericFacetBreadcrumb.numberOfValues(1);

        scope('when selecting more values', () => {
          for (let index = 1; index <= 4; index++) {
            Actions.numericFacet.checkValueAt(index);

            Expect.numericFacetBreadcrumb.displayValues(true);
            Expect.numericFacetBreadcrumb.numberOfValues(index + 1);
            Expect.numericFacetBreadcrumb.displayShowMore(false);
          }

          Actions.numericFacet.checkValueAt(5);

          Expect.numericFacetBreadcrumb.displayValues(true);
          Expect.numericFacetBreadcrumb.numberOfValues(5);
          Expect.numericFacetBreadcrumb.displayShowMore(true);

          Actions.clickShowMoreNumericFacetBreadcrumb();

          Expect.numericFacetBreadcrumb.numberOfValues(6);
          Expect.numericFacetBreadcrumb.displayShowMore(false);
        });

        scope('when clearing a value', () => {
          Actions.clickFirstValueNumericFacetBreadcrumb();
          cy.wait(InterceptAliases.Search);

          Expect.numericFacetBreadcrumb.numberOfValues(5);
        });
      });

      scope('when selecting values in time frame facet', () => {
        const timeframeLabel1 = 'Past 6 months';
        const timeframeLabel2 = 'Past 10 years';
        Expect.dateFacetBreadcrumb.displayBreadcrumb(false);

        Actions.timeframeFacet.selectValue(timeframeLabel1);
        cy.wait(InterceptAliases.Search);

        Expect.dateFacetBreadcrumb.displayBreadcrumb(true);
        Expect.dateFacetBreadcrumb.displayLabel(true);
        Expect.dateFacetBreadcrumb.labelContains('Date');
        Expect.dateFacetBreadcrumb.numberOfValues(1);
        Expect.dateFacetBreadcrumb.firstbreadcrumbValueLabelContains(
          timeframeLabel1
        );

        Actions.timeframeFacet.selectValue(timeframeLabel2);
        cy.wait(InterceptAliases.Search);

        Expect.dateFacetBreadcrumb.displayBreadcrumb(true);
        Expect.dateFacetBreadcrumb.displayLabel(true);
        Expect.dateFacetBreadcrumb.numberOfValues(1);
        Expect.dateFacetBreadcrumb.firstbreadcrumbValueLabelContains(
          timeframeLabel2
        );
      });

      scope('when clearing all filters', () => {
        Actions.clickClearFilters();

        Expect.numericFacetBreadcrumb.displayBreadcrumb(false);
        Expect.dateFacetBreadcrumb.displayBreadcrumb(false);
      });

      scope('when selecting values in category facet', () => {
        const path = ['North America', 'Canada', 'British Columbia'];

        Expect.categoryFacetBreadcrumb.displayBreadcrumb(false);

        Actions.categoryFacet.selectChildValue(path[0]);

        Expect.categoryFacetBreadcrumb.displayBreadcrumb(true);
        Expect.categoryFacetBreadcrumb.displayLabel(true);
        Expect.categoryFacetBreadcrumb.labelContains('Country');
        Expect.categoryFacetBreadcrumb.displayValues(true);
        Expect.categoryFacetBreadcrumb.numberOfValues(1);
        Expect.categoryFacetBreadcrumb.firstbreadcrumbValueLabelContains(
          path[0]
        );

        Actions.categoryFacet.selectChildValue(path[1]);
        cy.wait(InterceptAliases.Search);

        Expect.categoryFacetBreadcrumb.numberOfValues(1);
        Expect.categoryFacetBreadcrumb.firstbreadcrumbValueLabelContains(
          path.slice(0, 1).join(' / ')
        );

        Actions.categoryFacet.selectChildValue(path[2]);
        cy.wait(InterceptAliases.Search);

        Expect.categoryFacetBreadcrumb.numberOfValues(1);
        Expect.categoryFacetBreadcrumb.firstbreadcrumbValueLabelContains(
          path.join(' / ')
        );
      });

      scope('when selecting values in facet', () => {
        Actions.clickClearFilters();

        Actions.facet.selectFirstLinkValue();

        Expect.facetBreadcrumb.displayBreadcrumb(true);
        Expect.facetBreadcrumb.labelContains('File Type');
        Expect.facetBreadcrumb.displayValues(true);
        Expect.facetBreadcrumb.numberOfValues(1);
        Expect.facetBreadcrumb.firstbreadcrumbValueLabelContains('txt');

        Actions.facet.clickShowMoreButton();
        cy.wait(InterceptAliases.Search);

        Actions.facet.selectLastLinkValue();
        cy.wait(InterceptAliases.Search);

        Expect.facetBreadcrumb.numberOfValues(1);
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
        Expect.categoryFacetBreadcrumb.displayBreadcrumb(true);
        Expect.categoryFacetBreadcrumb.displayLabel(true);
        Expect.categoryFacetBreadcrumb.labelContains('Country');
        Expect.categoryFacetBreadcrumb.displayValues(true);
        Expect.categoryFacetBreadcrumb.numberOfValues(1);
        Expect.numericFacetBreadcrumb.displayBreadcrumb(false);
        Expect.facetBreadcrumb.displayBreadcrumb(false);
        Expect.dateFacetBreadcrumb.displayBreadcrumb(false);
        Expect.displayClearFilters(true);
      });

      reset();

      scope('with 3 filters', () => {
        const path = 'North America,Canada';
        const timeframeRange = 'past-6-month..now';
        const fileType = 'txt';
        const url = `cf[geographicalhierarchy]=${path}&f[filetype]=${fileType}&df[date]=${timeframeRange}`;

        loadFromUrlHash(url);
        Expect.facetBreadcrumb.displayBreadcrumb(true);
        Expect.facetBreadcrumb.displayLabel(true);
        Expect.facetBreadcrumb.labelContains('File Type');
        Expect.facetBreadcrumb.displayValues(true);
        Expect.facetBreadcrumb.numberOfValues(1);
        Expect.facetBreadcrumb.firstbreadcrumbValueLabelContains(fileType);

        Expect.dateFacetBreadcrumb.displayBreadcrumb(true);
        Expect.dateFacetBreadcrumb.displayLabel(true);
        Expect.dateFacetBreadcrumb.labelContains('Date');
        Expect.dateFacetBreadcrumb.displayValues(true);
        Expect.dateFacetBreadcrumb.numberOfValues(1);
        Expect.dateFacetBreadcrumb.firstbreadcrumbValueLabelContains(
          'Past 6 months'
        );
        Expect.categoryFacetBreadcrumb.displayBreadcrumb(true);
        Expect.categoryFacetBreadcrumb.displayLabel(true);
        Expect.categoryFacetBreadcrumb.labelContains('Country');
        Expect.categoryFacetBreadcrumb.displayValues(true);
        Expect.categoryFacetBreadcrumb.numberOfValues(1);
        Expect.categoryFacetBreadcrumb.firstbreadcrumbValueLabelContains(
          path.split(',').join(' / ')
        );

        Expect.displayClearFilters(true);
      });
    });
  });
});
