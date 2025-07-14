import {
  buildNotifyTrigger,
  buildProductListing,
  type Cart,
  type CommerceEngine,
  type Context,
} from '@coveo/headless/commerce';
import {useCallback, useEffect} from 'react';
import NotifyTrigger from '../components/triggers/notify-trigger.js';
import SearchAndListingInterface from '../components/use-cases/search-and-listing-interface/search-and-listing-interface.js';

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
      excludeDefaultParameters: true,
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
    /**
     * It is important to call the `Context` controller's `setView` method with the current URL when a page is loaded,
     * as the Commerce API requires this information to function properly.
     *
     * Note, however, that calling this method will reset the query, pagination, sort, and facets.
     *
     * This means that on a search or listing page, you must call this method BEFORE you bind the URL manager.
     * Otherwise, the URL manager will restore the state from the URL parameters, and then this state will get
     * immediately reset when the `setView` method is called.
     */
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
      <NotifyTrigger controller={buildNotifyTrigger(engine)} />
      <SearchAndListingInterface
        searchOrListingController={productListingController}
        cartController={cartController}
        navigate={navigate}
      />
    </div>
  );
}
