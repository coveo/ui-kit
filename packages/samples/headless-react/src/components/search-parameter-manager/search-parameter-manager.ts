import {
  buildSearchParameterManager,
  buildSearchParameterSerializer,
  HeadlessEngine,
  searchAppReducers,
} from '@coveo/headless';

const {serialize, deserialize} = buildSearchParameterSerializer();

/**
 * Search parameters should not be restored until all components are registered.
 *
 * Additionally, a search should not be executed until search parameters are restored.
 */
export function bindSearchParametersToURI(
  engine: HeadlessEngine<typeof searchAppReducers>
) {
  const hash = window.location.hash.slice(1);
  const parameters = deserialize(decodeURIComponent(hash));

  const searchParameterManager = buildSearchParameterManager(engine!, {
    initialState: {parameters},
  });

  return {
    autoUpdateURI: () =>
      searchParameterManager.subscribe(() => {
        window.location.hash = serialize(
          searchParameterManager.state.parameters
        );
      }),
  };
}
