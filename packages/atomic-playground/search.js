import {defineCustomElements} from '@coveo/atomic/loader';
import '@coveo/atomic/themes/coveo.css';

const sampleOrganization = {
  organizationId: 'searchuisamples',
  // This API key is intentionally public — it belongs to a sample organization used for samples/docs.
  accessToken: 'xx564559b1-0045-48e1-953c-3addd1ee4457',
};

defineCustomElements();

await customElements.whenDefined('atomic-search-interface');

const searchInterface = document.querySelector('atomic-search-interface');
await searchInterface.initialize(sampleOrganization);
searchInterface.executeFirstSearch();
