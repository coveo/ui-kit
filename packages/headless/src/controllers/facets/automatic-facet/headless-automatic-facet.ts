import type {SearchEngine} from '../../../app/search-engine/search-engine.js';
import {
  deselectAllAutomaticFacetValues,
  toggleSelectAutomaticFacetValue,
} from '../../../features/facets/automatic-facet-set/automatic-facet-set-actions.js';
import {
  facetClearAll,
  logFacetClearAll,
} from '../../../features/facets/facet-set/facet-set-analytics-actions.js';
import {
  getAnalyticsActionForToggleFacetSelect,
  getLegacyAnalyticsActionForToggleFacetSelect,
} from '../../../features/facets/facet-set/facet-set-utils.js';
import type {FacetValue} from '../../../features/facets/facet-set/interfaces/response.js';
import {executeSearch} from '../../../features/search/search-actions.js';
import {buildController} from '../../controller/headless-controller.js';
import type {AutomaticFacet} from '../automatic-facet-generator/headless-automatic-facet-generator.js';

/**
 * @internal
 * This prop is used internally by the `AutomaticFacetGenerator` controller.
 */
interface AutomaticFacetProps {
  /**
   * The field from which to display values in the facet.
   */
  field: string;
}

/**
 * @internal
 * This initializer is used internally by the `AutomaticFacetGenerator` controller.
 *
 * **Important:** This initializer is meant for internal use by Headless only. As an implementer, you should never import or use this initializer directly in your code.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `AutomaticFacet` properties used internally.
 * @returns An `AutomaticFacet` controller instance.
 * */
export function buildAutomaticFacet(
  engine: SearchEngine,
  props: AutomaticFacetProps
): AutomaticFacet {
  const {dispatch} = engine;
  const controller = buildController(engine);

  const {field} = props;

  return {
    ...controller,

    toggleSelect(selection: FacetValue) {
      dispatch(toggleSelectAutomaticFacetValue({field, selection}));
      dispatch(
        executeSearch({
          legacy: getLegacyAnalyticsActionForToggleFacetSelect(
            field,
            selection
          ),
          next: getAnalyticsActionForToggleFacetSelect(selection),
        })
      );
    },

    deselectAll() {
      dispatch(deselectAllAutomaticFacetValues(field));
      dispatch(
        executeSearch({
          legacy: logFacetClearAll(field),
          next: facetClearAll(),
        })
      );
    },

    get state() {
      const response = engine.state.automaticFacetSet?.set[field]?.response;

      const defaultState = {field: '', values: [], label: ''};

      return response
        ? {
            field: response.field,
            label: response.label,
            values: response.values,
          }
        : defaultState;
    },
  };
}
