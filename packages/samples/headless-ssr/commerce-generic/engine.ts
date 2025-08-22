import {
  type CommerceEngineDefinitionOptions,
  defineCommerceEngine,
  defineParameterManager,
  defineProductList,
  defineSearchBox,
  defineSummary,
  getSampleCommerceEngineConfiguration,
} from '@coveo/headless/ssr-commerce-next';

const config: CommerceEngineDefinitionOptions = {
  configuration: getSampleCommerceEngineConfiguration(),
  navigatorContextProvider: () => ({
    clientId: '',
    capture: false, // Disabled for demo
    location:
      typeof window !== 'undefined'
        ? window.location.href
        : 'http://localhost:3000',
    referrer: '',
    userAgent:
      typeof window !== 'undefined'
        ? window.navigator.userAgent
        : 'minimal-sample',
  }),
  controllers: {
    productList: defineProductList(),
    summary: defineSummary(),
    searchBox: defineSearchBox(),
    parameterManager: defineParameterManager(),
  },
};

export const engineDefinition = defineCommerceEngine(config);
