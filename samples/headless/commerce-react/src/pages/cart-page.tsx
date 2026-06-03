import {
  buildRecommendations,
  type CommerceEngine,
  type Context,
  type Cart as HeadlessCart,
} from '@coveo/headless/commerce';
import {useEffect} from 'react';
import Cart from '../components/cart/cart.js';
import RecommendationsInterface from '../components/use-cases/recommendations-interface/recommendations-interface.js';

interface ICartPageProps {
  engine: CommerceEngine;
  cartController: HeadlessCart;
  contextController: Context;
  url: string;
  navigate: (pathName: string) => void;
}

export default function CartPage(props: ICartPageProps) {
  const {engine, cartController, contextController, url, navigate} = props;

  const recommendationsController = buildRecommendations(engine, {
    options: {slotId: 'd8118c04-ff59-4f03-baca-2fc5f3b81221'},
  });

  useEffect(() => {
    /**
     * It is important to call the `Context` controller's `setView` method with the current URL when a page is loaded,
     * as the Commerce API requires this information to function properly.
     */
    contextController.setView({url});

    if (
      !recommendationsController.state.isLoading &&
      !recommendationsController.state.responseId
    ) {
      recommendationsController.refresh();
      return;
    }
  }, [contextController, recommendationsController, url]);

  return (
    <div className="CartPage">
      <h2 className="PageTitle">Cart</h2>
      <Cart controller={cartController} />
      <RecommendationsInterface
        recommendationsController={recommendationsController}
        cartController={cartController}
        navigate={navigate}
      />
    </div>
  );
}
