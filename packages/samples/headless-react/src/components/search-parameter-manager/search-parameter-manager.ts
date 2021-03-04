import {
  AnalyticsActions,
  buildSearchParameterManager,
  buildSearchParameterSerializer,
  Engine,
  SearchActions,
} from '@coveo/headless';

const {serialize, deserialize} = buildSearchParameterSerializer();

export function bindSearchParametersToURI(
  engine: Engine,
  options: {executeInitialSearch: boolean}
) {
  const hash = window.location.hash.slice(1);
  const parameters = deserialize(decodeURIComponent(hash));

  const searchParameterManager = buildSearchParameterManager(engine, {
    initialState: {parameters},
  });

  if (options.executeInitialSearch) {
    engine.dispatch(
      SearchActions.executeSearch(AnalyticsActions.logInterfaceLoad())
    );
  }

  return {
    autoUpdateURI: () =>
      searchParameterManager.subscribe(() => {
        window.location.hash = serialize(
          searchParameterManager.state.parameters
        );
      }),
  };
}
