import {buildSearchInterface, Engine} from '@coveo/thermidor';
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

export const searchInterface = buildSearchInterface({engine});
