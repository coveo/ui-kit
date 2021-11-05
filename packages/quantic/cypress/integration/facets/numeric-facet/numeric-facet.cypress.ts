import {configure} from '../../../page-objects/configurator';

import {
  field,
  NumericFacetExpectations as Expect,
} from './numeric-facet-expectations';
import {InterceptAliases, interceptSearch} from '../../../page-objects/search';
import {NumericFacetActions as Actions} from './numeric-facet-actions';
import {scope} from '../../../reporters/detailed-collector';

interface NumericFacetOptions {
  field: string;
  label: string;
  numberOfValues: number;
  sortCriteria: string;
  rangeAlgorithm: string;
  withInput: string;
  isCollapsed: boolean;
}

describe('Numeric Facet Test Suite', () => {
  const pageUrl = 's/quantic-numeric-facet';

  const defaultField = 'ytlikecount';
  const defaultLabel = 'Youtube Likes';
  const defaultNumberOfValues = 8;

  const defaultSettings = {
    field: defaultField,
    label: defaultLabel,
    numberOfValues: defaultNumberOfValues,
  };
  const customWithInputSettings = {
    field: defaultField,
    label: defaultLabel,
    numberOfValues: defaultNumberOfValues,
    withInput: 'integer',
  };

  function visitNumericFacetPage(
    options: Partial<NumericFacetOptions> = {},
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
    options: Partial<NumericFacetOptions> = {},
    urlHash: string
  ) {
    interceptSearch();
    cy.visit(`${pageUrl}#${urlHash}`);
    configure(options);
    cy.wait(InterceptAliases.Search);
  }

  describe('with default numeric facet', () => {
    it('should work as expected', () => {
      visitNumericFacetPage(defaultSettings);

      scope('on initial load', () => {
        Expect.logFacetLoad();
        Expect.displayFacet(true);
        Expect.displayLabel(true);
        Expect.displaySearchForm(false);
        Expect.displayClearButton(false);
        Expect.displayValues(true);
        Expect.labelContains(defaultLabel);
        Expect.numberOfValues(defaultNumberOfValues);
        Expect.numberOfSelectedCheckboxValues(0);
        Expect.numberOfIdleCheckboxValues(defaultNumberOfValues);
      });

      scope('when selecting a value', () => {
        const min = 0;
        const max = 8000;

        visitNumericFacetPage(defaultSettings);
        Actions.checkValueAt(0);

        Expect.displayClearButton(true);
        Expect.clearFilterContains('Clear filter');
        Expect.numberOfSelectedCheckboxValues(1);
        Expect.numberOfIdleCheckboxValues(defaultNumberOfValues - 1);
        Expect.urlHashContains(`${min}..${max}`);
        Expect.logNumericFacetSelect(`${min}..${max}`);
      });

      scope('when selecting multiple values', () => {
        visitNumericFacetPage(defaultSettings);
        Actions.checkValueAt(0);

        for (let index = 1; index < 8; index++) {
          const filterLabel = `Clear ${index + 1} filters`;
          Actions.checkValueAt(index);
          Expect.displayClearButton(true);
          Expect.clearFilterContains(filterLabel);
          Expect.numberOfSelectedCheckboxValues(index + 1);
          Expect.numberOfIdleCheckboxValues(
            defaultNumberOfValues - (index + 1)
          );
        }
      });

      scope('when clearing the selection', () => {
        visitNumericFacetPage(defaultSettings);

        Actions.checkValueAt(0);
        Actions.checkValueAt(1);
        Expect.displayClearButton(true);

        Actions.clickClearFilter();
        Expect.logClearFacetValues(field);
        Expect.displayClearButton(false);
        Expect.numberOfIdleCheckboxValues(defaultNumberOfValues);
        Expect.numberOfSelectedCheckboxValues(0);
      });
    });
  });
  describe('with custom withInput', () => {
    it('should work as expected', () => {
      visitNumericFacetPage(customWithInputSettings);

      scope('on initial load', () => {
        Expect.displayFacet(true);
        Expect.displaySearchForm(true);
        Expect.inputMaxEmpty();
        Expect.inputMinEmpty();
      });

      scope('when selecting a valid range', () => {
        const min = 120;
        const max = 8000;
        visitNumericFacetPage(customWithInputSettings);

        Actions.inputMinValue(min);
        Actions.inputMaxValue(max);
        Actions.submitManualRange();

        Expect.displayValues(false);
        Expect.search.numberOfResults(10);
        Expect.urlHashContains(`${min}..${max}`, true);
        Expect.displayClearButton(true);
        Expect.clearFilterContains('Clear filter');
        Expect.logNumericFacetSelect(`${min}..${max}`);
      });

      scope('when selecting a empty range', () => {
        visitNumericFacetPage(customWithInputSettings);

        Actions.submitManualRange();
        Expect.displayInputWarning(1);
        Expect.inputWarningContains();

        Actions.inputMinValue(100);
        Actions.submitManualRange();

        Expect.displayInputWarning(1);
        Expect.inputWarningContains();
        Expect.displayValues(true);
      });
      scope('when min input is bigger than max input', () => {
        visitNumericFacetPage(customWithInputSettings);

        Actions.inputMinValue(100);
        Actions.inputMaxValue(80);
        Actions.submitManualRange();

        Expect.displayInputWarning(1);
        Expect.inputWarningContains(
          'This value must be less than or equal to 80'
        );
        Expect.displayValues(true);
      });
      scope('when selecting from values', () => {
        visitNumericFacetPage(customWithInputSettings);

        Actions.checkValueAt(2);
        Expect.displayClearButton(true);
        Expect.clearFilterContains('Clear filter');
        Expect.numberOfSelectedCheckboxValues(1);
        Expect.numberOfIdleCheckboxValues(defaultNumberOfValues - 1);
        Expect.inputMaxEmpty();
        Expect.inputMinEmpty();
      });
    });
  });
  describe('with field returns no results', () => {
    before(() => {
      visitNumericFacetPage({
        field: 'somethingthatdoesnotexist',
      });
    });

    it('should render correctly', () => {
      Expect.displayLabel(false);
    });
  });
  describe('with is collapsed', () => {
    function setupIsCollapsed() {
      visitNumericFacetPage({
        field: defaultField,
        label: defaultLabel,
        numberOfValues: defaultNumberOfValues,
        isCollapsed: true,
      });
    }

    it('should render correctly', () => {
      setupIsCollapsed();

      Expect.displayFacet(true);
      Expect.labelContains(defaultLabel);
      Expect.displaySearchForm(false);
      Expect.displayValues(false);
      Expect.displayExpandButton(true);
    });
  });
  describe('with a selected range in the URL', () => {
    const min = '120';
    const max = '8000';

    it('should render correctly', () => {
      scope('without input', () => {
        loadFromUrlHash(
          {
            field: defaultField,
          },
          `nf[${field}]=${min}..${max}`
        );
        Expect.numberOfSelectedCheckboxValues(1);
        Expect.numberOfIdleCheckboxValues(defaultNumberOfValues - 1);
      });

      scope('with input', () => {
        loadFromUrlHash(
          customWithInputSettings,
          `nf[${field}_input]=${min}..${max}`
        );

        Expect.displayFacet(true);
        Expect.inputMaxContains(max.toString());
        Expect.inputMinContains(min.toString());
        Expect.displayValues(false);
        Expect.search.numberOfResults(10);
      });
    });
  });
  describe('with custom #rangeAlgorithm', () => {
    it('should render correctly', () => {
      function setupWithRangeAlgorithm(rangeAlgorithm: string) {
        visitNumericFacetPage({
          field: defaultField,
          label: defaultLabel,
          rangeAlgorithm: rangeAlgorithm,
        });
      }

      scope('with #even value option', () => {
        setupWithRangeAlgorithm('even');

        Expect.displayFacet(true);
        Expect.displayEqualRange();
      });

      scope('with #equiprobable value option', () => {
        setupWithRangeAlgorithm('equiprobable');

        Expect.displayFacet(true);
      });
    });
  });
});
