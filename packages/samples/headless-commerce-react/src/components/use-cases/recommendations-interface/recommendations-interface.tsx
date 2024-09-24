import {Cart, Recommendations} from '@coveo/headless/commerce';
import {useEffect, useState} from 'react';
import ProductList from '../../product-list/product-list.js';
import ShowMore from '../../show-more/show-more.js';
import Summary from '../../summary/summary.js';

//import Pagination from '../pagination/pagination';

interface IRecommendationsInterfaceProps {
  recommendationsController: Recommendations;
  cartController: Cart;
  navigate: (pathName: string) => void;
}

export default function RecommendationsInterface(
  props: IRecommendationsInterfaceProps
) {
  const {recommendationsController, cartController, navigate} = props;

  const [recommendationsState, setRecommendationsState] = useState(
    recommendationsController.state
  );

  useEffect(() => {
    recommendationsController.subscribe(() => {
      setRecommendationsState(recommendationsController.state);
    });
  }, [recommendationsController]);

  return (
    <div className="RecommendationsInterface">
      <h3 className="RecommendationsHeadline">
        {recommendationsState.headline}
      </h3>
      <Summary controller={recommendationsController.summary()} />
      <ProductList
        products={recommendationsState.products}
        cartController={cartController}
        controllerBuilder={recommendationsController.interactiveProduct}
        navigate={navigate}
      />
      <ShowMore controller={recommendationsController.pagination()} />
      {/*<Pagination controller={recommendationsController.pagination()} />*/}
    </div>
  );
}
