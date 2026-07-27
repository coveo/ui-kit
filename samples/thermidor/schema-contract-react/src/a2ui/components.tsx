import type {ComponentType} from 'react';
import type {CatalogSurface} from './adapter.js';

type ComponentBinding = {
  component: CatalogSurface['components'][number];
  controllers: CatalogSurface['controllers'];
};

type Product = {
  permanentid: string;
  ec_name: string;
  ec_shortdesc: string;
  ec_brand: string;
  ec_price: number;
  ec_promo_price?: number;
  ec_images: string[];
  ec_in_stock: boolean;
  ec_rating: number;
};

type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
};

const A2UI_COMPONENTS: Record<string, ComponentType<ComponentBinding>> = {
  ProductCarousel,
  Cart,
};

export function CatalogSurfaceRenderer({surface}: {surface: CatalogSurface}) {
  return (
    <section className="catalog-surface" aria-label={`A2-UI surface ${surface.id}`}>
      {surface.components.map((component) => {
        const Component = A2UI_COMPONENTS[component.component];
        return Component ? (
          <Component key={component.id} component={component} controllers={surface.controllers} />
        ) : (
          <p key={component.id} className="unsupported-component">
            No sample renderer is registered for {component.component}.
          </p>
        );
      })}
    </section>
  );
}

function ProductCarousel({component, controllers}: ComponentBinding) {
  const controllerId = component.controllers['productListController']?.controllerId;
  const products = controllerId ? asArray<Product>(controllers[controllerId]?.['products']) : [];

  return (
    <section className="product-carousel" aria-label="Featured products">
      <div className="section-heading">
        <div>
          <p className="eyebrow">ProductCarousel</p>
          <h2>Featured products</h2>
        </div>
        <span className="controller-id">controller: {controllerId}</span>
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
}

function Cart({component, controllers}: ComponentBinding) {
  const controllerId = component.controllers['cartController']?.controllerId;
  const items = controllerId ? asArray<CartItem>(controllers[controllerId]?.['items']) : [];
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
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}
