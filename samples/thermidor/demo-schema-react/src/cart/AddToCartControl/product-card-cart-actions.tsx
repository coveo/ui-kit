import type {ReactNode} from 'react';
import type {ProductCardProduct} from '../../a2ui/ProductCard/product-card-actions.js';
import {AddToCartControl} from './AddToCartControl.js';

/**
 * The actions of every product card: an {@link AddToCartControl} for its product. Provide it
 * through `ProductCardActionsContext`, inside a `CartProvider`.
 */
export const renderProductCardCartActions = ({price, ...product}: ProductCardProduct): ReactNode =>
  price === undefined ? null : <AddToCartControl product={{...product, unitPrice: price}} />;
