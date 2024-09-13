import {
  buildCommerceEngine,
  getSampleCommerceEngineConfiguration,
} from 'https://static.cloud.coveo.com/headless/v2/commerce/headless.esm.js';
import {navContent} from './commerce-nav.mjs';

const {context, ...restOfConfiguration} =
  getSampleCommerceEngineConfiguration();

export const commerceEngine = buildCommerceEngine({
  configuration: {
    context: {
      ...context,
      view: {
        url: navContent[document.title].barcaUrl,
      },
    },
    ...restOfConfiguration,
  },
});
