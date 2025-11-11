import {configuration} from '../../../../app/common-reducers.js';
import type {CoreEngine} from '../../../../app/engine.js';
import type {SearchThunkExtraArguments} from '../../../../app/search-thunk-extra-arguments.js';
import {
  disableFacet,
  enableFacet,
  updateFacetOptions,
} from '../../../../features/facet-options/facet-options-actions.js';
import {isFacetEnabledSelector} from '../../../../features/facet-options/facet-options-selectors.js';
import {facetOptionsReducer as facetOptions} from '../../../../features/facet-options/facet-options-slice.js';
import type {FacetValueState} from '../../../../features/facets/facet-api/value.js';
import {defaultFacetSearchOptions} from '../../../../features/facets/facet-search-set/facet-search-reducer-helpers.js';
import {specificFacetSearchSetReducer as facetSearchSet} from '../../../../features/facets/facet-search-set/specific/specific-facet-search-set-slice.js';
import {
  deselectAllFacetValues,
  registerFacet,
  updateFacetIsFieldExpanded,
  updateFacetNumberOfValues,
  updateFacetSortCriterion,
} from '../../../../features/facets/facet-set/facet-set-actions.js';
import {
  executeToggleFacetExclude,
  executeToggleFacetSelect,
} from '../../../../features/facets/facet-set/facet-set-controller-actions.js';
import {
  facetRequestSelector,
  facetResponseSelector,
  isFacetLoadingResponseSelector,
} from '../../../../features/facets/facet-set/facet-set-selectors.js';
import {
  defaultFacetOptions,
  facetSetReducer as facetSet,
} from '../../../../features/facets/facet-set/facet-set-slice.js';
import {
  isFacetValueExcluded,
  isFacetValueSelected,
} from '../../../../features/facets/facet-set/facet-set-utils.js';
import type {FacetSortCriterion} from '../../../../features/facets/facet-set/interfaces/request.js';
import {selectActiveTab} from '../../../../features/tab-set/tab-set-selectors.js';
import type {
  ConfigurationSection,
  FacetOptionsSection,
  FacetSearchSection,
  FacetSection,
  SearchSection,
} from '../../../../state/state-sections.js';
import {loadReducerError} from '../../../../utils/errors.js';
import {omit} from '../../../../utils/utils.js';
import {validateOptions} from '../../../../utils/validate-payload.js';
import {
  buildController,
  type Controller,
} from '../../../controller/headless-controller.js';
import {determineFacetId} from '../_common/facet-id-determinor.js';
import {
  type FacetOptions,
  facetOptionsSchema,
} from './headless-core-facet-options.js';

export type {FacetOptions, FacetValueState};

interface CoreFacetProps {
  /**
   * The options for the core `Facet` controller.
   * */
  options: FacetOptions;
}

/**
 * The `Facet` controller allows you to create a search interface component that the end user
 * can use to refine a query by selecting filters based on item metadata (that is, field values).
 * If you have enabled a [Dynamic Navigation Experience (DNE)](https://docs.coveo.com/en/m2na0333/)
 * model, the `Facet` controller automatically reorders facet values according to the user query.
 *
 * Examples:
 * - [facet.fn.tsx](https://github.com/coveo/ui-kit/blob/main/samples/headless/search-react/src/components/facet/facet.fn.tsx)
 * - [facet-search.tsx](https://github.com/coveo/ui-kit/blob/main/samples/headless/search-react/src/components/facet/facet-search.tsx)
 * - [facet.class.tsx](https://github.com/coveo/ui-kit/blob/main/samples/headless/search-react/src/components/facet/facet.class.tsx)
 *
 * @group Controllers
 * @category Facet
 */
export interface Facet extends CoreFacet {
  /**
   * Provides methods to search the facet's values.
   */
  facetSearch: FacetSearch;

  /**
   * The state of the `Facet` controller.
   */
  state: FacetState;
}

/**
 * The `Facet` headless controller offers a high-level interface for designing a common facet UI controller.
 *
 * @group Controllers
 * @category Facet
 */
export interface CoreFacet extends Controller {
  /**
   * Toggles the specified facet value.
   *
   * @param selection - The facet value to toggle.
   */
  toggleSelect(selection: FacetValue): void;

  /**
   * Toggles exclusion of the specified facet value.
   *
   * @param selection - The facet value to toggle exclusion.
   */
  toggleExclude(selection: FacetValue): void;

  /**
   * Toggles the specified facet value, deselecting others.
   *
   * @param selection - The facet value to toggle.
   */
  toggleSingleSelect(selection: FacetValue): void;

  /**
   * Excludes the specified facet value, deselecting others.
   *
   * @param selection - The facet value to toggle exclusion.
   */
  toggleSingleExclude(selection: FacetValue): void;

  /**
   * Checks whether the specified facet value is selected.
   *
   * @param value - The facet value to check.
   * @returns Whether the specified facet value is selected.
   */
  isValueSelected(value: FacetValue): boolean;

