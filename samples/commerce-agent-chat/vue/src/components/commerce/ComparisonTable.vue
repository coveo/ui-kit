<script setup lang="ts">
import {formatAttribute} from '@core/lib/commerceHelpers.js';
import type {Product} from '@core/types/commerce.js';
import PriceDisplay from './PriceDisplay.vue';

defineProps<{
  heading: string;
  products: Product[];
  attributes?: string[];
  isLoading?: boolean;
}>();
</script>

<template>
  <div
    v-if="products.length === 0 && (isLoading ?? false)"
    class="comparison-table-wrap"
    aria-busy="true"
  >
    <h3 class="commerce-heading">{{ heading }}</h3>
    <div class="comparison-table-loading">
      <div class="comparison-table-loading__line" />
      <div
        class="comparison-table-loading__line comparison-table-loading__line--wide"
      />
      <div class="comparison-table-loading__grid">
        <div class="comparison-table-loading__cell" />
        <div class="comparison-table-loading__cell" />
        <div class="comparison-table-loading__cell" />
      </div>
    </div>
  </div>

  <div v-else-if="products.length > 0" class="comparison-table-wrap">
    <h3 class="commerce-heading">{{ heading }}</h3>
    <div class="comparison-table-scroll">
      <table class="comparison-table">
        <thead>
          <tr>
            <th class="comparison-table__attr-col">Attribute</th>
            <th v-for="product in products" :key="product.ec_product_id">
              {{ product.ec_name }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="comparison-table__label">Image</td>
            <td
              v-for="product in products"
              :key="`${product.ec_product_id}-image`"
            >
              <img
                v-if="product.ec_image"
                :src="product.ec_image"
                :alt="product.ec_name"
                class="comparison-table__thumb"
              />
              <span v-else class="text-muted">No image</span>
            </td>
          </tr>
          <tr>
            <td class="comparison-table__label">Brand</td>
            <td
              v-for="product in products"
              :key="`${product.ec_product_id}-brand`"
            >
              {{ product.ec_brand }}
            </td>
          </tr>
          <tr>
            <td class="comparison-table__label">Price</td>
            <td
              v-for="product in products"
              :key="`${product.ec_product_id}-price`"
            >
              <PriceDisplay :product="product" />
            </td>
          </tr>
          <tr v-for="attribute in attributes ?? []" :key="attribute">
            <td class="comparison-table__label">
              {{ formatAttribute(attribute) }}
            </td>
            <td
              v-for="product in products"
              :key="`${product.ec_product_id}-${attribute}`"
            >
              <span v-if="product[attribute] != null">{{
                product[attribute]
              }}</span>
              <span v-else class="text-muted">—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.comparison-table-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.comparison-table-loading {
  border: 2px solid rgba(0, 212, 255, 0.2);
  border-radius: 10px;
  background: linear-gradient(
    135deg,
    rgba(22, 45, 66, 0.4) 0%,
    rgba(26, 58, 82, 0.3) 100%
  );
  padding: 0.85rem;
  display: grid;
  gap: 0.45rem;
  backdrop-filter: blur(5px);
}

.comparison-table-loading__line,
.comparison-table-loading__cell {
  border-radius: 6px;
  background: linear-gradient(
    90deg,
    rgba(26, 77, 109, 0.3) 25%,
    rgba(0, 212, 255, 0.15) 50%,
    rgba(26, 77, 109, 0.3) 75%
  );
  background-size: 600px 100%;
  animation: shimmer 1.4s infinite linear;
}

.comparison-table-scroll {
  overflow-x: auto;
}

.comparison-table {
  border-collapse: collapse;
  width: 100%;
  font-size: 0.82rem;
}

.comparison-table th,
.comparison-table td {
  padding: 0.55rem 0.8rem;
  border: 1px solid rgba(0, 212, 255, 0.2);
  text-align: left;
  vertical-align: middle;
  color: var(--ink);
}

.comparison-table thead th {
  background: rgba(26, 58, 82, 0.6);
  font-weight: 700;
  color: var(--accent);
  border-bottom: 2px solid rgba(0, 212, 255, 0.3);
}

.comparison-table__attr-col {
  min-width: 100px;
  background: rgba(26, 58, 82, 0.4);
  font-weight: 600;
}

.comparison-table__thumb {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid rgba(0, 212, 255, 0.2);
  display: block;
}

.text-muted {
  color: var(--ink-muted);
}
</style>
