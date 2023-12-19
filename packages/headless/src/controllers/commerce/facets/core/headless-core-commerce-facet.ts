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
import {
  AnyFacetValueResponse,
  DateFacetValue,
  FacetType,
  NumericFacetValue,
  RegularFacetValue,
  CategoryFacetValue,
} from '../../../../features/commerce/facets/facet-set/interfaces/response';
import {CategoryFacetValueRequest} from '../../../../features/facets/category-facet-set/interfaces/request';
import {
  deselectAllFacetValues,
  updateFacetIsFieldExpanded,
  updateFacetNumberOfValues,
} from '../../../../features/facets/facet-set/facet-set-actions';
import {FacetValueRequest} from '../../../../features/facets/facet-set/interfaces/request';
import {AnyFacetValueRequest} from '../../../../features/facets/generic/interfaces/generic-facet-request';
import {CommerceFacetSetSection} from '../../../../state/state-sections';
import {loadReducerError} from '../../../../utils/errors';
import {buildController} from '../../../controller/headless-controller';
import {
  CoreFacet as HeadlessCoreFacet,
  CoreFacetState,
} from '../../../core/facets/facet/headless-core-facet';
import {DateRangeRequest} from '../../../core/facets/range-facet/date-facet/headless-core-date-facet';
import {NumericRangeRequest} from '../../../core/facets/range-facet/numeric-facet/headless-core-numeric-facet';
import {findIfHasActiveValues} from './utils/headless-core-commerce-facet-utils';

export type {
  FacetType,
  FacetValueRequest,
  RegularFacetValue,
  NumericRangeRequest,
  NumericFacetValue,
  DateRangeRequest,
  DateFacetValue,
  CategoryFacetValueRequest,
  CategoryFacetValue,
};

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
    [payload: any], // eslint-disable-line @typescript-eslint/no-explicit-any
    any, // eslint-disable-line @typescript-eslint/no-explicit-any
    string,
    never,
    never
  >;
  toggleExcludeActionCreator?: ActionCreatorWithPreparedPayload<
    [payload: any], // eslint-disable-line @typescript-eslint/no-explicit-any
    any, // eslint-disable-line @typescript-eslint/no-explicit-any
    string,
    never,
    never
  >;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fetchResultsActionCreator: () => AsyncThunkAction<unknown, void, any>;
}

export type CommerceFacetOptions = Omit<
  CoreCommerceFacetOptions,
  | 'fetchResultsActionCreator'
  | 'toggleSelectActionCreator'
  | 'toggleExcludeActionCreator'
>;

export type CoreCommerceFacet<
  ValueRequest extends AnyFacetValueRequest,
  ValueResponse extends AnyFacetValueResponse,
> = Pick<
  HeadlessCoreFacet,
  'deselectAll' | 'showLessValues' | 'showMoreValues' | 'subscribe'
> & {
  /**
   * Toggles selection of the specified facet value.
   *
   * @param selection - The facet value to select.
   */
  toggleSelect(selection: ValueRequest): void;
  /**
   * Toggles exclusion of the specified facet value.
   *
   * @param selection - The facet value to exclude.
   */
  toggleExclude(selection: ValueRequest): void;
  /**
   * Toggles selection of the specified facet value, deselecting all others.
   *
   * @param selection - The facet value to single select.
   */
  toggleSingleSelect(selection: ValueRequest): void;
  /**
   * Toggles exclusion of the specified facet value, deselecting all others.
   *
   * @param selection - The facet value to single exclude.
   */
  toggleSingleExclude(selection: ValueRequest): void;
  /**
   * Whether the specified facet value is selected.
   *
   * @param value - The facet value to evaluate.
   */
  isValueSelected(value: ValueResponse): boolean;
  /**
   * Whether the specified facet value is excluded.
   *
   * @param value - The facet value to evaluate.
   */
  isValueExcluded(value: ValueResponse): boolean;
  /**
   * The state of this commerce facet controller instance.
   */
  state: CoreCommerceFacetState<ValueResponse>;
};

/**
 * A scoped and simplified part of the headless state that is relevant to the `CoreCommerceFacet` controller.
 */
export type CoreCommerceFacetState<
  ValueResponse extends AnyFacetValueResponse,
> = Omit<CoreFacetState, 'enabled' | 'sortCriterion' | 'values'> & {
  /**
   * The type of facet.
   */
  type: FacetType;
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
  values: ValueResponse[];
};

export type CoreCommerceFacetBuilder = typeof buildCoreCommerceFacet;

export function buildCoreCommerceFacet<
  ValueRequest extends AnyFacetValueRequest,
  ValueResponse extends AnyFacetValueResponse,
>(
  engine: CommerceEngine,
  props: CoreCommerceFacetProps
): CoreCommerceFacet<ValueRequest, ValueResponse> {
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

    toggleSelect: (selection: ValueRequest) => {
      dispatch(props.options.toggleSelectActionCreator({selection, facetId}));
      dispatch(props.options.fetchResultsActionCreator());
      // TODO: analytics
    },

    toggleExclude: (selection: ValueRequest) => {
      if (!props.options.toggleExcludeActionCreator) {
        console.warn(
          'Not toggle exclude action creator provided; calling #toggleExclude had no effect.'
        );
        return;
      }

      dispatch(props.options.toggleExcludeActionCreator({selection, facetId}));
      dispatch(props.options.fetchResultsActionCreator());
      // TODO: analytics
    },

    // Must use a function here to properly support inheritance with `this`.
    toggleSingleSelect: function (selection: ValueRequest) {
      if (selection.state === 'idle') {
        dispatch(deselectAllFacetValues(facetId));
      }

      this.toggleSelect(selection);
    },

    // Must use a function here to properly support inheritance with `this`.
    toggleSingleExclude: function (selection: ValueRequest) {
      if (!props.options.toggleExcludeActionCreator) {
        console.warn(
          'Not toggle exclude action creator provided; calling #toggleSingleExclude had no effect.'
        );
        return;
      }

      if (selection.state === 'idle') {
        dispatch(deselectAllFacetValues(facetId));
      }

      this.toggleExclude(selection);
    },

    isValueSelected: (value: ValueResponse) => {
      return value.state === 'selected';
    },

    isValueExcluded: (value: ValueResponse) => {
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

      const values = response.values as ValueResponse[];
      const hasActiveValues = findIfHasActiveValues(values, response.type);
      const canShowMoreValues = response ? response.moreValuesAvailable : false;

      return {
        facetId,
        type: response.type,
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
