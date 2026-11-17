import type {ProductCardProduct} from '../../../../demo-schema-react/src/a2ui/ProductCard/product-card-actions.js';
import {useCart} from '../../session/storefront-session.js';
import styles from './AddToCartButton.module.css';

interface AddToCartButtonProps {
  product: ProductCardProduct;
  onAdd(product: ProductCardProduct): void;
}

/** Adds a product card's product to the cart, and says how many are already in it. */
export function AddToCartButton({product, onAdd}: AddToCartButtonProps) {
  const {items} = useCart();
  const quantity = items.find((item) => item.productId === product.productId)?.quantity ?? 0;
  const label = quantity > 0 ? `Add · ${quantity} in cart` : 'Add to cart';

  return (
    <button
      type="button"
      className={styles.button}
      aria-label={`${label}, ${product.name}`}
      onClick={() => onAdd(product)}
    >
      {label}
    </button>
  );
}
