import {
  createCatalog,
  type CatalogDefinitions,
  type CatalogRenderers,
} from '@copilotkit/a2ui-renderer';
import {z} from 'zod';
import {useAdvertisedController} from './controllers.js';

export const THERMIDOR_CATALOG_ID = 'https://schema.thermidor.coveo.com/a2-ui/catalog.json';

const controllerAdvertisement = z.object({
  controllerId: z.string(),
  controllerSchema: z.string(),
});

const product = z.object({
  permanentid: z.string(),
  ec_name: z.string(),
  ec_shortdesc: z.string(),
  ec_brand: z.string(),
  ec_price: z.number(),
  ec_promo_price: z.number().optional(),
  ec_images: z.array(z.string()),
  ec_in_stock: z.boolean(),
  ec_rating: z.number(),
});

const cartItem = z.object({
  productId: z.string(),
  name: z.string(),
  price: z.number(),
  quantity: z.number(),
});

type Product = z.infer<typeof product>;
type CartItem = z.infer<typeof cartItem>;

export const thermidorCatalogDefinitions = {
  ProductCarousel: {
    description: 'A responsive product carousel backed by a product-list controller.',
    props: z.object({
      controllers: z.object({productListController: controllerAdvertisement}),
    }),
  },
  Cart: {
    description: 'A shopping-cart summary backed by a cart controller.',
    props: z.object({
      controllers: z.object({cartController: controllerAdvertisement}),
    }),
  },
} satisfies CatalogDefinitions;

const renderers = {
  ProductCarousel: ({props}) => {
    const state = useAdvertisedController<{products?: Product[]}>(
      props.controllers.productListController
    );
    const products = Array.isArray(state.products) ? state.products : [];

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
                <img alt="" src={product.ec_images[0]} />
                <p className="brand">{product.ec_brand}</p>
                <h3>{product.ec_name}</h3>
                <p>{product.ec_shortdesc}</p>
                <div className="product-meta">
                  <strong>${price.toFixed(2)}</strong>
                  <span>★ {product.ec_rating}</span>
                </div>
                <small>{product.ec_in_stock ? 'In stock' : 'Out of stock'}</small>
              </article>
            );
          })}
        </div>
      </section>
    );
  },
  Cart: ({props}) => {
    const state = useAdvertisedController<{items?: CartItem[]}>(props.controllers.cartController);
    const items = Array.isArray(state.items) ? state.items : [];
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

export const thermidorCatalog = createCatalog(thermidorCatalogDefinitions, renderers, {
  catalogId: THERMIDOR_CATALOG_ID,
  includeBasicCatalog: true,
});
