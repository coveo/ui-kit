import {navContent} from './commerce-nav.mjs';

const {buildCommerceEngine, getSampleCommerceEngineConfiguration} =
  await (import.meta.env
    ? import('@coveo/headless/commerce')
    : import('http://localhost:3000/headless/v0.0.0/commerce/headless.esm.js'));

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
