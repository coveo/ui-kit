import {
  Cart,
  InteractiveProduct as HeadlessInteractiveProduct,
  Product,
} from '@coveo/headless/commerce';
import {useEffect, useState} from 'react';
import {saveCartItemsToLocaleStorage} from '../../utils/cart-utils';
import {formatCurrency} from '../../utils/format-currency';

interface IInteractiveProductProps {
  product: Product;
  controller: HeadlessInteractiveProduct;
  cartController: Cart;
  navigate: (pathName: string) => void;
}

export default function InteractiveProduct(props: IInteractiveProductProps) {
  const {product, controller, cartController, navigate} = props;

  const [cartState, setCartState] = useState(cartController.state);

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

  const removeFromCart = () => {
    cartController.updateItemQuantity({
      name: product.ec_name ?? product.permanentid,
      price: product.ec_promo_price ?? product.ec_price ?? NaN,
      productId: product.ec_product_id ?? product.permanentid,
      quantity: 0,
    });
  };

  const renderPrice = () => {
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
    navigate(
      `/product/${product.ec_product_id ?? product.permanentid}/${product.ec_name ?? product.permanentid}/${product.ec_promo_price ?? product.ec_price ?? NaN}`
    );
  };

  return (
    <div className="InteractiveProduct">
      <button className="InteractiveProductLink" onClick={clickProduct}>
        {product.ec_name}
      </button>
      <div className="InteractiveProductImageWrapper">
        <img
          src={product.ec_images[0]}
          alt={product.permanentid}
          height={100}
        ></img>
      </div>
      {renderPrice()}
      <div className="InteractiveProductDescription">
        <p>{product.ec_description}</p>
      </div>
      <div className="ProductCartControls">
        <p className="CartCurrentQuantity">
          Currently in cart:<span> {numberInCart()}</span>
        </p>
        <button className="CartAddOne" onClick={() => adjustQuantity(1)}>
          Add one
        </button>
        <button
          className="CartRemoveOne"
          disabled={!isInCart()}
          onClick={() => adjustQuantity(-1)}
        >
          Remove one
        </button>
        <button
          className="CartRemoveAll"
          disabled={!isInCart()}
          onClick={removeFromCart}
        >
          Remove all
        </button>
      </div>
    </div>
  );
}
