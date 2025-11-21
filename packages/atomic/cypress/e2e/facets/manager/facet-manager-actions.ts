import {
  generateComponentHTML,
  TagProps,
  TestFixture,
} from '../../../fixtures/test-fixture';
import {hierarchicalField} from '../category-facet/category-facet-actions';
import {categoryFacetComponent} from '../category-facet/category-facet-selectors';
import {colorFacetField} from '../color-facet/color-facet-actions';
import {colorFacetComponent} from '../color-facet/color-facet-selectors';
import {field as facetField} from '../facet/facet-actions';
import {facetComponent} from '../facet/facet-selectors';
import {numericFacetField} from '../numeric-facet/numeric-facet-actions';
import {numericFacetComponent} from '../numeric-facet/numeric-facet-selectors';
import {ratingFacetField} from '../rating-facet/rating-facet-actions';
import {ratingFacetComponent} from '../rating-facet/rating-facet-selectors';
import {ratingRangeFacetField} from '../rating-range-facet/rating-range-facet-actions';
import {ratingRangeFacetComponent} from '../rating-range-facet/rating-range-facet-selectors';
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
      generateComponentHTML(ratingFacetComponent, {field: ratingFacetField})
    );
    manager.append(
      generateComponentHTML(ratingRangeFacetComponent, {
        field: ratingRangeFacetField,
      })
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
