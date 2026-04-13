<script setup lang="ts">
import {computed} from 'vue';

import {
  extractActionsBySurface,
  extractCatalogComponents,
  extractProductsBySurface,
} from '@core/lib/commerceExtractor.js';
import {
  isType,
  isSupportedType,
  uniqueProducts,
} from '@core/lib/commerceHelpers.js';
import {
  getBundleProductsFromCache,
  updateBundleProductCache,
} from '@core/lib/bundleProductCache.js';
import type {A2UISurfaceContent, Product} from '@core/types/commerce.js';
import BundleDisplay, {type BundleTierWithProducts} from './BundleDisplay.vue';
import ComparisonSummary from './ComparisonSummary.vue';
import ComparisonTable from './ComparisonTable.vue';
import NextActionsBar from './NextActionsBar.vue';
import ProductCarousel, {type ProductSection} from './ProductCarousel.vue';

const props = defineProps<{
  content: A2UISurfaceContent;
  isLoading?: boolean;
}>();

const emit = defineEmits<{
  actionSelected: [prompt: string];
}>();

const model = computed(() => {
  const operations = props.content?.operations ?? [];
  const productsBySurface = extractProductsBySurface(operations);
  updateBundleProductCache(productsBySurface);

  const actionsBySurface = extractActionsBySurface(operations);
  const components = extractCatalogComponents(operations).filter((component) =>
    isSupportedType(component.type)
  );
  const allProducts = uniqueProducts(productsBySurface);

  const comparisonBySurface = new Map<string, Product[]>();
  for (const component of components) {
    if (!isType(component.type, 'ComparisonTable')) {
      continue;
    }
    const products =
      productsBySurface.get(component.surfaceId) ??
      getBundleProductsFromCache(component.surfaceId);
    comparisonBySurface.set(
      component.surfaceId,
      products.length > 0 ? products : allProducts
    );
  }

  const hasNextActionsComponent = components.some((component) =>
    isType(component.type, 'NextActionsBar')
  );

  return {
    productsBySurface,
    actionsBySurface,
    components,
    comparisonBySurface,
    hasNextActionsComponent,
  };
});

function getProducts(surfaceId: string): Product[] {
  return (
    model.value.productsBySurface.get(surfaceId) ??
    getBundleProductsFromCache(surfaceId)
  );
}

function buildBundles(
  component: (typeof model.value.components)[number]
): BundleTierWithProducts[] {
  return (component.bundles ?? []).map((bundle) => ({
    ...bundle,
    slots: bundle.slots.map((slot) => ({
      ...slot,
      surfaceRef: slot.surfaceRef.trim(),
      product: getProducts(slot.surfaceRef.trim())[0] ?? null,
    })),
  }));
}
</script>

<template>
  <section class="commerce-catalog">
    <template
      v-for="(component, index) in model.components"
      :key="`${component.type}-${component.surfaceId}-${index}`"
    >
      <ProductCarousel
        v-if="isType(component.type, 'ProductCarousel')"
        :sections="
          [
            {
              heading: component.heading,
              products: getProducts(component.surfaceId),
            },
          ] as ProductSection[]
        "
        :is-loading="
          (props.isLoading ?? false) &&
          getProducts(component.surfaceId).length === 0
        "
      />

      <ComparisonSummary
        v-else-if="isType(component.type, 'ComparisonSummary')"
        :text="component.text ?? ''"
      />

      <ComparisonTable
        v-else-if="isType(component.type, 'ComparisonTable')"
        :heading="component.heading"
        :products="model.comparisonBySurface.get(component.surfaceId) ?? []"
        :attributes="component.attributes ?? []"
        :is-loading="
          (props.isLoading ?? false) &&
          (model.comparisonBySurface.get(component.surfaceId)?.length ?? 0) ===
            0
        "
      />

      <BundleDisplay
        v-else-if="isType(component.type, 'BundleDisplay')"
        :title="component.title ?? component.heading"
        :bundles="buildBundles(component)"
        :is-loading="props.isLoading ?? false"
      />

      <NextActionsBar
        v-else-if="isType(component.type, 'NextActionsBar')"
        :actions="model.actionsBySurface.get(component.surfaceId) ?? []"
        :is-loading="
          (props.isLoading ?? false) &&
          (model.actionsBySurface.get(component.surfaceId)?.length ?? 0) === 0
        "
        @action-click="emit('actionSelected', $event)"
      />
    </template>

    <NextActionsBar
      v-if="(props.isLoading ?? false) && !model.hasNextActionsComponent"
      :actions="[]"
      :is-loading="true"
      @action-click="emit('actionSelected', $event)"
    />
  </section>
</template>

<style scoped>
.commerce-catalog {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
</style>
