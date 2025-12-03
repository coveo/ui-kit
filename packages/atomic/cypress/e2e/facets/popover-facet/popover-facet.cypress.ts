import {TestFixture} from '../../../fixtures/test-fixture';
import {hierarchicalField} from '../category-facet/category-facet-actions';
import {colorFacetField} from '../color-facet/color-facet-actions';
import {field as facetField} from '../facet/facet-actions';
import {numericFacetField} from '../numeric-facet/numeric-facet-actions';
import {createTimeframeElements} from '../timeframe-facet/timeframe-facet-action';
import {addPopover, label} from './popover-facet-actions';
import * as PopoverAssertions from './popover-facet-assertions';
import {PopoverSelectors} from './popover-facet-selectors';

describe('Popover Facet Test Suites', () => {
  function testSuites() {
    beforeEach(() => {
      PopoverAssertions.assertLabelContains(label);
      PopoverAssertions.assertFacetIsHidden();
      PopoverSelectors.popoverButton().click();
    });

    describe('when clicking the facet button', () => {
      PopoverAssertions.assertFacetIsVisible();
    });

    describe('when clicking the facet button a second time', () => {
      beforeEach(() => {
        PopoverSelectors.popoverButton().click();
      });

      PopoverAssertions.assertFacetIsHidden();
    });

    describe('when clicking outside the facet after opening it', () => {
      beforeEach(() => {
        PopoverSelectors.backdrop().click();
      });

      PopoverAssertions.assertFacetIsHidden();
    });

    describe('when clicking inside the facet after opening it', () => {
      beforeEach(() => {
        PopoverSelectors.facet().click({force: true});
      });

      PopoverAssertions.assertFacetIsVisible();
    });
  }

  describe('with an atomic-facet', () => {
    beforeEach(() => {
      new TestFixture()
        .with(addPopover('atomic-facet', {field: facetField, label}))
        .init();
    });

    testSuites();
  });

  describe('with an atomic-numeric-facet with ranges', () => {
    beforeEach(() => {
      new TestFixture()
        .with(
          addPopover('atomic-numeric-facet', {field: numericFacetField, label})
        )
        .init();
    });

    testSuites();
  });

  describe('with an atomic-numeric-facet without ranges', () => {
    beforeEach(() => {
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
    beforeEach(() => {
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
    beforeEach(() => {
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
    beforeEach(() => {
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
    beforeEach(() => {
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
});
