import {
  AtomicCommerceBreadbox,
  AtomicCommerceFacets,
  AtomicCommerceInterface,
  AtomicCommerceLayout,
  AtomicCommercePager,
  AtomicCommerceProductList,
  AtomicCommerceQuerySummary,
  AtomicCommerceSearchBox,
  AtomicCommerceSearchBoxQuerySuggestions,
  AtomicCommerceSearchBoxRecentQueries,
  AtomicCommerceSortDropdown,
  AtomicLayoutSection,
} from '@coveo/atomic-react/commerce';
import {useMemo} from 'react';
import {buildEngine} from '../engine';
import {ProductTemplate} from './ProductTemplate';

type Props = {
  title: string;
  viewUrl: string;
};

export const ListingPage = ({title, viewUrl}: Props) => {
  // `key`ed by viewUrl in the router so the engine rebuilds per listing.
  const engine = useMemo(() => buildEngine(viewUrl), [viewUrl]);

  return (
    <>
      <h2 className="page-title">{title}</h2>
      <AtomicCommerceInterface engine={engine} type="product-listing" languageAssetsPath="/lang">
        <AtomicCommerceLayout>
          <AtomicLayoutSection section="search">
            <AtomicCommerceSearchBox redirectionUrl="/search">
              <AtomicCommerceSearchBoxRecentQueries />
              <AtomicCommerceSearchBoxQuerySuggestions />
            </AtomicCommerceSearchBox>
          </AtomicLayoutSection>

          <AtomicLayoutSection section="facets">
            <AtomicCommerceFacets />
          </AtomicLayoutSection>

          <AtomicLayoutSection section="main">
            <AtomicLayoutSection section="status">
              <AtomicCommerceBreadbox />
              <AtomicCommerceQuerySummary />
              <AtomicCommerceSortDropdown />
            </AtomicLayoutSection>

            <AtomicLayoutSection section="products">
              <AtomicCommerceProductList
                display="grid"
                density="compact"
                imageSize="small"
                template={ProductTemplate}
              />
            </AtomicLayoutSection>

            <AtomicLayoutSection section="pagination">
              <AtomicCommercePager />
            </AtomicLayoutSection>
          </AtomicLayoutSection>
        </AtomicCommerceLayout>
      </AtomicCommerceInterface>
    </>
  );
};
