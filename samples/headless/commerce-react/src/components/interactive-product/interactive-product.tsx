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
  navigate: (pathName: string) => void;
}

export default function InteractiveProduct(props: IInteractiveProductProps) {
  const {product, controller, cartController, promoteChildToParent, navigate} =
    props;

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

  const removeFromCart = () => {
    cartController.updateItemQuantity({
      name: product.ec_name ?? product.permanentid,
      price: product.ec_promo_price ?? product.ec_price ?? NaN,
      productId: product.ec_product_id ?? product.permanentid,
      quantity: 0,
    });
  };

  const renderProductCartControls = () => {
    return (
      <div className="ProductCartControls">
        <p className="CartCurrentQuantity">
          Currently in cart:<span> {numberInCart()}</span>
        </p>
        <button
          type="button"
          className="CartAddOne"
          onClick={() => adjustQuantity(1)}
        >
          Add one
        </button>
        <button
          type="button"
          className="CartRemoveOne"
          disabled={!isInCart()}
          onClick={() => adjustQuantity(-1)}
        >
          Remove one
        </button>
        <button
          type="button"
          className="CartRemoveAll"
          disabled={!isInCart()}
          onClick={removeFromCart}
        >
          Remove all
        </button>
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

    // Normally here, you would simply navigate to product.clickUri.
    const productId = product.ec_product_id ?? product.permanentid;
    const productName = product.ec_name ?? product.permanentid;
    const productPrice = product.ec_promo_price ?? product.ec_price ?? NaN;
    navigate(`/product/${productId}/${productName}/${productPrice}`);
    // In this sample project, we navigate to a custom URL because the app doesn't have access to a commerce backend
    // service to retrieve detailed product information from for the purpose of rendering a product description page
    // (PDP).
    // Therefore, we encode bare-minimum product information in the URL, and use it to render the PDP.
    // This is by no means a realistic scenario.
  };

  return (
    <div className="InteractiveProduct">
      <button type="button" className="ProductLink" onClick={clickProduct}>
        {product.ec_name}
      </button>
      <div className="ProductImageWrapper">
        <img
          src={product.ec_images[0]}
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
              src={child.ec_images[0]}
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
