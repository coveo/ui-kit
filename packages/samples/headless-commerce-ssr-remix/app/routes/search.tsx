import BreadcrumbManager from '@/app/components/breadcrumb-manager';
import ContextDropdown from '@/app/components/context-dropdown';
import DidYouMean from '@/app/components/did-you-mean';
import FacetGenerator from '@/app/components/facets/facet-generator';
import ProductList from '@/app/components/product-list';
import ShowMore from '@/app/components/show-more';
import Sort from '@/app/components/sort';
import Summary from '@/app/components/summary';
import Triggers from '@/app/components/triggers/triggers';
import externalContextService from '@/external-services/external-context-service';

export const loader = async () => {
  const {language, currency} =
    await externalContextService.getContextInformation();

  return {language, currency};
};

export default function SearchRoute({
  language,
  currency,
}: {
  language: string;
  currency: string;
}) {
  return (
    <>
      <Triggers />
      <h2>Search</h2>

      <div style={{display: 'flex', flexDirection: 'row'}}>
        <div style={{flex: 12}}>
          <ContextDropdown useCase="search" />
          <FacetGenerator />
        </div>
        <div style={{flex: 2}}>
          <Triggers />
          <DidYouMean />
        </div>
        <div style={{flex: 1}}></div>
        <div style={{flex: 12}}>
          <Summary />
          <ProductList language={language} currency={currency} />

          {/* The `Pagination` and `ShowMore` components showcase two frequent but mutually exclusive ways to implement
              pagination. */}

          {/* <Pagination
          staticState={staticState.controllers.pagination.state}
          controller={hydratedState?.controllers.pagination}
        ></Pagination> */}

          <ShowMore />
        </div>
        <div style={{flex: 1}}></div>
        <div style={{flex: 12}}>
          <Sort />
          <BreadcrumbManager />
        </div>
      </div>
    </>
  );
}
