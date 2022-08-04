import {TestFixture} from '../../../fixtures/test-fixture';
import {addPopover, clickPopoverButton} from './popover-actions';
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

    describe('with click', () => {
      function setupClickPopover() {
        setupPopover();
        clickPopoverButton();
      }
      before(setupClickPopover);
      CommonAssertions.assertContainsComponentError(PopoverSelectors, false);
      PopoverAssertions.assertDisplayPopover(true);
      PopoverAssertions.assertDisplaySlotWrapper(true);
    });
  });
  describe('with two facet children', () => {});
  describe('with zero facet children', () => {});
  describe('with invalid facet child', () => {});
});
