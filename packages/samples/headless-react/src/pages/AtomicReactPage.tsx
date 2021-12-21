import {
  AtomicResultList,
  AtomicSearchBox,
  AtomicSearchInterfaceWrapper,
} from '@coveo/atomic-react';

export function AtomicReactPage() {
  return (
    <AtomicSearchInterfaceWrapper>
      <AtomicSearchBox />
      <AtomicResultList />
    </AtomicSearchInterfaceWrapper>
  );
}
