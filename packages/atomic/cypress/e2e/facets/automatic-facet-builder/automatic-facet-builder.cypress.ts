import {TestFixture} from '../../../fixtures/test-fixture';
import {
  assertConsoleError,
  assertContainsComponentError,
} from '../../common-assertions';
import {addAutomaticFacetBuilder} from './automatic-facet-builder-actions';
import {
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
});
