import type {Cart, Product, ProductList} from '@coveo/headless/ssr-commerce';
import {addToCart} from '../common/cart-actions.js';
import {escapeHtml, formatCurrency, getElement} from '../common/utils.js';

type ProductListState = ProductList['state'];
type CartState = Cart['state'];

function quantityInCart(cartState: CartState, productId: string): number {
  if (!productId) {
    return 0;
  }
  return cartState.items.find((item) => item.productId === productId)?.quantity ?? 0;
}

function renderProductCard(product: Product, cartState: CartState): string {
  const imageUrl = product.ec_thumbnails?.[0] ?? product.ec_images?.[0] ?? '';
  const name = product.ec_name ?? 'Unknown product';
  const price = product.ec_promo_price ?? product.ec_price;
  const clickUri = product.clickUri ?? '#';
  const description = product.ec_description ?? '';
  const productId = product.ec_product_id ?? '';
  const inCart = quantityInCart(cartState, productId);

  const image = imageUrl
    ? `<img class="ProductImage" src="${escapeHtml(imageUrl)}" alt="${escapeHtml(name)}" loading="lazy" onerror="this.style.display='none'" />`
    : '<span class="ProductImagePlaceholder"></span>';

  return `
    <li class="ProductCard">
      <a class="ProductLink" href="${escapeHtml(clickUri)}" target="_blank" rel="noopener noreferrer">
        ${image}
        <span class="ProductName">${escapeHtml(name)}</span>
      </a>
      ${typeof price === 'number' ? `<div class="ProductPrice">${formatCurrency(price)}</div>` : ''}
      ${description ? `<p class="ProductDescription">${escapeHtml(description)}</p>` : ''}
      <button type="button" class="AddToCart" data-product-id="${escapeHtml(productId)}"${
        productId ? '' : ' disabled'
      }>Add to cart${inCart > 0 ? ` (${inCart})` : ''}</button>
    </li>
  `;
}

function renderProductCards(products: Product[], cartState: CartState): string {
  return products.map((product) => renderProductCard(product, cartState)).join('');
}

export function renderProductGrid(state: ProductListState, cartState: CartState): string {
  const {products} = state;
  return `
    <ul id="product-grid" class="ProductList" aria-label="Product List">${renderProductCards(products, cartState)}</ul>
    <div id="no-products" class="NoProducts" style="display: ${products.length === 0 ? 'block' : 'none'};">
      No products found. Try adjusting your search.
    </div>
  `;
}

export function hydrateProductGrid(productList: ProductList, cart: Cart) {
  const grid = getElement<HTMLUListElement>('product-grid');
  const noProducts = getElement<HTMLDivElement>('no-products');
  if (!grid) return;

  const update = () => {
    const {products} = productList.state;
    const hasProducts = products.length > 0;

    if (noProducts) {
      noProducts.style.display = hasProducts ? 'none' : 'block';
    }
    grid.innerHTML = hasProducts ? renderProductCards(products, cart.state) : '';
  };

  // Event delegation keeps the click handler stable across re-renders.
  grid.addEventListener('click', (event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>('.AddToCart');
    if (!button) return;

    const productId = button.dataset.productId;
    const product = productList.state.products.find(
      (candidate) => candidate.ec_product_id === productId
    );
    if (product) {
      addToCart(cart, cart.state, product, productList);
    }
  });

  // Re-render on product changes (new results) and on cart changes (so the
  // per-product "Add to cart (N)" quantity badge stays in sync).
  productList.subscribe(update);
  cart.subscribe(update);
  update();
}
