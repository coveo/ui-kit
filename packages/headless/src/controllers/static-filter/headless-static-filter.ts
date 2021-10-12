import {Schema} from '@coveo/bueno';
import {buildController, Controller} from '..';
import {SearchEngine} from '../..';
import {staticFilterSet} from '../../app/reducers';
import {
  staticFilterIdSchema,
  staticFilterValuesSchema,
} from '../../features/static-filter-set/static-filter-schema';
import {registerStaticFilter} from '../../features/static-filter-set/static-filter-set-actions';
import {StaticFilterValue} from '../../features/static-filter-set/static-filter-set-state';
import {StaticFilterSection} from '../../state/state-sections';
import {loadReducerError} from '../../utils/errors';
import {validateOptions} from '../../utils/validate-payload';

const optionsSchema = new Schema<Required<StaticFilterOptions>>({
  id: staticFilterIdSchema,
  values: staticFilterValuesSchema,
});

export interface StaticFilterProps {
  /**
   * The options for the `StaticFilter` controller.
   */
  options: StaticFilterOptions;
}

export interface StaticFilterOptions {
  /**
   * A unique identifier for the static filter.
   */
  id: string;

  /**
   * The values the static filter is responsible for managing.
   */
  values: StaticFilterValue[];
}

/**
 * The `StaticFilter` controller manages a collection of filter values.
 * */
export interface StaticFilter extends Controller {}

/**
 * Creates a `Static Filter` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `Sort` controller properties.
 * @returns A `Sort` controller instance.
 */
export function buildStaticFilter(
  engine: SearchEngine,
  props: StaticFilterProps
): StaticFilter {
  if (!loadReducers(engine)) {
    throw loadReducerError;
  }

  validateOptions(engine, optionsSchema, props.options, 'buildStaticFilter');

  const controller = buildController(engine);
  const {dispatch} = engine;

  dispatch(registerStaticFilter(props.options));

  return {...controller};
}

function loadReducers(
  engine: SearchEngine
): engine is SearchEngine<StaticFilterSection> {
  engine.addReducers({staticFilterSet});
  return true;
}
