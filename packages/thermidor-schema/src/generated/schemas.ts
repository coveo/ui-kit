// This file is generated from the canonical JSON Schema documents.
// Do not edit it directly; run `pnpm run generate` from the package root.

import * as z from 'zod/v4';

// The kind of action: "followup" triggers a conversational follow-up, "search" triggers a
// standalone search.
//
// The kind of action selected: "followup" or "search".

export const TypeSchema = z.enum(['followup', 'search']);
export type Type = z.infer<typeof TypeSchema>;

// The selection state of a facet value, shared across all commerce facet components.
//
// The selection state of this facet value.

export const FacetValueStateSchema = z.enum(['excluded', 'idle', 'selected']);
export type FacetValueState = z.infer<typeof FacetValueStateSchema>;

// The selection state of a facet value that supports selection but not exclusion (e.g.
// numeric and date facets). Constrained to 'idle' or 'selected'.
//
// The selection state of this facet value (idle or selected; exclusion is not supported).

export const SelectableFacetValueStateSchema = z.enum(['idle', 'selected']);
export type SelectableFacetValueState = z.infer<typeof SelectableFacetValueStateSchema>;

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
  childId: z.string(),
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
  values: z.record(z.string(), z.string()).optional(),
});
export type ComparisonProduct = z.infer<typeof ComparisonProductSchema>;

export const ProductListActionsSchema = z.strictObject({});
export type ProductListActions = z.infer<typeof ProductListActionsSchema>;

export const ProductListStateSchema = z.strictObject({
  products: z.array(ProductSchema),
});
export type ProductListState = z.infer<typeof ProductListStateSchema>;

export const ProductSummaryActionsSchema = z.strictObject({});
export type ProductSummaryActions = z.infer<typeof ProductSummaryActionsSchema>;

export const ProductSummaryStateSchema = z.strictObject({
  categoryLabel: z.string(),
  product: z.union([ProductSchema, z.null()]),
});
export type ProductSummaryState = z.infer<typeof ProductSummaryStateSchema>;

export const SelectPagePayloadSchema = z.strictObject({
  page: z.number().int().min(0),
});
export type SelectPagePayload = z.infer<typeof SelectPagePayloadSchema>;

export const PayloadSchema = z.strictObject({
  pageSize: z.number().int().min(1),
});
export type Payload = z.infer<typeof PayloadSchema>;

export const PaginationStateSchema = z.strictObject({
  page: z.number().int().min(0),
  pageSize: z.number().int().min(1),
  totalEntries: z.number().int().min(0),
  totalPages: z.number().int().min(0),
});
export type PaginationState = z.infer<typeof PaginationStateSchema>;

export const SelectSortPayloadSchema = z.strictObject({
  fields: z.array(z.unknown()),
  sortCriteria: z.string(),
});
export type SelectSortPayload = z.infer<typeof SelectSortPayloadSchema>;

export const SortCriterionSchema = z.strictObject({
  fields: z.array(z.unknown()),
  sortCriteria: z.string(),
});
export type SortCriterion = z.infer<typeof SortCriterionSchema>;

export const ActionSchema = z.strictObject({
  payload: z.unknown(),
});
export type Action = z.infer<typeof ActionSchema>;

export const SearchPayloadSchema = z.strictObject({
  query: z.string().min(0).max(1024),
});
export type SearchPayload = z.infer<typeof SearchPayloadSchema>;

export const RegularFacetToggleExcludePayloadSchema = z.strictObject({
  value: z.string().min(1).max(1024),
});
export type RegularFacetToggleExcludePayload = z.infer<
  typeof RegularFacetToggleExcludePayloadSchema
>;

export const RegularFacetToggleSelectPayloadSchema = z.strictObject({
  value: z.string().min(1).max(1024),
});
export type RegularFacetToggleSelectPayload = z.infer<typeof RegularFacetToggleSelectPayloadSchema>;

