// Shared frontend contract types for the Angular sample.
// These types re-export Thermidor's canonical conversation types and define
// the sample-specific commerce surface shapes used across the app.
export type {
  Turn,
  TurnStatus,
  AgentResponse,
  AgentMessage,
  A2UISurface,
  ToolCall,
  ToolCallStatus,
} from '@coveo/thermidor';

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

export type BundleDisplaySlot = {
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
