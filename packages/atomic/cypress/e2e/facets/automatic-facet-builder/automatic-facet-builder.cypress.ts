import {TestFixture} from '../../../fixtures/test-fixture';
import {
  assertConsoleError,
  assertContainsComponentError,
} from '../../common-assertions';
import {addAutomaticFacetBuilder} from './automatic-facet-builder-actions';
import {
  assertCollapseAutomaticFacets,
  assertContainsAutomaticFacet,
  automaticFacetBuilderComponent,
} from './automatic-facet-builder-assertions';

describe('Automatic Facet Builder Test Suites', () => {
  it('should throw an error when desiredCount property is invalid', () => {
    new TestFixture()
      .with(addAutomaticFacetBuilder({'desired-count': 'potato'}))
      .init();
    assertConsoleError();
    assertContainsComponentError(
      {
        shadow: () => cy.get(automaticFacetBuilderComponent).shadow(),
      },
      true
    );
  });

  it('should display atomic-automatic-facet when desiredCount is valid', () => {
    new TestFixture()
      .with(addAutomaticFacetBuilder({'desired-count': '1'}))
      .init();
    assertContainsAutomaticFacet();
  });

  it('should throw an error when areCollapsed property is invalid', () => {
    new TestFixture()
      .with(addAutomaticFacetBuilder({'are-collapsed': 'potato'}))
      .init();
    assertConsoleError();
    assertContainsComponentError(
      {
        shadow: () => cy.get(automaticFacetBuilderComponent).shadow(),
      },
      true
    );
  });

  it('should collapse the facets when areCollapsed property is `true`', () => {
    new TestFixture()
      .with(
        addAutomaticFacetBuilder({
          'are-collapsed': 'true',
          'desired-count': '1',
        })
      )
      .init();
    assertCollapseAutomaticFacets(true);
  });

  it('should not collapse the facets when areCollapsed property is `false`', () => {
    new TestFixture()
      .with(
        addAutomaticFacetBuilder({
          'are-collapsed': 'false',
          'desired-count': '1',
        })
      )
      .init();
    assertCollapseAutomaticFacets(false);
  });
});
