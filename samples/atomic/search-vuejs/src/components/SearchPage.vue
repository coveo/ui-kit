<script setup lang="ts">
/* oxlint-disable @typescript-eslint/no-unused-vars -- <> */
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
    accessToken: 'xx564559b1-0045-48e1-953c-3addd1ee4457',
    organizationId: 'searchuisamples',
  });

  // Trigger a first search
  searchInterface.executeFirstSearch();
}

onMounted(initInterface);
</script>

<template>
  <atomic-search-interface>
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
