import {configure} from '../../../page-objects/configurator';
import {InterceptAliases, interceptSearch} from '../../../page-objects/search';
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

        scope('validate timeframe values and ordering', () => {
          Expect.valuesEqual([
            'Next year',
            'Past 2 weeks',
            'Past month',
            'Past year',
            'Last decade',
          ]);
        });
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

  describe('with with-date-picker', () => {
    it('should activate manual range', () => {
      visitTimeframeFacet({
        withDatePicker: true,
      });

      // - input fields are present
      // - min/max validations

      // specify a range
      // - search request sent with the correct range
      // - values not displayed
      // - clear button displayed
      // - range in URL hash
      // - log UA event

      // clear filter
      // - input fields are empty
      // - values are displayed
      // - no range in URL hash
      // - clear button not displayed
      // - log UA event
    });
  });
});
