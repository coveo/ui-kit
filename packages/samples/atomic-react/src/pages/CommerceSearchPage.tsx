import {
  AtomicCommerceInterface,
  AtomicCommerceProductList,
  AtomicProductLink,
  AtomicProductText,
  AtomicProductPrice,
  AtomicProductDescription,
  getOrganizationEndpoints,
  buildCommerceEngine,
  AtomicResultBadge,
  AtomicResultFieldsList,
  AtomicResultRating,
  AtomicCommerceSearchBox,
  AtomicCommerceSearchBoxInstantProducts,
  AtomicCommerceSearchBoxQuerySuggestions,
  AtomicCommerceSearchBoxRecentQueries,
} from '@coveo/atomic-react/commerce';
import React, {useMemo} from 'react';

export const CommerceSearchPage = () => {
  const engine = useMemo(
    () =>
      buildCommerceEngine({
        configuration: {
          accessToken: 'xxc481d5de-16cb-4290-bd78-45345319d94c',
          organizationId: 'barcasportsmcy01fvu',
          organizationEndpoints: getOrganizationEndpoints(
            'barcasportsmcy01fvu',
            'dev'
          ),
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
      <AtomicCommerceSearchBox>
        <AtomicCommerceSearchBoxRecentQueries></AtomicCommerceSearchBoxRecentQueries>
        <AtomicCommerceSearchBoxQuerySuggestions></AtomicCommerceSearchBoxQuerySuggestions>
        <AtomicCommerceSearchBoxInstantProducts image-size="small"></AtomicCommerceSearchBoxInstantProducts>
      </AtomicCommerceSearchBox>
      <AtomicCommerceProductList
        display="list"
        density="compact"
        image-size="small"
        template={MyTemplate}
      />
    </AtomicCommerceInterface>
  );
};

function MyTemplate() {
  return (
    <>
      <AtomicProductLink class="font-bold"></AtomicProductLink>

      <AtomicProductText field="ec_brand"></AtomicProductText>

      <AtomicResultRating field="ec_rating"></AtomicResultRating>

      <AtomicProductPrice currency="USD"></AtomicProductPrice>
      <AtomicProductDescription></AtomicProductDescription>
      <AtomicResultFieldsList>
        <AtomicResultBadge label="In stock"></AtomicResultBadge>
      </AtomicResultFieldsList>
    </>
  );
}
