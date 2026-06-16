import {
  buildConverseController,
  buildGenerativeInterface,
  buildProductListController,
  buildResultListController,
  Engine,
} from '@coveo/headless-future';
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
  configuration,
  navigatorContextProvider: getNavigatorContext,
});

const generativeInterface = buildGenerativeInterface({
  engine,
  options: {
    commerceSearchControllers: [buildProductListController],
    searchControllers: [buildResultListController],
  },
});

export const converseController = buildConverseController({
  interface: generativeInterface,
});
