import {performSearch} from '../../../page-objects/actions/action-perform-search';
import {configure} from '../../../page-objects/configurator';
import {
  captureBaselineNumberOfRequests,
  getQueryAlias,
  getRoute,
  InterceptAliases,
  interceptSearch,
  interceptSearchIndefinitely,
} from '../../../page-objects/search';
import {
  useCaseParamTest,
  useCaseEnum,
  InsightInterfaceExpectations as InsightInterfaceExpect,
} from '../../../page-objects/use-case';
import {scope} from '../../../reporters/detailed-collector';
import {SearchExpectations} from '../../search-expectations';
import {TimeframeFacetActions as Actions} from './timeframe-facet-actions';
import {TimeframeFacetExpectations as Expect} from './timeframe-facet-expectations';

interface TimeframeFacetOptions {
  field: string;
  label: string;
  withDatePicker: boolean;
  isCollapsed: boolean;
  useCase: string;
}

describe('quantic-timeframe-facet', () => {
  const pageUrl = 's/quantic-timeframe-facet';

  const validRange = {
    start: '2000-01-01',
    end: '2000-12-31',
    filter: '2000/01/01@00:00:00..2000/12/31@23:59:59',
  };
  const invalidRange = {
    start: '2000-12-31',
    end: '2000-01-01',
    filter: '2000/12/31@00:00:00..2000/01/01@23:59:59',
  };

  function visitTimeframeFacet(
    options: Partial<TimeframeFacetOptions>,
    waitForSearch = true
  ) {
    interceptSearch();
    cy.visit(pageUrl);

    configure(options);

    if (options.useCase === useCaseEnum.insight) {
      InsightInterfaceExpect.isInitialized();
      performSearch();
    }
    if (waitForSearch) {
      cy.wait(getQueryAlias(options.useCase));
    }
  }

  function setupWithPauseBeforeSearch(useCase: string) {
    interceptSearchIndefinitely();
    cy.visit(pageUrl);
    configure({useCase: useCase});
  }

  function loadFromUrlHash(
    options: Partial<TimeframeFacetOptions> = {},
    urlHash: string
  ) {
    interceptSearch();
    cy.visit(`${pageUrl}#${urlHash}`);
    configure(options);
  }

  function mockSearchEmptyTimeframes(useCase: string) {
    cy.intercept(getRoute(useCase), (req) => {
      req.continue((res) => {
        const facetValues = res.body.facets[0].values;
        for (let i = 0; i < facetValues.length; i++) {
          // Set all timeframes as empty, except the first one
          facetValues[i].numberOfResults = i === 0 ? 100 : 0;
        }
        res.send();
      });
    }).as(getQueryAlias(useCase).substring(1));
  }

  function mockSearchWithAllTimeframes(useCase: string) {
    cy.intercept(getRoute(useCase), (req) => {
      req.continue((res) => {
        const facetValues = res.body.facets[0].values;
        for (let i = 0; i < facetValues.length; i++) {
          facetValues[i].numberOfResults = 100;
        }
        res.send();
      });
    }).as(getQueryAlias(useCase).substring(1));
  }

  useCaseParamTest.forEach((param) => {
    describe(param.label, () => {
      it('should show placeholder before search completes', () => {
        setupWithPauseBeforeSearch(param.useCase);

        Expect.displayPlaceholder(true);
      });

      describe('with default options', () => {
        it('should work as expected', () => {
          visitTimeframeFacet({useCase: param.useCase});

          scope('validate initial rendering', () => {
            Expect.displayLabel(true);
            Expect.labelContains('Timeframe');
            Expect.displayCollapseButton(true);
            Expect.displayExpandButton(false);
            Expect.displayClearButton(false);
            Expect.displayValues(true);
          });

          scope('when selecting a value', () => {
            Actions.selectValue('Past year');

            Expect.numberOfSelectedValues(1);
            Expect.selectedValueContains('Past year');
            if (param.useCase === useCaseEnum.search) {
              Expect.urlHashContains('Date', 'past-1-year..now');
            }
            Expect.displayClearButton(true);
            Expect.logSelectedValue('Date', 'past-1-year..now');
          });

          scope('when selecting another value', () => {
            Actions.selectValue('Last decade');

            Expect.numberOfSelectedValues(1);
            Expect.selectedValueContains('Last decade');
            if (param.useCase === useCaseEnum.search) {
              Expect.urlHashContains('Date', 'past-10-year..now');
            }
            Expect.displayClearButton(true);
            Expect.logSelectedValue('Date', 'past-10-year..now');
          });

          scope('when clearing filter', () => {
            captureBaselineNumberOfRequests(getQueryAlias(param.useCase));

            Actions.clearFilter();

            cy.wait(getQueryAlias(param.useCase));

            SearchExpectations.numberOfSearchRequests(1, param.useCase);
            Expect.numberOfSelectedValues(0);
            Expect.urlHashIsEmpty();
            Expect.displayClearButton(false);
            Expect.logClearFilter('Date');
          });

          scope('when collapsing the facet', () => {
            scope('when no value is selected', () => {
              scope('collapse the facet', () => {
                Actions.collapse();

                Expect.displayLabel(true);
                Expect.displayExpandButton(true);
                Expect.displayClearButton(false);
                Expect.displayValues(false);
              });

              scope('expand the facet', () => {
                Actions.expand();

                Expect.displayLabel(true);
                Expect.displayCollapseButton(true);
                Expect.displayValues(true);
              });
            });

            scope('when a value is selected', () => {
              Actions.selectValue('Past year');

              scope('collapse the facet', () => {
                Actions.collapse();

                Expect.displayLabel(true);
                Expect.displayExpandButton(true);
                Expect.displayClearButton(true);
                Expect.displayValues(false);
              });

              scope('expand the facet', () => {
                Actions.expand();

                Expect.displayLabel(true);
                Expect.displayCollapseButton(true);
                Expect.displayClearButton(true);
                Expect.displayValues(true);
              });
            });
          });
        });
      });

      describe('with is-collapsed', () => {
        it('should appear as collapsed', () => {
          visitTimeframeFacet({
            isCollapsed: true,
            useCase: param.useCase,
          });

          scope('on initial load', () => {
            Expect.displayLabel(true);
            Expect.displayExpandButton(true);
            Expect.displayValues(false);
          });

          scope('when expanding the facet', () => {
            Actions.expand();

            Expect.displayLabel(true);
            Expect.displayCollapseButton(true);
            Expect.displayValues(true);
          });
        });
      });

      describe('with empty timeframes', () => {
        it('should display non-empty timeframes only', () => {
          mockSearchEmptyTimeframes(param.useCase);
          visitTimeframeFacet({useCase: param.useCase});

          scope('with one non-empty timeframe', () => {
            Expect.numberOfValues(1);
          });
        });
      });

      describe('with non-empty timeframes', () => {
        it('should display timeframes in the right order', () => {
          mockSearchWithAllTimeframes(param.useCase);
          visitTimeframeFacet({useCase: param.useCase});

          Expect.valuesEqual([
            'Next year',
            'Past 2 weeks',
            'Past month',
            'Past year',
            'Last decade',
          ]);
        });
      });

      describe('with with-date-picker', () => {
        it('should activate manual range', () => {
          visitTimeframeFacet({
            withDatePicker: true,
            useCase: param.useCase,
          });

          scope('validate initial rendering', () => {
            Expect.displayLabel(true);
            Expect.displayCollapseButton(true);
            Expect.displayStartInput(true);
            Expect.displayEndInput(true);
            Expect.displayApplyButton(true);
            Expect.displayValues(true);
          });

          scope('when collapsing the facet', () => {
            Actions.collapse();

            Expect.displayStartInput(false);
            Expect.displayEndInput(false);
            Expect.displayApplyButton(false);

            Actions.expand();
          });

          scope('when specifying a valid range', () => {
            Actions.applyRange(validRange.start, validRange.end);

            cy.wait(getQueryAlias(param.useCase));

            if (param.useCase === useCaseEnum.search) {
              Expect.urlHashContains(
                'Date_input',
                '2000/01/01@00:00:00...2000/12/31@23:59:59'
              );
            }

            Expect.logSelectedValue('Date', validRange.filter);

            Expect.displayValues(false);
            Expect.displayClearButton(true);
          });

          scope('when clearing filter', () => {
            captureBaselineNumberOfRequests(getQueryAlias(param.useCase));

            Actions.clearFilter();

            cy.wait(getQueryAlias(param.useCase));

            SearchExpectations.numberOfSearchRequests(1, param.useCase);
            Expect.displayClearButton(false);
            Expect.displayValues(true);
            Expect.urlHashIsEmpty();
            Expect.logClearFilter('Date');
          });

          scope('when entering an invalid range', () => {
            scope('with empty start and end dates', () => {
              Actions.submitForm();

              Expect.numberOfValidationErrors(2);
              Expect.validationError('Complete this field.');
            });

            scope('when entering then erasing dates', () => {
              Actions.typeStartDate(validRange.start);
              Actions.submitForm();

              Expect.numberOfValidationErrors(1);
              Expect.validationError('Complete this field.');

              Actions.typeEndDate(validRange.end);
              Actions.submitForm();
              cy.wait(getQueryAlias(param.useCase));

              Expect.numberOfValidationErrors(0);

              captureBaselineNumberOfRequests(getQueryAlias(param.useCase));

              Actions.clearFilter();
              cy.wait(getQueryAlias(param.useCase));

              SearchExpectations.numberOfSearchRequests(1, param.useCase);
            });

            scope('invalid start date format', () => {
              Actions.applyRange('bad start date', validRange.end);

              Expect.numberOfValidationErrors(1);
              Expect.validationError(
                'Your entry does not match the allowed format yyyy-MM-dd.'
              );
            });

            scope('invalid end date format', () => {
              Actions.applyRange(validRange.start, 'bad end date');

              Expect.numberOfValidationErrors(1);
              Expect.validationError(
                'Your entry does not match the allowed format yyyy-MM-dd.'
              );
            });

            scope('end date smaller than start date', () => {
              Actions.applyRange(invalidRange.start, invalidRange.end);

              Expect.numberOfValidationErrors(1);
              Expect.validationError(
                `Value must be ${invalidRange.end} or earlier.`
              );
              Expect.urlHashIsEmpty();
              Expect.displayValues(true);
            });
          });

          scope('when entering a valid range', () => {
            Actions.applyRange(validRange.start, validRange.end);

            Expect.numberOfValidationErrors(0);
            if (param.useCase === useCaseEnum.search) {
              Expect.urlHashContains(
                'Date_input',
                '2000/01/01@00:00:00...2000/12/31@23:59:59'
              );
            }
            Expect.displayClearButton(true);
            Expect.displayValues(false);

            scope(
              'submitting the range form again should use the same range',
              () => {
                Actions.submitForm();

                if (param.useCase === useCaseEnum.search) {
                  Expect.urlHashContains(
                    'Date_input',
                    '2000/01/01@00:00:00...2000/12/31@23:59:59'
                  );
                }
              }
            );
          });
        });
      });

      if (param.useCase === useCaseEnum.search) {
        describe('when loading range from URL', () => {
          describe('with selected timeframe', () => {
            it('should load the facet correctly', () => {
              loadFromUrlHash(
                {
                  field: 'Date',
                },
                'df-Date=past-1-year..now'
              );

              Expect.displayLabel(true);
              Expect.displayCollapseButton(true);
              Expect.displayClearButton(true);
              Expect.displayValues(true);
              Expect.numberOfSelectedValues(1);
              Expect.selectedValueContains('Past year');
            });
          });

          describe('with custom range', () => {
            it('should load the facet correctly', () => {
              loadFromUrlHash(
                {
                  field: 'Date',
                  withDatePicker: true,
                },
                'df-Date_input=' + validRange.filter
              );

              Expect.displayLabel(true);
              Expect.displayCollapseButton(true);
              Expect.displayClearButton(true);
              Expect.displayStartInput(true);
              Expect.displayEndInput(true);
              Expect.displayApplyButton(true);
              Expect.displayValues(false);

              scope('fills datepickers with correct dates', () => {
                Expect.startInputContains(validRange.start);
                Expect.endInputContains(validRange.end);
              });
            });
          });
        });
      }

      describe('when no results match the timeframe facet', () => {
        function interceptNoResultsForFacet() {
          cy.intercept(getRoute(param.useCase), (req) => {
            req.continue((res) => {
              const facet = res.body.facets.find((f) => f.facetId === 'Date');
              if (facet) {
                facet.values.forEach((v) => {
                  v.numberOfResults = 0;
                });
              }
              res.send();
            });
          }).as(getQueryAlias(param.useCase).substring(1));
        }

        function setupWithNoResultsMatchingFacet(
          options: Partial<TimeframeFacetOptions>
        ) {
          interceptNoResultsForFacet();
          visitTimeframeFacet(options);
        }

        describe('when with-date-picker is false', () => {
          it('should hide the facet', () => {
            setupWithNoResultsMatchingFacet({useCase: param.useCase});

            Expect.displayLabel(false);
          });
        });

        describe('when with-date-picker is true', () => {
          it('should show the facet', () => {
            setupWithNoResultsMatchingFacet({
              withDatePicker: true,
              useCase: param.useCase,
            });

            Expect.displayLabel(true);
          });
        });
      });

      describe('when no results found', () => {
        function interceptNoSearchResults() {
          cy.intercept(getRoute(param.useCase), (req) => {
            req.continue((res) => {
              res.body.results = [];
              res.body.totalCount = 0;
              res.body.totalCountFiltered = 0;

              const facet = res.body.facets.find((f) => f.facetId === 'Date');
              if (facet) {
                facet.values.forEach((v) => {
                  const range = validRange.filter.split('..');
                  v.numberOfResults = 0;

                  if (v.start === range[0] && v.end === range[1]) {
                    v.state = 'selected';
                  }
                });
              }

              res.send();
            });
          }).as(getQueryAlias(param.useCase).substring(1));
        }

        function setupWithNoResults(options: Partial<TimeframeFacetOptions>) {
          interceptNoSearchResults();
          visitTimeframeFacet(options);
        }

        function loadFromUrlHashWithNoResults(
          options: Partial<TimeframeFacetOptions>,
          urlHash: string
        ) {
          interceptNoSearchResults();
          cy.visit(`${pageUrl}#${urlHash}`);
          configure(options);
          cy.wait(InterceptAliases.Search);
        }

        it('should not display facet', () => {
          setupWithNoResults({
            withDatePicker: true,
            useCase: param.useCase,
          });

          Expect.displayPlaceholder(false);
          Expect.displayLabel(false);
        });

        if (param.useCase === useCaseEnum.search) {
          it('should display facet if custom range is specified', () => {
            loadFromUrlHashWithNoResults(
              {
                withDatePicker: true,
              },
              `df-Date_input=${validRange.filter}`
            );

            Expect.displayPlaceholder(false);
            Expect.displayLabel(true);
            Expect.displayStartInput(true);
            Expect.displayEndInput(true);
            Expect.displayApplyButton(true);
            Expect.displayValues(false);
          });

          it('should display facet if timeframe is specified', () => {
            loadFromUrlHashWithNoResults({}, 'df-Date=past-1-year..now');

            Expect.displayPlaceholder(false);
            Expect.displayLabel(true);
            Expect.displayValues(true);
            Expect.numberOfSelectedValues(1);
            Expect.numberOfValues(1);
          });
        }
      });
    });
  });
});
