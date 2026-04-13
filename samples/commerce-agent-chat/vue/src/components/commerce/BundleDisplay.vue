<script setup lang="ts">
import {ref} from 'vue';
import type {BundleTierConfig, Product} from '@core/types/commerce.js';
import PriceDisplay from './PriceDisplay.vue';

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

const activeIndex = ref(0);
</script>

<template>
  <div
    v-if="props.bundles.length === 0 && (props.isLoading ?? false)"
    class="bundle-display"
    aria-busy="true"
  >
    <h3 class="commerce-heading">{{ title }}</h3>
    <div class="bundle-slots">
      <div
        v-for="i in 3"
        :key="`bundle-skeleton-${i}`"
        class="bundle-slot"
        aria-hidden="true"
      >
        <div class="commerce-loading commerce-loading--line" />
        <div class="commerce-loading commerce-loading--image" />
        <div
          class="commerce-loading commerce-loading--line commerce-loading--line-wide"
        />
      </div>
    </div>
  </div>

  <div v-else-if="props.bundles.length > 0" class="bundle-display">
    <h3 class="commerce-heading">{{ title }}</h3>
    <div
      v-if="props.bundles.length > 1"
      class="bundle-tabs"
      role="tablist"
      aria-label="Bundle tiers"
    >
      <button
        v-for="(bundle, i) in props.bundles"
        :key="bundle.bundleId"
        type="button"
        role="tab"
        :aria-selected="i === activeIndex"
        :class="['bundle-tab', {' bundle-tab--active': i === activeIndex}]"
        @click="activeIndex = i"
      >
        {{ bundle.label }}
      </button>
    </div>

    <div
      v-for="(bundle, i) in props.bundles"
      v-show="i === activeIndex"
      :key="`${bundle.bundleId}-${i}`"
      role="tabpanel"
    >
      <p v-if="bundle.description" class="bundle-description">
        {{ bundle.description }}
      </p>
      <div class="bundle-slots">
        <div
          v-for="(slot, j) in bundle.slots"
          :key="`${slot.surfaceRef}-${j}`"
          class="bundle-slot"
        >
          <p class="bundle-slot__label">{{ slot.categoryLabel }}</p>
          <template v-if="slot.product">
            <img
              v-if="slot.product.ec_image"
              :src="slot.product.ec_image"
              :alt="slot.product.ec_name"
              class="bundle-slot__image"
            />
            <p class="bundle-slot__name">{{ slot.product.ec_name }}</p>
            <p class="bundle-slot__brand">{{ slot.product.ec_brand }}</p>
            <PriceDisplay :product="slot.product" />
          </template>
          <p v-else class="text-muted">Product not available</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bundle-display {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.bundle-tabs {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.bundle-tab {
  padding: 0.4rem 0.9rem;
  border: 2px solid rgba(0, 212, 255, 0.3);
  border-radius: 10px;
  background: rgba(22, 45, 66, 0.5);
  color: var(--ink);
  font: inherit;
  font-size: 0.84rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.bundle-tab--active {
  background: linear-gradient(
    135deg,
    var(--accent-warm) 0%,
    var(--accent) 100%
  );
  color: #000;
  border-color: var(--accent);
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.4);
}

.bundle-tab:hover {
  border-color: var(--accent);
  box-shadow: 0 0 15px rgba(0, 212, 255, 0.2);
}

.bundle-description {
  margin: 0 0 0.5rem;
  font-size: 0.82rem;
  color: var(--ink-muted);
}

.bundle-slots {
  display: flex;
  gap: 0.65rem;
  overflow-x: auto;
  padding-bottom: 0.25rem;
}

.bundle-slot {
  flex: 0 0 160px;
  border: 2px solid rgba(0, 212, 255, 0.3);
  border-radius: 12px;
  background: linear-gradient(
    135deg,
    rgba(22, 45, 66, 0.5) 0%,
    rgba(26, 58, 82, 0.3) 100%
  );
  padding: 0.7rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  transition: all 0.3s ease;
  box-shadow: 0 0 12px rgba(0, 212, 255, 0.1);
  backdrop-filter: blur(5px);
}

.bundle-slot:hover {
  border-color: rgba(0, 212, 255, 0.6);
  box-shadow: 0 0 25px rgba(0, 212, 255, 0.2);
  transform: translateY(-2px);
}

.bundle-slot__label {
  margin: 0;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--accent);
}

.bundle-slot__image {
  width: 100%;
  height: 90px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid rgba(0, 212, 255, 0.2);
  display: block;
}

.bundle-slot__name {
  margin: 0;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--ink);
}

.bundle-slot__brand {
  margin: 0;
  font-size: 0.72rem;
  color: var(--ink-muted);
}

.text-muted {
  color: var(--ink-muted);
  font-size: 0.8rem;
}
</style>
