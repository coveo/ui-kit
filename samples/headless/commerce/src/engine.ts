import {
  buildCommerceEngine,
  getSampleCommerceEngineConfiguration,
} from '@coveo/headless/commerce';

function createEngine(viewUrl: string) {
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

export function createSearchEngine() {
  return createEngine('https://sports.barca.group/search');
}

export function createListingEngine() {
  return createEngine(
    'https://sports.barca.group/browse/promotions/ui-kit-testing'
  );
}
