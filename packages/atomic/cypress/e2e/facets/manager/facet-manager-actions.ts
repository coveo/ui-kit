import {
  generateComponentHTML,
  TagProps,
  TestFixture,
} from '../../../fixtures/test-fixture';

const hierarchicalField = 'geographicalhierarchy';
const categoryFacetComponent = 'atomic-category-facet';
import {colorFacetField} from '../color-facet/color-facet-actions';
import {colorFacetComponent} from '../color-facet/color-facet-selectors';
import {field as facetField} from '../facet/facet-actions';
import {facetComponent} from '../facet/facet-selectors';
import {numericFacetField} from '../numeric-facet/numeric-facet-actions';
import {numericFacetComponent} from '../numeric-facet/numeric-facet-selectors';
import {createTimeframeElements} from '../timeframe-facet/timeframe-facet-action';
import {timeframeFacetComponent} from '../timeframe-facet/timeframe-facet-selectors';

export const facetManagerComponent = 'atomic-facet-manager';

export const addFacetManagerWithStaticFacets =
  (props: TagProps = {}) =>
  (env: TestFixture) => {
    const manager = generateComponentHTML(facetManagerComponent, props);

    manager.append(generateComponentHTML(facetComponent, {field: facetField}));
    manager.append(
      generateComponentHTML(numericFacetComponent, {field: numericFacetField})
    );
    manager.append(
      generateComponentHTML(categoryFacetComponent, {field: hierarchicalField})
    );
    manager.append(
      generateComponentHTML(colorFacetComponent, {
        field: colorFacetField,
      })
    );

    const timeframeFacet = generateComponentHTML(timeframeFacetComponent);
    timeframeFacet.append(...createTimeframeElements());
    manager.append(timeframeFacet);

    env.withElement(manager);
  };
