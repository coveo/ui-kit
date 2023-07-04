// Toggle
import {SearchEngine} from '../../../app/search-engine/search-engine';
import {
  deselectAllAutomaticFacetValues,
  toggleSelectAutomaticFacetValue,
} from '../../../features/facets/automatic-facet-set/automatic-facet-set-actions';
import {automaticFacetSelector} from '../../../features/facets/automatic-facet-set/automatic-facet-set-selectors';
import {logFacetClearAll} from '../../../features/facets/facet-set/facet-set-analytics-actions';
import {getAnalyticsActionForToggleFacetSelect} from '../../../features/facets/facet-set/facet-set-utils';
import {FacetValue} from '../../../features/facets/facet-set/interfaces/response';
import {executeSearch} from '../../../features/search/search-actions';
import {
  Controller,
  buildController,
} from '../../controller/headless-controller';

export interface AutomaticFacetState {
  field: string;
  label: string;
  values: FacetValue[];
}
export interface AutomaticFacetProps {
  field: string;
}
export interface AutomaticFacet extends Controller {
  /**
   * Toggles the specified facet value.
   *
   * @param selection - The facet value to toggle.
   */
  toggleSelect(selection: FacetValue): void;
  /**
   * Toggles the specified facet value, deselecting others.
   *
   * @param selection - The facet value to toggle.
   */
  toggleSingleSelect(selection: FacetValue): void;
  /**
   * Deselects all facet values.
   * */
  deselectAll(): void;
  /**
   *  TODO
   */
  state: AutomaticFacetState;
}
/**
 * Creates a `Facet` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `Facet` properties.
 * @returns A `Facet` controller instance.
 * */
export function buildAutomaticFacet(
  engine: SearchEngine,
  props: AutomaticFacetProps
): AutomaticFacet {
  const {dispatch} = engine;
  const controller = buildController(engine);

  const {field} = props;

  const getFacetResponse = () =>
    automaticFacetSelector(engine.state.automaticFacetSet, field);

  return {
    ...controller,

    toggleSelect(selection: FacetValue) {
      dispatch(toggleSelectAutomaticFacetValue({field, selection}));
      dispatch(
        executeSearch(getAnalyticsActionForToggleFacetSelect(field, selection))
      );
    },

    toggleSingleSelect(selection: FacetValue) {
      if (selection.state === 'idle') {
        dispatch(deselectAllAutomaticFacetValues(field));
      }
      this.toggleSelect(selection);
    },

    deselectAll() {
      dispatch(deselectAllAutomaticFacetValues(field));
      dispatch(executeSearch(logFacetClearAll(field)));
    },

    get state() {
      const response = getFacetResponse();
      const field = response ? response.field : '';
      const values = response ? response.values : [];
      const label = response ? response.label ?? 'No Label' : '';

      return {
        field,
        label,
        values,
      };
    },
  };
}
