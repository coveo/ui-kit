import {RecordValue, Schema} from '@coveo/bueno';
import {Engine} from '../../app/headless-engine';
import {getQueryInitialState} from '../../features/query/query-state';
import {
  restoreSearchParameters,
  SearchParameters,
} from '../../features/search-parameters/search-parameter-actions';
import {searchParametersDefinition} from '../../features/search-parameters/search-parameter-schema';
import {SearchParametersState} from '../../state/search-app-state';
import {validateInitialState} from '../../utils/validate-payload';
import {buildController} from '../controller/headless-controller';

export interface SearchParameterManagerProps {
  initialState: SearchParameterManagerInitialState;
}

interface SearchParameterManagerInitialState {
  parameters: SearchParameters;
}

const initialStateSchema = new Schema<
  Required<SearchParameterManagerInitialState>
>({
  parameters: new RecordValue({
    options: {required: true},
    values: searchParametersDefinition,
  }),
});

/** The `SearchParameterManager` controller allows restoring parameters that affect the results from e.g. a url.*/
export type SearchParameterManager = ReturnType<
  typeof buildSearchParameterManager
>;

/** The state relevant to the `SearchParameterManager` controller.*/
export type SearchParameterManagerState = SearchParameterManager['state'];

export function buildSearchParameterManager(
  engine: Engine<Partial<SearchParametersState>>,
  props: SearchParameterManagerProps
) {
  const {dispatch} = engine;
  const controller = buildController(engine);

  validateInitialState(
    initialStateSchema,
    props.initialState,
    buildSearchParameterManager.name
  );
  dispatch(restoreSearchParameters(props.initialState.parameters));

  return {
    ...controller,

    get state() {
      const state = engine.state;
      const parameters: SearchParameters = {
        ...getQ(state),
        ...getEnableQuerySyntax(state),
      };

      return {parameters};
    },
  };
}

function getQ(state: Partial<SearchParametersState>) {
  if (state.query === undefined) {
    return {};
  }

  const q = state.query.q;
  const shouldInclude = q !== getQueryInitialState().q;
  return shouldInclude ? {q} : {};
}

function getEnableQuerySyntax(state: Partial<SearchParametersState>) {
  if (state.query === undefined) {
    return {};
  }

  const enableQuerySyntax = state.query.enableQuerySyntax;
  const shouldInclude =
    enableQuerySyntax !== getQueryInitialState().enableQuerySyntax;
  return shouldInclude ? {enableQuerySyntax} : {};
}
