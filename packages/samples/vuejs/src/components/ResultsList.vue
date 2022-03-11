<script setup lang="ts">
import resultTemplate from '../templates/result-template.html?raw';
</script>

<template>
  <div class="results">
    <atomic-did-you-mean></atomic-did-you-mean>
    <atomic-result-list
      fields-to-include="ec_price,ec_rating,ec_images,ec_brand,cat_platform,cat_condition,cat_categories,cat_review_count,cat_color"
      display="grid"
      image-size="large"
    >
      <atomic-result-template v-html="resultTemplate"> </atomic-result-template>
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
