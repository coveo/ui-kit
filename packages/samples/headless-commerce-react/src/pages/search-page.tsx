import {
  buildInstantProducts,
  buildSearch,
  buildSearchBox,
  Cart,
  CommerceEngine,
} from '@coveo/headless/commerce';
import {Context} from '@coveo/headless/commerce';
import {useCallback} from 'react';
import {useEffect} from 'react';
import DidYouMean from '../components/did-you-mean/did-you-mean';
import SearchBox from '../components/search-box/search-box';
import SearchAndListingInterface from '../components/use-cases/search-and-listing-interface/search-and-listing-interface';
import {highlightOptions} from '../utils/highlight-options';

interface ISearchProps {
  engine: CommerceEngine;
  cartController: Cart;
  contextController: Context;
  url: string;
  navigate: (pathName: string) => void;
}

export default function Search(props: ISearchProps) {
  const {engine, cartController, contextController, url, navigate} = props;

  contextController.setView({url});
  const searchController = buildSearch(engine);

  const searchBoxId = 'search-box';
  const searchBoxController = buildSearchBox(engine, {
    options: {id: searchBoxId, highlightOptions},
  });

  const bindUrlManager = useCallback(() => {
    const fragment = () => window.location.hash.slice(1);
    const urlManager = searchController.urlManager({
      initialState: {fragment: fragment()},
    });

    const onHashChange = () => {
      urlManager.synchronize(fragment());
    };

    window.addEventListener('hashchange', onHashChange);
    const unsubscribeManager = urlManager.subscribe(() => {
      const hash = `#${urlManager.state.fragment}`;

      if (!searchController.state.responseId) {
        window.history.replaceState(null, document.title, hash);
        return;
      }

      window.history.pushState(null, document.title, hash);
    });

    return () => {
      window.removeEventListener('hashchange', onHashChange);
      unsubscribeManager();
    };
  }, [searchController]);

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
      !searchController.state.isLoading &&
      !searchController.state.responseId
    ) {
      searchController.executeFirstSearch();
      return;
    }

    if (!searchController.state.isLoading) {
      searchBoxController.submit();
    }

    return unsubscribe;
  }, [
    contextController,
    url,
    searchController,
    bindUrlManager,
    searchBoxController,
  ]);

  return (
    <div className="SearchPage">
      <SearchBox
        controller={searchBoxController}
        instantProductsController={buildInstantProducts(engine, {
          options: {searchBoxId},
        })}
        navigate={navigate}
      />
      <h2 className="PageTitle">Search</h2>
      <DidYouMean controller={searchController.didYouMean()} />
      <SearchAndListingInterface
        searchOrListingController={searchController}
        cartController={cartController}
        navigate={navigate}
      />
    </div>
  );
}
