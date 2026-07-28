import {buildCommerceEngine, getSampleCommerceEngineConfiguration} from '@coveo/headless/commerce';

/**
 * Builds a commerce engine bound to a given catalog `view` URL, using the
 * public `barca` sample commerce configuration (safe to share). The `view.url`
 * identifies the current page: for a product listing it selects which listing
 * to load; for search it identifies the commerce-search page.
 */
export function buildEngine(viewUrl: string) {
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
