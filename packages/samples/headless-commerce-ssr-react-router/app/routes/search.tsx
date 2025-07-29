import BreadcrumbManager from '@/app/components/breadcrumb-manager';
import ContextDropdown from '@/app/components/context-dropdown';
import DidYouMean from '@/app/components/did-you-mean';
import FacetGenerator from '@/app/components/facets/facet-generator';
import ProductList from '@/app/components/product-list';
import ShowMore from '@/app/components/show-more';
import Sort from '@/app/components/sort';
import Summary from '@/app/components/summary';
import NotifyTrigger from '../components/triggers/notify-trigger.js';

export default function SearchRoute() {
  return (
    <>
      <h2>Search</h2>
      <NotifyTrigger />
      <ContextDropdown useCase="search" />
      <div style={{display: 'flex', flexDirection: 'row'}}>
        <div style={{flex: 1}}>
          <FacetGenerator />
        </div>
        <div style={{flex: 2}}>
          <DidYouMean />
          <BreadcrumbManager />
          <Summary />
          <Sort />
          <ProductList />

          {/* The `Pagination` and `ShowMore` components showcase two frequent but mutually exclusive ways to implement
              pagination. */}

          {/* <Pagination
          staticState={staticState.controllers.pagination.state}
          controller={hydratedState?.controllers.pagination}
        ></Pagination> */}

          <ShowMore />
        </div>
      </div>
    </>
  );
}
