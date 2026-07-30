import {
  AtomicCommerceFacets,
  AtomicCommerceInterface,
  AtomicCommerceLayout,
  AtomicCommercePager,
  AtomicCommerceProductList,
  AtomicCommerceQuerySummary,
  AtomicCommerceSearchBox,
  AtomicCommerceSearchBoxInstantProducts,
  AtomicCommerceSearchBoxQuerySuggestions,
  AtomicCommerceSearchBoxRecentQueries,
  AtomicCommerceSortDropdown,
  AtomicLayoutSection,
} from '@coveo/atomic-react/commerce';
import {useMemo} from 'react';
import {buildEngine} from '../engine';
import {ProductTemplate} from './ProductTemplate';

export const SearchPage = () => {
  const engine = useMemo(() => buildEngine('https://sports.barca.group/commerce-search'), []);

  return (
    <AtomicCommerceInterface engine={engine} type="search" languageAssetsPath="/lang">
      <AtomicCommerceLayout>
        <AtomicLayoutSection section="search">
          <AtomicCommerceSearchBox>
            <AtomicCommerceSearchBoxRecentQueries />
            <AtomicCommerceSearchBoxQuerySuggestions />
            <AtomicCommerceSearchBoxInstantProducts imageSize="small" />
          </AtomicCommerceSearchBox>
        </AtomicLayoutSection>

        <AtomicLayoutSection section="facets">
          <AtomicCommerceFacets />
        </AtomicLayoutSection>

        <AtomicLayoutSection section="main">
          <AtomicLayoutSection section="status">
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
  );
};