export const RegularFacetToggleSingleExcludePayloadSchema = z.strictObject({
  value: z.string().min(1).max(1024),
});
export type RegularFacetToggleSingleExcludePayload = z.infer<
  typeof RegularFacetToggleSingleExcludePayloadSchema
>;

export const RegularFacetToggleSingleSelectPayloadSchema = z.strictObject({
  value: z.string().min(1).max(1024),
});
export type RegularFacetToggleSingleSelectPayload = z.infer<
  typeof RegularFacetToggleSingleSelectPayloadSchema
>;

export const RegularFacetSearchResultSchema = z.strictObject({
  numberOfResults: z.number().int().min(0).max(999999999),
  value: z.string().min(1).max(1024),
});
export type RegularFacetSearchResult = z.infer<typeof RegularFacetSearchResultSchema>;

export const RegularFacetValueSchema = z.strictObject({
  numberOfResults: z.number().int().min(0).max(999999999),
  state: z.enum(['idle', 'selected', 'excluded']),
  value: z.string().min(1).max(1024),
});
export type RegularFacetValue = z.infer<typeof RegularFacetValueSchema>;

export const NumericFacetApplyCustomRangePayloadSchema = z.strictObject({
  end: z.number(),
  start: z.number(),
});
export type NumericFacetApplyCustomRangePayload = z.infer<
  typeof NumericFacetApplyCustomRangePayloadSchema
>;

export const NumericFacetToggleSelectPayloadSchema = z.strictObject({
  end: z.number(),
  start: z.number(),
});
export type NumericFacetToggleSelectPayload = z.infer<typeof NumericFacetToggleSelectPayloadSchema>;

export const NumericFacetToggleSingleSelectPayloadSchema = z.strictObject({
  end: z.number(),
  start: z.number(),
});
export type NumericFacetToggleSingleSelectPayload = z.infer<
  typeof NumericFacetToggleSingleSelectPayloadSchema
>;

export const NumericFacetCustomRangeSchema = z.strictObject({
  end: z.number(),
  numberOfResults: z.number().int().min(0),
  start: z.number(),
});
export type NumericFacetCustomRange = z.infer<typeof NumericFacetCustomRangeSchema>;

export const NumericFacetDomainSchema = z.strictObject({
  max: z.number().optional(),
  min: z.number().optional(),
});
export type NumericFacetDomain = z.infer<typeof NumericFacetDomainSchema>;

export const NumericFacetValueSchema = z.strictObject({
  end: z.number(),
  numberOfResults: z.number().int().min(0),
  start: z.number(),
  state: z.enum(['idle', 'selected']),
});
export type NumericFacetValue = z.infer<typeof NumericFacetValueSchema>;

export const DateFacetApplyCustomRangePayloadSchema = z.strictObject({
  end: z.string(),
  start: z.string(),
});
export type DateFacetApplyCustomRangePayload = z.infer<
  typeof DateFacetApplyCustomRangePayloadSchema
>;

export const DateFacetToggleSelectPayloadSchema = z.strictObject({
  end: z.string(),
  start: z.string(),
});
export type DateFacetToggleSelectPayload = z.infer<typeof DateFacetToggleSelectPayloadSchema>;

export const DateFacetToggleSingleSelectPayloadSchema = z.strictObject({
  end: z.string(),
  start: z.string(),
});
export type DateFacetToggleSingleSelectPayload = z.infer<
  typeof DateFacetToggleSingleSelectPayloadSchema
>;

export const DateFacetCustomRangeSchema = z.strictObject({
  end: z.string(),
  numberOfResults: z.number().int().min(0),
  start: z.string(),
});
export type DateFacetCustomRange = z.infer<typeof DateFacetCustomRangeSchema>;

export const DateFacetValueSchema = z.strictObject({
  end: z.string(),
  numberOfResults: z.number().int().min(0),
  start: z.string(),
  state: z.enum(['idle', 'selected']),
});
export type DateFacetValue = z.infer<typeof DateFacetValueSchema>;

