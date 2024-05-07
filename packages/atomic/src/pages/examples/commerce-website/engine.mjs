import {navContent} from './commerce-nav.mjs';
import {
  getOrganizationEndpoints,
  buildRecommendations,
  buildProductListing,
  buildCart,
} from '/build/headless/commerce/headless.esm.js';

export const commerceEngineConfig = {
  accessToken: 'xxc481d5de-16cb-4290-bd78-45345319d94c',
  organizationId: 'barcasportsmcy01fvu',
  organizationEndpoints: await getOrganizationEndpoints(
    'barcasportsmcy01fvu',
    'dev'
  ),
  analytics: {
    trackingId: 'sports',
  },
  context: {
    language: 'en',
    country: 'US',
    currency: 'USD',
    view: {
      url: navContent[document.title].barcaUrl,
      referrer: document.referrer,
    },
  },
};

export const setupRecommendationsMostPurchased = (engine) => {
  const recommendationsMostPurchased = buildRecommendations(engine, {
    options: {
      slotId: '573ae88e-37ae-456f-a949-829164ad7a84',
    },
  });
  recommendationsMostPurchased.refresh();
  return recommendationsMostPurchased;
};

export const setupRecommendationsMostViewed = (engine) => {
  const recommendationsMostViewed = buildRecommendations(engine, {
    options: {
      slotId: 'e098ca76-e7de-4488-b818-c87fbce35542',
    },
  });
  recommendationsMostViewed.refresh();
  return recommendationsMostViewed;
};

export const setupProductListing = (engine) => {
  const productListing = buildProductListing(engine);
  productListing.refresh();
  return productListing;
};

export const setupCart = (engine) => {
  const cart = buildCart(engine);
  return cart;
};

export const renderProducts = (elem, title, products) => {
  if (!products.length) {
    document.querySelector(elem).innerHTML = 'No products found.';
    return;
  }
  document.querySelector(elem).innerHTML =
    `<h2>${title}</h2>` +
    products
      .map((product) => {
        return `<span><a href='${product.clickUri}'><img width="100px" src='${product.ec_images[0]}'>${product.ec_name}</a></span>`;
      })
      .join('');

  return products
    .map((product) => {
      return `<div>${product.name}</div>`;
    })
    .join('');
};
