export interface Product {
  ec_name: string;
  ec_brand: string;
  ec_price: number;
  ec_promo_price?: number;
  ec_image: string;
  ec_product_id: string;
  [key: string]: string | number | undefined;
}

export interface NextAction {
  text: string;
  type: string;
}

export interface BundleTierConfig {
  bundleId: string;
  label: string;
  description: string;
  slots: BundleSlotConfig[];
}

export interface CatalogComponent {
  type: string;
  heading: string;
  surfaceId: string;
  attributes?: string[];
  text?: string;
  title?: string;
  bundles?: BundleTierConfig[];
  isLoading?: boolean;
}

interface BundleSlotConfig {
  categoryLabel: string;
  surfaceRef: string;
}
