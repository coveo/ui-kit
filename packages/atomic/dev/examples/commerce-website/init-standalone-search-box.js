import {commerceEngine} from './engine.mjs';

void (async () => {
  await customElements.whenDefined('atomic-commerce-interface');
  const searchBox = document.querySelector('atomic-commerce-interface');
  await searchBox.initializeWithEngine(commerceEngine);
})();
