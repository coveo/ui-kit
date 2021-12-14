import {
  AtomicResultList,
  AtomicSearchBox,
  AtomicSearchInterface,
} from '@coveo/atomic-react';
import {useEffect} from 'react';

export function AtomicReactPage() {
  useEffect(() => {
    init();
  }, []);

  return (
    <AtomicSearchInterface>
      <AtomicSearchBox />
      <AtomicResultList />
    </AtomicSearchInterface>
  );
}

async function init() {
  await customElements.whenDefined('atomic-search-interface');
  const searchInterface = document.querySelector('atomic-search-interface');

  if (!searchInterface) {
    console.log('failed to initialize. atomic-search-interface not found');
    return;
  }

  await searchInterface.initialize({
    accessToken: 'xx564559b1-0045-48e1-953c-3addd1ee4457',
    organizationId: 'searchuisamples',
  });

  searchInterface.executeFirstSearch();
}
