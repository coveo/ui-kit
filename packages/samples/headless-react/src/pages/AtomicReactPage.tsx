import {
  AtomicResultList,
  AtomicSearchBox,
  AtomicSearchInterface,
  AtomicFacet,
  buildSearchEngine,
  getSampleSearchEngineConfiguration,
} from '@coveo/atomic-react';

export function AtomicReactPage() {
  const engine = buildSearchEngine({
    configuration: getSampleSearchEngineConfiguration(),
  });
  return (
    <AtomicSearchInterface engine={engine}>
      <AtomicSearchBox />
      <AtomicFacet field="objecttype" label="Object type" />
      <AtomicResultList />
    </AtomicSearchInterface>
  );
}
