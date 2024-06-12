import {
  AtomicCommerceInterface,
  AtomicCommerceProductList,
  AtomicProductLink,
  AtomicProductText,
  AtomicProductPrice,
  AtomicProductDescription,
  buildCommerceEngine,
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
import React, {useMemo} from 'react';

export const CommerceSearchPage = () => {
  const engine = useMemo(
    () =>
      buildCommerceEngine({
        configuration: {
          accessToken: 'xxc481d5de-16cb-4290-bd78-45345319d94c',
          organizationId: 'barcasportsmcy01fvu',
          environment: 'dev',
          analytics: {
            trackingId: 'sports',
          },
          context: {
            language: 'en',
            country: 'US',
            currency: 'USD',
            view: {
              url: 'https://sports-dev.barca.group/commerce-search',
              referrer: document.referrer,
            },
          },
          cart: {
            items: [
              {
                productId: 'SP01057_00001',
                quantity: 1,
                name: 'Kayaker Canoe',
                price: 800,
              },
              {
                productId: 'SP00081_00001',
                quantity: 1,
                name: 'Bamboo Canoe Paddle',
                price: 120,
              },
              {
                productId: 'SP04236_00005',
                quantity: 1,
                name: 'Eco-Brave Rashguard',
                price: 33,
              },
              {
                productId: 'SP04236_00005',
                quantity: 1,
                name: 'Eco-Brave Rashguard',
                price: 33,
              },
            ],
          },
        },
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
          class="block text-neutral-dark"
        ></AtomicProductText>
        <AtomicProductRating field="ec_rating"></AtomicProductRating>
      </AtomicProductSectionMetadata>
      <AtomicProductSectionEmphasized>
        <AtomicProductPrice currency="USD" />
      </AtomicProductSectionEmphasized>
      <AtomicProductSectionDescription>
        <AtomicProductDescription />
      </AtomicProductSectionDescription>
    </>
  );
}
