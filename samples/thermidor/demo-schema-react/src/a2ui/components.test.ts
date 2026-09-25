import {describe, expect, it} from 'vitest';
import {
  createThermidorCatalog,
  thermidorCatalogDefinitions,
  THERMIDOR_CATALOG_ID,
} from './components.js';
import {
  ProductCarouselSchema,
  ProductCarouselPropsSchema,
  ProductSchema,
  ProductSummarySchema,
  ComparisonTableSchema,
  LayoutStackSchema,
  QuerySummarySchema,
  PageSizeSchema,
} from '@coveo/thermidor-schema/zod3';

const EXPECTED_COMPONENTS = [
  'ProductCarousel',
  'NextActionsBar',
  'BundleDisplay',
  'ComparisonTable',
  'ProductList',
  'ProductSummary',
  'Pagination',
  'Sort',
  'RegularFacet',
  'NumericFacet',
  'CategoryFacet',
  'FacetManager',
  'CommerceSearch',
  'LayoutStack',
  'QuerySummary',
  'PageSize',
] as const;

describe('createThermidorCatalog (catalog build smoke)', () => {
  it('builds without throwing', () => {
    expect(() => createThermidorCatalog()).not.toThrow();
  });

  it('registers every Thermidor component in the catalog definitions', () => {
    for (const name of EXPECTED_COMPONENTS) {
      expect(thermidorCatalogDefinitions, `missing ${name}`).toHaveProperty(name);
    }
  });

  it('exports the correct catalog ID', () => {
    expect(THERMIDOR_CATALOG_ID).toBe('https://schema.thermidor.coveo.com/a2-ui/catalog.json');
  });
});

describe('dynamic props schemas resolve {path} bindings', () => {
  it('accepts a { path } binding on a bindable prop', () => {
    // The catalog feeds the DYNAMIC XxxPropsSchema, whose bindable fields admit a
    // { path } Data_Binding object so the renderer resolves it against the data model.
    expect(
      ProductCarouselPropsSchema.safeParse({
        heading: {path: '/state/carousel/heading'},
        products: {path: '/state/carousel/products'},
      }).success
    ).toBe(true);
  });
});

describe('component state contracts', () => {
  it('validates generated Product values against their JSON Schema constraints', () => {
    expect(
      ProductSchema.safeParse({
        permanentid: 'p1',
        ec_name: 'Trail shoes',
        ec_rating: null,
        additionalFields: {},
        children: [{permanentid: 'p1-blue', ec_name: 'Trail shoes', additionalFields: {}}],
      }).success
    ).toBe(true);
    expect(
      ProductSchema.safeParse({
        permanentid: 'p1',
        ec_name: 'Trail shoes',
        ec_rating: 6,
        additionalFields: {},
      }).success
    ).toBe(false);
  });

  it('validates product-carousel state via the generated component schema', () => {
    expect(
      ProductCarouselSchema.shape.state.safeParse({
        heading: 'Trail shoes',
        products: [{permanentid: 'p1', ec_name: 'Trail shoes', additionalFields: {}}],
      }).success
    ).toBe(true);
  });

  it('validates product-summary state (product may be null)', () => {
    expect(
      ProductSummarySchema.shape.state.safeParse({
        categoryLabel: 'Surfboard',
        product: {permanentid: 'p1', ec_name: 'Board', additionalFields: {}},
      }).success
    ).toBe(true);
    expect(
      ProductSummarySchema.shape.state.safeParse({categoryLabel: 'Surfboard', product: null})
        .success
    ).toBe(true);
  });

  it('validates comparison-table state with heading, summary, products and attributes', () => {
    expect(
      ComparisonTableSchema.shape.state.safeParse({
        heading: 'Comparison',
        summary: 'A short summary.',
        products: [{productId: 'p1', name: 'Board', values: {brand: 'Acme'}}],
        attributes: [{key: 'brand', label: 'Brand'}],
      }).success
    ).toBe(true);
    expect(
      ComparisonTableSchema.shape.state.safeParse({
        heading: 'Comparison',
        summary: 'A short summary.',
        attributes: [],
      }).success
    ).toBe(false);
  });

  it('validates the layout-stack empty state contract', () => {
    expect(LayoutStackSchema.shape.state.safeParse({}).success).toBe(true);
    expect(LayoutStackSchema.shape.state.safeParse({direction: 'row'}).success).toBe(false);
  });

  it('validates the query-summary aggregate state contract', () => {
    expect(
      QuerySummarySchema.shape.state.safeParse({
        query: 'Water Sports',
        firstIndex: 1,
        lastIndex: 12,
        totalEntries: 43,
      }).success
    ).toBe(true);
    expect(QuerySummarySchema.shape.state.safeParse({query: 'x'}).success).toBe(false);
  });

  it('validates the page-size state and setPageSize action payload', () => {
    expect(PageSizeSchema.shape.state.safeParse({pageSize: 24}).success).toBe(true);
    expect(
      PageSizeSchema.shape.actions
        .unwrap()
        .shape.setPageSize.shape.payload.safeParse({pageSize: 48}).success
    ).toBe(true);
  });
});
