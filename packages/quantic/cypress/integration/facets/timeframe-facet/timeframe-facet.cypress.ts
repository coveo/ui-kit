import {configure} from '../../../page-objects/configurator';
import {
  InterceptAliases,
  interceptSearch,
  routeMatchers,
} from '../../../page-objects/search';
import {scope} from '../../../reporters/detailed-collector';

import {TimeframeFacetExpectations as Expect} from './timeframe-facet-expectations';
import {TimeframeFacetActions as Actions} from './timeframe-facet-actions';
import {TimeframeFacetSelectors} from './timeframe-facet-selectors';
import {categoryFacetComponent} from '../category-facet/category-facet-selectors';

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
        Actions.selectValue('Next year');

        Expect.numberOfSelectedValues(1);
        Expect.selectedValueContains('Next year');
        Expect.urlHashContains('Date', 'now..next-1-year');
        Expect.displayClearButton(true);
        Expect.logSelectedValue('Date', 'now..next-1-year');
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
          Actions.selectValue('Next year');

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
    });
  });
});
