import {
  type CommerceEngineDefinitionOptions,
  defineCommerceEngine,
  defineParameterManager,
  defineProductList,
  defineSearchBox,
  defineSummary,
  getSampleCommerceEngineConfiguration,
} from '@coveo/headless/ssr-commerce-next';

function createNavigatorContext() {
  const isBrowser = typeof window !== 'undefined';

  return {
    clientId: '',
    capture: false, // Disabled for demo
    location: isBrowser ? window.location.href : 'http://localhost:3000',
    referrer: '',
    userAgent: isBrowser ? window.navigator.userAgent : 'minimal-sample',
  };
}

const config: CommerceEngineDefinitionOptions = {
  configuration: getSampleCommerceEngineConfiguration(),
  navigatorContextProvider: createNavigatorContext,
  controllers: {
    productList: defineProductList(),
    summary: defineSummary(),
    searchBox: defineSearchBox(),
    parameterManager: defineParameterManager(),
  },
};

export const engineDefinition = defineCommerceEngine(config);

export type EngineDefinition = typeof engineDefinition.searchEngineDefinition;
