import {TestFixture} from '../../../fixtures/test-fixture';
import {
  assertConsoleError,
  assertContainsComponentError,
} from '../../common-assertions';
import {addAutomaticFacetGenerator} from './automatic-facet-generator-actions';
import {
  assertCollapseAutomaticFacets,
  assertContainsAutomaticFacet,
  assertDisplayNothing,
  assertDisplayPlaceholder,
  automaticFacetGeneratorComponent,
} from './automatic-facet-generator-assertions';

describe('Automatic Facet Generator Test Suites', () => {
  it('should throw an error when desiredCount property is invalid', () => {
    new TestFixture()
      .with(addAutomaticFacetGenerator({'desired-count': 'potato'}))
      .init();
    assertConsoleError();
    assertContainsComponentError(
      {
        shadow: () => cy.get(automaticFacetGeneratorComponent).shadow(),
      },
      true
    );
  });

  it('should display atomic-automatic-facet when desiredCount is valid', () => {
    new TestFixture()
      .with(addAutomaticFacetGenerator({'desired-count': '1'}))
      .init();
    assertContainsAutomaticFacet();
  });

  it('should throw an error when areCollapsed property is invalid', () => {
    new TestFixture()
      .with(addAutomaticFacetGenerator({'are-collapsed': 'potato'}))
      .init();
    assertConsoleError();
    assertContainsComponentError(
      {
        shadow: () => cy.get(automaticFacetGeneratorComponent).shadow(),
      },
      true
    );
  });

  it('should collapse the facets when areCollapsed property is `true`', () => {
    new TestFixture()
      .with(
        addAutomaticFacetGenerator({
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
        addAutomaticFacetGenerator({
          'are-collapsed': 'false',
          'desired-count': '1',
        })
      )
      .init();
    assertCollapseAutomaticFacets(false);
  });

  it('should display placeholders when no search has yet been executed', () => {
    new TestFixture()
      .with(
        addAutomaticFacetGenerator({
          'desired-count': '1',
        })
      )
      .withoutFirstAutomaticSearch()
      .init();
    assertDisplayPlaceholder();
  });

  it('should display nothing when response is empty', () => {
    new TestFixture()
      .with(
        addAutomaticFacetGenerator({
          'desired-count': '1',
        })
      )
      .withoutAutomaticFacets()
      .init();
    assertDisplayNothing();
  });
});
