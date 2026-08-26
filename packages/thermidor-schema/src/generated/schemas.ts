// This file is generated from the canonical JSON Schema documents.
// Do not edit it directly; run `pnpm run generate` from the package root.

import * as z from 'zod/v4';

// The kind of action: "followup" triggers a conversational follow-up, "search" triggers a
// standalone search.
//
// The kind of action selected: "followup" or "search".

export const TypeSchema = z.enum(['followup', 'search']);
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

export const ProductCarouselActionsSchema = z.strictObject({});
export type ProductCarouselActions = z.infer<typeof ProductCarouselActionsSchema>;

export const ProductCarouselStateSchema = z.strictObject({
  heading: z.string(),
  products: z.array(ProductSchema),
});
export type ProductCarouselState = z.infer<typeof ProductCarouselStateSchema>;

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
  type: z.enum(['followup', 'search']),
});
export type SelectActionPayload = z.infer<typeof SelectActionPayloadSchema>;

export const ActionItemSchema = z.strictObject({
  text: z.string(),
  type: z.enum(['followup', 'search']),
});
export type ActionItem = z.infer<typeof ActionItemSchema>;

export const BundleDisplayActionsSchema = z.strictObject({});
export type BundleDisplayActions = z.infer<typeof BundleDisplayActionsSchema>;

export const BundleSlotSchema = z.strictObject({
  categoryLabel: z.string(),
  surfaceRef: z.string(),
});
export type BundleSlot = z.infer<typeof BundleSlotSchema>;

export const ComparisonTableActionsSchema = z.strictObject({});
export type ComparisonTableActions = z.infer<typeof ComparisonTableActionsSchema>;

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

export const ProductListActionsSchema = z.strictObject({});
export type ProductListActions = z.infer<typeof ProductListActionsSchema>;

export const ProductListStateSchema = z.strictObject({
  products: z.array(ProductSchema),
});
export type ProductListState = z.infer<typeof ProductListStateSchema>;

export const SelectPagePayloadSchema = z.strictObject({
  page: z.number().int().min(0),
});
export type SelectPagePayload = z.infer<typeof SelectPagePayloadSchema>;

export const SetPageSizePayloadSchema = z.strictObject({
  pageSize: z.number().int().min(1),
});
export type SetPageSizePayload = z.infer<typeof SetPageSizePayloadSchema>;

export const PaginationStateSchema = z.strictObject({
  page: z.number().int().min(0),
  pageSize: z.number().int().min(1),
  totalEntries: z.number().int().min(0),
  totalPages: z.number().int().min(0),
});
export type PaginationState = z.infer<typeof PaginationStateSchema>;

export const SetSortPayloadSchema = z.strictObject({
  fields: z.array(z.unknown()),
  sortCriteria: z.string(),
});
export type SetSortPayload = z.infer<typeof SetSortPayloadSchema>;

export const SortCriterionSchema = z.strictObject({
  fields: z.array(z.unknown()),
  sortCriteria: z.string(),
});
export type SortCriterion = z.infer<typeof SortCriterionSchema>;

export const SubmitQueryPayloadSchema = z.strictObject({
  query: z.string(),
});
export type SubmitQueryPayload = z.infer<typeof SubmitQueryPayloadSchema>;

export const SearchBoxStateSchema = z.strictObject({
  query: z.string(),
});
export type SearchBoxState = z.infer<typeof SearchBoxStateSchema>;

export const ProductCarouselSchema = z.strictObject({
  actions: ProductCarouselActionsSchema,
  componentType: z.literal('product-carousel'),
  state: ProductCarouselStateSchema,
});
export type ProductCarousel = z.infer<typeof ProductCarouselSchema>;

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

export const ProductListSchema = z.strictObject({
  actions: ProductListActionsSchema,
  componentType: z.literal('product-list'),
  state: ProductListStateSchema,
});
export type ProductList = z.infer<typeof ProductListSchema>;

export const SelectPageSchema = z.strictObject({
  payload: SelectPagePayloadSchema,
});
export type SelectPage = z.infer<typeof SelectPageSchema>;

export const SetPageSizeSchema = z.strictObject({
  payload: SetPageSizePayloadSchema,
});
export type SetPageSize = z.infer<typeof SetPageSizeSchema>;

export const SetSortSchema = z.strictObject({
  payload: SetSortPayloadSchema,
});
export type SetSort = z.infer<typeof SetSortSchema>;

export const SortStateSchema = z.strictObject({
  appliedSort: SortCriterionSchema,
  availableSorts: z.array(SortCriterionSchema),
});
export type SortState = z.infer<typeof SortStateSchema>;

export const SubmitQuerySchema = z.strictObject({
  payload: SubmitQueryPayloadSchema,
});
export type SubmitQuery = z.infer<typeof SubmitQuerySchema>;

export const SetItemsSchema = z.strictObject({
  payload: SetItemsPayloadSchema,
});
export type SetItems = z.infer<typeof SetItemsSchema>;

export const NextActionsBarActionsSchema = z.strictObject({
  selectAction: SelectActionSchema,
});
export type NextActionsBarActions = z.infer<typeof NextActionsBarActionsSchema>;

