import {
  buildSearchBoxController,
  buildCommerceInterface,
  buildProductListController,
  buildPaginationController,
  Engine,
} from '@coveo/thermidor';
import {getSampleConfiguration} from './env.js';

function getClientId() {
  const stored = sessionStorage.getItem('commerce-client-id');
  if (stored) {
    return stored;
  }
  const id = crypto.randomUUID();
  sessionStorage.setItem('commerce-client-id', id);
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

const commerceInterface = buildCommerceInterface({engine});

export const searchBoxController = buildSearchBoxController({
  interface: commerceInterface,
});

export const productListController = buildProductListController({
  interface: commerceInterface,
});

export const paginationController = buildPaginationController({
  interface: commerceInterface,
});