  /**
   * Checks whether the specified facet value is excluded.
   *
   * @param value - The facet value to check.
   * @returns Whether the specified facet value is excluded.
   */
  isValueExcluded(value: FacetValue): boolean;

  /**
   * Deselects all facet values.
   * */
  deselectAll(): void;

  /**
   * Sorts the facet values according to the specified criterion.
   *
   * @param criterion - The criterion to use for sorting values.
   */
  sortBy(criterion: FacetSortCriterion): void;

  /**
   * Checks whether the facet values are sorted according to the specified criterion.
   *
   * @param criterion - The criterion to compare.
   * @returns Whether the facet values are sorted according to the specified criterion.
   */
  isSortedBy(criterion: FacetSortCriterion): boolean;

  /**
   * Increases the number of values displayed in the facet to the next multiple of the originally configured value.
   */
  showMoreValues(): void;

  /**
   * Sets the number of values displayed in the facet to the originally configured value.
   * */
  showLessValues(): void;

  /**
   * Enables the facet. I.e., undoes the effects of `disable`.
   */
  enable(): void;

  /**
   * Disables the facet. I.e., prevents it from filtering results.
   */
  disable(): void;

  /**
   * The state of the `Facet` controller.
   * */
  state: CoreFacetState;
}

/**
 * A scoped and simplified part of the headless state that is relevant to the `Facet` controller.
 *
 * @group Controllers
 * @category Facet
 */
export interface FacetState extends CoreFacetState {
  /** The state of the facet's searchbox. */
  facetSearch: FacetSearchState;
}

/**
 * A scoped and simplified part of the headless state that is relevant to the `Facet` controller.
 *
 * @group Controllers
 * @category Facet
 */
export interface CoreFacetState {
  /** The facet ID. */
  facetId: string;

  /** The values of the facet. */
  values: FacetValue[];

  /** The active sortCriterion of the facet. */
  sortCriterion: FacetSortCriterion;

  /** `true` if a search is in progress and `false` otherwise. */
  isLoading: boolean;

  /** `true` if there is at least one non-idle value and `false` otherwise. */
  hasActiveValues: boolean;

  /** `true` if there are more values to display and `false` otherwise. */
  canShowMoreValues: boolean;

  /** `true` if fewer values can be displayed and `false` otherwise. */
  canShowLessValues: boolean;

  /** Whether the facet is enabled and its values are used to filter search results. */
  enabled: boolean;

  /** The tabs on which the facet should be enabled or disabled. */
  tabs?: {included?: string[]; excluded?: string[]};

  /**
   * The name to display if this field is used by the Facet Generator in your interface.
   * See [Change Facet Generator options](https://docs.coveo.com/en/n9sd0159#change-facet-generator-options).
   */
  label?: string;
}

export interface FacetSearch {
  /**
   * Updates the facet search query.
   *
   * @param text - The query to search.
   * */
  updateText(text: string): void;

  /**
   * Shows more facet search results.
   * */
  showMoreResults(): void;

  /**
   * Performs a facet search.
   * */
  search(): void;

  /**
   * Selects a facet search result.
   *
   * @param value - The search result to select.
   * */
  select(value: SpecificFacetSearchResult): void;

  /**
   * Excludes a facet search result.
   *
   * @param value - The search result to exclude.
   * */
  exclude(value: SpecificFacetSearchResult): void;

  /**
   * Selects a search result while deselecting facet values.
   *
   * @param value - The search result to select.
   * */
  singleSelect(value: SpecificFacetSearchResult): void;

  /**
   * Excludes a search result while including facet values.
   *
   * @param value - The search result to exclude.
   * */
  singleExclude(value: SpecificFacetSearchResult): void;

  /**
   * Resets the query and empties the values.
   * */
  clear(): void;

  /**
   * Updates the facet value captions.
   * @param captions - A dictionary that maps index field values to facet value display names.
   */
  updateCaptions(captions: Record<string, string>): void;
}

export interface FacetSearchState {
  /**
   * The facet search results.
   * */
  values: SpecificFacetSearchResult[];

  /**
   * `true` if the facet search is in progress and `false` otherwise.
   * */
  isLoading: boolean;

  /**
   * Whether more values are available.
   * */
  moreValuesAvailable: boolean;

  /** The current query in the facet search box. */
  query: string;
}

export interface SpecificFacetSearchResult {
  /**
   * The custom facet value display name, as specified in the `captions` argument of the facet request.
   */
  displayValue: string;

  /**
   * The original facet value, as retrieved from the field in the index.
   */
  rawValue: string;

  /**
   * An estimate of the number of result items matching both the current query and
   * the filter expression that would get generated if the facet value were selected.
   */
  count: number;
}

export interface FacetValue {
  /**
   * Whether a facet value is filtering results (`selected`) or not (`idle`).
   * */
  state: FacetValueState;

  /**
   * The number of results that have the facet value.
   * */
  numberOfResults: number;

  /**
   * The facet value.
   * */
  value: string;
}

