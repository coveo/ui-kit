import {
  buildSearchParameterManager,
  buildSearchParameterSerializer,
  Engine,
} from '@coveo/headless';

const {serialize, deserialize} = buildSearchParameterSerializer();

export function bindSearchParametersToURI(engine: Engine) {
  const hash = window.location.hash.slice(1);
  const parameters = deserialize(decodeURIComponent(hash));

  const searchParameterManager = buildSearchParameterManager(engine, {
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
