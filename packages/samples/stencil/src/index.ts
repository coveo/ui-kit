import {getSampleSearchEngineConfiguration} from '@coveo/atomic/headless';

async function main() {
  await customElements.whenDefined('atomic-search-interface');
  const searchInterface: HTMLAtomicSearchInterfaceElement =
    document.querySelector('atomic-search-interface')!;

  await searchInterface.initialize(getSampleSearchEngineConfiguration());

  searchInterface.executeFirstSearch();
}

main();