export const CategoryFacetSearchPayloadSchema = z.strictObject({
  query: z.string().max(256),
});
export type CategoryFacetSearchPayload = z.infer<typeof CategoryFacetSearchPayloadSchema>;

export const CategoryFacetSelectPathPayloadSchema = z.strictObject({
  path: z.array(z.string()),
});
export type CategoryFacetSelectPathPayload = z.infer<typeof CategoryFacetSelectPathPayloadSchema>;

export const CategoryFacetValueSchema = z.strictObject({
  numberOfResults: z.number().int().min(0),
  path: z.array(z.string()),
  value: z.string(),
});
export type CategoryFacetValue = z.infer<typeof CategoryFacetValueSchema>;

export const CategoryFacetValuesSchema = z.strictObject({
  ancestry: z.array(CategoryFacetValueSchema),
  children: z.array(CategoryFacetValueSchema),
  selected: z.union([CategoryFacetValueSchema, z.null()]),
});
export type CategoryFacetValues = z.infer<typeof CategoryFacetValuesSchema>;

export const FacetManagerActionsSchema = z.strictObject({});
export type FacetManagerActions = z.infer<typeof FacetManagerActionsSchema>;

export const FacetManagerStateSchema = z.strictObject({});
export type FacetManagerState = z.infer<typeof FacetManagerStateSchema>;

export const CommerceSearchActionsSchema = z.strictObject({});
export type CommerceSearchActions = z.infer<typeof CommerceSearchActionsSchema>;

export const CommerceSearchStateSchema = z.strictObject({});
export type CommerceSearchState = z.infer<typeof CommerceSearchStateSchema>;

export const LayoutStackActionsSchema = z.strictObject({});
export type LayoutStackActions = z.infer<typeof LayoutStackActionsSchema>;

export const LayoutStackStateSchema = z.strictObject({});
export type LayoutStackState = z.infer<typeof LayoutStackStateSchema>;

export const QuerySummaryActionsSchema = z.strictObject({});
export type QuerySummaryActions = z.infer<typeof QuerySummaryActionsSchema>;

export const QuerySummaryStateSchema = z.strictObject({
  firstIndex: z.number().int().min(0),
  lastIndex: z.number().int().min(0),
  query: z.string(),
  totalEntries: z.number().int().min(0),
});
export type QuerySummaryState = z.infer<typeof QuerySummaryStateSchema>;

export const SetPageSizePayloadSchema = z.strictObject({
  pageSize: z.number().int().min(1),
});
export type SetPageSizePayload = z.infer<typeof SetPageSizePayloadSchema>;

export const PageSizeStateSchema = z.strictObject({
  pageSize: z.number().int().min(1),
});
export type PageSizeState = z.infer<typeof PageSizeStateSchema>;

export const ProductCarouselSchema = z.strictObject({
  actions: ProductCarouselActionsSchema,
  child: z.string().regex(new RegExp('^[a-z][a-z0-9-]*$')).optional(),
  children: z
    .array(z.string().regex(new RegExp('^[a-z][a-z0-9-]*$')))
    .max(1000)
    .optional(),
  componentType: z.literal('product-carousel'),
  state: ProductCarouselStateSchema,
});
export type ProductCarousel = z.infer<typeof ProductCarouselSchema>;

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
  heading: z.string(),
  products: z.array(ComparisonProductSchema),
  summary: z.string(),
});
export type ComparisonTableState = z.infer<typeof ComparisonTableStateSchema>;

export const ProductListSchema = z.strictObject({
  actions: ProductListActionsSchema,
  child: z.string().regex(new RegExp('^[a-z][a-z0-9-]*$')).optional(),
  children: z
    .array(z.string().regex(new RegExp('^[a-z][a-z0-9-]*$')))
    .max(1000)
    .optional(),
  componentType: z.literal('product-list'),
  state: ProductListStateSchema,
});
export type ProductList = z.infer<typeof ProductListSchema>;

