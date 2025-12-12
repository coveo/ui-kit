import type {
  Cart,
  ChildProduct,
  ProductListing,
} from '@coveo/headless/commerce';
import {useEffect, useState} from 'react';
import BreadcrumbManager from '../../breadcrumb-manager/breadcrumb-manager.js';
import FacetGenerator from '../../facets/facet-generator/facet-generator.js';
import Pagination from '../../pagination/pagination.js';
import ProductList from '../../product-list/product-list.js';
import ProductsPerPage from '../../products-per-page/products-per-page.js';
import Sort from '../../sort/sort.js';
import Summary from '../../summary/summary.js';
import './listing-interface.css';
import ShowMore from '../../show-more/show-more.js';

interface IListingInterface {
  listingController: ProductListing;
  cartController: Cart;
  navigate: (pathName: string) => void;
}

export default function ListingInterface(props: IListingInterface) {
  const {listingController, cartController, navigate} = props;

  const [listingState, setListingState] = useState(listingController.state);

  useEffect(() => {
    listingController.subscribe(() => setListingState(listingController.state));
  }, [listingController]);

  const summaryController = listingController.summary();
  const paginationController = listingController.pagination();

  return (
    <div className="ListingInterface row">
      <div className="row">
        <Sort controller={listingController.sort()} />
        <Summary controller={summaryController} />
      </div>
      <div className="column small">
        <FacetGenerator controller={listingController.facetGenerator()} />
      </div>
      <div className="column medium">
        <BreadcrumbManager controller={listingController.breadcrumbManager()} />

        <ProductList
          products={listingState.products}
          controllerBuilder={listingController.interactiveProduct}
          cartController={cartController}
          promoteChildToParent={(child: ChildProduct) =>
            listingController.promoteChildToParent(child)
          }
          navigate={navigate}
        ></ProductList>
        <ProductsPerPage controller={paginationController} />
        <ShowMore
          controller={paginationController}
          summaryController={summaryController}
        />
        <Pagination controller={paginationController} />
      </div>
    </div>
  );
}
