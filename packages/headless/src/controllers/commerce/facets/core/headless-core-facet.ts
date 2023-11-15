import {Schema} from '@coveo/bueno';
import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {
  commerceFacetResponseSelector,
  isCommerceFacetLoadingResponseSelector,
} from '../../../../features/commerce/facets/facet-set/facet-set-selector';
import {commerceFacetSetReducer as commerceFacetSet} from '../../../../features/commerce/facets/facet-set/facet-set-slice';
import {FacetValueState} from '../../../../features/facets/facet-api/value';
import {
  deselectAllFacetValues,
  toggleExcludeFacetValue,
  toggleSelectFacetValue,
  updateFacetIsFieldExpanded,
  updateFacetNumberOfValues,
} from '../../../../features/facets/facet-set/facet-set-actions';
import {
  isFacetValueExcluded,
  isFacetValueSelected,
} from '../../../../features/facets/facet-set/facet-set-utils';
import {CommerceFacetSetSection} from '../../../../state/state-sections';
import {loadReducerError} from '../../../../utils/errors';
import {
  requiredNonEmptyString,
  validateOptions,
} from '../../../../utils/validate-payload';
import {buildController} from '../../../controller/headless-controller';
import {
  CoreFacet as HeadlessCoreFacet,
  CoreFacetState,
  FacetValue,
} from '../../../core/facets/facet/headless-core-facet';

export type {FacetValue, FacetValueState};

/**
 * @internal
 * This prop is used internally by the `FacetGenerator` controller.
 */
export interface FacetProps {
  options: FacetOptions;
}

export interface FacetOptions {
  /**
   * A unique identifier for the controller.
   * */
  facetId: string;
}

/**
 * The `Facet` headless controller offers a high-level interface for designing a common facet UI controller.
 */
export type CoreFacet = Omit<
  HeadlessCoreFacet,
  'sortBy' | 'isSortedBy' | 'enable' | 'disable' | 'state'
> & {
  /**
   * The state of the `CommerceCoreFacet` controller.
   * */
  state: FacetState;
};

/**
 * A scoped and simplified part of the headless state that is relevant to the `CommerceCoreFacet` controller.
 */
export type FacetState = Omit<CoreFacetState, 'enabled' | 'sortCriterion'> & {
  /** The facet field. */
  field: string;
  /** The facet display name. */
  displayName?: string;
};

export type FacetBuilder = typeof buildCoreFacet;

export function buildCoreFacet(
  engine: CommerceEngine,
  props: FacetProps
): CoreFacet {
  if (!loadFacetReducers(engine)) {
    throw loadReducerError;
  }

  const {dispatch} = engine;
  const controller = buildController(engine);

  validateOptions(
    engine,
    new Schema<Required<FacetOptions>>({
      facetId: requiredNonEmptyString,
    }),
    props.options,
    'buildCoreFacet'
  );

  const facetId = props.options.facetId;

  const getRequest = () => engine.state.commerceFacetSet[facetId].request;
  const getResponse = () =>
    commerceFacetResponseSelector(engine.state, facetId)!;
  const getIsLoading = () =>
    isCommerceFacetLoadingResponseSelector(engine.state);

  const getNumberOfActiveValues = () => {
    return getRequest().values.filter((v) => v.state !== 'idle').length;
  };

  const computeCanShowLessValues = () => {
    const response = getResponse();
    const request = getRequest();
    const initialNumberOfValues = response.values.length;
    const hasIdleValues = !!request.values.find((v) => v.state === 'idle');

    return initialNumberOfValues < request.numberOfValues && hasIdleValues;
  };

  return {
    ...controller,

    toggleSelect: (selection: FacetValue) =>
      dispatch(toggleSelectFacetValue({facetId, selection})),

    toggleExclude: (selection: FacetValue) =>
      dispatch(toggleExcludeFacetValue({facetId, selection})),

    // Must use a function here to properly support inheritance with `this`.
    toggleSingleSelect: function (selection: FacetValue) {
      if (selection.state === 'idle') {
        dispatch(deselectAllFacetValues(facetId));
      }

      this.toggleSelect(selection);
    },

    // Must use a function here to properly support inheritance with `this`.
    toggleSingleExclude: function (selection: FacetValue) {
      if (selection.state === 'idle') {
        dispatch(deselectAllFacetValues(facetId));
      }

      this.toggleExclude(selection);
    },

    isValueSelected: isFacetValueSelected,

    isValueExcluded: isFacetValueExcluded,

    deselectAll() {
      dispatch(deselectAllFacetValues(facetId));
    },

    showMoreValues() {
      const numberInState = getRequest().numberOfValues;
      const initialNumberOfValues = getResponse().values.length;
      const numberToNextMultipleOfConfigured =
        initialNumberOfValues - (numberInState % initialNumberOfValues);
      const numberOfValues = numberInState + numberToNextMultipleOfConfigured;

      dispatch(updateFacetNumberOfValues({facetId, numberOfValues}));
      dispatch(updateFacetIsFieldExpanded({facetId, isFieldExpanded: true}));
    },

    showLessValues() {
      const initialNumberOfValues = getResponse().values.length;
      const newNumberOfValues = Math.max(
        initialNumberOfValues,
        getNumberOfActiveValues()
      );

      dispatch(
        updateFacetNumberOfValues({facetId, numberOfValues: newNumberOfValues})
      );
      dispatch(updateFacetIsFieldExpanded({facetId, isFieldExpanded: false}));
    },

    get state() {
      const response = getResponse();

      const values = response ? response.values : [];
      const hasActiveValues = values.some(
        (facetValue) => facetValue.state !== 'idle'
      );
      const canShowMoreValues = response ? response.moreValuesAvailable : false;

      return {
        facetId,
        field: response.field,
        displayName: response.displayName,
        values,
        isLoading: getIsLoading() ?? false,
        hasActiveValues,
        canShowMoreValues,
        canShowLessValues: computeCanShowLessValues(),
      };
    },
  };
}

function loadFacetReducers(
  engine: CommerceEngine
): engine is CommerceEngine<CommerceFacetSetSection> {
  engine.addReducers({commerceFacetSet});
  return true;
}
