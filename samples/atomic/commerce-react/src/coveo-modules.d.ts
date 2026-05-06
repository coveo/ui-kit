declare module '@coveo/headless/commerce' {
  export type Product = Record<string, unknown>;
  export function buildCommerceEngine(options: {
    configuration: unknown;
  }): unknown;
  export function getSampleCommerceEngineConfiguration(): unknown;
}

declare module '@coveo/atomic-react/commerce' {
  import type {ComponentType} from 'react';

  export const AtomicCommerceFacets: ComponentType<any>;
  export const AtomicCommerceInterface: ComponentType<any>;
  export const AtomicCommerceLayout: ComponentType<any>;
  export const AtomicCommerceLoadMoreProducts: ComponentType<any>;
  export const AtomicCommerceProductList: ComponentType<any>;
  export const AtomicCommerceQuerySummary: ComponentType<any>;
  export const AtomicCommerceRecommendationInterface: ComponentType<any>;
  export const AtomicCommerceRecommendationList: ComponentType<any>;
  export const AtomicCommerceSearchBox: ComponentType<any>;
  export const AtomicCommerceSearchBoxInstantProducts: ComponentType<any>;
  export const AtomicCommerceSearchBoxQuerySuggestions: ComponentType<any>;
  export const AtomicCommerceSearchBoxRecentQueries: ComponentType<any>;
  export const AtomicCommerceSortDropdown: ComponentType<any>;
  export const AtomicLayoutSection: ComponentType<any>;
  export const AtomicProductDescription: ComponentType<any>;
  export const AtomicProductImage: ComponentType<any>;
  export const AtomicProductLink: ComponentType<any>;
  export const AtomicProductPrice: ComponentType<any>;
  export const AtomicProductRating: ComponentType<any>;
  export const AtomicProductSectionDescription: ComponentType<any>;
  export const AtomicProductSectionEmphasized: ComponentType<any>;
  export const AtomicProductSectionMetadata: ComponentType<any>;
  export const AtomicProductSectionName: ComponentType<any>;
  export const AtomicProductSectionVisual: ComponentType<any>;
  export const AtomicProductText: ComponentType<any>;
}
