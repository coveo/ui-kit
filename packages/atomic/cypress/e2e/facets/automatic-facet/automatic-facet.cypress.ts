import {TestFixture} from '../../../fixtures/test-fixture';
import * as CommonAssertions from '../../common-assertions';
import {addAutomaticFacetGenerator} from '../automatic-facet-generator/automatic-facet-generator-actions';
import * as AutomaticFacetAssertions from '../automatic-facet/automatic-facet-assertions';
import {
  pressClearButton,
  selectIdleCheckboxValueAt,
} from '../facet-common-actions';
import * as CommonFacetAssertions from '../facet-common-assertions';
import {
  AutomaticFacetSelectors,
  automaticFacetComponent,
} from './automatic-facet-selectors';

describe('Automatic Facet Test Suites', () => {
  function setup() {
    new TestFixture()
      .with(
        addAutomaticFacetGenerator({
          'desired-count': '1',
          'are-collapsed': 'false',
        })
      )
      .init();
  }

  describe('verify rendering', () => {
    beforeEach(setup);

    // CommonAssertions.assertAccessibility(automaticFacetComponent);
    CommonAssertions.assertContainsComponentError(
      AutomaticFacetSelectors,
      false
    );
    CommonFacetAssertions.assertDisplayFacet(AutomaticFacetSelectors, true);
    AutomaticFacetAssertions.assertLabelIsNotEmpty(AutomaticFacetSelectors);
    CommonFacetAssertions.assertDisplayValues(AutomaticFacetSelectors, true);
    CommonFacetAssertions.assertNumberOfSelectedCheckboxValues(
      AutomaticFacetSelectors,
      0
    );
    CommonFacetAssertions.assertDisplayClearButton(
      AutomaticFacetSelectors,
      false
    );
  });

  describe('verify label', () => {
    const fieldName = 'field';
    function setupForLabelLogic(responseLabel: string | undefined) {
      new TestFixture()
        .with(
          addAutomaticFacetGenerator({
            'desired-count': '1',
            'are-collapsed': 'false',
          })
        )
        .withCustomResponse((r) => {
          r.generateAutomaticFacets = {
            facets: [
              {
                field: fieldName,
                label: responseLabel,
                values: [],
              },
            ],
          };
        })
        .init();
    }

    describe('when it is defined in the response', () => {
      beforeEach(() => setupForLabelLogic('label'));

      AutomaticFacetAssertions.assertLabel(
        AutomaticFacetSelectors,
        'label',
        'label'
      );
    });

    describe('when it is undefined in the response', () => {
      beforeEach(() => setupForLabelLogic(undefined));

      AutomaticFacetAssertions.assertLabel(
        AutomaticFacetSelectors,
        fieldName,
        'field'
      );
    });
  });

  describe('when selecting a value', () => {
    const index = 1;
    function setupSelectValue() {
      setup();
      selectIdleCheckboxValueAt(AutomaticFacetSelectors, index);
    }

    describe('verify rendering', () => {
      beforeEach(setupSelectValue);

      // CommonAssertions.assertAccessibility(automaticFacetComponent);
      CommonFacetAssertions.assertDisplayClearButton(
        AutomaticFacetSelectors,
        true
      );
      CommonFacetAssertions.assertNumberOfSelectedCheckboxValues(
        AutomaticFacetSelectors,
        1
      );
      AutomaticFacetAssertions.assertValueAtIndex(AutomaticFacetSelectors, 0);
    });

    describe('verify analytics', () => {
      beforeEach(setupSelectValue);

      AutomaticFacetAssertions.assertLogFacetSelect();
    });

    describe('when selecting a second value', () => {
      const index = 2;
      function setupSelectSecondValue() {
        setupSelectValue();
        selectIdleCheckboxValueAt(AutomaticFacetSelectors, index);
      }

      describe('verify rendering', () => {
        beforeEach(setupSelectSecondValue);

        // CommonAssertions.assertAccessibility(automaticFacetComponent);
        CommonFacetAssertions.assertDisplayClearButton(
          AutomaticFacetSelectors,
          true
        );
        CommonFacetAssertions.assertNumberOfSelectedCheckboxValues(
          AutomaticFacetSelectors,
          2
        );
        AutomaticFacetAssertions.assertValueAtIndex(AutomaticFacetSelectors, 1);
      });

      describe('verify analytics', () => {
        beforeEach(setupSelectSecondValue);

        AutomaticFacetAssertions.assertLogFacetSelect();
      });

      describe('when selecting the "Clear" button', () => {
        function setUpClearValues() {
          setupSelectSecondValue();
          pressClearButton(AutomaticFacetSelectors);
        }

        describe('verify rendering', () => {
          beforeEach(setUpClearValues);

          CommonFacetAssertions.assertDisplayClearButton(
            AutomaticFacetSelectors,
            false
          );
          CommonFacetAssertions.assertNumberOfSelectedCheckboxValues(
            AutomaticFacetSelectors,
            0
          );
          CommonFacetAssertions.assertFocusHeader(AutomaticFacetSelectors);
        });

        describe('verify analytics', () => {
          beforeEach(setUpClearValues);

          AutomaticFacetAssertions.assertLogClearFacetValues();
        });
      });
    });
  });
});
