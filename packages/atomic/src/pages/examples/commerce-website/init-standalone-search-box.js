import {commerceEngineConfig} from './engine.mjs';

(async () => {
  await customElements.whenDefined('atomic-commerce-interface');
  const searchBox = document.getElementById('standaloneSearchBox');
  await searchBox.initialize(commerceEngineConfig);
})();
