import {AtomicTableElement} from '@coveo/atomic-react';
import {
  AtomicCommerceFacets,
  AtomicCommerceInterface,
  AtomicCommerceLayout,
  AtomicCommerceLoadMoreProducts,
  AtomicCommerceProductList,
  AtomicCommerceQuerySummary,
  AtomicCommerceSearchBox,
  AtomicCommerceSearchBoxInstantProducts,
  AtomicCommerceSearchBoxQuerySuggestions,
  AtomicCommerceSearchBoxRecentQueries,
  AtomicCommerceSortDropdown,
  AtomicLayoutSection,
  AtomicProductImage,
  AtomicProductLink,
  AtomicProductPrice,
  AtomicProductRating,
  AtomicProductSectionEmphasized,
  AtomicProductSectionName,
  AtomicProductSectionVisual,
  AtomicProductText,
} from '@coveo/atomic-react/commerce';
import {
  buildCommerceEngine,
  getSampleCommerceEngineConfiguration,
} from '@coveo/headless/commerce';
import type {FunctionComponent} from 'react';
import {useMemo} from 'react';

export const CommerceTableProductListPage: FunctionComponent = () => {
  const engine = useMemo(
    () =>
      buildCommerceEngine({
        configuration: getSampleCommerceEngineConfiguration(),
      }),
    []
  );

  return (
    <AtomicCommerceInterface engine={engine} type="search">
      <AtomicCommerceLayout>
        <AtomicLayoutSection section="search">
          <AtomicCommerceSearchBox>
            <AtomicCommerceSearchBoxRecentQueries></AtomicCommerceSearchBoxRecentQueries>
            <AtomicCommerceSearchBoxQuerySuggestions></AtomicCommerceSearchBoxQuerySuggestions>
            <AtomicCommerceSearchBoxInstantProducts image-size="small"></AtomicCommerceSearchBoxInstantProducts>
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
              display="table"
              density="compact"
              image-size="small"
              template={MyTemplate}
            />
          </AtomicLayoutSection>
          <AtomicLayoutSection section="pagination">
            <AtomicCommerceLoadMoreProducts />
          </AtomicLayoutSection>
        </AtomicLayoutSection>
      </AtomicCommerceLayout>
    </AtomicCommerceInterface>
  );
};

function MyTemplate() {
  return (
    <>
      <AtomicTableElement label="Image">
        <AtomicProductSectionVisual>
          <AtomicProductImage field="ec_images"></AtomicProductImage>
        </AtomicProductSectionVisual>
      </AtomicTableElement>
      <AtomicTableElement label="Product description">
        <AtomicProductSectionName>
          <AtomicProductLink></AtomicProductLink>
          <AtomicProductText field="title"></AtomicProductText>
        </AtomicProductSectionName>

        <AtomicProductSectionEmphasized>
          <AtomicProductPrice></AtomicProductPrice>
        </AtomicProductSectionEmphasized>
      </AtomicTableElement>
      <AtomicTableElement label="Rating">
        <AtomicProductRating field="ec_rating"></AtomicProductRating>
      </AtomicTableElement>
    </>
  );
}
