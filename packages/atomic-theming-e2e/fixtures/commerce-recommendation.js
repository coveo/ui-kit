import {buildCommerceEngine} from '@coveo/headless/commerce';

/**
 * The commerce recommendation interface only accepts a prebuilt engine, unlike the other
 * interfaces which expose `initialize`. Building it here keeps the Headless import in the
 * page, where Vite resolves it, rather than inside an evaluated browser callback.
 */
window.initializeCommerceRecommendations = async (configuration) => {
  const recommendationInterface = document.querySelector(
    'atomic-commerce-recommendation-interface'
  );
  await recommendationInterface.initializeWithEngine(buildCommerceEngine({configuration}));
};
