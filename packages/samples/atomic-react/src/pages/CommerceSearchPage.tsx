import {
  AtomicCommerceInterface,
  AtomicCommerceProductList,
  AtomicProductLink,
  AtomicProductText,
  AtomicProductPrice,
  AtomicProductDescription,
  AtomicCommerceSearchBox,
  AtomicCommerceSearchBoxInstantProducts,
  AtomicCommerceSearchBoxQuerySuggestions,
  AtomicCommerceSearchBoxRecentQueries,
  AtomicCommerceLayout,
  AtomicLayoutSection,
  AtomicCommerceFacets,
  AtomicCommerceSortDropdown,
  AtomicProductSectionVisual,
  AtomicProductImage,
  AtomicProductRating,
  AtomicProductSectionDescription,
  AtomicProductSectionEmphasized,
  AtomicProductSectionMetadata,
  AtomicProductSectionName,
} from '@coveo/atomic-react/commerce';
import {
  buildCommerceEngine,
  getSampleCommerceEngineConfiguration,
} from '@coveo/headless/commerce';
import React, {useMemo} from 'react';

export const CommerceSearchPage = () => {
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
            <AtomicCommerceSortDropdown />
          </AtomicLayoutSection>
          <AtomicLayoutSection section="products">
            <AtomicCommerceProductList
              display="grid"
              density="compact"
              image-size="small"
              template={MyTemplate}
            />
          </AtomicLayoutSection>
        </AtomicLayoutSection>
      </AtomicCommerceLayout>
    </AtomicCommerceInterface>
  );
};

function MyTemplate() {
  return (
    <>
      <AtomicProductSectionName>
        <AtomicProductLink />
      </AtomicProductSectionName>
      <AtomicProductSectionVisual>
        <AtomicProductImage field="ec_thumbnails"></AtomicProductImage>
      </AtomicProductSectionVisual>
      <AtomicProductSectionMetadata>
        <AtomicProductText
          field="ec_brand"
          class="text-neutral-dark block"
        ></AtomicProductText>
        <AtomicProductRating field="ec_rating"></AtomicProductRating>
      </AtomicProductSectionMetadata>
      <AtomicProductSectionEmphasized>
        <AtomicProductPrice />
      </AtomicProductSectionEmphasized>
      <AtomicProductSectionDescription>
        <AtomicProductDescription />
      </AtomicProductSectionDescription>
    </>
  );
}
