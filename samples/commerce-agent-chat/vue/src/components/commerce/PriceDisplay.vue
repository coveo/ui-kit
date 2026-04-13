<script setup lang="ts">
import {ref, watchEffect} from 'vue';
import type {Product} from '@core/types/commerce.js';

const props = defineProps<{product: Product}>();

interface PriceDisplayElement extends HTMLElement {
  product: Product;
}

const elementRef = ref<PriceDisplayElement | null>(null);

watchEffect(() => {
  if (elementRef.value) {
    elementRef.value.product = props.product;
  }
});
</script>

<template>
  <cac-price-display ref="elementRef" />
</template>
