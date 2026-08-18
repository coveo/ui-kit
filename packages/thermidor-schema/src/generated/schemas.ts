// This file is generated from the canonical JSON Schema documents.
// Do not edit it directly; run `pnpm run generate` from the package root.

import * as z from "zod/v4";

// The kind of action: "followup" triggers a conversational follow-up, "search" triggers a
// standalone search.
//
// The kind of action selected: "followup" or "search".

export const TypeSchema = z.enum(["followup", "search"]);
export type Type = z.infer<typeof TypeSchema>;

export const ProductSchema = z.strictObject({
  additionalFields: z.record(z.string(), z.unknown()),
  get children() {
    return z.array(ProductSchema).optional();
  },
  clickUri: z.url().optional(),
  ec_brand: z.string().optional(),
  ec_category: z.array(z.string()).optional(),
  ec_color: z.string().optional(),
  ec_description: z.string().optional(),
  ec_images: z.array(z.url()).optional(),
  ec_in_stock: z.boolean().optional(),
  ec_item_group_id: z.string().optional(),
  ec_item_group_name: z.string().optional(),
  ec_name: z.string(),
  ec_price: z.number().optional(),
  ec_promo_price: z.number().optional(),
  ec_rating: z.union([z.number().min(0).max(5), z.null()]).optional(),
  ec_shortdesc: z.string().optional(),
  ec_thumbnails: z.array(z.url()).optional(),
  permanentid: z.string(),
});
export type Product = z.infer<typeof ProductSchema>;

export const ProductListControllerContractActionsSchema = z.strictObject({});
export type ProductListControllerContractActions = z.infer<
  typeof ProductListControllerContractActionsSchema
>;

export const ProductListStateSchema = z.strictObject({
  products: z.array(ProductSchema),
});
export type ProductListState = z.infer<typeof ProductListStateSchema>;

export const CartItemSchema = z.strictObject({
  name: z.string(),
  price: z.number().min(0),
  productId: z.string(),
  quantity: z.number().int().min(1),
});
export type CartItem = z.infer<typeof CartItemSchema>;

export const UpdateItemQuantityPayloadSchema = z.strictObject({
  item: CartItemSchema,
});
export type UpdateItemQuantityPayload = z.infer<typeof UpdateItemQuantityPayloadSchema>;

export const CartStateSchema = z.strictObject({
  items: z.array(CartItemSchema),
});
export type CartState = z.infer<typeof CartStateSchema>;

export const SelectActionPayloadSchema = z.strictObject({
  text: z.string(),
  type: z.enum(["followup", "search"]),
});
export type SelectActionPayload = z.infer<typeof SelectActionPayloadSchema>;

export const ActionItemSchema = z.strictObject({
  text: z.string(),
  type: z.enum(["followup", "search"]),
});
export type ActionItem = z.infer<typeof ActionItemSchema>;

export const BundleDisplayControllerContractActionsSchema = z.strictObject({});
export type BundleDisplayControllerContractActions = z.infer<
  typeof BundleDisplayControllerContractActionsSchema
>;

export const BundleSlotSchema = z.strictObject({
  categoryLabel: z.string(),
  surfaceRef: z.string(),
});
export type BundleSlot = z.infer<typeof BundleSlotSchema>;

export const ComparisonTableControllerContractActionsSchema = z.strictObject({});
export type ComparisonTableControllerContractActions = z.infer<
  typeof ComparisonTableControllerContractActionsSchema
>;

export const ComparisonAttributeSchema = z.strictObject({
  key: z.string(),
  label: z.string(),
});
export type ComparisonAttribute = z.infer<typeof ComparisonAttributeSchema>;

export const ComparisonProductSchema = z.strictObject({
  imageUrl: z.url().optional(),
  name: z.string(),
  price: z.number().optional(),
  productId: z.string(),
  rating: z.number().min(0).max(5).optional(),
  values: z.record(z.string(), z.string()),
});
export type ComparisonProduct = z.infer<typeof ComparisonProductSchema>;

