// Shared frontend contract types for the Angular sample.
// These types re-export Thermidor's canonical conversation types and define
// the sample-specific commerce surface shapes used across the app.
export type {Turn, A2UISurface, ReasoningStep, RoutedInterface} from '@coveo/thermidor';

export type ProductRecord = {
  ec_product_id: string;
  ec_name: string;
  ec_brand: string;
  ec_price: number;
  ec_promo_price?: number;
  ec_image: string;
  clickUri: string;
  description?: string;
  accent?: string;
  [key: string]: string | number | undefined;
};

export type NextAction = {
  text: string;
  type: 'search' | 'followup';
};

type BundleSlotConfig = {
  categoryLabel: string;
  surfaceRef: string;
};

type BundleTierConfig = {
  bundleId: string;
  label: string;
  description: string;
  slots: BundleSlotConfig[];
};

export type ValueMapEntry = {
  key: string;
  valueString?: string;
  valueNumber?: number;
  valueMap?: ValueMapItem[];
};

export type ValueMapItem = {
  valueMap?: ValueMapEntry[];
};

type BeginRenderingOperation = {
  beginRendering: {
    surfaceId: string;
    root: string;
    catalogId: string;
  };
};

type LiteralOrPath = {
  literalString?: string;
  path?: string;
};

type ProductCardComponent = {
  ProductCard: {
    ec_product_id?: {path: string};
    ec_name?: {path: string};
    ec_brand?: {path: string};
    ec_image?: {path: string};
    ec_price?: {path: string};
    ec_promo_price?: {path: string};
  };
};

type ProductCarouselComponent = {
  ProductCarousel: {
    heading?: LiteralOrPath;
    products?: {
      componentId: string;
      dataBinding: string;
    };
    isLoading?: boolean;
  };
};

type ComparisonTableComponent = {
  ComparisonTable: {
    heading?: LiteralOrPath;
    products?: {
      componentId: string;
      dataBinding: string;
    };
    attributes?: string[];
    isLoading?: boolean;
  };
};

type ComparisonSummaryComponent = {
  ComparisonSummary: {
    text?: LiteralOrPath;
  };
};

type BundleDisplayComponent = {
  BundleDisplay: {
    title?: LiteralOrPath;
    bundles?: BundleTierConfig[];
    isLoading?: boolean;
  };
};

type NextActionsBarComponent = {
  NextActionsBar: {
    actions?: {
      componentId: string;
      dataBinding: string;
    };
    isLoading?: boolean;
  };
};

type SurfaceComponentPayload =
  | ProductCardComponent
  | ProductCarouselComponent
  | ComparisonTableComponent
  | ComparisonSummaryComponent
  | BundleDisplayComponent
  | NextActionsBarComponent;

export type SurfaceUpdateOperation = {
  surfaceUpdate: {
    surfaceId: string;
    components: Array<{
      id: string;
      component: SurfaceComponentPayload;
    }>;
  };
};

export type DataModelUpdateOperation = {
  dataModelUpdate: {
    surfaceId: string;
    contents: Array<{
      key: string;
      valueMap?: ValueMapItem[];
    }>;
  };
};

export type A2UIOperation =
  | BeginRenderingOperation
  | SurfaceUpdateOperation
  | DataModelUpdateOperation
  | Record<string, unknown>;

export type ActivitySnapshotContent = {
  operations: A2UIOperation[];
};

export type CommerceSurfaceComponentType =
  | 'ProductCarousel'
  | 'ComparisonTable'
  | 'ComparisonSummary'
  | 'BundleDisplay'
  | 'NextActionsBar'
  | 'ProductCard';

export type ProductCarouselSurface = {
  surfaceId: string;
  componentType: 'ProductCarousel';
  heading: string;
  products: ProductRecord[];
  isLoading: boolean;
};

export type ComparisonTableSurface = {
  surfaceId: string;
  componentType: 'ComparisonTable';
  heading: string;
  attributes: string[];
  products: ProductRecord[];
  isLoading: boolean;
};

export type ComparisonSummarySurface = {
  surfaceId: string;
  componentType: 'ComparisonSummary';
  text: string;
};

type BundleDisplaySlot = {
  categoryLabel: string;
  surfaceRef: string;
  product: ProductRecord | null;
};

export type BundleDisplayTier = {
  bundleId: string;
  label: string;
  description: string;
  slots: BundleDisplaySlot[];
};

export type BundleDisplaySurface = {
  surfaceId: string;
  componentType: 'BundleDisplay';
  title: string;
  bundles: BundleDisplayTier[];
  isLoading: boolean;
};

export type NextActionsBarSurface = {
  surfaceId: string;
  componentType: 'NextActionsBar';
  actions: NextAction[];
  isLoading: boolean;
};

export type RenderableCommerceSurface =
  | ProductCarouselSurface
  | ComparisonTableSurface
  | ComparisonSummarySurface
  | BundleDisplaySurface
  | NextActionsBarSurface;