export const ProductSummarySchema = z.strictObject({
  actions: ProductSummaryActionsSchema,
  child: z.string().regex(new RegExp('^[a-z][a-z0-9-]*$')).optional(),
  children: z
    .array(z.string().regex(new RegExp('^[a-z][a-z0-9-]*$')))
    .max(1000)
    .optional(),
  componentType: z.literal('product-summary'),
  state: ProductSummaryStateSchema,
});
export type ProductSummary = z.infer<typeof ProductSummarySchema>;

export const SelectPageSchema = z.strictObject({
  payload: SelectPagePayloadSchema,
});
export type SelectPage = z.infer<typeof SelectPageSchema>;

export const PurpleSetPageSizeSchema = z.strictObject({
  payload: PayloadSchema,
});
export type PurpleSetPageSize = z.infer<typeof PurpleSetPageSizeSchema>;

export const SelectSortSchema = z.strictObject({
  payload: SelectSortPayloadSchema,
});
export type SelectSort = z.infer<typeof SelectSortSchema>;

export const SortStateSchema = z.strictObject({
  appliedSort: SortCriterionSchema,
  availableSorts: z.array(SortCriterionSchema),
});
export type SortState = z.infer<typeof SortStateSchema>;

export const SearchSchema = z.strictObject({
  payload: SearchPayloadSchema,
});
export type Search = z.infer<typeof SearchSchema>;

export const RegularFacetToggleExcludeSchema = z.strictObject({
  payload: RegularFacetToggleExcludePayloadSchema,
});
export type RegularFacetToggleExclude = z.infer<typeof RegularFacetToggleExcludeSchema>;

export const RegularFacetToggleSelectSchema = z.strictObject({
  payload: RegularFacetToggleSelectPayloadSchema,
});
export type RegularFacetToggleSelect = z.infer<typeof RegularFacetToggleSelectSchema>;

export const RegularFacetToggleSingleExcludeSchema = z.strictObject({
  payload: RegularFacetToggleSingleExcludePayloadSchema,
});
export type RegularFacetToggleSingleExclude = z.infer<typeof RegularFacetToggleSingleExcludeSchema>;

export const RegularFacetToggleSingleSelectSchema = z.strictObject({
  payload: RegularFacetToggleSingleSelectPayloadSchema,
});
export type RegularFacetToggleSingleSelect = z.infer<typeof RegularFacetToggleSingleSelectSchema>;

export const RegularFacetSearchSchema = z.strictObject({
  canShowMoreResults: z.boolean(),
  query: z.string().min(0).max(1024),
  results: z.array(RegularFacetSearchResultSchema).max(1000),
});
export type RegularFacetSearch = z.infer<typeof RegularFacetSearchSchema>;

export const NumericFacetApplyCustomRangeSchema = z.strictObject({
  payload: NumericFacetApplyCustomRangePayloadSchema,
});
export type NumericFacetApplyCustomRange = z.infer<typeof NumericFacetApplyCustomRangeSchema>;

export const NumericFacetToggleSelectSchema = z.strictObject({
  payload: NumericFacetToggleSelectPayloadSchema,
});
export type NumericFacetToggleSelect = z.infer<typeof NumericFacetToggleSelectSchema>;

export const NumericFacetToggleSingleSelectSchema = z.strictObject({
  payload: NumericFacetToggleSingleSelectPayloadSchema,
});
export type NumericFacetToggleSingleSelect = z.infer<typeof NumericFacetToggleSingleSelectSchema>;

export const NumericFacetStateSchema = z.strictObject({
  canShowLessValues: z.boolean(),
  canShowMoreValues: z.boolean(),
  customRange: z.union([NumericFacetCustomRangeSchema, z.null()]),
  displayName: z.string(),
  domain: NumericFacetDomainSchema.optional(),
  field: z.string(),
  hasActiveValues: z.boolean(),
  values: z.array(NumericFacetValueSchema).max(500),
});
export type NumericFacetState = z.infer<typeof NumericFacetStateSchema>;

