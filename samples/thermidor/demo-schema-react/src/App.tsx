import {BundleActionsContext} from './a2ui/BundleDisplay/bundle-actions.js';
import {ProductCardActionsContext} from './a2ui/ProductCard/product-card-actions.js';
import {renderBundleCartActions} from './cart/AddBundleToCartButton/AddBundleToCartButton.js';
import {renderProductCardCartActions} from './cart/AddToCartControl/product-card-cart-actions.js';
import {CartProvider} from './cart/CartProvider.js';
import {SessionProvider} from './context/session.js';
import {AppShell} from './components/AppShell.js';

export default function App() {
  return (
    <CartProvider>
      <ProductCardActionsContext.Provider value={renderProductCardCartActions}>
        <BundleActionsContext.Provider value={renderBundleCartActions}>
          <SessionProvider>
            <AppShell />
          </SessionProvider>
        </BundleActionsContext.Provider>
      </ProductCardActionsContext.Provider>
    </CartProvider>
  );
}
