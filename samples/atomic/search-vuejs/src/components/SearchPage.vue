<script setup lang="ts">
/** biome-ignore-all lint/correctness/noUnusedImports: <> */
import {onMounted} from 'vue';
import ResultsList from './ResultsList.vue';
import SearchPageFacets from './SearchPageFacets.vue';
import TopBar from './TopBar.vue';

async function initInterface() {
  await customElements.whenDefined('atomic-search-interface');
  const searchInterface = document.querySelector(
    'atomic-search-interface'
  ) as HTMLAtomicSearchInterfaceElement;

  // Initialization
  await searchInterface.initialize({
    accessToken: 'xxc23ce82a-3733-496e-b37e-9736168c4fd9',
    organizationId: 'electronicscoveodemocomo0n2fu8v',
  });

  // Trigger a first search
  searchInterface.executeFirstSearch();
}

onMounted(initInterface);
</script>

<template>
  <atomic-search-interface search-hub="UI_KIT_E2E" pipeline="UI_KIT_E2E" fields-to-include='["ec_price","ec_rating","ec_images","ec_brand","cat_platform","cat_condition","cat_categories","cat_review_count","cat_color"]'>
    <atomic-search-layout>
      <atomic-layout-section section="search">
        <atomic-search-box></atomic-search-box>
      </atomic-layout-section>
      <atomic-layout-section section="facets">
        <SearchPageFacets />
      </atomic-layout-section>
      <atomic-layout-section section="main">
        <atomic-layout-section section="status">
          <atomic-breadbox></atomic-breadbox>
          <TopBar />
        </atomic-layout-section>
        <atomic-layout-section section="pagination">
          <ResultsList />
        </atomic-layout-section>
      </atomic-layout-section>
    </atomic-search-layout>
  </atomic-search-interface>
</template>
