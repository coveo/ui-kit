import {
  buildConverseController,
  buildGenerativeInterface,
  Engine,
} from '@coveo/thermidor';
import {getSampleConfiguration} from './env.js';

function getClientId() {
  const stored = sessionStorage.getItem('generative-client-id');
  if (stored) {
    return stored;
  }
  const id = crypto.randomUUID();
  sessionStorage.setItem('generative-client-id', id);
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
  configuration: {
    ...configuration,
    a2uiVersion: '0.8',
  },
  navigatorContextProvider: getNavigatorContext,
});

const generativeInterface = buildGenerativeInterface({engine});

export const converseController = buildConverseController({
  interface: generativeInterface,
});
