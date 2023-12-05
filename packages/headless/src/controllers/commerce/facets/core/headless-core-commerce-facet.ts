import {
  ActionCreatorWithPreparedPayload,
  AsyncThunkAction,
} from '@reduxjs/toolkit';
import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {
  commerceFacetResponseSelector,
  isCommerceFacetLoadingResponseSelector,
} from '../../../../features/commerce/facets/facet-set/facet-set-selector';
import {commerceFacetSetReducer as commerceFacetSet} from '../../../../features/commerce/facets/facet-set/facet-set-slice';
import {AnyFacetValueResponse} from '../../../../features/commerce/facets/facet-set/interfaces/response';
import {
  deselectAllFacetValues,
  updateFacetIsFieldExpanded,
  updateFacetNumberOfValues,
} from '../../../../features/facets/facet-set/facet-set-actions';
import {AnyFacetValueRequest} from '../../../../features/facets/generic/interfaces/generic-facet-request';
import {CommerceFacetSetSection} from '../../../../state/state-sections';
import {loadReducerError} from '../../../../utils/errors';
import {buildController} from '../../../controller/headless-controller';
import {
  CoreFacet as HeadlessCoreFacet,
  CoreFacetState,
} from '../../../core/facets/facet/headless-core-facet';

interface AnyToggleFacetValueActionCreatorPayload {
  selection: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  facetId: string;
}

/**
 * @internal
 *
 * The configurable `CoreCommerceFacet` properties used internally.
 */
export interface CoreCommerceFacetProps {
  options: CoreCommerceFacetOptions;
}

export interface CoreCommerceFacetOptions {
  facetId: string;
  toggleSelectActionCreator: ActionCreatorWithPreparedPayload<
    [payload: AnyToggleFacetValueActionCreatorPayload],
    any, // eslint-disable-line @typescript-eslint/no-explicit-any
    string,
    never,
    never
  >;
  toggleExcludeActionCreator: ActionCreatorWithPreparedPayload<
    [payload: AnyToggleFacetValueActionCreatorPayload],
    any, // eslint-disable-line @typescript-eslint/no-explicit-any
    string,
    never,
    never
  >;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fetchResultsActionCreator: () => AsyncThunkAction<unknown, void, any>;
}

export type CoreCommerceFacet<
  T1 extends AnyFacetValueRequest,
  T2 extends AnyFacetValueResponse,
> = Pick<
  HeadlessCoreFacet,
  'deselectAll' | 'showLessValues' | 'showMoreValues' | 'subscribe'
> & {
  /**
   * Toggles selection of the specified facet value.
   *
   * @param selection - The facet value to select.
   */
  toggleSelect(selection: T1): void;
  /**
   * Toggles exclusion of the specified facet value.
   *
   * @param selection - The facet value to exclude.
   */
  toggleExclude(selection: T1): void;
  /**
   * Toggles selection of the specified facet value, deselecting all others.
   *
   * @param selection - The facet value to single select.
   */
  toggleSingleSelect(selection: T1): void;
  /**
   * Toggles exclusion of the specified facet value, deselecting all others.
   *
   * @param selection - The facet value to single exclude.
   */
  toggleSingleExclude(selection: T1): void;
  /**
   * Whether the specified facet value is selected.
   *
   * @param value - The facet value to evaluate.
   */
  isValueSelected(value: T1): boolean;
  /**
   * Whether the specified facet value is excluded.
   *
   * @param value - The facet value to evaluate.
   */
  isValueExcluded(value: T1): boolean;
  /**
   * The state of this commerce facet controller instance.
   */
  state: CoreCommerceFacetState<T2>;
};

/**
 * A scoped and simplified part of the headless state that is relevant to the `CoreCommerceFacet` controller.
 */
export type CoreCommerceFacetState<T extends AnyFacetValueResponse> = Omit<
  CoreFacetState,
  'enabled' | 'sortCriterion' | 'values'
> & {
  /**
   * The facet field.
   */
  field: string;
  /**
   * The facet display name.
   */
  displayName?: string;
  /**
   * The facet values
   */
  values: T[];
};

export type CoreCommerceFacetBuilder = typeof buildCoreCommerceFacet;

export function buildCoreCommerceFacet<
  T1 extends AnyFacetValueRequest,
  T2 extends AnyFacetValueResponse,
>(
  engine: CommerceEngine,
  props: CoreCommerceFacetProps
): CoreCommerceFacet<T1, T2> {
  if (!loadCommerceFacetReducers(engine)) {
    throw loadReducerError;
  }

  const {dispatch} = engine;
  const controller = buildController(engine);

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
    const request = getRequest();
    const initialNumberOfValues = request.initialNumberOfValues;
    const hasIdleValues = !!request.values.find((v) => v.state === 'idle');

    return initialNumberOfValues < request.numberOfValues && hasIdleValues;
  };

  return {
    ...controller,

    toggleSelect: (selection: T1) => {
      dispatch(props.options.toggleSelectActionCreator({selection, facetId}));
      dispatch(props.options.fetchResultsActionCreator());
      // TODO: analytics
    },

    toggleExclude: (selection: T1) => {
      dispatch(props.options.toggleExcludeActionCreator({selection, facetId}));
      dispatch(props.options.fetchResultsActionCreator());
      // TODO: analytics
    },

    // Must use a function here to properly support inheritance with `this`.
    toggleSingleSelect: function (selection: T1) {
      if (selection.state === 'idle') {
        dispatch(deselectAllFacetValues(facetId));
      }

      this.toggleSelect(selection);
    },

    // Must use a function here to properly support inheritance with `this`.
    toggleSingleExclude: function (selection: T1) {
      if (selection.state === 'idle') {
        dispatch(deselectAllFacetValues(facetId));
      }

      this.toggleExclude(selection);
    },

    isValueSelected: (value: T1) => {
      return value.state === 'selected';
    },

    isValueExcluded: (value: T1) => {
      return value.state === 'excluded';
    },

    deselectAll() {
      dispatch(deselectAllFacetValues(facetId));
      dispatch(props.options.fetchResultsActionCreator());
    },

    showMoreValues() {
      const numberInState = getRequest().numberOfValues;
      const initialNumberOfValues = getRequest().initialNumberOfValues;
      const numberToNextMultipleOfConfigured =
        initialNumberOfValues - (numberInState % initialNumberOfValues);
      const numberOfValues = numberInState + numberToNextMultipleOfConfigured;

      dispatch(updateFacetNumberOfValues({facetId, numberOfValues}));
      dispatch(updateFacetIsFieldExpanded({facetId, isFieldExpanded: true}));
      dispatch(props.options.fetchResultsActionCreator());
    },

    showLessValues() {
      const initialNumberOfValues = getRequest().initialNumberOfValues;
      const newNumberOfValues = Math.max(
        initialNumberOfValues,
        getNumberOfActiveValues()
      );

      dispatch(
        updateFacetNumberOfValues({facetId, numberOfValues: newNumberOfValues})
      );
      dispatch(updateFacetIsFieldExpanded({facetId, isFieldExpanded: false}));
      dispatch(props.options.fetchResultsActionCreator());
    },

    get state() {
      const response = getResponse();

      const values = response.values as T2[];
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

function loadCommerceFacetReducers(
  engine: CommerceEngine
): engine is CommerceEngine<CommerceFacetSetSection> {
  engine.addReducers({commerceFacetSet});
  return true;
}
