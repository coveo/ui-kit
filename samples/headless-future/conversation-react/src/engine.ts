import {buildCartController, Engine} from '@coveo/headless-future';
import {getSampleConfiguration} from './env.js';

let clientId: string | null = null;

function getClientId() {
  if (clientId) {
    return clientId;
  }

  const generatedId =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  clientId = generatedId;
  return generatedId;
}

function getNavigatorContext() {
  return {
    clientId: getClientId(),
    location: window.location.href,
    referrer: document.referrer || null,
    userAgent: window.navigator.userAgent || null,
  };
}

export function buildSampleEngine() {
  const configuration = getSampleConfiguration();
  const engine = new Engine({
    configuration,
    navigatorContextProvider: getNavigatorContext,
  });

  const cartController = buildCartController({engine});
  cartController.setItems({items: []});

  return engine;
}
