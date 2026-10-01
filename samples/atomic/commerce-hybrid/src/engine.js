import {buildCommerceEngine, getSampleCommerceEngineConfiguration} from '@coveo/headless/commerce';

/**
 * Builds a commerce engine bound to a given catalog `view` URL, using the
 * public `barca` sample commerce configuration (safe to share).
 *
 * In this hybrid sample the engine is the single integration point: it is what
 * `atomic-commerce-interface` is initialized with, and it is what the custom
 * Headless search box dispatches into. Nothing else couples the two.
 *
 * To use this sample as an MRE, replace the returned configuration with your own
 * `organizationId`/`accessToken` and your catalog URLs.
 */
export function buildEngine(viewUrl) {
  const {context, ...rest} = getSampleCommerceEngineConfiguration();
  return buildCommerceEngine({
    configuration: {
      ...rest,
      context: {
        ...context,
        view: {url: viewUrl},
      },
    },
  });
}
