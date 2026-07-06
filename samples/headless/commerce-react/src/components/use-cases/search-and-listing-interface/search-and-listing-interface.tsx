import type {
  Cart,
  ChildProduct,
  Search as HeadlessSearch,
  ProductListing,
} from '@coveo/headless/commerce';
import {useEffect, useState} from 'react';
import BreadcrumbManager from '../../breadcrumb-manager/breadcrumb-manager.js';
import FacetGenerator from '../../facets/facet-generator/facet-generator.js';
import Pagination from '../../pagination/pagination.js';
// ProductsPerPage is an optional page-size control, omitted to keep the sample focused:
// import ProductsPerPage from '../../products-per-page/products-per-page.js';
import ResultList from '../../result-list/result-list.js';
import Sort from '../../sort/sort.js';
import Summary from '../../summary/summary.js';
import './search-and-listing-interface.css';
// ShowMore is an alternative to the numbered Pager, omitted to keep the sample focused:
// import ShowMore from '../../show-more/show-more.js';

interface ISearchAndListingInterface {
  searchOrListingController: HeadlessSearch | ProductListing;
  cartController: Cart;
}

export default function SearchAndListingInterface(
  props: ISearchAndListingInterface
) {
  const {searchOrListingController, cartController} = props;

  const [searchOrListingState, setSearchOrListingState] = useState(
    searchOrListingController.state
  );

  useEffect(() => {
    searchOrListingController.subscribe(() =>
      setSearchOrListingState(searchOrListingController.state)
    );
  }, [searchOrListingController]);

  const summaryController = searchOrListingController.summary();
  const paginationController = searchOrListingController.pagination();

  return (
    <div className="SearchAndListingInterface row">
      <div className="row">
        <Sort controller={searchOrListingController.sort()} />
        <Summary controller={summaryController} />
      </div>
      <div className="column small">
        <FacetGenerator
          controller={searchOrListingController.facetGenerator()}
        />
      </div>
      <div className="column medium">
        <BreadcrumbManager
          controller={searchOrListingController.breadcrumbManager()}
        />

        <ResultList
          results={searchOrListingState.results}
          productControllerBuilder={
            searchOrListingController.interactiveProduct
          }
          spotlightContentControllerBuilder={
            searchOrListingController.interactiveSpotlightContent
          }
          cartController={cartController}
          promoteChildToParent={(child: ChildProduct) =>
            searchOrListingController.promoteChildToParent(child)
          }
        />
        {/* ProductsPerPage is an optional page-size control, omitted here to keep the sample focused.
        <ProductsPerPage controller={paginationController} /> */}
        {/* ShowMore is an alternative to the numbered Pager below; omitted here to keep the sample focused on a single pagination pattern.
        <ShowMore
          controller={paginationController}
          summaryController={summaryController}
        /> */}
        <Pagination controller={paginationController} />
      </div>
    </div>
  );
}
