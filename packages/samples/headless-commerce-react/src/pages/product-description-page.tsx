import {
  Cart,
  CommerceEngine,
  Context,
  buildProductView,
  buildRecommendations,
} from '@coveo/headless/commerce';
import {useEffect, useRef} from 'react';
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

  if (!product) {
    return null;
  }

  return (
    <div className="Homepage">
      <h2 className="PageTitle">{product.name}</h2>
      <p className="ProductPrice">{formatCurrency(product.price)}</p>
      <RecommendationsInterface
        cartController={cartController}
        navigate={navigate}
        recommendationsController={recommendationsController}
      />
    </div>
  );
}
