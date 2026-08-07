import {
  createCatalog,
  type CatalogDefinitions,
  type CatalogRenderers,
} from '@copilotkit/a2ui-renderer';
import {type EngineStateSource, useAdvertisedController} from './controllers.js';
import {cartPropsSchema, productCarouselPropsSchema} from '@coveo/thermidor-contracts';

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

export function createThermidorCatalog(stateSource: EngineStateSource) {
  const renderers = {
    ProductCarousel: ({props}) => {
      const controller = useAdvertisedController(
        stateSource,
        props.controllers.productListController
      );
      const products = controller.state?.products ?? [];

      return (
        <section className="product-carousel" aria-label="Featured products">
          <div className="section-heading">
            <div>
              <p className="eyebrow">ProductCarousel</p>
              <h2>Featured products</h2>
            </div>
            <span className="controller-id">
              controller: {props.controllers.productListController.controllerId}
            </span>
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
      const controller = useAdvertisedController(stateSource, props.controllers.cartController);
      const items = controller.state?.items ?? [];
      const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

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
        </aside>
      );
    },
  } satisfies CatalogRenderers<typeof thermidorCatalogDefinitions>;

  return createCatalog(thermidorCatalogDefinitions, renderers, {
    catalogId: THERMIDOR_CATALOG_ID,
    includeBasicCatalog: true,
  });
}
