import {
  AtomicCommerceLayout,
  AtomicCommerceRecommendationInterface,
  AtomicCommerceRecommendationList,
  AtomicLayoutSection,
  AtomicProductDescription,
  AtomicProductImage,
  AtomicProductLink,
  AtomicProductPrice,
  AtomicProductRating,
  AtomicProductSectionDescription,
  AtomicProductSectionEmphasized,
  AtomicProductSectionMetadata,
  AtomicProductSectionName,
  AtomicProductSectionVisual,
  AtomicProductText,
} from '@coveo/atomic-react/commerce';
import {
  buildCommerceEngine,
  getSampleCommerceEngineConfiguration,
} from '@coveo/headless/commerce';
import {useMemo} from 'react';

export const CommerceRecommendationPage = () => {
  const engine = useMemo(
    () =>
      buildCommerceEngine({
        configuration: getSampleCommerceEngineConfiguration(),
      }),
    []
  );

  return (
    <>
      <style>
        {`
    atomic-commerce-recommendation-list {
      margin-top: var(--atomic-layout-spacing-y);
      --atomic-recs-number-of-columns: 3;
    }

    @media only screen and (max-width: 1024px) {
      atomic-commerce-recommendation-list {
        --atomic-recs-number-of-columns: 1;
        --atomic-recs-number-of-rows: 3;
      }
    }`}
      </style>
      <AtomicCommerceRecommendationInterface engine={engine}>
        <AtomicCommerceLayout mobileBreakpoint="1024px">
          <AtomicLayoutSection section="main">
            <AtomicCommerceRecommendationList
              imageSize="small"
              display="list"
              productsPerPage={3}
              slotId="af4fb7ba-6641-4b67-9cf9-be67e9f30174"
              template={MyTemplate}
            ></AtomicCommerceRecommendationList>
          </AtomicLayoutSection>
        </AtomicCommerceLayout>
      </AtomicCommerceRecommendationInterface>
    </>
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
          className="text-neutral-dark block"
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
