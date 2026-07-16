import {
  buildSearchBoxController,
  buildSearchInterface,
  buildResultListController,
  buildPaginationController,
  Engine,
} from '@coveo/thermidor';
import {getSampleConfiguration} from './env.js';

function getClientId() {
  const stored = sessionStorage.getItem('search-client-id');
  if (stored) {
    return stored;
  }
  const id = crypto.randomUUID();
  sessionStorage.setItem('search-client-id', id);
  return id;
}

function getNavigatorContext() {
  return {
    clientId: getClientId(),
    location: window.location.href,
    referrer: document.referrer || null,
    userAgent: window.navigator.userAgent || null,
  };
}

const configuration = getSampleConfiguration();

const engine = new Engine({
  configuration,
  navigatorContextProvider: getNavigatorContext,
});

const searchInterface = buildSearchInterface({engine});

export const searchBoxController = buildSearchBoxController({
  interface: searchInterface,
});

export const resultListController = buildResultListController({
  interface: searchInterface,
});

export const paginationController = buildPaginationController({
  interface: searchInterface,
});
