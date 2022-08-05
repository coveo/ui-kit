import {TestFixture} from '../../../fixtures/test-fixture';
import {
  addPopover,
  addPopoverNoFacets,
  addPopoverTwoFacets,
  clickFacetValue,
  clickPopoverButton,
} from './popover-actions';
import {popoverComponent, PopoverSelectors} from './popover-selector';
import * as CommonAssertions from '../../common-assertions';
import * as PopoverAssertions from './popover-assertions';

describe('Popover Test Suites', () => {
  describe('with one facet child', () => {
    function setupPopover() {
      new TestFixture()
        .with(addPopover({field: 'author', 'number-of-values': 5}))
        .init();
    }
    describe('verify rendering', () => {
      before(setupPopover);
      CommonAssertions.assertAccessibility(popoverComponent);
      CommonAssertions.assertContainsComponentError(PopoverSelectors, false);
      PopoverAssertions.assertDisplayPopover(true);
      PopoverAssertions.assertDisplaySlotWrapper(false);
    });

    describe('with button click', () => {
      function setupClickPopover() {
        setupPopover();
        clickPopoverButton();
      }
      before(setupClickPopover);
      CommonAssertions.assertContainsComponentError(PopoverSelectors, false);
      PopoverAssertions.assertDisplayPopover(true);
      PopoverAssertions.assertDisplaySlotWrapper(true);
      PopoverAssertions.assertNumberOfSelectedValues('0');
    });

    describe('with value click', () => {
      function setupClickPopover() {
        setupPopover();
        clickPopoverButton();
        clickFacetValue('Lily C');
      }
      before(setupClickPopover);
      CommonAssertions.assertContainsComponentError(PopoverSelectors, false);
      PopoverAssertions.assertDisplayPopover(true);
      PopoverAssertions.assertDisplaySlotWrapper(true);
      PopoverAssertions.assertNumberOfSelectedValues('1');
    });
  });
  describe('with two facet children', () => {
    function setupPopoverTwoFacets() {
      new TestFixture()
        .with(
          addPopoverTwoFacets(
            {field: 'author', 'number-of-values': 5},
            {field: 'language', 'number-of-values': 5}
          )
        )
        .init();
    }
    describe('verify rendering', () => {
      before(setupPopoverTwoFacets);
      CommonAssertions.assertContainsComponentError(PopoverSelectors, true);
      PopoverAssertions.assertDisplayPopover(false);
    });
  });
  describe('with zero facet children', () => {
    function setupPopoverNoFacet() {
      new TestFixture().with(addPopoverNoFacets()).init();
    }
    describe('verify rendering', () => {
      before(setupPopoverNoFacet);
      CommonAssertions.assertContainsComponentError(PopoverSelectors, true);
      PopoverAssertions.assertDisplayPopover(false);
    });
  });
  describe('with invalid facet child', () => {
    function setupPopoverInvalidFacet() {
      new TestFixture()
        .with(addPopover({field: 'invalidd', 'number-of-values': 5}))
        .init();
    }
    describe('verify rendering', () => {
      before(setupPopoverInvalidFacet);
      CommonAssertions.assertContainsComponentError(PopoverSelectors, false);
      PopoverAssertions.assertDisplayPopover(false);
    });
  });
});
