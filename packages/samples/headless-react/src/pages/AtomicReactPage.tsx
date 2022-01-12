import {
  AtomicResultList,
  AtomicSearchBox,
  AtomicSearchInterface,
  AtomicFacet,
  buildSearchEngine,
  getSampleSearchEngineConfiguration,
  AtomicResultTemplate,
  AtomicResultLink,
  AtomicResultBadge,
  AtomicResultSectionBadges,
  AtomicResultSectionTitle,
} from '@coveo/atomic-react';

export function AtomicReactPage() {
  const engine = buildSearchEngine({
    configuration: getSampleSearchEngineConfiguration(),
  });
  return (
    <AtomicSearchInterface engine={engine}>
      <AtomicSearchBox />
      <AtomicFacet field="source" label="Sources" />
      <AtomicFacet field="objecttype" label="Object type" />
      <AtomicResultList>
        <AtomicResultTemplate
          mustMatch={{
            objecttype: ['Account', 'File'],
            source: ['Coveo Samples - Dynamics 365'],
          }}
          mustNotMatch={{
            sourcetype: ['YouTube'],
          }}
        >
          <AtomicResultSectionBadges>
            <AtomicResultBadge field="source"></AtomicResultBadge>
          </AtomicResultSectionBadges>
          <AtomicResultSectionTitle>
            <AtomicResultLink></AtomicResultLink>
          </AtomicResultSectionTitle>
        </AtomicResultTemplate>
      </AtomicResultList>
    </AtomicSearchInterface>
  );
}
