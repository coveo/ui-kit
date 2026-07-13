import type {
  Cart,
  ChildProduct,
  InteractiveProduct as HeadlessInteractiveProduct,
  Product,
} from '@coveo/headless/commerce';
import {useEffect, useState} from 'react';
import {saveCartItemsToLocaleStorage} from '../../utils/cart-utils.js';
import {formatCurrency} from '../../utils/format-currency.js';

interface IInteractiveProductProps {
  product: Product;
  controller: HeadlessInteractiveProduct;
  cartController: Cart;
  promoteChildToParent: (product: ChildProduct) => void;
}

export default function InteractiveProduct(props: IInteractiveProductProps) {
  const {product, controller, cartController, promoteChildToParent} = props;

  const [cartState, setCartState] = useState(cartController.state);

  // When the cart state changes, you should save it so that you can restore it when you initialize the commerce engine.
  useEffect(() => {
    cartController.subscribe(() => {
      setCartState(cartController.state);
      saveCartItemsToLocaleStorage(cartController.state);
    });
  }, [cartController]);

  const isInCart = () => {
    return cartState.items.some(
      (item) => item.productId === product.ec_product_id
    );
  };

  const numberInCart = () => {
    return (
      cartState.items.find((item) => item.productId === product.ec_product_id)
        ?.quantity ?? 0
    );
  };

  const adjustQuantity = (delta: number) => {
    cartController.updateItemQuantity({
      name: product.ec_name ?? product.permanentid,
      price: product.ec_promo_price ?? product.ec_price ?? NaN,
      productId: product.ec_product_id ?? product.permanentid,
      quantity: numberInCart() + delta,
    });
  };

  const renderProductCartControls = () => {
    return (
      <div className="ProductCartControls">
        <button
          type="button"
          className="CartAddOne"
          onClick={() => adjustQuantity(1)}
        >
          Add to cart
        </button>
        {isInCart() && (
          <p className="CartCurrentQuantity">In cart: {numberInCart()}</p>
        )}
      </div>
    );
  };

  const renderProductPrice = () => {
    const promoPrice = product.ec_promo_price;
    const price = product.ec_price;

    if (promoPrice && price && promoPrice < price) {
      return (
        <span className="InteractiveProductPrice">
          <s>{formatCurrency(price)}</s>
          <span> {formatCurrency(promoPrice)}</span>
        </span>
      );
    }

    if (price || promoPrice) {
      return <span>{formatCurrency((price ?? promoPrice)!)}</span>;
    }

    return <span>Price not available</span>;
  };

  const clickProduct = () => {
    controller.select();
    window.open(product.clickUri, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="InteractiveProduct">
      <button type="button" className="ProductLink" onClick={clickProduct}>
        {product.ec_name}
      </button>
      <div className="ProductImageWrapper">
        <img
          src={product.ec_images?.[0] ?? ''}
          alt={product.permanentid}
          height={100}
        ></img>
      </div>
      {renderProductPrice()}
      <div className="ProductDescription">
        <p>{product.ec_description}</p>
      </div>
      {product.totalNumberOfChildren! > 1 && <p>Also available in:</p>}
      {product.children.map((child) => {
        return child.permanentid !== product.permanentid ? (
          <button
            type="button"
            key={child.permanentid}
            onClick={() => promoteChildToParent!(child)}
          >
            <img
              alt={child.ec_name!}
              height="25px"
              src={child.ec_images?.[0] ?? ''}
            ></img>
          </button>
        ) : null;
      })}
      {product.totalNumberOfChildren! > 5 && (
        <span> and {product.totalNumberOfChildren! - 5} more</span>
      )}
      {renderProductCartControls()}
      <hr />
    </div>
  );
}
