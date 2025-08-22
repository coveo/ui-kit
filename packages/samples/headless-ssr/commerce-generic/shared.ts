export interface Product {
  ec_thumbnails?: string;
  ec_images?: string;
  ec_name?: string;
  title?: string;
  ec_brand?: string;
  brand?: string;
  ec_price?: number | string;
  price?: number | string;
  ec_rating?: number | string;
  rating?: number | string;
}

export interface Summary {
  totalNumberOfProducts?: number;
}

export function renderProductCard(product: Product): string {
  const imageUrl = product.ec_thumbnails || product.ec_images || '';
  const name = product.ec_name || product.title || 'Unknown Product';
  const brand = product.ec_brand || product.brand || '';
  const price = product.ec_price || product.price || '';
  const rating = product.ec_rating || product.rating || '';

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

export function getProductsFromController(productList: any): Product[] {
  return productList?.state?.products || [];
}

export function getSummaryFromController(summary: any): Summary | undefined {
  return summary?.state;
}

export function getSearchValueFromController(searchBox: any): string {
  return searchBox?.state?.value || '';
}

export function getElement<T extends HTMLElement>(id: string): T | null {
  return document.getElementById(id) as T | null;
}
