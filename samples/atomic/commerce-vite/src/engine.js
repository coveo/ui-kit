import {buildCommerceEngine, getSampleCommerceEngineConfiguration} from '@coveo/headless/commerce';

/**
 * Builds a commerce engine bound to a given catalog `view` URL, using the
 * public `barca` sample commerce configuration (safe to share).
 *
 * The `view.url` is how Commerce identifies the current page: for a product
 * listing it selects which listing to load, and for search it identifies the
 * commerce-search page. To use this sample as an MRE, replace the returned
 * configuration with your own `organizationId`/`accessToken` and your catalog
 * URLs.
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
