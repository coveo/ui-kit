import {configure, reset} from '../../page-objects/configurator';
import {InterceptAliases, interceptSearch} from '../../page-objects/search';
import {scope} from '../../reporters/detailed-collector';
import {BreadcrumbManagerActions as Actions} from './breadcrumb-manager-actions';
import {BreadcrumbManagerExpectations as Expect} from './breadcrumb-manager-expectations';

describe('quantic-breadcrumb-manager', () => {
  const breadcrumbManagertUrl = 's/quantic-breadcrumb-manager';

  const facetField = 'filetype';
  const numericField = 'ytlikecount';
  const dateField = 'date';
  const categoryField = 'geographicalhierarchy';

  interface BreadcrumbOptions {
    categoryDivider: string;
    collapseThreshold: number;
  }

  function visitBreadcrumbManager(
    options: Partial<BreadcrumbOptions> = {},
    waitForSearch = true
  ) {
    interceptSearch();
    cy.visit(breadcrumbManagertUrl);
    configure(options);
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
        cy.wait(InterceptAliases.UA.Facet.Select);

        Expect.displayClearFilters(true);
        Expect.numericFacetBreadcrumb.displayBreadcrumb(true);
        Expect.numericFacetBreadcrumb.displayLabel(true);
        Expect.numericFacetBreadcrumb.labelContains('Youtube Likes');
        Expect.numericFacetBreadcrumb.displayValues(true);
        Expect.numericFacetBreadcrumb.numberOfValues(1);

        scope('when selecting more values', () => {
          for (let index = 1; index <= 4; index++) {
            Actions.numericFacet.checkValueAt(index);
            cy.wait(InterceptAliases.UA.Facet.Select);

            Expect.numericFacetBreadcrumb.displayValues(true);
            Expect.numericFacetBreadcrumb.numberOfValues(index + 1);
            Expect.numericFacetBreadcrumb.displayShowMore(false);
          }

          Actions.numericFacet.checkValueAt(5);
          cy.wait(InterceptAliases.UA.Facet.Select);

          Expect.numericFacetBreadcrumb.displayValues(true);
          Expect.numericFacetBreadcrumb.numberOfValues(5);
          Expect.numericFacetBreadcrumb.displayShowMore(true);

          Actions.clickShowMoreNumericFacetBreadcrumb();

          Expect.numericFacetBreadcrumb.numberOfValues(6);
          Expect.numericFacetBreadcrumb.displayShowMore(false);
        });

        scope('when clearing a value', () => {
          Actions.clickFirstValueNumericFacetBreadcrumb();

          Expect.logFacetBreadcrumbFacet(numericField);
          Expect.numericFacetBreadcrumb.numberOfValues(5);
        });
      });

      scope('when selecting values in time frame facet', () => {
        const timeframeLabel1 = 'Past 6 months';
        const timeframeLabel2 = 'Past 10 years';
        Expect.dateFacetBreadcrumb.displayBreadcrumb(false);

        Actions.timeframeFacet.selectValue(timeframeLabel1);
        cy.wait(InterceptAliases.UA.Facet.Select);

        Expect.dateFacetBreadcrumb.displayBreadcrumb(true);
        Expect.dateFacetBreadcrumb.displayLabel(true);
        Expect.dateFacetBreadcrumb.labelContains('Date');
        Expect.dateFacetBreadcrumb.numberOfValues(1);
        Expect.dateFacetBreadcrumb.firstBreadcrumbValueLabelContains(
          timeframeLabel1
        );

        Actions.timeframeFacet.selectValue(timeframeLabel2);
        cy.wait(InterceptAliases.UA.Facet.Select);

        Expect.dateFacetBreadcrumb.displayBreadcrumb(true);
        Expect.dateFacetBreadcrumb.displayLabel(true);
        Expect.dateFacetBreadcrumb.numberOfValues(1);
        Expect.dateFacetBreadcrumb.firstBreadcrumbValueLabelContains(
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
        cy.wait(InterceptAliases.UA.Facet.Select);

        Expect.categoryFacetBreadcrumb.displayBreadcrumb(true);
        Expect.categoryFacetBreadcrumb.displayLabel(true);
        Expect.categoryFacetBreadcrumb.labelContains('Country');
        Expect.categoryFacetBreadcrumb.displayValues(true);
        Expect.categoryFacetBreadcrumb.numberOfValues(1);
        Expect.categoryFacetBreadcrumb.firstBreadcrumbValueLabelContains(
          path[0]
        );

        Actions.categoryFacet.selectChildValue(path[1]);
        cy.wait(InterceptAliases.UA.Facet.Select);

        Expect.categoryFacetBreadcrumb.numberOfValues(1);
        Expect.categoryFacetBreadcrumb.firstBreadcrumbValueLabelContains(
          path.slice(0, 1).join(' / ')
        );

        Actions.categoryFacet.selectChildValue(path[2]);
        cy.wait(InterceptAliases.UA.Facet.Select);

        Expect.categoryFacetBreadcrumb.numberOfValues(1);
        Expect.categoryFacetBreadcrumb.firstBreadcrumbValueLabelContains(
          path.join(' / ')
        );

        Actions.clickCategoryFacetBreadcrumb();

        Expect.logCategoryFacetBreadcrumbFacet(categoryField);
        Expect.categoryFacetBreadcrumb.displayBreadcrumb(false);
        Expect.displayClearFilters(false);
      });

      scope('when selecting values in facet', () => {
        cy.then(Actions.facet.selectFirstLinkValue)
          .wait(InterceptAliases.UA.Facet.Select)
          .then((interception) => {
            Expect.facetBreadcrumb.firstBreadcrumbValueLabelContains(
              interception.request.body.customData.facetValue
            );
          });

        Expect.facetBreadcrumb.displayBreadcrumb(true);
        Expect.facetBreadcrumb.labelContains('File Type');
        Expect.facetBreadcrumb.displayValues(true);
        Expect.facetBreadcrumb.numberOfValues(1);

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
        const url = `cf[${categoryField}]=${path}`;

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
        const url = `cf[${categoryField}]=${path}&f[${facetField}]=${fileType}&df[${dateField}]=${timeframeRange}`;

        loadFromUrlHash(url);
        Expect.facetBreadcrumb.displayBreadcrumb(true);
        Expect.facetBreadcrumb.displayLabel(true);
        Expect.facetBreadcrumb.labelContains('File Type');
        Expect.facetBreadcrumb.displayValues(true);
        Expect.facetBreadcrumb.numberOfValues(1);
        Expect.facetBreadcrumb.firstBreadcrumbValueLabelContains(fileType);

        Expect.dateFacetBreadcrumb.displayBreadcrumb(true);
        Expect.dateFacetBreadcrumb.displayLabel(true);
        Expect.dateFacetBreadcrumb.labelContains('Date');
        Expect.dateFacetBreadcrumb.displayValues(true);
        Expect.dateFacetBreadcrumb.numberOfValues(1);
        Expect.dateFacetBreadcrumb.firstBreadcrumbValueLabelContains(
          'Past 6 months'
        );
        Expect.categoryFacetBreadcrumb.displayBreadcrumb(true);
        Expect.categoryFacetBreadcrumb.displayLabel(true);
        Expect.categoryFacetBreadcrumb.labelContains('Country');
        Expect.categoryFacetBreadcrumb.displayValues(true);
        Expect.categoryFacetBreadcrumb.numberOfValues(1);
        Expect.categoryFacetBreadcrumb.firstBreadcrumbValueLabelContains(
          path.split(',').join(' / ')
        );

        Expect.displayClearFilters(true);
      });
    });
  });

  describe('with custom category divider', () => {
    it('should work as expected', () => {
      visitBreadcrumbManager({
        categoryDivider: '*',
      });

      const path = ['North America', 'Canada', 'British Columbia'];

      Expect.categoryFacetBreadcrumb.displayBreadcrumb(false);

      Actions.categoryFacet.selectChildValue(path[0]);

      Expect.categoryFacetBreadcrumb.displayBreadcrumb(true);
      Expect.categoryFacetBreadcrumb.displayLabel(true);
      Expect.categoryFacetBreadcrumb.labelContains('Country');
      Expect.categoryFacetBreadcrumb.displayValues(true);
      Expect.categoryFacetBreadcrumb.numberOfValues(1);
      Expect.categoryFacetBreadcrumb.firstBreadcrumbValueLabelContains(path[0]);

      Actions.categoryFacet.selectChildValue(path[1]);
      cy.wait(InterceptAliases.UA.Facet.Select);

      Expect.categoryFacetBreadcrumb.numberOfValues(1);
      Expect.categoryFacetBreadcrumb.firstBreadcrumbValueLabelContains(
        path.slice(0, 1).join(' * ')
      );

      Actions.categoryFacet.selectChildValue(path[2]);
      cy.wait(InterceptAliases.UA.Facet.Select);

      Expect.categoryFacetBreadcrumb.numberOfValues(1);
      Expect.categoryFacetBreadcrumb.firstBreadcrumbValueLabelContains(
        path.join(' * ')
      );
    });
  });

  describe('with custom collapse threshold', () => {
    it('should work as expected', () => {
      visitBreadcrumbManager({
        collapseThreshold: 2,
      });

      Actions.numericFacet.checkValueAt(0);
      Expect.numericFacetBreadcrumb.displayBreadcrumb(true);
      Expect.numericFacetBreadcrumb.numberOfValues(1);

      Actions.numericFacet.checkValueAt(1);
      Expect.numericFacetBreadcrumb.numberOfValues(2);

      Actions.numericFacet.checkValueAt(2);
      Expect.numericFacetBreadcrumb.numberOfValues(2);
      Expect.numericFacetBreadcrumb.displayShowMore(true);
    });
  });
});
