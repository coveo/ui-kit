import type {Product, ProductList} from '@coveo/headless/ssr-commerce-next';
import {getElement} from '../common/utils.js';

export function ProductGrid(productList: ProductList) {
  if (!productList) return;

  const grid = getElement<HTMLDivElement>('product-grid');
  const noProducts = getElement<HTMLDivElement>('no-products');
  if (!grid) return;

  const render = () => {
    const products = selectProducts(productList);
    const hasProducts = products.length > 0;

    if (noProducts) {
      noProducts.style.display = hasProducts ? 'none' : 'block';
    }
    grid.innerHTML = hasProducts ? renderProductGrid(products) : '';
  };

  productList.subscribe(render);
  render();
}

function renderProductCard(product: Product): string {
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

export function renderProductGrid(products: Product[]): string {
  return products.map(renderProductCard).join('');
}

export function selectProducts(productList: ProductList): Product[] {
  return productList?.state?.products || [];
}
