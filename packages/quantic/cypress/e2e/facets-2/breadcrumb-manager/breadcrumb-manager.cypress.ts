import {performSearch} from '../../../page-objects/actions/action-perform-search';
import {configure, reset} from '../../../page-objects/configurator';
import {
  getQueryAlias,
  InterceptAliases,
  interceptSearch,
} from '../../../page-objects/search';
import {
  useCaseParamTest,
  useCaseEnum,
  InsightInterfaceExpectations as InsightInterfaceExpect,
} from '../../../page-objects/use-case';
import {scope} from '../../../reporters/detailed-collector';
import {BreadcrumbManagerActions as Actions} from './breadcrumb-manager-actions';
import {BreadcrumbManagerExpectations as Expect} from './breadcrumb-manager-expectations';

describe('quantic-breadcrumb-manager', () => {
  const breadcrumbManagerUrl = 's/quantic-breadcrumb-manager';

  const facetField = 'filetype';
  const numericField = 'ytlikecount';
  const dateField = 'date';
  const categoryField = 'geographicalhierarchy';
  const clearActionName = 'Clear filter';

  interface BreadcrumbOptions {
    useCase: string;
    categoryDivider: string;
    collapseThreshold: number;
    displayFacetValuesAs: 'link' | 'checkbox';
  }

  function visitBreadcrumbManager(
    options: Partial<BreadcrumbOptions> = {},
    waitForSearch = true
  ) {
    interceptSearch();
    cy.visit(breadcrumbManagerUrl);
    configure(options);
    if (options.useCase === useCaseEnum.insight) {
      InsightInterfaceExpect.isInitialized();
      performSearch();
    }
    if (waitForSearch) {
      cy.wait(getQueryAlias(options.useCase));
    }
  }

  function loadFromUrlHash(urlHash: string) {
    interceptSearch();
    cy.visit(`${breadcrumbManagerUrl}#${urlHash}`);
    configure();
  }

  useCaseParamTest.forEach((param) => {
    describe(param.label, () => {
      describe('with default values', () => {
        it('should work as expected', () => {
          visitBreadcrumbManager({useCase: param.useCase});

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
            const dateFacetName = 'Date';
            const timeframeLabel1 = 'Past 6 months';
            const timeframeLabel2 = 'Past decade';
            Expect.dateFacetBreadcrumb.displayBreadcrumb(false);

            Actions.timeframeFacet.selectValue(timeframeLabel1);
            cy.wait(InterceptAliases.UA.Facet.Select);

            Expect.dateFacetBreadcrumb.displayBreadcrumb(true);
            Expect.dateFacetBreadcrumb.displayLabel(true);
            Expect.dateFacetBreadcrumb.labelContains(dateFacetName);
            Expect.dateFacetBreadcrumb.numberOfValues(1);
            Expect.dateFacetBreadcrumb.firstBreadcrumbValueLabelContains(
              timeframeLabel1
            );
            Expect.dateFacetBreadcrumb.firstBreadcrumbAltTextEq(
              `${dateFacetName} ${timeframeLabel1} ${clearActionName}`
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
            const categoryFacetName = 'Country';

            Expect.categoryFacetBreadcrumb.displayBreadcrumb(false);

            Actions.categoryFacet.selectChildValue(path[0]);
            cy.wait(InterceptAliases.UA.Facet.Select);

            Expect.categoryFacetBreadcrumb.displayBreadcrumb(true);
            Expect.categoryFacetBreadcrumb.displayLabel(true);
            Expect.categoryFacetBreadcrumb.labelContains(categoryFacetName);
            Expect.categoryFacetBreadcrumb.displayValues(true);
            Expect.categoryFacetBreadcrumb.numberOfValues(1);
            Expect.categoryFacetBreadcrumb.firstBreadcrumbValueLabelContains(
              path[0]
            );
            Expect.categoryFacetBreadcrumb.firstBreadcrumbAltTextEq(
              `${categoryFacetName} ${path[0]} ${clearActionName}`
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
            cy.wait(getQueryAlias(param.useCase));

            Actions.facet.selectLastLinkValue();
            cy.wait(getQueryAlias(param.useCase));

            Expect.facetBreadcrumb.numberOfValues(1);
          });
        });
      });

      describe('when facet values are displayed as checkboxes', () => {
        it('should properly display the breadcrumb values', () => {
          visitBreadcrumbManager({
            useCase: param.useCase,
            displayFacetValuesAs: 'checkbox',
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
            cy.wait(getQueryAlias(param.useCase));
            Actions.facet.selectLastLinkValue();
            cy.wait(getQueryAlias(param.useCase));
            Expect.facetBreadcrumb.numberOfValues(2);
          });

          scope('when clearing the values', () => {
            Actions.clickFirstValueFacetBreadcrumb();
            Expect.facetBreadcrumb.numberOfValues(1);
            Actions.clickFirstValueFacetBreadcrumb();
            Expect.facetBreadcrumb.displayBreadcrumb(false);
          });
        });
      });

      if (param.useCase === useCaseEnum.search) {
        describe('when loading from URL', () => {
          it('should work as expected', () => {
            scope('with one filter', () => {
              const path = 'Africa,Togo';
              const url = `cf-${categoryField}=${path}`;

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
              const url = `cf-${categoryField}=${path}&f-${facetField}=${fileType}&df-${dateField}=${timeframeRange}`;

              loadFromUrlHash(url);
              Expect.facetBreadcrumb.displayBreadcrumb(true);
              Expect.facetBreadcrumb.displayLabel(true);
              Expect.facetBreadcrumb.labelContains('File Type');
              Expect.facetBreadcrumb.displayValues(true);
              Expect.facetBreadcrumb.numberOfValues(1);
              Expect.facetBreadcrumb.firstBreadcrumbValueLabelContains(
                fileType
              );

              const dateFacetName = 'Date';
              Expect.dateFacetBreadcrumb.displayBreadcrumb(true);
              Expect.dateFacetBreadcrumb.displayLabel(true);
              Expect.dateFacetBreadcrumb.labelContains(dateFacetName);
              Expect.dateFacetBreadcrumb.displayValues(true);
              Expect.dateFacetBreadcrumb.numberOfValues(1);
              Expect.dateFacetBreadcrumb.firstBreadcrumbValueLabelContains(
                'Past 6 months'
              );
              Expect.dateFacetBreadcrumb.firstBreadcrumbAltTextEq(
                `${dateFacetName} Past 6 months ${clearActionName}`
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
      }

      describe('with custom category divider', () => {
        it('should work as expected', () => {
          visitBreadcrumbManager({
            categoryDivider: '*',
            useCase: param.useCase,
          });

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
            useCase: param.useCase,
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
  });
});
