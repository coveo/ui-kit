<script setup lang="ts">
import {onMounted} from 'vue';

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
    accessToken: 'xx564559b1-0045-48e1-953c-3addd1ee4457',
    organizationId: 'searchuisamples',
  });

  // Trigger a first search
  searchInterface.executeFirstSearch();
}

const resultTemplate = `
      <template>
        <p>Title:</p>
        <atomic-result-link></atomic-result-link>
      </template>`;

onMounted(initInterface);
</script>

<template>
  <atomic-search-interface>
    <div class="facets">
      <atomic-facet field="author" label="Author"></atomic-facet>
    </div>
    <div class="main">
      <atomic-query-summary></atomic-query-summary>
      <atomic-result-list>
        <atomic-result-template v-html="resultTemplate">
        </atomic-result-template>
      </atomic-result-list>
    </div>
  </atomic-search-interface>
</template>
