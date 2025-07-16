import type {} from '@coveo/atomic';

async function main() {
  await customElements.whenDefined('atomic-search-interface');
  const searchInterface: HTMLAtomicSearchInterfaceElement =
    document.querySelector('atomic-search-interface')!;
  await searchInterface.initialize({
    organizationId: 'barcagroupproductionkwvdy6lp',
    accessToken: 'xxfbc21fae-f1ee-45f9-8a7a-a7de938e0e05',
    organizationEndpoints: await searchInterface.getOrganizationEndpoints(
      'barcagroupproductionkwvdy6lp'
    ),
  });

  searchInterface.executeFirstSearch();
}

export default main;
