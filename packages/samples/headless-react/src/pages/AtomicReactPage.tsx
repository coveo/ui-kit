import {
  AtomicResultList,
  AtomicSearchBox,
  AtomicSearchInterface,
} from '@coveo/atomic-react';
import {useEffect, useRef} from 'react';

export function AtomicReactPage() {
  const searchInterface = useRef<HTMLAtomicSearchInterfaceElement>(null);

  useEffect(() => {
    init(searchInterface.current!);
  }, []);

  return (
    <AtomicSearchInterface ref={searchInterface}>
      <AtomicSearchBox />
      <AtomicResultList />
    </AtomicSearchInterface>
  );
}

async function init(searchInterface: HTMLAtomicSearchInterfaceElement) {
  await searchInterface.initialize({
    accessToken: 'xx564559b1-0045-48e1-953c-3addd1ee4457',
    organizationId: 'searchuisamples',
  });

  searchInterface.executeFirstSearch();
}
