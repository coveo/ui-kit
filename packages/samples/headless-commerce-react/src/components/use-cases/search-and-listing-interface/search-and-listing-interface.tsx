import {
  Cart,
  Search as HeadlessSearch,
  ProductListing,
} from '@coveo/headless/commerce';
import {useState, useEffect} from 'react';
import BreadcrumbManager from '../../breadcrumb-manager/breadcrumb-manager';
import FacetGenerator from '../../facets/facet-generator/facet-generator';
import ProductList from '../../product-list/product-list';
import ShowMore from '../../show-more/show-more';
import Sort from '../../sort/sort';
import Summary from '../../summary/summary';
import './search-and-listing-interface.css';

//import Pagination from './pagination/pagination';

interface ISearchAndListingInterface {
  searchOrListingController: HeadlessSearch | ProductListing;
  cartController: Cart;
  navigate: (pathName: string) => void;
}

export default function SearchAndListingInterface(
  props: ISearchAndListingInterface
) {
  const {searchOrListingController, cartController, navigate} = props;

  const [searchOrListingState, setSearchOrListingState] = useState(
    searchOrListingController.state
  );

  useEffect(() => {
    searchOrListingController.subscribe(() =>
      setSearchOrListingState(searchOrListingController.state)
    );
  }, [searchOrListingController]);

  return (
    <div className="SearchAndListingInterface row">
      <div className="column">
        <FacetGenerator
          controller={searchOrListingController.facetGenerator()}
        />
      </div>
      <div className="column">
        <BreadcrumbManager
          controller={searchOrListingController.breadcrumbManager()}
        />
        <Sort controller={searchOrListingController.sort()} />
        <Summary controller={searchOrListingController.summary()} />
        <ProductList
          products={searchOrListingState.products}
          controllerBuilder={searchOrListingController.interactiveProduct}
          cartController={cartController}
          navigate={navigate}
        ></ProductList>
        <ShowMore controller={searchOrListingController.pagination()} />
        {/*<Pagination controller={controller.pagination()} />*/}
      </div>
    </div>
  );
}
