import {useCallback, useSyncExternalStore} from 'react';
import type {ProductListController} from '@coveo/thermidor';
import {ProductCard} from '../ProductCard/ProductCard.js';
import type {Product} from '../utils.js';
import styles from './ProductGrid.module.css';

interface ProductGridProps {
  controller: ProductListController;
}

export function ProductGrid({controller}: ProductGridProps) {
  const subscribe = useCallback(
    (onStoreChange: () => void) => controller.subscribe(onStoreChange),
    [controller]
  );
  const getSnapshot = useCallback(() => controller.state, [controller]);
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const products = state.products as unknown as Product[];

  if (products.length === 0) {
    return <p className={styles.empty}>No results found</p>;
  }

  return (
    <div className={styles.grid}>
      {products.map((product, index) => (
        <ProductCard
          key={(product.permanentid as string | undefined) ?? index}
          product={product}
        />
      ))}
    </div>
  );
}