export const DateFacetApplyCustomRangeSchema = z.strictObject({
  payload: DateFacetApplyCustomRangePayloadSchema,
});
export type DateFacetApplyCustomRange = z.infer<typeof DateFacetApplyCustomRangeSchema>;

export const DateFacetToggleSelectSchema = z.strictObject({
  payload: DateFacetToggleSelectPayloadSchema,
});
export type DateFacetToggleSelect = z.infer<typeof DateFacetToggleSelectSchema>;

export const DateFacetToggleSingleSelectSchema = z.strictObject({
  payload: DateFacetToggleSingleSelectPayloadSchema,
});
export type DateFacetToggleSingleSelect = z.infer<typeof DateFacetToggleSingleSelectSchema>;

export const DateFacetStateSchema = z.strictObject({
  canShowLessValues: z.boolean(),
  canShowMoreValues: z.boolean(),
  customRange: z.union([DateFacetCustomRangeSchema, z.null()]),
  displayName: z.string(),
  field: z.string(),
  hasActiveValues: z.boolean(),
  values: z.array(DateFacetValueSchema),
});
export type DateFacetState = z.infer<typeof DateFacetStateSchema>;

export const CategoryFacetSearchSchema = z.strictObject({
  payload: CategoryFacetSearchPayloadSchema,
});
export type CategoryFacetSearch = z.infer<typeof CategoryFacetSearchSchema>;

export const CategoryFacetSelectPathSchema = z.strictObject({
  payload: CategoryFacetSelectPathPayloadSchema,
});
export type CategoryFacetSelectPath = z.infer<typeof CategoryFacetSelectPathSchema>;

export const FacetSearchClassSchema = z.strictObject({
  canShowMoreResults: z.boolean(),
  query: z.string().max(256),
  results: z.array(CategoryFacetValueSchema),
});
export type FacetSearchClass = z.infer<typeof FacetSearchClassSchema>;

export const FacetManagerSchema = z.strictObject({
  actions: FacetManagerActionsSchema,
  child: z.string().regex(new RegExp('^[a-z][a-z0-9-]*$')).optional(),
  children: z
    .array(z.string().regex(new RegExp('^[a-z][a-z0-9-]*$')))
    .max(1000)
    .optional(),
  componentType: z.literal('facet-manager'),
  state: FacetManagerStateSchema,
});
export type FacetManager = z.infer<typeof FacetManagerSchema>;

export const CommerceSearchSchema = z.strictObject({
  actions: CommerceSearchActionsSchema,
  child: z.string().regex(new RegExp('^[a-z][a-z0-9-]*$')).optional(),
  children: z
    .array(z.string().regex(new RegExp('^[a-z][a-z0-9-]*$')))
    .max(1000)
    .optional(),
  componentType: z.literal('commerce-search'),
  state: CommerceSearchStateSchema,
});
export type CommerceSearch = z.infer<typeof CommerceSearchSchema>;

export const LayoutStackSchema = z.strictObject({
  actions: LayoutStackActionsSchema,
  child: z.string().regex(new RegExp('^[a-z][a-z0-9-]*$')).optional(),
  children: z
    .array(z.string().regex(new RegExp('^[a-z][a-z0-9-]*$')))
    .max(1000)
    .optional(),
  componentType: z.literal('layout-stack'),
  state: LayoutStackStateSchema,
});
export type LayoutStack = z.infer<typeof LayoutStackSchema>;

export const QuerySummarySchema = z.strictObject({
  actions: QuerySummaryActionsSchema,
  child: z.string().regex(new RegExp('^[a-z][a-z0-9-]*$')).optional(),
  children: z
    .array(z.string().regex(new RegExp('^[a-z][a-z0-9-]*$')))
    .max(1000)
    .optional(),
  componentType: z.literal('query-summary'),
  state: QuerySummaryStateSchema,
});
export type QuerySummary = z.infer<typeof QuerySummarySchema>;

