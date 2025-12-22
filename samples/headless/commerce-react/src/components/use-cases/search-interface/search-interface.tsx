import type {
  Cart,
  ChildProduct,
  Search as HeadlessSearch,
} from '@coveo/headless/commerce';
import {useEffect, useState} from 'react';
import BreadcrumbManager from '../../breadcrumb-manager/breadcrumb-manager.js';
import FacetGenerator from '../../facets/facet-generator/facet-generator.js';
import Pagination from '../../pagination/pagination.js';
import ProductList from '../../product-list/product-list.js';
import ProductsPerPage from '../../products-per-page/products-per-page.js';
import Sort from '../../sort/sort.js';
import Summary from '../../summary/summary.js';
import './search-interface.css';
import ShowMore from '../../show-more/show-more.js';

interface ISearchInterface {
  searchController: HeadlessSearch;
  cartController: Cart;
  navigate: (pathName: string) => void;
}

export default function SearchInterface(props: ISearchInterface) {
  const {searchController, cartController, navigate} = props;

  const [searchState, setSearchState] = useState(searchController.state);

  useEffect(() => {
    searchController.subscribe(() => setSearchState(searchController.state));
  }, [searchController]);

  const summaryController = searchController.summary();
  const paginationController = searchController.pagination();

  return (
    <div className="SearchInterface row">
      <div className="row">
        <Sort controller={searchController.sort()} />
        <Summary controller={summaryController} />
      </div>
      <div className="column small">
        <FacetGenerator controller={searchController.facetGenerator()} />
      </div>
      <div className="column medium">
        <BreadcrumbManager controller={searchController.breadcrumbManager()} />

        <ProductList
          products={searchState.products}
          controllerBuilder={searchController.interactiveProduct}
          cartController={cartController}
          promoteChildToParent={(child: ChildProduct) =>
            searchController.promoteChildToParent(child)
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
