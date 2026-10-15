import {buildCart, buildRecommendations} from '@coveo/headless/commerce';
import './components/cart-view.js';
import {startPage} from './page.js';

// Cart page: the cart itself is Headless (Atomic has no cart component), and the
// recommendations below it are a standard Atomic list on the cart slot.
const engine = await startPage('https://sports.barca.group/cart');

const cartView = document.querySelector('cart-view');
cartView?.initialize(engine);

// The cart is sent with every recommendation request, so cart recommendations go
// stale when the cart changes. `atomic-commerce-recommendation-list` has no public
// refresh method, but its state lives in the engine, keyed by slot: refreshing a
// Headless controller for the same slot re-renders the Atomic list.
const slotId = document
  .querySelector('atomic-commerce-recommendation-list')
  ?.getAttribute('slot-id');

//
// Subscribing to the cart, rather than to the cart view, also catches the
// add-to-cart buttons inside the recommendation cards. `subscribe` calls back
// right away, so the items are compared to skip that first call, which would
// duplicate the list's own initial request.
if (slotId) {
  const cartRecommendations = buildRecommendations(engine, {options: {slotId}});
  const cart = buildCart(engine);
  let items = JSON.stringify(cart.state.items);

  cart.subscribe(() => {
    const nextItems = JSON.stringify(cart.state.items);
    if (nextItems !== items) {
      items = nextItems;
      cartRecommendations.refresh();
    }
  });
}
