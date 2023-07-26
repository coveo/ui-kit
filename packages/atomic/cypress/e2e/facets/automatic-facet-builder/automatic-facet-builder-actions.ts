import {
  TagProps,
  generateComponentHTML,
} from '../../../fixtures/fixture-common';
import {TestFixture} from '../../../fixtures/test-fixture';
import {automaticFacetBuilderComponent} from './automatic-facet-builder-assertions';

export const addAutomaticFacetBuilder =
  (props: TagProps = {}) =>
  (env: TestFixture) => {
    const automaticFacetBuilder = generateComponentHTML(
      automaticFacetBuilderComponent,
      props
    );

    env.withElement(automaticFacetBuilder);
  };