/**
 * Creates a `Facet` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `Facet` properties.
 * @param optionsSchema - The facet options schema to use when validating options upon facet initialization.
 * @returns A `Facet` controller instance.
 *
 * @group Controllers
 * @category Facet
 * */
export function buildCoreFacet(
  engine: CoreEngine,
  props: CoreFacetProps,
  optionsSchema = facetOptionsSchema
): CoreFacet {
  if (!loadFacetReducers(engine)) {
    throw loadReducerError;
  }

  const {dispatch} = engine;
  const controller = buildController(engine);

  const facetId = determineFacetId(engine, props.options);
  const tabs = props.options.tabs ?? {};
  const activeTab = selectActiveTab(engine.state.tabSet);
  const registrationOptions = {
    ...defaultFacetOptions,
    ...omit('facetSearch', props.options),
    field: props.options.field,
    facetId,
    tabs,
    activeTab,
  };

  const options: Required<FacetOptions> = {
    facetSearch: {...defaultFacetSearchOptions, ...props.options.facetSearch},
    ...registrationOptions,
  };

  validateOptions(engine, optionsSchema, options, 'buildFacet');

  const getRequest = () => facetRequestSelector(engine.state, facetId);
  const getResponse = () => facetResponseSelector(engine.state, facetId);
  const getIsLoading = () => isFacetLoadingResponseSelector(engine.state);
  const getIsEnabled = () => isFacetEnabledSelector(engine.state, facetId);

  const getNumberOfActiveValues = () => {
    const {currentValues} = getRequest();
    return currentValues.filter((v) => v.state !== 'idle').length;
  };

  const computeCanShowLessValues = () => {
    const {currentValues} = getRequest();
    const initialNumberOfValues = options.numberOfValues;
    const hasIdleValues = !!currentValues.find((v) => v.state === 'idle');

    return initialNumberOfValues < currentValues.length && hasIdleValues;
  };

  dispatch(registerFacet(registrationOptions));

  return {
    ...controller,

    toggleSelect: (selection: FacetValue) =>
      dispatch(executeToggleFacetSelect({facetId: options.facetId, selection})),

    toggleExclude: (selection: FacetValue) =>
      dispatch(
        executeToggleFacetExclude({facetId: options.facetId, selection})
      ),

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
      dispatch(updateFacetOptions());
    },

    sortBy(criterion: FacetSortCriterion) {
      dispatch(updateFacetSortCriterion({facetId, criterion}));
      dispatch(updateFacetOptions());
    },

    isSortedBy(criterion: FacetSortCriterion) {
      return this.state.sortCriterion === criterion;
    },

    showMoreValues() {
      const numberInState = getRequest().numberOfValues;
      const initialNumberOfValues = options.numberOfValues;
      const numberToNextMultipleOfConfigured =
        initialNumberOfValues - (numberInState % initialNumberOfValues);
      const numberOfValues = numberInState + numberToNextMultipleOfConfigured;

      dispatch(updateFacetNumberOfValues({facetId, numberOfValues}));
      dispatch(updateFacetIsFieldExpanded({facetId, isFieldExpanded: true}));
      dispatch(updateFacetOptions());
    },

    showLessValues() {
      const initialNumberOfValues = options.numberOfValues;
      const newNumberOfValues = Math.max(
        initialNumberOfValues,
        getNumberOfActiveValues()
      );

      dispatch(
        updateFacetNumberOfValues({facetId, numberOfValues: newNumberOfValues})
      );
      dispatch(updateFacetIsFieldExpanded({facetId, isFieldExpanded: false}));
      dispatch(updateFacetOptions());
    },

    enable() {
      dispatch(enableFacet(facetId));
    },

    disable() {
      dispatch(disableFacet(facetId));
    },

    get state() {
      const request = getRequest();
      const response = getResponse();
      const isLoading = getIsLoading();
      const enabled = getIsEnabled();
      let sortCriterion!: FacetSortCriterion;

      if (typeof request.sortCriteria === 'object') {
        sortCriterion =
          request.sortCriteria.order === 'descending'
            ? 'alphanumericDescending'
            : 'alphanumeric';
      } else {
        sortCriterion = request.sortCriteria;
      }

      const values = response ? response.values : [];
      const hasActiveValues = values.some(
        (facetValue) => facetValue.state !== 'idle'
      );
      const canShowMoreValues = response ? response.moreValuesAvailable : false;

      const resultsMustMatch = request.resultsMustMatch;

      return {
        label: response?.label,
        facetId,
        tabs,
        values,
        sortCriterion,
        resultsMustMatch,
        isLoading,
        hasActiveValues,
        canShowMoreValues,
        canShowLessValues: computeCanShowLessValues(),
        enabled,
      };
    },
  };
}

function loadFacetReducers(
  engine: CoreEngine
): engine is CoreEngine<
  FacetSection &
    FacetOptionsSection &
    ConfigurationSection &
    FacetSearchSection &
    SearchSection,
  SearchThunkExtraArguments
> {
  engine.addReducers({facetSet, facetOptions, configuration, facetSearchSet});
  return true;
}
