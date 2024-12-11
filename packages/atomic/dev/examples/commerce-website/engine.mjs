import {
  buildCommerceEngine,
  getSampleCommerceEngineConfiguration,
} from '@coveo/headless/commerce';
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
