import {
  buildProductListing,
  Cart,
  CommerceEngine,
  Context,
} from '@coveo/headless/commerce';
import {useCallback} from 'react';
import {useEffect} from 'react';
import SearchAndListingInterface from '../components/use-cases/search-and-listing-interface/search-and-listing-interface';

interface IProductListingPageProps {
  engine: CommerceEngine;
  cartController: Cart;
  contextController: Context;
  url: string;
  pageName: string;
  navigate: (pathName: string) => void;
}

export default function ProductListingPage(props: IProductListingPageProps) {
  const {engine, cartController, contextController, url, pageName, navigate} =
    props;

  const productListingController = buildProductListing(engine);

  const bindUrlManager = useCallback(() => {
    const fragment = () => window.location.hash.slice(1);
    const urlManager = productListingController.urlManager({
      initialState: {fragment: fragment()},
    });

    const onHashChange = () => {
      urlManager.synchronize(fragment());
    };

    window.addEventListener('hashchange', onHashChange);
    const unsubscribeManager = urlManager.subscribe(() => {
      const hash = `#${urlManager.state.fragment}`;

      if (!productListingController.state.responseId) {
        window.history.replaceState(null, document.title, hash);
        return;
      }

      window.history.pushState(null, document.title, hash);
    });

    return () => {
      window.removeEventListener('hashchange', onHashChange);
      unsubscribeManager();
    };
  }, [productListingController]);

  useEffect(() => {
    contextController.setView({url});
    const unsubscribe = bindUrlManager();

    if (
      !productListingController.state.isLoading &&
      !productListingController.state.responseId
    ) {
      productListingController.executeFirstRequest();
    } else if (!productListingController.state.isLoading) {
      productListingController.refresh();
    }

    return unsubscribe;
  }, [contextController, url, productListingController, bindUrlManager]);

  return (
    <div className="ProductListingPage">
      <h2 className="PageTitle">{pageName}</h2>
      <SearchAndListingInterface
        searchOrListingController={productListingController}
        cartController={cartController}
        navigate={navigate}
      />
    </div>
  );
}
