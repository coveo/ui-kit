import {ProductCardActionsContext} from './a2ui/ProductCard/product-card-actions.js';
import {renderProductCardCartActions} from './cart/AddToCartControl/product-card-cart-actions.js';
import {CartProvider} from './cart/CartProvider.js';
import {SessionProvider} from './context/session.js';
import {AppShell} from './components/AppShell.js';

export default function App() {
  return (
    <CartProvider>
      <ProductCardActionsContext.Provider value={renderProductCardCartActions}>
        <SessionProvider>
          <AppShell />
        </SessionProvider>
      </ProductCardActionsContext.Provider>
    </CartProvider>
  );
}
