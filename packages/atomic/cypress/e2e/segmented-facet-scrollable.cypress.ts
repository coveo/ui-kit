import {TestFixture} from '../fixtures/test-fixture';
import {addScrollable, clickArrow} from './segmented-facet-scrollable-actions';
import * as ScrollableAssertions from './segmented-facet-scrollable-assertions';

describe('Segmented Facet Scrollable Test Suites', () => {
  function setupScrollable() {
    new TestFixture()
      .with(addScrollable({field: 'author', 'number-of-values': 5}))
      .init();
  }
  describe('verify rendering', () => {
    beforeEach(setupScrollable);
    ScrollableAssertions.assertDisplayScrollable(true);
  });
  describe('with overflowing segmented facets', () => {
    function setupWithOverflowFacets() {
      new TestFixture()
        .with(addScrollable({field: 'author', 'number-of-values': 50}))
        .init();
    }

    describe('verify rendering', () => {
      beforeEach(setupWithOverflowFacets);
      ScrollableAssertions.assertDisplayScrollable(true);
      ScrollableAssertions.assertDisplayArrows(false, true);
    });

    describe('with right click', () => {
      function setupClickArrowScrollable() {
        setupWithOverflowFacets();
        clickArrow('right');
      }
      beforeEach(setupClickArrowScrollable);
      ScrollableAssertions.assertDisplayArrows(true, true);
    });

    describe(
      'with screen size increase',
      {
        viewportHeight: 4320,
        viewportWidth: 7680,
      },
      () => {
        beforeEach(() => {
          setupWithOverflowFacets();
        });
        ScrollableAssertions.assertDisplayScrollable(true);
        ScrollableAssertions.assertDisplayArrows(false, false);
      }
    );
  });
  describe('without overflowing segmented facets', () => {
    function setupWithoutOverflowFacets() {
      new TestFixture()
        .with(addScrollable({field: 'author', 'number-of-values': 4}))
        .init();
    }

    describe('verify rendering', () => {
      beforeEach(setupWithoutOverflowFacets);
      ScrollableAssertions.assertDisplayScrollable(true);
      ScrollableAssertions.assertDisplayArrows(false, false);
    });

    describe(
      'with screen size decrease',
      {
        viewportHeight: 320,
        viewportWidth: 400,
      },
      () => {
        beforeEach(() => {
          setupWithoutOverflowFacets();
        });
        ScrollableAssertions.assertDisplayScrollable(true);
        ScrollableAssertions.assertDisplayArrows(false, true);
      }
    );
  });

  describe('with invalid segmented facets', () => {
    function setupWithInvalidFacets() {
      new TestFixture()
        .with(addScrollable({field: 'invalidField', 'number-of-values': 4}))
        .init();
    }
    beforeEach(setupWithInvalidFacets);
    ScrollableAssertions.assertDisplayScrollable(false);
  });

  describe('when no search has yet been executed', () => {
    beforeEach(() => {
      new TestFixture()
        .with(addScrollable({field: 'author', 'number-of-values': 5}))
        .withoutFirstAutomaticSearch()
        .init();
    });
    ScrollableAssertions.assertDisplayScrollable(true);
  });
});
