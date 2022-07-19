import {TestFixture} from '../fixtures/test-fixture';
import * as CommonAssertions from './common-assertions';
import {
  addScrollable,
  clickArrow,
  scroll,
} from './segmented-facet-scrollable-actions';
import * as ScrollableAssertions from './segmented-facet-scrollable-assertions';

describe('Segmented Facet Scrollable Test Suites', () => {
  function setupScrollable() {
    //setup component with segmented facets
    new TestFixture()
      .with(addScrollable({field: 'author', 'number-of-values': 5}))
      .init();
  }
  describe('verify rendering', () => {
    before(setupScrollable);
    ScrollableAssertions.assertDisplayScrollable(true);
  });
  describe('with overflowing segmented facets', () => {
    function setupWithOverflowFacets() {
      new TestFixture()
        .with(addScrollable({field: 'author', 'number-of-values': 50}))
        .init();
    }

    describe('verify rendering', () => {
      before(setupWithOverflowFacets);
      ScrollableAssertions.assertDisplayScrollable(true);
      ScrollableAssertions.assertDisplayArrows(false, true);
    });

    describe('with right click', () => {
      function setupClickArrowScrollable() {
        setupWithOverflowFacets();
        clickArrow('right');
      }
      before(setupClickArrowScrollable);
      ScrollableAssertions.assertDisplayArrows(true, true);
    });

    describe('with right scroll', () => {
      function setupScrollScrollable() {
        setupWithOverflowFacets();
        scroll('right', 2000);
      }
      before(setupScrollScrollable);
      ScrollableAssertions.assertDisplayArrows(true, true);
    });

    describe.skip('with right scroll using keyboard', () => {
      ScrollableAssertions.assertDisplayArrows(true, true);
    });

    describe.skip('with screen size increase', () => {
      before(setupWithOverflowFacets);
      //cy.viewport(3840, 2160);
      ScrollableAssertions.assertDisplayScrollable(true);
      ScrollableAssertions.assertDisplayArrows(false, false);
    });
  });
  describe('without overflowing segmented facets', () => {
    function setupWithoutOverflowFacets() {
      new TestFixture()
        .with(addScrollable({field: 'author', 'number-of-values': 4}))
        .init();
    }

    describe('verify rendering', () => {
      before(setupWithoutOverflowFacets);
      ScrollableAssertions.assertDisplayScrollable(true);
      ScrollableAssertions.assertDisplayArrows(false, false);
    });

    describe.skip('with screen size decrease', () => {
      ScrollableAssertions.assertDisplayScrollable(true);
      ScrollableAssertions.assertDisplayArrows(true, true);
    });
  });

  describe('with invalid segmented facets', () => {
    function setupWithInvalidFacets() {
      new TestFixture()
        .with(addScrollable({field: 'invalidd', 'number-of-values': 4}))
        .init();
    }
    before(setupWithInvalidFacets);
    ScrollableAssertions.assertDisplayScrollable(false);
  });

  describe.skip('with invalid search', () => {
    function setupWithInvalidSearch() {
      //setup component with segmented facets
    }
    ScrollableAssertions.assertDisplayScrollable(false);
  });
});
