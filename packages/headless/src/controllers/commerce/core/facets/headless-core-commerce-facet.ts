import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {stateKey} from '../../../../app/state-key';
import {
  deselectAllValuesInCoreFacet,
  updateCoreFacetIsFieldExpanded,
  updateCoreFacetNumberOfValues,
} from '../../../../features/commerce/facets/core-facet/core-facet-actions';
import {commerceFacetSetReducer as commerceFacetSet} from '../../../../features/commerce/facets/facet-set/facet-set-slice';
import {FacetType} from '../../../../features/commerce/facets/facet-set/interfaces/common';
import {
  AnyFacetRequest,
  CategoryFacetValueRequest,
} from '../../../../features/commerce/facets/facet-set/interfaces/request';
import {
  AnyFacetResponse,
  AnyFacetValueResponse,
  CategoryFacetValue,
  DateFacetValue,
  NumericFacetValue,
  RegularFacetValue,
} from '../../../../features/commerce/facets/facet-set/interfaces/response';
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
import {FetchProductsActionCreator, ToggleActionCreator} from '../common';

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

export interface FacetControllerType<T extends FacetType> {
  type: T;
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

export type CoreCommerceFacetBuilder = typeof buildCoreCommerceFacet;

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

  const getRequest = (): AnyFacetRequest | undefined =>
    engine[stateKey].commerceFacetSet[facetId]?.request;
  const getResponse = () =>
    props.options.facetResponseSelector(engine[stateKey], facetId);
  const getIsLoading = () =>
    props.options.isFacetLoadingResponseSelector(engine[stateKey]);

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
      // TODO: analytics
    },

    toggleExclude: (selection: ValueRequest) => {
      // eslint-disable-next-line @cspell/spellchecker
      // TODO CAPI-409: Rework facet type definitions
      if (!props.options.toggleExcludeActionCreator) {
        engine.logger.warn(
          'No toggle exclude action creator provided; calling #toggleExclude had no effect.'
        );
        return;
      }

      dispatch(props.options.toggleExcludeActionCreator({selection, facetId}));
      dispatch(props.options.fetchProductsActionCreator());
      // TODO: analytics
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
      // eslint-disable-next-line @cspell/spellchecker
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
      const initialNumberOfValues = getRequest()?.initialNumberOfValues ?? 0;
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
      const initialNumberOfValues = getRequest()?.initialNumberOfValues ?? 0;
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
      const response = getResponse();
      const canShowMoreValues = response?.moreValuesAvailable ?? false;

      const values = (response?.values ?? []) as ValueResponse[];
      const hasActiveValues = values.some((v) => v.state !== 'idle');

      return {
        facetId,
        tabs: {},
        type: response?.type ?? 'regular',
        field: response?.field ?? '',
        displayName: response?.displayName ?? '',
        values,
        isLoading: getIsLoading(),
        canShowMoreValues,
        canShowLessValues: canShowLessValues(getRequest()),
        hasActiveValues,
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

const canShowLessValues = (request: AnyFacetRequest | undefined) => {
  if (!request) {
    return false;
  }

  const initialNumberOfValues = request.initialNumberOfValues;
  const hasIdleValues = !!request.values.find((v) => v.state === 'idle');

  return (
    (initialNumberOfValues ?? 0) < (request.numberOfValues ?? 0) &&
    hasIdleValues
  );
};
