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

export interface ValueMapEntry {
  key: string;
  valueString?: string;
  valueNumber?: number;
  valueMap?: ValueMapEntry[];
}

export interface ServerToClientMessage {
  dataModelUpdate?: DataModelUpdate;
  surfaceUpdate?: SurfaceUpdate;
}

export interface A2UISurfaceContent {
  operations: ServerToClientMessage[];
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

interface DataModelUpdate {
  surfaceId?: string;
  contents: {key: string; valueMap?: ValueMapEntry[]}[];
}

interface SurfaceUpdate {
  surfaceId?: string;
  components: {component: Record<string, unknown>}[];
}

interface BundleSlotConfig {
  categoryLabel: string;
  surfaceRef: string;
}
