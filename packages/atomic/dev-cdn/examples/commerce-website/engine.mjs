import {
  buildCommerceEngine,
  getSampleCommerceEngineConfiguration,
} from 'http://localhost:3000/headless/v0.0.0/commerce/headless.esm.js';
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
