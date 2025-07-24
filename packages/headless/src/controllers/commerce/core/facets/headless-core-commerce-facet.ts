import type {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine.js';
import {stateKey} from '../../../../app/state-key.js';
import {
  deselectAllValuesInCoreFacet,
  updateCoreFacetIsFieldExpanded,
  updateCoreFacetNumberOfValues,
} from '../../../../features/commerce/facets/core-facet/core-facet-actions.js';
import {facetRequestSelector} from '../../../../features/commerce/facets/facet-set/facet-set-selector.js';
import {commerceFacetSetReducer as commerceFacetSet} from '../../../../features/commerce/facets/facet-set/facet-set-slice.js';
import type {FacetType} from '../../../../features/commerce/facets/facet-set/interfaces/common.js';
import type {
  AnyFacetRequest,
  CategoryFacetValueRequest,
  LocationFacetValueRequest,
} from '../../../../features/commerce/facets/facet-set/interfaces/request.js';
import type {
  AnyFacetResponse,
  AnyFacetValueResponse,
  BaseFacetValue,
  CategoryFacetValue,
  DateFacetValue,
  LocationFacetValue,
  NumericFacetValue,
  RegularFacetValue,
} from '../../../../features/commerce/facets/facet-set/interfaces/response.js';
import type {FacetValueRequest} from '../../../../features/facets/facet-set/interfaces/request.js';
import type {AnyFacetValueRequest} from '../../../../features/facets/generic/interfaces/generic-facet-request.js';
import type {CommerceFacetSetSection} from '../../../../state/state-sections.js';
import {loadReducerError} from '../../../../utils/errors.js';
import {buildController} from '../../../controller/headless-controller.js';
import type {
  CoreFacetState,
  CoreFacet as HeadlessCoreFacet,
} from '../../../core/facets/facet/headless-core-facet.js';
import type {DateRangeRequest} from '../../../core/facets/range-facet/date-facet/headless-core-date-facet.js';
import type {NumericRangeRequest} from '../../../core/facets/range-facet/numeric-facet/headless-core-numeric-facet.js';
import type {
  FetchProductsActionCreator,
  ToggleActionCreator,
} from '../common.js';

export type {
  FacetType,
  FacetValueRequest,
  RegularFacetValue,
  LocationFacetValueRequest,
  LocationFacetValue,
  NumericRangeRequest,
  NumericFacetValue,
  DateRangeRequest,
  DateFacetValue,
  CategoryFacetValueRequest,
  CategoryFacetValue,
  BaseFacetValue,
};

export interface FacetControllerType<T extends FacetType> {
  type: T;
}

/**
 * @internal
 *
 * The configurable `CoreCommerceFacet` properties used internally.
 */
interface CoreCommerceFacetProps {
  options: CoreCommerceFacetOptions;
}

export interface CoreCommerceFacetOptions {
  facetId: string;
  toggleSelectActionCreator: ToggleActionCreator;
  toggleExcludeActionCreator?: ToggleActionCreator;
  fetchProductsActionCreator: FetchProductsActionCreator;
  facetResponseSelector: (
    state: CommerceEngine[typeof stateKey],
    facetId: string
  ) => AnyFacetResponse | undefined;
  isFacetLoadingResponseSelector: (
    state: CommerceEngine[typeof stateKey]
  ) => boolean;
}

export type CommerceFacetOptions = Omit<
  CoreCommerceFacetOptions,
  | 'fetchProductsActionCreator'
  | 'toggleSelectActionCreator'
  | 'toggleExcludeActionCreator'
  | 'facetResponseSelector'
  | 'isFacetLoadingResponseSelector'
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
};

/**
 * A scoped and simplified part of the headless state that is relevant to the `CoreCommerceFacet` controller.
 */
export type CoreCommerceFacetState<
  ValueResponse extends AnyFacetValueResponse,
