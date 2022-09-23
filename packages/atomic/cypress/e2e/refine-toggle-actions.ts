import {
  generateComponentHTML,
  TagProps,
  TestFixture,
} from '../fixtures/test-fixture';
import {facetComponent} from './facets/facet/facet-selectors';
import {field as facetField} from './facets/facet/facet-actions';
import {numericFacetField} from './facets/numeric-facet/numeric-facet-actions';
import {hierarchicalField} from './facets/category-facet/category-facet-actions';
import {numericFacetComponent} from './facets/numeric-facet/numeric-facet-selectors';
import {categoryFacetComponent} from './facets/category-facet/category-facet-selectors';
import {ratingFacetComponent} from './facets/rating-facet/rating-facet-selectors';
import {ratingFacetField} from './facets/rating-facet/rating-facet-actions';
import {ratingRangeFacetField} from './facets/rating-range-facet/rating-range-facet-actions';
import {ratingRangeFacetComponent} from './facets/rating-range-facet/rating-range-facet-selectors';
import {colorFacetComponent} from './facets/color-facet/color-facet-selectors';
import {colorFacetField} from './facets/color-facet/color-facet-actions';
import {timeframeFacetComponent} from './facets/timeframe-facet/timeframe-facet-selectors';
import {createTimeframeElements} from './facets/timeframe-facet/timeframe-facet-action';
import {facetManagerComponent} from './facets/manager/facet-manager-actions';
import {refineToggleComponent} from './refine-toggle-selectors';

export const addRefineToggle =
  (props: TagProps = {}) =>
  (env: TestFixture) => {
    const manager = generateComponentHTML(facetManagerComponent);
    const refineToggle = generateComponentHTML(refineToggleComponent, props);

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

    env.withElement(manager).withElement(refineToggle);
  };

export const addRefineToggleRangeVariations =
  (props: TagProps = {}) =>
  (env: TestFixture) => {
    const manager = generateComponentHTML(facetManagerComponent);
    const refineToggle = generateComponentHTML(refineToggleComponent, props);

    // Timeframe variations
    const timeframeFacetRanges = generateComponentHTML(
      timeframeFacetComponent,
      {}
    );
    timeframeFacetRanges.append(...createTimeframeElements());

    const timeframeFacetRangesWithDatePicker = generateComponentHTML(
      timeframeFacetComponent,
      {'with-date-picker': 'true'}
    );
    timeframeFacetRangesWithDatePicker.append(...createTimeframeElements());

    const timeframeFacetDatePickerOnly = generateComponentHTML(
      timeframeFacetComponent,
      {'with-date-picker': 'true'}
    );

    manager.append(timeframeFacetRanges);
    manager.append(timeframeFacetRangesWithDatePicker);
    manager.append(timeframeFacetDatePickerOnly);

    // Numeric variations
    const baseNumericOptions = {
      field: numericFacetField,
    };

    const numericFacetRangesOnly = generateComponentHTML(
      numericFacetComponent,
      baseNumericOptions
    );

    const numericFacetRangesWithInput = generateComponentHTML(
      numericFacetComponent,
      {...baseNumericOptions, 'with-input': 'integer'}
    );

    const numericFacetInputOnly = generateComponentHTML(numericFacetComponent, {
      ...baseNumericOptions,
      'with-input': 'integer',
      'number-of-values': '0',
    });

    manager.append(numericFacetRangesOnly);
    manager.append(numericFacetRangesWithInput);
    manager.append(numericFacetInputOnly);

    env.withElement(manager).withElement(refineToggle);
  };
