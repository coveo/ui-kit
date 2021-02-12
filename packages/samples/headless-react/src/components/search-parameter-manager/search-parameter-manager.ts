import {
  buildSearchParameterManager,
  buildSearchParameterSerializer,
  Engine,
} from '@coveo/headless';

const {serialize, deserialize} = buildSearchParameterSerializer();

function readSearchParametersFromURI() {
  return deserialize(decodeURIComponent(window.location.hash.slice(1)));
}

type SearchParameters = ReturnType<typeof readSearchParametersFromURI>;

function writeSearchParametersToURI(searchParameters: SearchParameters) {
  window.location.hash = serialize(searchParameters);
}

export function bindSearchParametersToURI(engine: Engine) {
  const searchParameterManager = buildSearchParameterManager(engine, {
    initialState: {parameters: readSearchParametersFromURI()},
  });

  return {
    autoUpdateURI: () =>
      searchParameterManager.subscribe(() =>
        writeSearchParametersToURI(searchParameterManager.state.parameters)
      ),
  };
}