> = Omit<CoreFacetState, 'enabled' | 'sortCriterion' | 'values' | 'label'> & {
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

export function buildCoreCommerceFacet<
  ValueRequest extends AnyFacetValueRequest,
  ValueResponse extends AnyFacetValueResponse,
>(engine: CommerceEngine, props: CoreCommerceFacetProps) {
  if (!loadCommerceFacetReducers(engine)) {
    throw loadReducerError;
  }

  const {dispatch} = engine;
  const controller = buildController(engine);

  const facetId = props.options.facetId;

  const getEngineState = () => engine[stateKey];

  const getRequest = (): AnyFacetRequest | undefined =>
    facetRequestSelector(getEngineState(), facetId);
  const getResponse = () =>
    props.options.facetResponseSelector(getEngineState(), facetId);
  const getIsLoading = () =>
    props.options.isFacetLoadingResponseSelector(getEngineState());

  const getNumberOfActiveValues = () => {
    return getRequest()?.values?.filter((v) => v.state !== 'idle').length ?? 0;
  };

  return {
    ...controller,

    toggleSelect: (selection: ValueRequest) => {
      dispatch(
        props.options.toggleSelectActionCreator({
          selection,
          facetId,
        })
      );
      dispatch(props.options.fetchProductsActionCreator());
    },

    toggleExclude: (selection: ValueRequest) => {
      // TODO CAPI-409: Rework facet type definitions
      if (!props.options.toggleExcludeActionCreator) {
        engine.logger.warn(
          'No toggle exclude action creator provided; calling #toggleExclude had no effect.'
        );
        return;
      }

      dispatch(props.options.toggleExcludeActionCreator({selection, facetId}));
      dispatch(props.options.fetchProductsActionCreator());
    },

    // Must use a function here to properly support inheritance with `this`.
    toggleSingleSelect: function (selection: ValueRequest) {
      if (selection.state === 'idle') {
        dispatch(deselectAllValuesInCoreFacet({facetId}));
      }

      this.toggleSelect(selection);
    },

    // Must use a function here to properly support inheritance with `this`.
    toggleSingleExclude: function (selection: ValueRequest) {
      // TODO CAPI-409: Rework facet type definitions
      if (!props.options.toggleExcludeActionCreator) {
        engine.logger.warn(
          'No toggle exclude action creator provided; calling #toggleSingleExclude had no effect.'
        );
        return;
      }

      if (selection.state === 'idle') {
        dispatch(deselectAllValuesInCoreFacet({facetId}));
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
      dispatch(deselectAllValuesInCoreFacet({facetId}));
      dispatch(props.options.fetchProductsActionCreator());
    },

    showMoreValues() {
      const numberInState = getRequest()?.numberOfValues ?? 0;
      const initialNumberOfValues = getRequest()?.initialNumberOfValues ?? 1;
      const numberToNextMultipleOfConfigured =
        initialNumberOfValues - (numberInState % initialNumberOfValues);
      const numberOfValues = numberInState + numberToNextMultipleOfConfigured;

      dispatch(updateCoreFacetNumberOfValues({facetId, numberOfValues}));
      dispatch(
        updateCoreFacetIsFieldExpanded({facetId, isFieldExpanded: true})
      );
      dispatch(props.options.fetchProductsActionCreator());
    },

    showLessValues() {
      const initialNumberOfValues = getRequest()?.initialNumberOfValues ?? 1;
      const newNumberOfValues = Math.max(
        initialNumberOfValues,
        getNumberOfActiveValues()
      );

      dispatch(
        updateCoreFacetNumberOfValues({
          facetId,
          numberOfValues: newNumberOfValues,
        })
      );
      dispatch(
        updateCoreFacetIsFieldExpanded({facetId, isFieldExpanded: false})
      );
      dispatch(props.options.fetchProductsActionCreator());
    },

    get state(): CoreCommerceFacetState<ValueResponse> {
      return getCoreFacetState(
        facetId,
        getRequest(),
        getResponse(),
        getIsLoading()
      );
    },
  };
}

function loadCommerceFacetReducers(
  engine: CommerceEngine
): engine is CommerceEngine<CommerceFacetSetSection> {
  engine.addReducers({commerceFacetSet});
  return true;
}

const canShowLessValues = (request: AnyFacetRequest | undefined) => {
  return (
    !!request &&
    request.values.length > (request.initialNumberOfValues ?? 1) &&
    request.values.some((v) => v.state === 'idle')
  );
};

export const getCoreFacetState = <T extends AnyFacetValueResponse>(
  facetId: string,
  request: AnyFacetRequest | undefined,
  response: AnyFacetResponse | undefined,
  isLoading: boolean
): CoreCommerceFacetState<T> => {
  return {
    canShowLessValues: canShowLessValues(request),
    canShowMoreValues: response?.moreValuesAvailable ?? false,
    displayName: response?.displayName ?? '',
    facetId: facetId,
    field: response?.field ?? '',
    hasActiveValues:
      !response || response.type === 'hierarchical'
        ? false
        : response.values.some((v) => v.state !== 'idle'),
    isLoading,
    type: response?.type ?? 'regular',
    values: response?.values ? (response.values as T[]) : [],
  };
};
