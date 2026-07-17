import {
  AtomicProductImage,
  AtomicProductLink,
  AtomicProductPrice,
  AtomicProductRating,
  AtomicProductSectionEmphasized,
  AtomicProductSectionMetadata,
  AtomicProductSectionName,
  AtomicProductSectionVisual,
  AtomicProductText,
} from '@coveo/atomic-react/commerce';

// Shared product card template for the product lists and recommendations.
export const ProductTemplate = () => (
  <>
    <AtomicProductSectionVisual>
      <AtomicProductImage field="ec_thumbnails" />
    </AtomicProductSectionVisual>
    <AtomicProductSectionName>
      <AtomicProductLink />
    </AtomicProductSectionName>
    <AtomicProductSectionMetadata>
      <AtomicProductText field="ec_brand" className="text-neutral-dark block" />
      <AtomicProductRating field="ec_rating" />
    </AtomicProductSectionMetadata>
    <AtomicProductSectionEmphasized>
      <AtomicProductPrice />
    </AtomicProductSectionEmphasized>
  </>
);
