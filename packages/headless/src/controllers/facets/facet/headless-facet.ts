import {Schema, StringValue, BooleanValue, NumberValue} from '@coveo/bueno';
import {Controller} from '../../controller/headless-controller';
import {Engine} from '../../../app/headless-engine';
import {
  registerFacet,
  toggleSelectFacetValue,
  deselectAllFacetValues,
  updateFacetSortCriterion,
  FacetRegistrationOptions,
  updateFacetNumberOfValues,
} from '../../../features/facets/facet-set/facet-set-actions';
import {randomID} from '../../../utils/utils';
import {
  facetSelector,
  facetRequestSelector,
} from '../../../features/facets/facet-set/facet-set-selectors';
import {
  FacetValue,
  FacetSortCriterion,
  FacetRequestOptions,
} from '../../../features/facets/facet-set/facet-set-interfaces';
import {executeSearch} from '../../../features/search/search-actions';
import {
  FacetSelectionChangeMetadata,
  logFacetDeselect,
  logFacetSelect,
  logFacetClearAll,
  logFacetUpdateSort,
  logFacetShowMore,
  logFacetShowLess,
} from '../../../features/facets/facet-set/facet-set-analytics-actions';
import {
  FacetSearch,
  facetSearchController,
} from '../facet-search/headless-facet-search';
import {FacetSearchRequestOptions} from '../../../features/facets/facet-search-set/facet-search-request-options';
import {FacetSearchOptions} from '../../../features/facets/facet-search-set/facet-search-actions';

export type FacetState = Facet['state'];

export type FacetProps = {
  options: FacetOptions;
};

const schema = new Schema({
  /**
   * A unique identifier for the controller.
   * By default, a unique random identifier is generated.
   */
  facetId: new StringValue({default: () => randomID('facet')}),
  /** The field whose values you want to display in the facet.*/
  field: new StringValue({required: true}),
  delimitingCharacter: new StringValue({default: '>'}),
  filterFacetCount: new BooleanValue({default: true}),
  injectionDepth: new NumberValue({default: 1000}),
  numberOfValues: new NumberValue({default: 8, min: 1}),
});

export type FacetOptions = FacetRequestOptions & {
  field: string;
  facetId?: string;
  facetSearch?: Partial<FacetSearchRequestOptions>;
};

export type ValidatedFacetOptions = FacetRegistrationOptions & {
  facetSearch: Partial<FacetSearchRequestOptions>;
};

export class Facet extends Controller {
  public facetSearch!: FacetSearch;
  private options: ValidatedFacetOptions;

  constructor(engine: Engine, props: FacetProps) {
    super(engine);
    this.options = schema.validate(props.options) as ValidatedFacetOptions;

    this.register();
    this.initFacetSearch();
  }

  /**
   * Selects (deselects) the passed value if unselected (selected).
   * @param selection The facet value to select or deselect.
   */
  public toggleSelect(selection: FacetValue) {
    const facetId = this.options.facetId;
    const analyticsAction = this.getAnalyticsActionForToggleSelect(selection);

    this.dispatch(toggleSelectFacetValue({facetId, selection}));
    this.dispatch(executeSearch(analyticsAction));
  }

  /**
   * Returns `true` is the passed facet value is selected and `false` otherwise.
   * @param facetValue The facet value to check.
   * @returns {boolean}.
   */
  public isValueSelected(value: FacetValue) {
    return value.state === 'selected';
  }

  /** Deselects all facet values.*/
  public deselectAll() {
    const id = this.options.facetId;

    this.dispatch(deselectAllFacetValues(id));
    this.dispatch(executeSearch(logFacetClearAll(id)));
  }

  /**
   * Returns `true` if the facet has selected values and `false` otherwise.
   * @returns {boolean}.
   */
  public get hasActiveValues() {
    return !!this.state.values.find(
      (facetValue) => facetValue.state !== 'idle'
    );
  }

  /** Sorts the facet values according to the passed criterion.
   * @param {FacetSortCriterion} criterion The criterion to sort values by.
   */
  public sortBy(criterion: FacetSortCriterion) {
    const facetId = this.options.facetId;

    this.dispatch(updateFacetSortCriterion({facetId, criterion}));
    this.dispatch(executeSearch(logFacetUpdateSort({facetId, criterion})));
  }

  /**
   * Returns `true` if the facet values are sorted according to the passed criterion and `false` otherwise.
   * @param {FacetSortCriterion} criterion The criterion to compare.
   */
  public isSortedBy(criterion: FacetSortCriterion) {
    return this.state.sortCriterion === criterion;
  }

  /**
   * Increases the number of values displayed in the facet.
   */
  public showMoreValues() {
    const facetId = this.options.facetId;
    const numberInState = this.request.numberOfValues;
    const configuredNumber = this.options.numberOfValues!;
    const numberToNextMultipleOfConfigured =
      configuredNumber - (numberInState % configuredNumber);
    const numberOfValues = numberInState + numberToNextMultipleOfConfigured;

    this.dispatch(updateFacetNumberOfValues({facetId, numberOfValues}));
    this.dispatch(
      updateFacetSortCriterion({facetId, criterion: 'alphanumeric'})
    );
    this.dispatch(executeSearch(logFacetShowMore(facetId)));
  }

  /** Returns `true` if there are more values to display and `false` otherwise.*/
  public get canShowMoreValues() {
    const res = this.response;
    return res ? res.moreValuesAvailable : false;
  }

  /** Sets the displayed number of values to the originally configured value.*/
  public showLessValues() {
    const {facetId, numberOfValues} = this.options;
    const newNumberOfValues = Math.max(
      numberOfValues!,
      this.numberOfActiveValues
    );

    this.dispatch(
      updateFacetNumberOfValues({facetId, numberOfValues: newNumberOfValues})
    );
    this.dispatch(updateFacetSortCriterion({facetId, criterion: 'score'}));
    this.dispatch(executeSearch(logFacetShowLess(facetId)));
  }

  /** Returns `true` if fewer values can be displayed and `false` otherwise.*/
  public get canShowLessValues() {
    const {currentValues} = this.request;
    const configuredNumber = this.options.numberOfValues!;
    const hasIdleValues = !!currentValues.find((v) => v.state === 'idle');

    return configuredNumber < currentValues.length && hasIdleValues;
  }

  /**
   * @returns The state of the `Facet` controller.
   */
  public get state() {
    const request = this.request;
    const response = this.response;

    const sortCriterion = request.sortCriteria;
    const values = response ? response.values : [];

    return {
      values,
      sortCriterion,
    };
  }

  private get numberOfActiveValues() {
    return this.request.currentValues.filter((v) => v.state !== 'idle').length;
  }

  private get request() {
    const id = this.options.facetId;
    const state = this.engine.state;

    return facetRequestSelector(state, id);
  }

  private get response() {
    const id = this.options.facetId;
    const state = this.engine.state;

    return facetSelector(state, id);
  }

  private register() {
    this.dispatch(registerFacet(this.options));
  }

  private initFacetSearch() {
    const {facetId, facetSearch} = this.options;
    const options: FacetSearchOptions = {
      facetId,
      ...facetSearch,
    };

    this.facetSearch = facetSearchController(this.engine, {options});
  }

  private getAnalyticsActionForToggleSelect(selection: FacetValue) {
    const payload: FacetSelectionChangeMetadata = {
      facetId: this.options.facetId,
      facetValue: selection.value,
    };

    return this.isValueSelected(selection)
      ? logFacetDeselect(payload)
      : logFacetSelect(payload);
  }
}
