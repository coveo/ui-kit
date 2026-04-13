<script setup lang="ts">
import {
  formatPrice,
  hasDiscount,
  promoPrice,
} from '@core/lib/commerceHelpers.js';
import type {Product} from '@core/types/commerce.js';

const props = defineProps<{product: Product}>();

const promo = promoPrice(props.product);
const hasPromoDiscount = hasDiscount(props.product);
</script>

<template>
  <span class="price-display">
    <template v-if="hasPromoDiscount">
      <span class="price-original">{{ formatPrice(product.ec_price) }}</span>
      <span class="price-promo">{{ formatPrice(promo) }}</span>
    </template>
    <span v-else class="price-regular">{{
      formatPrice(product.ec_price)
    }}</span>
  </span>
</template>

<style scoped>
.price-display {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.price-regular {
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--accent);
  text-shadow: 0 0 8px rgba(0, 212, 255, 0.3);
}

.price-original {
  font-size: 0.8rem;
  color: var(--text-secondary);
  text-decoration: line-through;
}

.price-promo {
  font-size: 0.85rem;
  font-weight: 700;
  color: #ffffff;
  background: linear-gradient(
    135deg,
    var(--accent-warm) 0%,
    var(--accent-hot) 100%
  );
  border-radius: 6px;
  padding: 0.15em 0.5em;
  box-shadow: 0 0 10px rgba(255, 183, 0, 0.3);
}
</style>
