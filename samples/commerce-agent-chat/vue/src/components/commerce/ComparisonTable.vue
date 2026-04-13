<script setup lang="ts">
import {ref, watchEffect} from 'vue';
import type {Product} from '@core/types/commerce.js';

const props = defineProps<{
  heading: string;
  products: Product[];
  attributes?: string[];
  isLoading?: boolean;
}>();

interface ComparisonTableElement extends HTMLElement {
  heading: string;
  products: Product[];
  comparisonAttributes: string[];
  isLoading: boolean;
}

const elementRef = ref<ComparisonTableElement | null>(null);

watchEffect(() => {
  if (elementRef.value) {
    elementRef.value.heading = props.heading;
    elementRef.value.products = props.products;
    elementRef.value.comparisonAttributes = props.attributes ?? [];
    elementRef.value.isLoading = props.isLoading ?? false;
  }
});
</script>

<template>
  <cac-comparison-table ref="elementRef" />
</template>
