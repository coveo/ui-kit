import {defineCustomElements} from '@coveo/atomic/loader';
import '@coveo/atomic/themes/coveo.css';
import './components/add-to-cart-button.js';
import './components/mini-cart.js';
import {buildEngine} from './engine.js';
import {rememberClickedProducts} from './product-handoff.js';

/**
 * What every page does first: build one engine for the page, initialize every
 * Atomic interface on it, and bind the Headless elements that live outside those
 * interfaces.
 *
 * The custom elements are defined by the imports above, before any Atomic
 * interface renders a product template, so the add-to-cart buttons inside
 * product cards upgrade as soon as the cards render.
 */
export async function startPage(viewUrl: string) {
  defineCustomElements();
  rememberClickedProducts();

  const engine = await buildEngine(viewUrl);
  document.querySelector('mini-cart')?.initialize(engine);

  // Atomic loads components lazily, only for tags present on the page, so wait for
  // each interface's own tag rather than for every interface type.
  const atomicInterfaces = [
    ...document.querySelectorAll('atomic-commerce-interface'),
    ...document.querySelectorAll('atomic-commerce-recommendation-interface'),
  ];
  await Promise.all(
    atomicInterfaces.map(async (atomicInterface) => {
      await customElements.whenDefined(atomicInterface.localName);
      await atomicInterface.initializeWithEngine(engine);
    })
  );

  return engine;
}
