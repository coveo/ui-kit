import type {Product} from '@coveo/headless/ssr-commerce-next';
import type {
  ProductListController,
  SearchBoxController,
  Summary,
  SummaryController,
} from './types.js';

export function renderProductCard(product: Product): string {
  const imageUrl = product.ec_thumbnails?.[0] ?? product.ec_images?.[0] ?? '';
  const name = product.ec_name ?? 'Unknown Product';
  const brand = product.ec_brand ?? '';
  const price = product.ec_price ?? product.ec_promo_price ?? '';
  const rating = product.ec_rating ?? 0;

  return `
    <div class="product-card">
      ${imageUrl ? `<img src="${imageUrl}" alt="${name}" class="product-image" onerror="this.style.display='none'" />` : ''}
      <div class="product-name">${name}</div>
      ${brand ? `<div class="product-brand">${brand}</div>` : ''}
      ${price ? `<div class="product-price">$${typeof price === 'number' ? price.toFixed(2) : price}</div>` : ''}
      ${rating ? `<div class="product-rating">${'★'.repeat(Math.floor(Number(rating)))} (${rating})</div>` : ''}
    </div>
  `;
}

export function renderProductsList(products: Product[]): string {
  return products.map(renderProductCard).join('');
}

export function formatQuerySummary(
  summary: Summary | undefined,
  searchValue: string
): string {
  if (!summary) return 'Loading...';
  const total = summary.totalNumberOfProducts || 0;
  return `${total} products found${searchValue ? ` for "${searchValue}"` : ''}`;
}

export function getProductsFromController(
  productList: ProductListController
): Product[] {
  return productList?.state?.products || [];
}

export function getSummaryFromController(
  summary: SummaryController
): Summary | undefined {
  return summary?.state;
}

export function getSearchValueFromController(
  searchBox: SearchBoxController
): string {
  return searchBox?.state?.value || '';
}

export function getElement<T extends HTMLElement>(id: string): T | null {
  return document.getElementById(id) as T | null;
}
