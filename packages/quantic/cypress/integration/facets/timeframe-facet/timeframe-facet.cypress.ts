import {configure} from '../../../page-objects/configurator';
import {
  InterceptAliases,
  interceptSearch,
  routeMatchers,
} from '../../../page-objects/search';
import {scope} from '../../../reporters/detailed-collector';

import {TimeframeFacetExpectations as Expect} from './timeframe-facet-expectations';
import {TimeframeFacetActions as Actions} from './timeframe-facet-actions';

interface TimeframeFacetOptions {
  field: string;
  label: string;
  withDatePicker: boolean;
  isCollapsed: boolean;
}

describe('quantic-timeframe-facet', () => {
  const pageUrl = 's/quantic-timeframe-facet';

  function visitTimeframeFacet(
    options: Partial<TimeframeFacetOptions>,
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
    options: Partial<TimeframeFacetOptions> = {},
    urlHash: string
  ) {
    interceptSearch();
    cy.visit(`${pageUrl}#${urlHash}`);
    configure(options);
  }

  it('should show placeholder before search completes', () => {
    visitTimeframeFacet({}, false);

    Expect.displayPlaceholder(true);

    scope('when search request completes', () => {
      cy.wait(InterceptAliases.Search);
      Expect.displayPlaceholder(false);
    });
  });

  describe('with default options', () => {
    it('should work as expected', () => {
      visitTimeframeFacet({});

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
        Expect.urlHashContains('Date', 'past-1-year..now');
        Expect.displayClearButton(true);
        Expect.logSelectedValue('Date', 'past-1-year..now');
      });

      scope('when selecting another value', () => {
        Actions.selectValue('Last decade');

        Expect.numberOfSelectedValues(1);
        Expect.selectedValueContains('Last decade');
        Expect.urlHashContains('Date', 'past-10-year..now');
        Expect.displayClearButton(true);
        Expect.logSelectedValue('Date', 'past-10-year..now');
      });

      scope('when clearing filter', () => {
        Actions.clearFilter();

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

  function mockSearchEmptyTimeframes() {
    cy.intercept(routeMatchers.search, (req) => {
      req.continue((res) => {
        const facetValues = res.body.facets[0].values;
        for (let i = 0; i < facetValues.length; i++) {
          // Set all timeframes as empty, except the first one
          facetValues[i].numberOfResults = i === 0 ? 100 : 0;
        }
        res.send();
      });
    }).as(InterceptAliases.Search.substring(1));
  }

  function mockSearchWithAllTimeframes() {
    cy.intercept(routeMatchers.search, (req) => {
      req.continue((res) => {
        const facetValues = res.body.facets[0].values;
        for (let i = 0; i < facetValues.length; i++) {
          facetValues[i].numberOfResults = 100;
        }
        res.send();
      });
    }).as(InterceptAliases.Search.substring(1));
  }

  describe('with empty timeframes', () => {
    it('should display non-empty timeframes only', () => {
      mockSearchEmptyTimeframes();
      cy.visit(pageUrl);
      configure({});
      cy.wait(InterceptAliases.Search);

      scope('with one non-empty timeframe', () => {
        Expect.numberOfValues(1);
      });
    });
  });

  describe('with non-empty timeframes', () => {
    it('should display timeframes in the right order', () => {
      mockSearchWithAllTimeframes();
      cy.visit(pageUrl);
      configure({});
      cy.wait(InterceptAliases.Search);

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

      scope('when specifying a range', () => {
        Actions.applyRange('2000-12-31', '2001-03-15');

        cy.wait(InterceptAliases.Search);

        const range = '2000/12/31@00:00:00..2001/03/15@23:59:59';
        Expect.urlHashContains('Date_input', range);
        Expect.logSelectedValue('Date', range);

        Expect.displayValues(false);
        Expect.displayClearButton(true);
      });

      scope('when clearing filter', () => {
        Actions.clearFilter();

        cy.wait(InterceptAliases.Search);

        Expect.displayClearButton(false);
        Expect.displayValues(true);
        Expect.urlHashIsEmpty();
        Expect.logClearFilter('Date');
      });

      scope('when entering an invalid range', () => {
        scope('invalid start date format', () => {
          Actions.applyRange('bad start date', '2000-01-01');

          Expect.validationError(
            'Your entry does not match the allowed format yyyy-MM-dd.'
          );
        });

        scope('invalid end date format', () => {
          Actions.applyRange('2000-01-01', 'bad end date');

          Expect.validationError(
            'Your entry does not match the allowed format yyyy-MM-dd.'
          );
        });

        scope('end date smaller than start date', () => {
          Actions.applyRange('2000-12-31', '2000-01-01');

          Expect.validationError('Value must be 2000-01-01 or earlier.');
          Expect.urlHashIsEmpty();
          Expect.displayValues(true);
        });
      });

      scope('when entering a valid range', () => {
        Actions.applyRange('2000-01-01', '2000-12-31');

        Expect.noValidationError();
        Expect.urlHashContains(
          'Date_input',
          '2000/01/01@00:00:00..2000/12/31@23:59:59'
        );
        Expect.displayClearButton(true);
        Expect.displayValues(false);

        scope(
          'submitting the range form again should use the same range',
          () => {
            Actions.submitForm();

            Expect.urlHashContains(
              'Date_input',
              '2000/01/01@00:00:00..2000/12/31@23:59:59'
            );
          }
        );
      });
    });
  });

  describe('when loading range from URL', () => {
    describe('with selected timeframe', () => {
      it('should load the facet correctly', () => {
        loadFromUrlHash(
          {
            field: 'Date',
          },
          'df[Date]=past-1-year..now'
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
          'df[Date_input]=2000/01/01@00:00:00..2000/12/31@23:59:59'
        );

        Expect.displayLabel(true);
        Expect.displayCollapseButton(true);
        Expect.displayClearButton(true);
        Expect.displayStartInput(true);
        Expect.displayEndInput(true);
        Expect.displayApplyButton(true);
        Expect.displayValues(false);

        scope('fills datepickers with correct dates', () => {
          Expect.startInputContains('2000-01-01');
          Expect.endInputContains('2000-12-31');
        });
      });
    });
  });
});
