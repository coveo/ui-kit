import {waitForAtomic} from '../utils/atomic';

async function main() {
  await waitForAtomic();
  await customElements.whenDefined('atomic-search-interface');
  const searchInterface: HTMLAtomicSearchInterfaceElement =
    document.querySelector('atomic-search-interface')!;
  await searchInterface.initialize({
    organizationId: 'searchuisamples',
    // This API key is intentionally public — it belongs to a sample organization used for samples/docs.
    accessToken: 'xx564559b1-0045-48e1-953c-3addd1ee4457',
  });

  searchInterface.executeFirstSearch();
}

export default main;
