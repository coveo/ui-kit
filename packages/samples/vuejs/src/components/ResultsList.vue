<script setup lang="ts">
import {onMounted} from 'vue';
import resultTemplate from '../templates/result-template.html?raw';

onMounted(initializeResults);

// TODO: get these types from atomic package
interface RenderFunction {
  (): HTMLElement;
}

interface AtomicResultList extends HTMLElement {
  setRenderFunction: (arg: RenderFunction) => void;
}

async function initializeResults() {
  await customElements.whenDefined('atomic-result-list');
  await customElements.whenDefined('atomic-result-section-title');
  const atomicResultList = document.querySelector(
    'atomic-result-list'
  ) as AtomicResultList;

  atomicResultList.setRenderFunction(() => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = resultTemplate;
    return wrapper;
  });
}
</script>

<template>
  <div class="results">
    <atomic-did-you-mean></atomic-did-you-mean>
    <atomic-result-list
      fields-to-include="ec_price,ec_rating,ec_images,ec_brand,cat_platform,cat_condition,cat_categories,cat_review_count,cat_color"
      display="grid"
      image-size="large"
    >
    </atomic-result-list>
    <div class="pagination">
      <atomic-load-more-results></atomic-load-more-results>
    </div>
    <div class="status">
      <atomic-query-error></atomic-query-error>
      <atomic-no-results></atomic-no-results>
    </div>
  </div>
</template>
