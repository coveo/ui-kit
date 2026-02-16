import {
  buildCart,
  buildContext,
  type CommerceEngine,
} from '@coveo/headless/commerce';
import {useEffect, useState, useTransition} from 'react';
import Layout from '../layout/layout.js';
import CartPage from '../pages/cart-page.js';
import HomePage from '../pages/home-page.js';
import ProductDescriptionPage from '../pages/product-description-page.js';
import ProductListingPage from '../pages/product-listing-page.js';
import SearchPage from '../pages/search-page.js';

interface IRouterProps {
  engine: CommerceEngine;
}

export default function Router(props: IRouterProps) {
  const {engine} = props;
  const [page, setPage] = useState('/');
  const [previousPage, setPreviousPage] = useState('/');
  const [isPending, startTransition] = useTransition();

  const cartController = buildCart(engine);
  const contextController = buildContext(engine);

  useEffect(() => {
    setPreviousPage(window.location.pathname);
    setPage(window.location.pathname);
  }, []);

  function navigate(pathName: string) {
    window.history.pushState(null, '', pathName);
    startTransition(() => {
      setPreviousPage(window.location.pathname);
      setPage(pathName);
    });
  }

  useEffect(() => {
    const handlePopState = () => {
      if (previousPage !== window.location.pathname) {
        startTransition(() => {
          setPage(window.location.pathname);
          setPreviousPage(window.location.pathname);
        });
      }
    };
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [previousPage]);

  let content: React.ReactNode;
  if (/\/listing\/surf-accessories/.test(page)) {
    content = (
      <ProductListingPage
        engine={engine}
        cartController={cartController}
        contextController={contextController}
        url="https://sports.barca.group/browse/promotions/surf-accessories"
        pageName="Surf Accessories"
        navigate={navigate}
      />
    );
  } else if (/\/listing\/pants/.test(page)) {
    content = (
      <ProductListingPage
        engine={engine}
        cartController={cartController}
        contextController={contextController}
        url="https://sports.barca.group/browse/promotions/clothing/pants"
        pageName="Pants"
        navigate={navigate}
      />
    );
  } else if (/\/listing\/towels/.test(page)) {
    content = (
      <ProductListingPage
        engine={engine}
        cartController={cartController}
        contextController={contextController}
        url="https://sports.barca.group/browse/promotions/accessories/towels"
        pageName="Towels"
        navigate={navigate}
      />
    );
  } else if (/\/search/.test(page)) {
    content = (
      <SearchPage
        engine={engine}
        cartController={cartController}
        contextController={contextController}
        url="https://sports.barca.group/search"
        navigate={navigate}
      />
    );
  } else if (/\/cart/.test(page)) {
    content = (
      <CartPage
        engine={engine}
        cartController={cartController}
        contextController={contextController}
        url="https://sports.barca.group/cart"
        navigate={navigate}
      />
    );
  } else if (/\/product/.test(page)) {
    const productId = page.split('/')[2];
    content = (
      <ProductDescriptionPage
        engine={engine}
        cartController={cartController}
        contextController={contextController}
        url={`https://sports.barca.group/pdp/${productId}`}
        navigate={navigate}
      ></ProductDescriptionPage>
    );
  } else {
    content = (
      <HomePage
        engine={engine}
        cartController={cartController}
        contextController={contextController}
        url="https://sports.barca.group"
        navigate={navigate}
      />
    );
  }

  return (
    <Layout engine={engine} isPending={isPending} navigate={navigate}>
      {content}
    </Layout>
  );
}