export const ProductListControllerContractSchema = z.strictObject({
  actions: ProductListControllerContractActionsSchema,
  controllerSchema: z.literal(
    "https://schema.thermidor.coveo.com/controllers/product-list.schema.json",
  ),
  state: ProductListStateSchema,
});
export type ProductListControllerContract = z.infer<typeof ProductListControllerContractSchema>;

export const SetItemsPayloadSchema = z.strictObject({
  items: z.array(CartItemSchema),
});
export type SetItemsPayload = z.infer<typeof SetItemsPayloadSchema>;

export const UpdateItemQuantitySchema = z.strictObject({
  payload: UpdateItemQuantityPayloadSchema,
});
export type UpdateItemQuantity = z.infer<typeof UpdateItemQuantitySchema>;

export const SelectActionSchema = z.strictObject({
  payload: SelectActionPayloadSchema,
});
export type SelectAction = z.infer<typeof SelectActionSchema>;

export const NextActionsStateSchema = z.strictObject({
  actions: z.array(ActionItemSchema),
});
export type NextActionsState = z.infer<typeof NextActionsStateSchema>;

export const BundleTierSchema = z.strictObject({
  description: z.string(),
  label: z.string(),
  slots: z.array(BundleSlotSchema),
});
export type BundleTier = z.infer<typeof BundleTierSchema>;

export const ComparisonTableStateSchema = z.strictObject({
  attributes: z.array(ComparisonAttributeSchema),
  products: z.array(ComparisonProductSchema),
});
export type ComparisonTableState = z.infer<typeof ComparisonTableStateSchema>;

export const SetItemsSchema = z.strictObject({
  payload: SetItemsPayloadSchema,
});
export type SetItems = z.infer<typeof SetItemsSchema>;

export const NextActionsControllerContractActionsSchema = z.strictObject({
  selectAction: SelectActionSchema,
});
export type NextActionsControllerContractActions = z.infer<
  typeof NextActionsControllerContractActionsSchema
>;

export const BundleDisplayStateSchema = z.strictObject({
  tiers: z.array(BundleTierSchema),
});
export type BundleDisplayState = z.infer<typeof BundleDisplayStateSchema>;

export const ComparisonTableControllerContractSchema = z.strictObject({
  actions: ComparisonTableControllerContractActionsSchema,
  controllerSchema: z.literal(
    "https://schema.thermidor.coveo.com/controllers/comparison-table.schema.json",
  ),
  state: ComparisonTableStateSchema,
});
export type ComparisonTableControllerContract = z.infer<
  typeof ComparisonTableControllerContractSchema
>;

export const CartControllerContractActionsSchema = z.strictObject({
  setItems: SetItemsSchema,
  updateItemQuantity: UpdateItemQuantitySchema,
});
export type CartControllerContractActions = z.infer<typeof CartControllerContractActionsSchema>;

export const NextActionsControllerContractSchema = z.strictObject({
  actions: NextActionsControllerContractActionsSchema,
  controllerSchema: z.literal(
    "https://schema.thermidor.coveo.com/controllers/next-actions.schema.json",
  ),
  state: NextActionsStateSchema,
});
export type NextActionsControllerContract = z.infer<typeof NextActionsControllerContractSchema>;

export const BundleDisplayControllerContractSchema = z.strictObject({
  actions: BundleDisplayControllerContractActionsSchema,
  controllerSchema: z.literal(
    "https://schema.thermidor.coveo.com/controllers/bundle-display.schema.json",
  ),
  state: BundleDisplayStateSchema,
});
export type BundleDisplayControllerContract = z.infer<typeof BundleDisplayControllerContractSchema>;

export const CartControllerContractSchema = z.strictObject({
  actions: CartControllerContractActionsSchema,
  controllerSchema: z.literal("https://schema.thermidor.coveo.com/controllers/cart.schema.json"),
  state: CartStateSchema,
});
export type CartControllerContract = z.infer<typeof CartControllerContractSchema>;

export const ControllerContractsSchema = z.discriminatedUnion("controllerSchema", [
  ProductListControllerContractSchema,
  CartControllerContractSchema,
  NextActionsControllerContractSchema,
  BundleDisplayControllerContractSchema,
  ComparisonTableControllerContractSchema,
]);
export type ControllerContracts = z.infer<typeof ControllerContractsSchema>;
