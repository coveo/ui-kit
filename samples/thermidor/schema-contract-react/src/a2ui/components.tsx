import {
  createCatalog,
  type CatalogDefinitions,
  type CatalogRenderers,
} from '@copilotkit/a2ui-renderer';
import {Catalog, createFunctionImplementation} from '@a2ui/web_core/v0_9';
import type {ConverseController} from '@coveo/thermidor';
import {
  cartControllerStateSchema,
  cartPropsSchema,
  controllerActionDispatcherFunction,
  productCarouselPropsSchema,
  productListControllerStateSchema,
} from '@coveo/thermidor-contracts';

export const THERMIDOR_CATALOG_ID = 'https://schema.thermidor.coveo.com/a2-ui/catalog.json';

export const thermidorCatalogDefinitions = {
  ProductCarousel: {
    description: 'A responsive product carousel backed by a product-list controller.',
    props: productCarouselPropsSchema,
  },
  Cart: {
    description: 'A shopping-cart summary backed by a cart controller.',
    props: cartPropsSchema,
  },
} satisfies CatalogDefinitions;

export function createThermidorCatalog(
  controller: Pick<ConverseController, 'dispatchAction'>,
  onError: (error: Error) => void = () => undefined
) {
  const renderers = {
    ProductCarousel: ({props}) => {
      const binding = props.controllers.productListController;
      const state = productListControllerStateSchema.safeParse(binding.state);
      const products = state.success ? state.data.products : [];

      return (
        <section className="product-carousel" aria-label="Featured products">
          <div className="section-heading">
            <div>
              <p className="eyebrow">ProductCarousel</p>
              <h2>Featured products</h2>
            </div>
            <span className="controller-id">controller: {binding.controllerId}</span>
          </div>
          <div className="product-grid">
            {products.map((product) => {
              const price = product.ec_promo_price ?? product.ec_price;
              return (
                <article className="product-card" key={product.permanentid}>
                  <img alt="" src={product.ec_images?.[0]} />
                  <p className="brand">{product.ec_brand}</p>
                  <h3>{product.ec_name}</h3>
                  <p>{product.ec_shortdesc}</p>
                  <div className="product-meta">
                    <strong>
                      {price === undefined ? 'Price unavailable' : `$${price.toFixed(2)}`}
                    </strong>
                    <span>
                      {product.ec_rating == null ? 'Not rated' : `★ ${product.ec_rating}`}
                    </span>
                  </div>
                  <small>
                    {product.ec_in_stock === undefined
                      ? 'Availability unknown'
                      : product.ec_in_stock
                        ? 'In stock'
                        : 'Out of stock'}
                  </small>
                </article>
              );
            })}
          </div>
        </section>
      );
    },
    Cart: ({props}) => {
      const binding = props.controllers.cartController;
      const state = cartControllerStateSchema.safeParse(binding.state);
      const items = state.success ? state.data.items : [];
      const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const setItems = asAction(binding.actions.setItems);
      const updateItemQuantity = asAction(binding.actions.updateItemQuantity);

      return (
        <aside className="cart" aria-label="Cart">
          <p className="eyebrow">Cart</p>
          <h2>Your cart</h2>
          {items.map((item) => (
            <div className="cart-line" key={item.productId}>
              <span>
                {item.quantity} × {item.name}
              </span>
              <strong>${(item.price * item.quantity).toFixed(2)}</strong>
            </div>
          ))}
          <div className="cart-total">
            <span>Total</span>
            <strong>${total.toFixed(2)}</strong>
          </div>
          <div className="cart-actions">
            <button type="button" onClick={updateItemQuantity}>
              Set demo quantity to 2
            </button>
            <button type="button" onClick={setItems}>
              Clear cart
            </button>
          </div>
        </aside>
      );
    },
  } satisfies CatalogRenderers<typeof thermidorCatalogDefinitions>;

  const baseCatalog = createCatalog(thermidorCatalogDefinitions, renderers, {
    catalogId: THERMIDOR_CATALOG_ID,
    includeBasicCatalog: true,
  });
  const dispatchControllerAction = createFunctionImplementation(
    controllerActionDispatcherFunction,
    (args) => {
      void controller.dispatchAction(args).catch((error: unknown) => {
        onError(error instanceof Error ? error : new Error(String(error)));
      });
    }
  );

  return new Catalog(
    baseCatalog.id,
    [...baseCatalog.components.values()],
    [...baseCatalog.functions.values(), dispatchControllerAction],
    baseCatalog.themeSchema
  );
}

function asAction(value: unknown): () => void {
  return typeof value === 'function' ? (value as () => void) : () => undefined;
}
