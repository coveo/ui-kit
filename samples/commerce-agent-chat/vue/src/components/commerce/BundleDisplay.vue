<script setup lang="ts">
import {ref, watchEffect} from 'vue';
import type {BundleTierConfig, Product} from '@core/types/commerce.js';

interface BundleSlotWithProduct {
  categoryLabel: string;
  surfaceRef: string;
  product: Product | null;
}

export interface BundleTierWithProducts extends Omit<
  BundleTierConfig,
  'slots'
> {
  slots: BundleSlotWithProduct[];
}

const props = defineProps<{
  title: string;
  bundles: BundleTierWithProducts[];
  isLoading?: boolean;
}>();

interface BundleDisplayElement extends HTMLElement {
  heading: string;
  bundles: BundleTierWithProducts[];
  isLoading: boolean;
}

const elementRef = ref<BundleDisplayElement | null>(null);

watchEffect(() => {
  if (elementRef.value) {
    elementRef.value.heading = props.title;
    elementRef.value.bundles = props.bundles;
    elementRef.value.isLoading = props.isLoading ?? false;
  }
});
</script>

<template>
  <cac-bundle-display ref="elementRef" />
</template>
