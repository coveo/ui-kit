<script setup lang="ts">
import {ref, watchEffect} from 'vue';
import type {Product} from '@core/types/commerce.js';

export interface ProductSection {
  heading: string;
  products: Product[];
}

const props = defineProps<{
  sections: ProductSection[];
  isLoading?: boolean;
}>();

interface ProductCarouselElement extends HTMLElement {
  sections: ProductSection[];
  isLoading: boolean;
}

const elementRef = ref<ProductCarouselElement | null>(null);

watchEffect(() => {
  if (elementRef.value) {
    elementRef.value.sections = props.sections;
    elementRef.value.isLoading = props.isLoading ?? false;
  }
});
</script>

<template>
  <cac-product-carousel ref="elementRef" />
</template>
