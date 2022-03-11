<script setup lang="ts">
import {onMounted} from 'vue';
import TopBar from './TopBar.vue';
import SearchPageFacets from './SearchPageFacets.vue';
import ResultsList from './ResultsList.vue';

// TODO: get these types from atomic package
interface InitializationOptions {
  organizationId: string;
  accessToken: string;
}

interface HTMLAtomicSearchInterfaceElement extends HTMLElement {
  initialize: (options: InitializationOptions) => Promise<void>;
  executeFirstSearch(): Promise<void>;
}

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
  <atomic-search-interface search-hub="MainSearch" pipeline="Search">
    <div class="search">
      <atomic-search-box></atomic-search-box>
    </div>
    <SearchPageFacets />
    <atomic-breadbox></atomic-breadbox>
    <TopBar />
    <ResultsList />
  </atomic-search-interface>
</template>
