// Toggle
import {SearchEngine} from '../../../app/search-engine/search-engine';
import {
  deselectAllAutomaticFacetValues,
  toggleSelectAutomaticFacetValue,
} from '../../../features/facets/automatic-facet-set/automatic-facet-set-actions';
import {logFacetClearAll} from '../../../features/facets/facet-set/facet-set-analytics-actions';
import {getAnalyticsActionForToggleFacetSelect} from '../../../features/facets/facet-set/facet-set-utils';
import {FacetValue} from '../../../features/facets/facet-set/interfaces/response';
import {executeSearch} from '../../../features/search/search-actions';
import {
  Controller,
  buildController,
} from '../../controller/headless-controller';

/**
 * @beta - This interface is part of the automatic facets feature.
 * Automatic facets are currently in beta testing and should be available soon.
 *
 * A scoped and simplified part of the headless state that is relevant to the `Automatic Facet` controller.
 */
export interface AutomaticFacetState {
  /**
   * The automatic facet field
   */
  field: string;
  /**
   * The automatic facet label
   */
  label: string;
  /**
   * The automatic facet values
   */
  values: FacetValue[];
}
/**
 * @beta - This interface is part of the automatic facets feature.
 * Automatic facets are currently in beta testing and should be available soon.
 *
 * The props for the `AutomaticFacet` controller.
 */
export interface AutomaticFacetProps {
  /**
   * The field whose values you want to display in the facet.
   */
  field: string;
}
/**
 * @beta - This interface is part of the automatic facets feature.
 * Automatic facets are currently in beta testing and should be available soon.
 *
 * The `AutomaticFacet` controller allows you to create a facet component that is to be used
 * with the `FacetManager` controller. ???
 */
export interface AutomaticFacet extends Controller {
  /**
   * Toggles the specified automatic facet value.
   *
   * @param selection - The facet value to toggle.
   */
  toggleSelect(selection: FacetValue): void;
  /**
   * Deselects all automatic facet values.
   * */
  deselectAll(): void;
  /**
   *  The state of the `AutomaticFacet` controller.
   */
  state: AutomaticFacetState;
}
/**
 * @beta - This function is part of the automatic facets feature.
 * Automatic facets are currently in beta testing and should be available soon.
 *
 * Creates a `AutomaticFacet` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `AutomaticFacet` properties.
 * @returns A `AutomaticFacet` controller instance.
 * */
export function buildAutomaticFacet(
  engine: SearchEngine,
  props: AutomaticFacetProps
): AutomaticFacet {
  const {dispatch} = engine;
  const controller = buildController(engine);

  const {field} = props;

  const getFacetResponse = () => engine.state.automaticFacetSet?.facets[field];

  return {
    ...controller,

    toggleSelect(selection: FacetValue) {
      dispatch(toggleSelectAutomaticFacetValue({field, selection}));
      dispatch(
        executeSearch(getAnalyticsActionForToggleFacetSelect(field, selection))
      );
    },

    deselectAll() {
      dispatch(deselectAllAutomaticFacetValues(field));
      dispatch(executeSearch(logFacetClearAll(field)));
    },

    get state() {
      const response = getFacetResponse();
      const field = response ? response.field : '';
      const values = response ? response.values : [];
      const label = response ? response.label : '';

      return {
        field,
        label,
        values,
      };
    },
  };
}
