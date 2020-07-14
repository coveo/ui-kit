import {Schema, StringValue} from '@coveo/bueno';
import {Controller} from '../../controller/headless-controller';
import {Engine} from '../../../app/headless-engine';
import {
  registerFacet,
  toggleSelectFacetValue,
  deselectAllFacetValues,
  updateFacetSortCriterion,
} from '../../../features/facets/facet-set/facet-set-actions';
import {randomID} from '../../../utils/utils';
import {
  facetSelector,
  facetRequestSelector,
} from '../../../features/facets/facet-set/facet-set-selectors';
import {
  FacetValue,
  FacetSortCriterion,
} from '../../../features/facets/facet-set/facet-set-interfaces';
import {executeSearch} from '../../../features/search/search-actions';
import {
  FacetSelectionChangeMetadata,
  logFacetDeselect,
  logFacetSelect,
  logFacetClearAll,
  logFacetUpdateSort,
} from '../../../features/facets/facet-set/facet-set-analytics-actions';

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
});

export type FacetOptions = {
  field: string;
  facetId?: string;
  sortCriteria?: FacetSortCriterion;
};

export class Facet extends Controller {
  private options: Required<FacetOptions>;

  constructor(engine: Engine, props: FacetProps) {
    super(engine);
    this.options = schema.validate(props.options) as Required<FacetOptions>;

    this.register();
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
   * @returns The state of the `Facet` controller.
   */
  public get state() {
    const id = this.options.facetId;
    const state = this.engine.state;

    const request = facetRequestSelector(state, id);
    const response = facetSelector(state, id);

    const sortCriterion = request.sortCriteria;
    const values = response ? response.values : [];

    return {
      values,
      sortCriterion,
    };
  }

  private register() {
    this.dispatch(registerFacet(this.options));
  }

  private getAnalyticsActionForToggleSelect(selection: FacetValue) {
    const payload: FacetSelectionChangeMetadata = {
      facetId: this.options.facetId,
      selection,
    };

    return this.isValueSelected(selection)
      ? logFacetDeselect(payload)
      : logFacetSelect(payload);
  }
}
