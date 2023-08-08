import {
  TagProps,
  generateComponentHTML,
} from '../../../fixtures/fixture-common';
import {TestFixture} from '../../../fixtures/test-fixture';
import {automaticFacetGeneratorComponent} from './automatic-facet-generator-assertions';

export const addAutomaticFacetGenerator =
  (props: TagProps = {}) =>
  (env: TestFixture) => {
    const automaticFacetGenerator = generateComponentHTML(
      automaticFacetGeneratorComponent,
      props
    );

    env.withElement(automaticFacetGenerator);
  };
