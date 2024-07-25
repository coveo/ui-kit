import {navContent} from './commerce-nav.mjs';
import {
  buildCommerceEngine,
  getSampleCommerceEngineConfiguration,
} from '/build/headless/commerce/headless.esm.js';

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