export const FluffySetPageSizeSchema = z.strictObject({
  payload: SetPageSizePayloadSchema,
});
export type FluffySetPageSize = z.infer<typeof FluffySetPageSizeSchema>;

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
  child: z.string().regex(new RegExp('^[a-z][a-z0-9-]*$')).optional(),
  children: z
    .array(z.string().regex(new RegExp('^[a-z][a-z0-9-]*$')))
    .max(1000)
    .optional(),
  componentType: z.literal('comparison-table'),
  state: ComparisonTableStateSchema,
});
export type ComparisonTable = z.infer<typeof ComparisonTableSchema>;

export const PaginationActionsSchema = z.strictObject({
  selectPage: SelectPageSchema,
  setPageSize: PurpleSetPageSizeSchema,
});
export type PaginationActions = z.infer<typeof PaginationActionsSchema>;

export const SortActionsSchema = z.strictObject({
  selectSort: SelectSortSchema,
});
export type SortActions = z.infer<typeof SortActionsSchema>;

export const RegularFacetActionsSchema = z.strictObject({
  clearAllActiveValues: ActionSchema,
  clearSearch: ActionSchema,
  search: SearchSchema,
  showLessValues: ActionSchema,
  showMoreSearchResults: ActionSchema,
  showMoreValues: ActionSchema,
  toggleExclude: RegularFacetToggleExcludeSchema,
  toggleSelect: RegularFacetToggleSelectSchema,
  toggleSingleExclude: RegularFacetToggleSingleExcludeSchema,
  toggleSingleSelect: RegularFacetToggleSingleSelectSchema,
});
export type RegularFacetActions = z.infer<typeof RegularFacetActionsSchema>;

export const RegularFacetStateSchema = z.strictObject({
  canShowLessValues: z.boolean(),
  canShowMoreValues: z.boolean(),
  displayName: z.string().min(1).max(255),
  facetSearch: RegularFacetSearchSchema,
  field: z.string().min(1).max(255),
  hasActiveValues: z.boolean(),
  values: z.array(RegularFacetValueSchema).max(1000),
});
export type RegularFacetState = z.infer<typeof RegularFacetStateSchema>;

export const NumericFacetActionsSchema = z.strictObject({
  applyCustomRange: NumericFacetApplyCustomRangeSchema,
  clearAllActiveValues: ActionSchema,
  showLessValues: ActionSchema,
  showMoreValues: ActionSchema,
  toggleSelect: NumericFacetToggleSelectSchema,
  toggleSingleSelect: NumericFacetToggleSingleSelectSchema,
});
export type NumericFacetActions = z.infer<typeof NumericFacetActionsSchema>;

export const DateFacetActionsSchema = z.strictObject({
  applyCustomRange: DateFacetApplyCustomRangeSchema,
  clearAllActiveValues: ActionSchema,
  showLessValues: ActionSchema,
  showMoreValues: ActionSchema,
  toggleSelect: DateFacetToggleSelectSchema,
  toggleSingleSelect: DateFacetToggleSingleSelectSchema,
});
export type DateFacetActions = z.infer<typeof DateFacetActionsSchema>;

export const CategoryFacetActionsSchema = z.strictObject({
  clearSearch: ActionSchema,
  clearSelectedPath: ActionSchema,
  search: CategoryFacetSearchSchema,
  selectPath: CategoryFacetSelectPathSchema,
  showLessValues: ActionSchema,
  showMoreSearchResults: ActionSchema,
  showMoreValues: ActionSchema,
});
export type CategoryFacetActions = z.infer<typeof CategoryFacetActionsSchema>;

export const CategoryFacetStateSchema = z.strictObject({
  canShowLessValues: z.boolean(),
  canShowMoreValues: z.boolean(),
  displayName: z.string(),
  facetSearch: FacetSearchClassSchema,
  field: z.string(),
  values: CategoryFacetValuesSchema,
});
export type CategoryFacetState = z.infer<typeof CategoryFacetStateSchema>;

