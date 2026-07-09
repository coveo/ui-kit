import type {Product, ProductList} from '@coveo/headless/ssr-commerce';
import {escapeHtml, formatCurrency, getElement} from '../common/utils.js';

type ProductListState = ProductList['state'];

function renderProductCard(product: Product): string {
  const imageUrl = product.ec_thumbnails?.[0] ?? product.ec_images?.[0] ?? '';
  const name = product.ec_name ?? 'Unknown product';
  const price = product.ec_promo_price ?? product.ec_price;
  const clickUri = product.clickUri ?? '#';
  const description = product.ec_description ?? '';

  const image = imageUrl
    ? `<img class="ProductImage" src="${escapeHtml(imageUrl)}" alt="${escapeHtml(name)}" loading="lazy" onerror="this.style.display='none'" />`
    : '<span class="ProductImagePlaceholder"></span>';

  return `
    <li class="ProductCard">
      <a class="ProductLink" href="${escapeHtml(clickUri)}" target="_blank" rel="noopener noreferrer">
        ${image}
        <span class="ProductName">${escapeHtml(name)}</span>
      </a>
      ${
        typeof price === 'number'
          ? `<div class="ProductPrice">${formatCurrency(price)}</div>`
          : ''
      }
      ${
        description
          ? `<p class="ProductDescription">${escapeHtml(description)}</p>`
          : ''
      }
    </li>
  `;
}

function renderProductCards(products: Product[]): string {
  return products.map(renderProductCard).join('');
}

export function renderProductGrid(state: ProductListState): string {
  const {products} = state;
  return `
    <ul id="product-grid" class="ProductList" aria-label="Product List">${renderProductCards(products)}</ul>
    <div id="no-products" class="NoProducts" style="display: ${products.length === 0 ? 'block' : 'none'};">
      No products found. Try adjusting your search.
    </div>
  `;
}

export function hydrateProductGrid(productList: ProductList) {
  const grid = getElement<HTMLUListElement>('product-grid');
  const noProducts = getElement<HTMLDivElement>('no-products');
  if (!grid) return;

  const update = () => {
    const {products} = productList.state;
    const hasProducts = products.length > 0;

    if (noProducts) {
      noProducts.style.display = hasProducts ? 'none' : 'block';
    }
    grid.innerHTML = hasProducts ? renderProductCards(products) : '';
  };

  productList.subscribe(update);
  update();
}
