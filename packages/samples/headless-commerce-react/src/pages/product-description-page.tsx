import {
  Cart,
  CommerceEngine,
  Context,
  buildProductView,
  buildRecommendations,
} from '@coveo/headless/commerce';
import {useEffect, useRef, useState} from 'react';
import RecommendationsInterface from '../components/use-cases/recommendations-interface/recommendations-interface';
import {formatCurrency} from '../utils/format-currency';
import {loadProduct} from '../utils/pdp-utils';

interface IProductDescriptionPageProps {
  engine: CommerceEngine;
  cartController: Cart;
  contextController: Context;
  url: string;
  navigate: (pathName: string) => void;
}

/**
 * This page essentially demonstrates how to use the `ProductView` controller to emit an `ec.productView` event when a
 * product description page (PDP) is loaded.
 */
export default function ProductDescriptionPage(
  props: IProductDescriptionPageProps
) {
  const {engine, cartController, contextController, url, navigate} = props;
  const [cartState, setCartState] = useState(cartController.state);

  /**
   * It is important to log the `ec.productView` event only once per PDP load. This is why we use a ref here.
   */
  const productViewEventEmitted = useRef(false);

  /**
   * The implementation of this function is not important.
   *
   * Typically, the product data used on a PDP will not be fetched from Coveo, but rather from another backend service
   * such as an SAP commerce API.
   *
   * In this example, the bare-minimum product necessary data to emit an `ec.productView` event is simply encoded in
   * and extracted from the URL. This is of course not a realistic scenario.
   */
  const product = loadProduct();

  useEffect(() => {
    contextController.setView({url});
  }, [contextController, url]);

  useEffect(() => {
    if (productViewEventEmitted.current || !product) {
      return;
    }

    buildProductView(engine).view(product);
    productViewEventEmitted.current = true;
  }, [engine, product]);

  const recommendationsController = buildRecommendations(engine, {
    options: {
      slotId: 'ff5d8804-d398-4dd5-b68c-6a729c66454b',
      productId: product?.productId ?? '',
    },
  });

  useEffect(() => {
    if (
      !recommendationsController.state.isLoading &&
      !recommendationsController.state.responseId
    ) {
      recommendationsController.refresh();
      return;
    }
  }, [recommendationsController]);

  useEffect(() => {
    cartController.subscribe(() => setCartState(cartController.state));
  }, [cartController]);

  if (!product) {
    return null;
  }

  const isInCart = () => {
    return cartState.items.some((item) => item.productId === product.productId);
  };

  const numberInCart = () => {
    return (
      cartState.items.find((item) => item.productId === product.productId)
        ?.quantity ?? 0
    );
  };

  const adjustQuantity = (delta: number) => {
    cartController.updateItemQuantity({
      name: product.name,
      price: product.price,
      productId: product.productId,
      quantity: numberInCart() + delta,
    });
  };

  const removeFromCart = () => {
    cartController.updateItemQuantity({
      name: product.name,
      price: product.price,
      productId: product.productId,
      quantity: 0,
    });
  };

  return (
    <div className="ProductDescriptionPage">
      <h2 className="PageTitle">{product.name}</h2>
      <p className="ProductPrice">
        Price:<span> {formatCurrency(product.price)}</span>
      </p>
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
      <RecommendationsInterface
        cartController={cartController}
        navigate={navigate}
        recommendationsController={recommendationsController}
      />
    </div>
  );
}
