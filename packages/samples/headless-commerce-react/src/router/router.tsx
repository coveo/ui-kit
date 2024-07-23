import {
  buildCart,
  buildContext,
  CommerceEngine,
} from '@coveo/headless/commerce';
import {useEffect, useState, useTransition} from 'react';
import Layout from '../layout/layout';
import CartPage from '../pages/cart-page';
import HomePage from '../pages/home-page';
import ProductDescriptionPage from '../pages/product-description-page';
import ProductListingPage from '../pages/product-listing-page';
import SearchPage from '../pages/search-page';

interface IRouterProps {
  engine: CommerceEngine;
}

export default function Router(props: IRouterProps) {
  const {engine} = props;
  const [page, setPage] = useState('/');
  const [isPending, startTransition] = useTransition();

  const cartController = buildCart(engine);
  const contextController = buildContext(engine);

  useEffect(() => {
    setPage(window.location.pathname);
  }, []);

  function navigate(pathName: string) {
    startTransition(() => {
      window.history.pushState(null, '', pathName);
      setPage(pathName);
    });
  }

  let content;
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
    const hash = new URLSearchParams(window.location.hash.substring(1));
    content = (
      <ProductDescriptionPage
        engine={engine}
        cartController={cartController}
        contextController={contextController}
        url={`https://sports.barca.group/pdp/${hash.get('productId')}`}
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
