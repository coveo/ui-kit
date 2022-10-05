import {TestFixture} from '../../../fixtures/test-fixture';
import {addPopover, label} from './popover-facet-actions';
import {field as facetField} from '../facet/facet-actions';
import {numericFacetField} from '../numeric-facet/numeric-facet-actions';
import {PopoverSelectors} from './popover-facet-selectors';
import * as PopoverAssertions from './popover-facet-assertions';
import {colorFacetField} from '../color-facet/color-facet-actions';
import {hierarchicalField} from '../category-facet/category-facet-actions';
import {ratingFacetField} from '../rating-facet/rating-facet-actions';
import {createTimeframeElements} from '../timeframe-facet/timeframe-facet-action';

describe('Popover Facet Test Suites', () => {
  function testSuites() {
    PopoverAssertions.assertLabelContains(label);
    PopoverAssertions.assertFacetIsHidden();

    describe('when clicking the facet button', () => {
      before(() => {
        PopoverSelectors.popoverButton().click();
      });

      PopoverAssertions.assertFacetIsVisible();
    });

    describe('when clicking the facet button a second time', () => {
      before(() => {
        PopoverSelectors.popoverButton().click();
      });

      PopoverAssertions.assertFacetIsHidden();
    });

    describe('when clicking outside the facet after opening it', () => {
      before(() => {
        PopoverSelectors.popoverButton().click();
        PopoverSelectors.backdrop().click();
      });

      PopoverAssertions.assertFacetIsHidden();
    });

    describe('when clicking inside the facet after opening it', () => {
      before(() => {
        PopoverSelectors.popoverButton().click();
        PopoverSelectors.facet().click({force: true});
      });

      PopoverAssertions.assertFacetIsVisible();
    });
  }

  describe('with an atomic-facet', () => {
    before(() => {
      new TestFixture()
        .with(addPopover('atomic-facet', {field: facetField, label}))
        .init();
    });

    testSuites();
  });

  describe('with an atomic-numeric-facet with ranges', () => {
    before(() => {
      new TestFixture()
        .with(
          addPopover('atomic-numeric-facet', {field: numericFacetField, label})
        )
        .init();
    });

    testSuites();
  });

  describe('with an atomic-numeric-facet without ranges', () => {
    before(() => {
      new TestFixture()
        .with(
          addPopover('atomic-numeric-facet', {
            label,
            field: numericFacetField,
            'with-input': 'integer',
            'number-of-values': '0',
          })
        )
        .init();
    });

    testSuites();
  });

  describe('with an atomic-timeframe-facet with ranges', () => {
    before(() => {
      new TestFixture()
        .with(
          addPopover(
            'atomic-timeframe-facet',
            {
              label,
            },
            createTimeframeElements()
          )
        )
        .init();
    });

    testSuites();
  });

  describe('with an atomic-timeframe-facet without ranges', () => {
    before(() => {
      new TestFixture()
        .with(
          addPopover('atomic-timeframe-facet', {
            label,
            'with-date-picker': '',
          })
        )
        .init();
    });

    testSuites();
  });

  describe('with an atomic-color-facet', () => {
    before(() => {
      new TestFixture()
        .with(
          addPopover('atomic-color-facet', {
            label,
            field: colorFacetField,
          })
        )
        .init();
    });

    testSuites();
  });

  describe('with an atomic-category-facet', () => {
    before(() => {
      new TestFixture()
        .with(
          addPopover('atomic-category-facet', {
            label,
            field: hierarchicalField,
          })
        )
        .init();
    });

    testSuites();
  });

  describe('with an atomic-rating-facet', () => {
    before(() => {
      new TestFixture()
        .with(
          addPopover('atomic-rating-facet', {
            label,
            field: ratingFacetField,
          })
        )
        .init();
    });

    testSuites();
  });

  describe('with an atomic-rating-range-facet', () => {
    before(() => {
      new TestFixture()
        .with(
          addPopover('atomic-rating-range-facet', {
            label,
            field: ratingFacetField,
          })
        )
        .init();
    });

    testSuites();
  });
});
