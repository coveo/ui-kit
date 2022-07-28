import {TestFixture} from '../fixtures/test-fixture';
import {segmentedFacetComponent} from './facets/segmented-facet/segmented-facet-selectors';
import {
  addScrollable,
  clickArrow,
  scroll,
} from './segmented-facet-scrollable-actions';
import * as ScrollableAssertions from './segmented-facet-scrollable-assertions';
import {scrollableComponent} from './segmented-facet-scrollable-selectors';

describe('Segmented Facet Scrollable Test Suites', () => {
  function setupScrollable() {
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
      function setupKeyboardScrollable() {
        setupWithOverflowFacets();
        cy.get(scrollableComponent).click('center');
        cy.get(segmentedFacetComponent)
          .shadow()
          .find('[part="value-box"][aria-pressed="true"]')
          .type('{rightarrow}');
      }
      before(setupKeyboardScrollable);
      ScrollableAssertions.assertDisplayArrows(true, true);
    });

    describe('with screen size increase', () => {
      before(() => {
        setupWithOverflowFacets();
        cy.viewport(7680, 4320);
      });
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

    describe('with screen size decrease', () => {
      before(() => {
        setupWithoutOverflowFacets();
        cy.viewport(320, 480);
      });

      ScrollableAssertions.assertDisplayScrollable(true);
      ScrollableAssertions.assertDisplayArrows(false, true);
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

  describe('when no search has yet been executed', () => {
    before(() => {
      new TestFixture()
        .with(addScrollable({field: 'author', 'number-of-values': 5}))
        .withoutFirstAutomaticSearch()
        .init();
    });
    ScrollableAssertions.assertDisplayScrollable(true);
  });
});
