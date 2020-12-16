import {Engine} from '../../app/headless-engine';
import {
  registerSortCriterion,
  updateSortCriterion,
} from '../../features/sort-criteria/sort-criteria-actions';
import {executeSearch} from '../../features/search/search-actions';
import {
  buildCriterionExpression,
  SortBy,
  SortCriterion,
  SortOrder,
} from '../../features/sort-criteria/criteria';
import {buildController} from '../controller/headless-controller';
import {updatePage} from '../../features/pagination/pagination-actions';
import {logResultsSort} from '../../features/sort-criteria/sort-criteria-analytics-actions';
import {ConfigurationSection, SortSection} from '../../state/state-sections';
import {
  ArrayValue,
  EnumValue,
  isArray,
  RecordValue,
  Schema,
  StringValue,
} from '@coveo/bueno';
import {validateInitialState} from '../../utils/validate-payload';

export interface SortProps {
  initialState: Partial<SortInitialState>;
}

export interface SortInitialState {
  /** The initial sort criterion to register in state. */
  criterion: SortCriterion | SortCriterion[];
}

const criterionDefinition = new RecordValue({
  values: {
    by: new EnumValue({enum: SortBy, required: true}),
    order: new EnumValue({enum: SortOrder}),
    field: new StringValue(),
  },
});

function validateSortInitialState(
  engine: Engine<ConfigurationSection & SortSection>,
  state: Partial<SortInitialState> | undefined
) {
  if (!state) {
    return;
  }

  const schema = new Schema<SortInitialState>({
    criterion: new ArrayValue({each: criterionDefinition}) as never,
  });
  const criterion = getCriterionAsArray(state);
  const initialState: SortInitialState = {...state, criterion};

  validateInitialState(engine, schema, initialState, buildSort.name);
}

function getCriterionAsArray(state: Partial<SortInitialState>) {
  if (!state.criterion) {
    return [];
  }

  return isArray(state.criterion) ? state.criterion : [state.criterion];
}

/** The `Sort` controller allows changing how the results are sorted.*/
export type Sort = ReturnType<typeof buildSort>;

/** The state relevant to the `Sort` controller.*/
export type SortState = Sort['state'];

export function buildSort(
  engine: Engine<ConfigurationSection & SortSection>,
  props: Partial<SortProps> = {}
) {
  const controller = buildController(engine);
  const {dispatch} = engine;

  validateSortInitialState(engine, props.initialState);

  const criterion = props.initialState?.criterion;
  const search = () => dispatch(executeSearch(logResultsSort()));

  if (criterion) {
    dispatch(registerSortCriterion(criterion));
  }

  return {
    ...controller,

    /**
     * Updates the sort criterion and executes a new search.
     * @param criterion The new sort criterion.
     */
    sortBy(criterion: SortCriterion | SortCriterion[]) {
      dispatch(updateSortCriterion(criterion));
      dispatch(updatePage(1));
      search();
    },

    /**
     * Returns `true` if the passed sort criterion matches the value in state, and `false` otherwise.
     * @param criterion The criterion to compare.
     * @returns {boolean}
     */
    isSortedBy(criterion: SortCriterion | SortCriterion[]) {
      return this.state.sortCriteria === buildCriterionExpression(criterion);
    },

    /**  @returns The state of the `Sort` controller.*/
    get state() {
      return {
        sortCriteria: engine.state.sortCriteria,
      };
    },
  };
}
