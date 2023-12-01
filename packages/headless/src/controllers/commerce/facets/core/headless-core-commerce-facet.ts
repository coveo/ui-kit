import {Schema} from '@coveo/bueno';
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
import {CategoryFacetValue} from '../../../../features/facets/category-facet-set/interfaces/response';
import {FacetValueState} from '../../../../features/facets/facet-api/value';
import {
  deselectAllFacetValues,
  updateFacetIsFieldExpanded,
  updateFacetNumberOfValues,
} from '../../../../features/facets/facet-set/facet-set-actions';
import {
  isFacetValueExcluded,
  isFacetValueSelected,
} from '../../../../features/facets/facet-set/facet-set-utils';
import {DateFacetValue} from '../../../../features/facets/range-facets/date-facet-set/interfaces/response';
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
  FacetValue as RegularFacetValue,
} from '../../../core/facets/facet/headless-core-facet';
import {NumericFacetValue} from '../../../core/facets/range-facet/numeric-facet/headless-core-numeric-facet';

export type {FacetValueState, RegularFacetValue, NumericFacetValue};

export type AnyFacetValue =
  | RegularFacetValue
  | NumericFacetValue
  | DateFacetValue
  | CategoryFacetValue;

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
  toggleSelectActionCreator?: ActionCreatorWithPreparedPayload<
    [payload: AnyToggleFacetValueActionCreatorPayload],
    any, // eslint-disable-line @typescript-eslint/no-explicit-any
    string,
    never,
    never
  >;
  toggleExcludeActionCreator?: ActionCreatorWithPreparedPayload<
    [payload: AnyToggleFacetValueActionCreatorPayload],
    any, // eslint-disable-line @typescript-eslint/no-explicit-any
    string,
    never,
    never
  >;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fetchResultsActionCreator?: () => AsyncThunkAction<unknown, void, any>;
}

export type CoreCommerceFacet = Pick<
  HeadlessCoreFacet,
  'deselectAll' | 'showLessValues' | 'showMoreValues' | 'subscribe'
> & {
  toggleSelect(selection: AnyFacetValue): void;
  toggleExclude(selection: AnyFacetValue): void;
  toggleSingleSelect(selection: AnyFacetValue): void;
  toggleSingleExclude(selection: AnyFacetValue): void;
  isValueSelected(value: AnyFacetValue): boolean;
  isValueExcluded(value: AnyFacetValue): boolean;
  state: CoreCommerceFacetState;
};

/**
 * A scoped and simplified part of the headless state that is relevant to the `CoreCommerceFacet` controller.
 */
export type CoreCommerceFacetState = Omit<
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
  values: AnyFacetValue[];
};

export type CoreCommerceFacetBuilder = typeof buildCoreCommerceFacet;

export function buildCoreCommerceFacet(
  engine: CommerceEngine,
  props: CoreCommerceFacetProps
): CoreCommerceFacet {
  if (!loadCommerceFacetReducers(engine)) {
    throw loadReducerError;
  }

  const {dispatch} = engine;
  const controller = buildController(engine);

  validateOptions(
    engine,
    new Schema<CoreCommerceFacetOptions>({
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
    const request = getRequest();
    const initialNumberOfValues = request.initialNumberOfValues;
    const hasIdleValues = !!request.values.find((v) => v.state === 'idle');

    return initialNumberOfValues < request.numberOfValues && hasIdleValues;
  };

  return {
    ...controller,

    toggleSelect: (selection: AnyFacetValue) => {
      if (props.options.toggleSelectActionCreator) {
        dispatch(props.options.toggleSelectActionCreator({selection, facetId}));
        if (props.options.fetchResultsActionCreator) {
          dispatch(props.options.fetchResultsActionCreator());
          // TODO: analytics
        }
      } else {
        throw new Error('No toggleSelectActionCreator was provided');
      }
    },

    toggleExclude: (selection: AnyFacetValue) => {
      if (props.options.toggleExcludeActionCreator) {
        dispatch(
          props.options.toggleExcludeActionCreator({selection, facetId})
        );
        if (props.options.fetchResultsActionCreator) {
          dispatch(props.options.fetchResultsActionCreator());
          // TODO: analytics
        }
      } else {
        throw new Error('No toggleExcludeActionCreator was provided');
      }
    },

    // Must use a function here to properly support inheritance with `this`.
    toggleSingleSelect: function (selection: AnyFacetValue) {
      if (selection.state === 'idle') {
        dispatch(deselectAllFacetValues(facetId));
      }

      this.toggleSelect(selection);
    },

    // Must use a function here to properly support inheritance with `this`.
    toggleSingleExclude: function (selection: AnyFacetValue) {
      if (selection.state === 'idle') {
        dispatch(deselectAllFacetValues(facetId));
      }

      this.toggleExclude(selection);
    },

    isValueSelected: isFacetValueSelected,

    isValueExcluded: isFacetValueExcluded,

    deselectAll() {
      dispatch(deselectAllFacetValues(facetId));
      if (props.options.fetchResultsActionCreator) {
        dispatch(props.options.fetchResultsActionCreator());
      }
    },

    showMoreValues() {
      const numberInState = getRequest().numberOfValues;
      const initialNumberOfValues = getRequest().initialNumberOfValues;
      const numberToNextMultipleOfConfigured =
        initialNumberOfValues - (numberInState % initialNumberOfValues);
      const numberOfValues = numberInState + numberToNextMultipleOfConfigured;

      dispatch(updateFacetNumberOfValues({facetId, numberOfValues}));
      dispatch(updateFacetIsFieldExpanded({facetId, isFieldExpanded: true}));
      if (props.options.fetchResultsActionCreator) {
        dispatch(props.options.fetchResultsActionCreator());
      }
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
      if (props.options.fetchResultsActionCreator) {
        dispatch(props.options.fetchResultsActionCreator());
      }
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

function loadCommerceFacetReducers(
  engine: CommerceEngine
): engine is CommerceEngine<CommerceFacetSetSection> {
  engine.addReducers({commerceFacetSet});
  return true;
}