export const PageSizeActionsSchema = z.strictObject({
  setPageSize: FluffySetPageSizeSchema,
});
export type PageSizeActions = z.infer<typeof PageSizeActionsSchema>;

export const NextActionsBarSchema = z.strictObject({
  actions: NextActionsBarActionsSchema,
  child: z.string().regex(new RegExp('^[a-z][a-z0-9-]*$')).optional(),
  children: z
    .array(z.string().regex(new RegExp('^[a-z][a-z0-9-]*$')))
    .max(1000)
    .optional(),
  componentType: z.literal('next-actions-bar'),
  state: NextActionsStateSchema,
});
export type NextActionsBar = z.infer<typeof NextActionsBarSchema>;

export const BundleDisplaySchema = z.strictObject({
  actions: BundleDisplayActionsSchema,
  child: z.string().regex(new RegExp('^[a-z][a-z0-9-]*$')).optional(),
  children: z
    .array(z.string().regex(new RegExp('^[a-z][a-z0-9-]*$')))
    .max(1000)
    .optional(),
  componentType: z.literal('bundle-display'),
  state: BundleDisplayStateSchema,
});
export type BundleDisplay = z.infer<typeof BundleDisplaySchema>;

export const PaginationSchema = z.strictObject({
  actions: PaginationActionsSchema,
  child: z.string().regex(new RegExp('^[a-z][a-z0-9-]*$')).optional(),
  children: z
    .array(z.string().regex(new RegExp('^[a-z][a-z0-9-]*$')))
    .max(1000)
    .optional(),
  componentType: z.literal('pagination'),
  state: PaginationStateSchema,
});
export type Pagination = z.infer<typeof PaginationSchema>;

export const SortSchema = z.strictObject({
  actions: SortActionsSchema,
  child: z.string().regex(new RegExp('^[a-z][a-z0-9-]*$')).optional(),
  children: z
    .array(z.string().regex(new RegExp('^[a-z][a-z0-9-]*$')))
    .max(1000)
    .optional(),
  componentType: z.literal('sort'),
  state: SortStateSchema,
});
export type Sort = z.infer<typeof SortSchema>;

export const RegularFacetSchema = z.strictObject({
  actions: RegularFacetActionsSchema,
  child: z.string().regex(new RegExp('^[a-z][a-z0-9-]*$')).optional(),
  children: z
    .array(z.string().regex(new RegExp('^[a-z][a-z0-9-]*$')))
    .max(1000)
    .optional(),
  componentType: z.literal('regular-facet'),
  state: RegularFacetStateSchema,
});
export type RegularFacet = z.infer<typeof RegularFacetSchema>;

export const NumericFacetSchema = z.strictObject({
  actions: NumericFacetActionsSchema,
  child: z.string().regex(new RegExp('^[a-z][a-z0-9-]*$')).optional(),
  children: z
    .array(z.string().regex(new RegExp('^[a-z][a-z0-9-]*$')))
    .max(1000)
    .optional(),
  componentType: z.literal('numeric-facet'),
  state: NumericFacetStateSchema,
});
export type NumericFacet = z.infer<typeof NumericFacetSchema>;

export const DateFacetSchema = z.strictObject({
  actions: DateFacetActionsSchema,
  child: z.string().regex(new RegExp('^[a-z][a-z0-9-]*$')).optional(),
  children: z
    .array(z.string().regex(new RegExp('^[a-z][a-z0-9-]*$')))
    .max(1000)
    .optional(),
  componentType: z.literal('date-facet'),
  state: DateFacetStateSchema,
});
export type DateFacet = z.infer<typeof DateFacetSchema>;

export const CategoryFacetSchema = z.strictObject({
  actions: CategoryFacetActionsSchema,
  child: z.string().regex(new RegExp('^[a-z][a-z0-9-]*$')).optional(),
  children: z
    .array(z.string().regex(new RegExp('^[a-z][a-z0-9-]*$')))
    .max(1000)
    .optional(),
  componentType: z.literal('category-facet'),
  state: CategoryFacetStateSchema,
});
export type CategoryFacet = z.infer<typeof CategoryFacetSchema>;

