import type {Product} from '../types/commerce.js';

const bundleProductCache = new Map<string, Product[]>();

export function updateBundleProductCache(
  productsBySurface: Map<string, Product[]>
): void {
  for (const [surfaceId, products] of productsBySurface.entries()) {
    if (surfaceId.startsWith('bundle-surface-') && products.length > 0) {
      bundleProductCache.set(surfaceId, products);
    }
  }
}

export function getBundleProductsFromCache(surfaceId: string): Product[] {
  return bundleProductCache.get(surfaceId) ?? [];
}

export function resetBundleProductCache(): void {
  bundleProductCache.clear();
}
