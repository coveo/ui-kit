import {waitForAtomic} from '../utils/atomic';

async function main() {
  await waitForAtomic();
  await customElements.whenDefined('atomic-search-interface');
  const searchInterface: HTMLAtomicSearchInterfaceElement =
    document.querySelector('atomic-search-interface')!;
  await searchInterface.initialize({
    organizationId: 'barcagroupproductionkwvdy6lp',
    accessToken: 'xxfbc21fae-f1ee-45f9-8a7a-a7de938e0e05',
  });

  searchInterface.executeFirstSearch();
}

export default main;