export const BundleDisplayStateSchema = z.strictObject({
  tiers: z.array(BundleTierSchema),
});
export type BundleDisplayState = z.infer<typeof BundleDisplayStateSchema>;

export const ComparisonTableSchema = z.strictObject({
  actions: ComparisonTableActionsSchema,
  componentType: z.literal('comparison-table'),
  state: ComparisonTableStateSchema,
});
export type ComparisonTable = z.infer<typeof ComparisonTableSchema>;

export const PaginationActionsSchema = z.strictObject({
  selectPage: SelectPageSchema,
  setPageSize: SetPageSizeSchema,
});
export type PaginationActions = z.infer<typeof PaginationActionsSchema>;

export const SortActionsSchema = z.strictObject({
  setSort: SetSortSchema,
});
export type SortActions = z.infer<typeof SortActionsSchema>;

export const SearchBoxActionsSchema = z.strictObject({
  submitQuery: SubmitQuerySchema,
});
export type SearchBoxActions = z.infer<typeof SearchBoxActionsSchema>;

export const CartActionsSchema = z.strictObject({
  setItems: SetItemsSchema,
  updateItemQuantity: UpdateItemQuantitySchema,
});
export type CartActions = z.infer<typeof CartActionsSchema>;

export const NextActionsBarSchema = z.strictObject({
  actions: NextActionsBarActionsSchema,
  componentType: z.literal('next-actions-bar'),
  state: NextActionsStateSchema,
});
export type NextActionsBar = z.infer<typeof NextActionsBarSchema>;

export const BundleDisplaySchema = z.strictObject({
  actions: BundleDisplayActionsSchema,
  componentType: z.literal('bundle-display'),
  state: BundleDisplayStateSchema,
});
export type BundleDisplay = z.infer<typeof BundleDisplaySchema>;

export const PaginationSchema = z.strictObject({
  actions: PaginationActionsSchema,
  componentType: z.literal('pagination'),
  state: PaginationStateSchema,
});
export type Pagination = z.infer<typeof PaginationSchema>;

export const SortSchema = z.strictObject({
  actions: SortActionsSchema,
  componentType: z.literal('sort'),
  state: SortStateSchema,
});
export type Sort = z.infer<typeof SortSchema>;

export const SearchBoxSchema = z.strictObject({
  actions: SearchBoxActionsSchema,
  componentType: z.literal('search-box'),
  state: SearchBoxStateSchema,
});
export type SearchBox = z.infer<typeof SearchBoxSchema>;

export const CartSchema = z.strictObject({
  actions: CartActionsSchema,
  componentType: z.literal('cart'),
  state: CartStateSchema,
});
export type Cart = z.infer<typeof CartSchema>;

export const ComponentContractsSchema = z.discriminatedUnion('componentType', [
  ProductCarouselSchema,
  CartSchema,
  NextActionsBarSchema,
  BundleDisplaySchema,
  ComparisonTableSchema,
  ProductListSchema,
  PaginationSchema,
  SortSchema,
  SearchBoxSchema,
]);
export type ComponentContracts = z.infer<typeof ComponentContractsSchema>;

/**
 * Component props schemas.
 * These props are injected by the A2-UI surface layer (backend) and passed to catalog
 * renderers automatically. Consumers should NOT hardcode these values; they arrive via
 * the createSurface message's components[].props.
 */
export const BundleDisplayPropsSchema = z.object({
  componentId: z.string(),
  componentType: z.literal('bundle-display'),
});
export type BundleDisplayProps = z.infer<typeof BundleDisplayPropsSchema>;

export const CartPropsSchema = z.object({
  componentId: z.string(),
  componentType: z.literal('cart'),
});
export type CartProps = z.infer<typeof CartPropsSchema>;

export const ComparisonTablePropsSchema = z.object({
  componentId: z.string(),
  componentType: z.literal('comparison-table'),
});
export type ComparisonTableProps = z.infer<typeof ComparisonTablePropsSchema>;

export const NextActionsBarPropsSchema = z.object({
  componentId: z.string(),
  componentType: z.literal('next-actions-bar'),
});
export type NextActionsBarProps = z.infer<typeof NextActionsBarPropsSchema>;

export const PaginationPropsSchema = z.object({
  componentId: z.string(),
  componentType: z.literal('pagination'),
});
export type PaginationProps = z.infer<typeof PaginationPropsSchema>;

export const ProductCarouselPropsSchema = z.object({
  componentId: z.string(),
  componentType: z.literal('product-carousel'),
});
export type ProductCarouselProps = z.infer<typeof ProductCarouselPropsSchema>;

export const ProductListPropsSchema = z.object({
  componentId: z.string(),
  componentType: z.literal('product-list'),
});
export type ProductListProps = z.infer<typeof ProductListPropsSchema>;

export const SearchBoxPropsSchema = z.object({
  componentId: z.string(),
  componentType: z.literal('search-box'),
});
export type SearchBoxProps = z.infer<typeof SearchBoxPropsSchema>;

export const SortPropsSchema = z.object({
  componentId: z.string(),
  componentType: z.literal('sort'),
});
export type SortProps = z.infer<typeof SortPropsSchema>;
