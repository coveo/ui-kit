import {
  CommerceEngine,
  Cart,
  buildRecommendations,
  Context,
} from '@coveo/headless/commerce';
import {useEffect} from 'react';
import RecommendationsInterface from '../components/use-cases/recommendations-interface/recommendations-interface';

interface IHomePageProps {
  engine: CommerceEngine;
  cartController: Cart;
  contextController: Context;
  url: string;
  navigate: (pathName: string) => void;
}

export default function HomePage(props: IHomePageProps) {
  const {engine, cartController, contextController, url, navigate} = props;

  const recommendationsController = buildRecommendations(engine, {
    options: {slotId: 'af4fb7ba-6641-4b67-9cf9-be67e9f30174'},
  });

  useEffect(() => {
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
    <div className="Homepage">
      <h2 className="PageTitle">Home</h2>
      <RecommendationsInterface
        recommendationsController={recommendationsController}
        cartController={cartController}
        navigate={navigate}
      />
    </div>
  );
}