export const PageSizeSchema = z.strictObject({
  actions: PageSizeActionsSchema,
  child: z.string().regex(new RegExp('^[a-z][a-z0-9-]*$')).optional(),
  children: z
    .array(z.string().regex(new RegExp('^[a-z][a-z0-9-]*$')))
    .max(1000)
    .optional(),
  componentType: z.literal('page-size'),
  state: PageSizeStateSchema,
});
export type PageSize = z.infer<typeof PageSizeSchema>;

export const ComponentContractsSchema = z.discriminatedUnion('componentType', [
  ProductCarouselSchema,
  NextActionsBarSchema,
  BundleDisplaySchema,
  ComparisonTableSchema,
  ProductListSchema,
  ProductSummarySchema,
  PaginationSchema,
  SortSchema,
  RegularFacetSchema,
  NumericFacetSchema,
  DateFacetSchema,
  CategoryFacetSchema,
  FacetManagerSchema,
  CommerceSearchSchema,
  LayoutStackSchema,
  QuerySummarySchema,
  PageSizeSchema,
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

export const CategoryFacetPropsSchema = z.object({
  componentId: z.string(),
  componentType: z.literal('category-facet'),
});
export type CategoryFacetProps = z.infer<typeof CategoryFacetPropsSchema>;

export const CommerceSearchPropsSchema = z.object({
  componentId: z.string(),
  componentType: z.literal('commerce-search'),
});
export type CommerceSearchProps = z.infer<typeof CommerceSearchPropsSchema>;

export const ComparisonTablePropsSchema = z.object({
  componentId: z.string(),
  componentType: z.literal('comparison-table'),
});
export type ComparisonTableProps = z.infer<typeof ComparisonTablePropsSchema>;

export const DateFacetPropsSchema = z.object({
  componentId: z.string(),
  componentType: z.literal('date-facet'),
});
export type DateFacetProps = z.infer<typeof DateFacetPropsSchema>;

export const FacetManagerPropsSchema = z.object({
  componentId: z.string(),
  componentType: z.literal('facet-manager'),
});
export type FacetManagerProps = z.infer<typeof FacetManagerPropsSchema>;

export const LayoutStackPropsSchema = z.object({
  componentId: z.string(),
  componentType: z.literal('layout-stack'),
});
export type LayoutStackProps = z.infer<typeof LayoutStackPropsSchema>;

export const NextActionsBarPropsSchema = z.object({
  componentId: z.string(),
  componentType: z.literal('next-actions-bar'),
});
export type NextActionsBarProps = z.infer<typeof NextActionsBarPropsSchema>;

export const NumericFacetPropsSchema = z.object({
  componentId: z.string(),
  componentType: z.literal('numeric-facet'),
});
export type NumericFacetProps = z.infer<typeof NumericFacetPropsSchema>;

export const PageSizePropsSchema = z.object({
  componentId: z.string(),
  componentType: z.literal('page-size'),
});
export type PageSizeProps = z.infer<typeof PageSizePropsSchema>;

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

export const ProductSummaryPropsSchema = z.object({
  componentId: z.string(),
  componentType: z.literal('product-summary'),
});
export type ProductSummaryProps = z.infer<typeof ProductSummaryPropsSchema>;

export const QuerySummaryPropsSchema = z.object({
  componentId: z.string(),
  componentType: z.literal('query-summary'),
});
export type QuerySummaryProps = z.infer<typeof QuerySummaryPropsSchema>;

export const RegularFacetPropsSchema = z.object({
  componentId: z.string(),
  componentType: z.literal('regular-facet'),
});
export type RegularFacetProps = z.infer<typeof RegularFacetPropsSchema>;

export const SortPropsSchema = z.object({
  componentId: z.string(),
  componentType: z.literal('sort'),
});
export type SortProps = z.infer<typeof SortPropsSchema>;
