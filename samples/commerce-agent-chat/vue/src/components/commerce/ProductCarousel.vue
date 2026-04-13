<script setup lang="ts">
import type {Product} from '@core/types/commerce.js';
import PriceDisplay from './PriceDisplay.vue';

export interface ProductSection {
  heading: string;
  products: Product[];
}

defineProps<{
  sections: ProductSection[];
  isLoading?: boolean;
}>();
</script>

<template>
  <div v-if="sections.length > 0" class="product-carousel">
    <div
      v-for="(section, i) in sections"
      :key="`${section.heading}-${i}`"
      class="carousel-section"
    >
      <template v-if="(isLoading ?? false) && section.products.length === 0">
        <h3 class="commerce-heading">{{ section.heading }}</h3>
        <div
          class="carousel-track"
          role="list"
          aria-label="Loading products"
          aria-busy="true"
        >
          <div
            v-for="j in 3"
            :key="`carousel-skeleton-${j}`"
            role="listitem"
            class="carousel-track__item"
          >
            <article class="product-card product-card--skeleton">
              <div
                class="product-card__image commerce-loading commerce-loading--image"
              />
              <div class="product-card__body">
                <div class="commerce-loading commerce-loading--line" />
                <div
                  class="commerce-loading commerce-loading--line commerce-loading--line-wide"
                />
              </div>
            </article>
          </div>
        </div>
      </template>
      <template v-else>
        <h3 class="commerce-heading">{{ section.heading }}</h3>
        <div class="carousel-track" role="list">
          <div
            v-for="product in section.products"
            :key="product.ec_product_id"
            role="listitem"
            class="carousel-track__item"
          >
            <article class="product-card">
              <img
                v-if="product.ec_image"
                :src="product.ec_image"
                :alt="product.ec_name"
                class="product-card__image"
              />
              <div
                v-else
                class="product-card__image product-card__image--placeholder"
                aria-hidden="true"
              />
              <div class="product-card__body">
                <p class="product-card__name">{{ product.ec_name }}</p>
                <p class="product-card__brand">{{ product.ec_brand }}</p>
                <PriceDisplay :product="product" />
              </div>
            </article>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.product-carousel {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.carousel-section {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.carousel-track {
  display: flex;
  gap: 0.75rem;
  overflow-x: auto;
  padding-top: 0.4rem;
  padding-bottom: 0.4rem;
  scroll-snap-type: x mandatory;
}

.carousel-track::-webkit-scrollbar {
  height: 4px;
}

.carousel-track::-webkit-scrollbar-track {
  background: var(--bg-1);
}

.carousel-track::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 2px;
}

.carousel-track__item {
  flex: 0 0 180px;
  min-width: 180px;
}

.product-card {
  flex: 0 0 180px;
  border: 2px solid rgba(0, 212, 255, 0.3);
  border-radius: 12px;
  background: linear-gradient(
    135deg,
    rgba(22, 45, 66, 0.6) 0%,
    rgba(26, 58, 82, 0.4) 100%
  );
  overflow: hidden;
  scroll-snap-align: start;
  transition: all 0.3s ease;
  box-shadow: 0 0 15px rgba(0, 212, 255, 0.1);
  backdrop-filter: blur(5px);
}

.product-card:hover {
  border-color: rgba(0, 212, 255, 0.6);
  box-shadow: 0 0 30px rgba(0, 212, 255, 0.25);
  transform: translateY(-4px);
}

.product-card__image {
  width: 100%;
  height: 110px;
  object-fit: cover;
  display: block;
  border-bottom: 1px solid rgba(0, 212, 255, 0.2);
}

.product-card__image--placeholder {
  background: linear-gradient(
    45deg,
    rgba(0, 212, 255, 0.1),
    rgba(0, 212, 255, 0.05)
  );
}

.product-card--skeleton .product-card__body {
  gap: 0.45rem;
}

.product-card__body {
  padding: 0.5rem 0.65rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.product-card__name {
  margin: 0;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--ink);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-card__brand {
  margin: 0;
  font-size: 0.72rem;
  color: var(--ink-muted);
}
</style>
