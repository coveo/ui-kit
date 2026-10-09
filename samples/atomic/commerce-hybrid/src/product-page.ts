import {buildProductView} from '@coveo/headless/commerce';
import './components/product-badges.js';
import {toCartItem} from './cart.js';
import {priceFormatter} from './engine.js';
import {startPage} from './page.js';
import {getHandedOffProduct} from './product-handoff.js';

// Product page. On a real storefront the platform renders this page and already
// knows the product; here it is handed over from the card that was clicked (see
// `product-handoff.ts`). Atomic has no product-page support, so the view event,
// badges, and add-to-cart are Headless, while the recommendations are Atomic.
const permanentid = new URLSearchParams(window.location.search).get('id') ?? '';
const product = getHandedOffProduct(permanentid);
const productId = product ? toCartItem(product).productId : permanentid;

// Must be set before the recommendation interface initializes, which is when
// the list reads it.
document
  .querySelector('atomic-commerce-recommendation-list')
  ?.setAttribute('product-id', productId);

const engine = await startPage(`https://sports.barca.group/products/${productId}`);

if (product) {
  const {name, price} = toCartItem(product);

  document.title = `${name} — Atomic + Headless Hybrid Sample`;
  document.querySelector('#product-name')!.textContent = name;
  document.querySelector('#product-price')!.textContent = priceFormatter(engine)(price);

  const image = document.querySelector<HTMLImageElement>('#product-image')!;
  if (product.ec_thumbnails[0]) {
    image.src = product.ec_thumbnails[0];
    image.hidden = false;
  }

  // Sent once the interfaces are initialized, so the event is attributed to the
  // same analytics source as the rest of the page.
  buildProductView(engine).view({productId, name, price});

  document.querySelector('product-badges')?.initialize(engine, productId);
  document.querySelector('add-to-cart-button')?.initialize(engine, product);
} else {
  document.querySelector('#product-name')!.textContent = 'Product not found';
  document.querySelector('#product-price')!.textContent =
    'Open a product from the home or search page to see it here.';
  document.querySelector('add-to-cart-button')?.remove();
}
