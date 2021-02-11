import {buildSearchParameterSerializer} from '@coveo/headless';

const {serialize, deserialize} = buildSearchParameterSerializer();

export function readSearchParametersFromURI() {
  return deserialize(decodeURIComponent(window.location.hash.slice(1)));
}

type SearchParameters = ReturnType<typeof readSearchParametersFromURI>;

export function writeSearchParametersToURI(searchParameters: SearchParameters) {
  window.location.hash = serialize(searchParameters);
}
