import {describe, expect, it} from 'vitest';
import {thermidorCatalogDefinitions, THERMIDOR_CATALOG_ID} from './components.js';
import {
  ProductCarouselSchema,
  ProductCarouselPropsSchema,
  ProductSchema,
  ProductSummarySchema,
  ProductSummaryPropsSchema,
  ComparisonTableSchema,
  LayoutStackSchema,
  LayoutStackPropsSchema,
  QuerySummarySchema,
  QuerySummaryPropsSchema,
  PageSizeSchema,
  PageSizePropsSchema,
} from '@coveo/thermidor-schema';

describe('thermidorCatalogDefinitions', () => {
  it('accepts the flat component props supplied by the catalog message', () => {
    expect(
      ProductCarouselPropsSchema.safeParse({
        componentId: 'featured-products',
        componentType: 'product-carousel',
      }).success
    ).toBe(true);
  });

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

  it('rejects props with wrong componentType literal', () => {
    expect(
      ProductCarouselPropsSchema.safeParse({
        componentId: 'featured-products',
        componentType: 'comparison-table',
      }).success
    ).toBe(false);
  });

  it('validates component contract state via the generated component schema', () => {
    expect(
      ProductCarouselSchema.shape.state.safeParse({
        heading: 'Trail shoes',
        products: [{permanentid: 'p1', ec_name: 'Trail shoes', additionalFields: {}}],
      }).success
    ).toBe(true);
  });

  it('registers the product-summary component in the catalog with a matching contract', () => {
    expect(thermidorCatalogDefinitions).toHaveProperty('ProductSummary');
    expect(ProductSummaryPropsSchema.shape.componentType.value).toBe(
      ProductSummarySchema.shape.componentType.value
    );
    expect(
      ProductSummarySchema.shape.state.safeParse({
        categoryLabel: 'Surfboard',
        product: {permanentid: 'p1', ec_name: 'Board', additionalFields: {}},
      }).success
    ).toBe(true);
    // The single product may be null when no product is available for the slot.
    expect(
      ProductSummarySchema.shape.state.safeParse({categoryLabel: 'Surfboard', product: null})
        .success
    ).toBe(true);
  });

  it('registers the comparison-table leaf with heading, summary, products and attributes state', () => {
    expect(thermidorCatalogDefinitions).toHaveProperty('ComparisonTable');
    expect(
      ComparisonTableSchema.shape.state.safeParse({
        heading: 'Comparison',
        summary: 'A short summary.',
        products: [{productId: 'p1', name: 'Board', values: {brand: 'Acme'}}],
        attributes: [{key: 'brand', label: 'Brand'}],
      }).success
    ).toBe(true);
    // Products are required leaf state; omitting them is rejected.
    expect(
      ComparisonTableSchema.shape.state.safeParse({
        heading: 'Comparison',
        summary: 'A short summary.',
        attributes: [],
      }).success
    ).toBe(false);
  });

  it('registers the layout-stack container in the catalog with an empty state contract', () => {
    expect(thermidorCatalogDefinitions).toHaveProperty('LayoutStack');
    expect(LayoutStackPropsSchema.shape.componentType.value).toBe(
      LayoutStackSchema.shape.componentType.value
    );
    expect(LayoutStackSchema.shape.state.safeParse({}).success).toBe(true);
    // A layout container holds no business data; extra state keys are rejected.
    expect(LayoutStackSchema.shape.state.safeParse({direction: 'row'}).success).toBe(false);
  });

  it('registers the query-summary component with its aggregate state contract', () => {
    expect(thermidorCatalogDefinitions).toHaveProperty('QuerySummary');
    expect(QuerySummaryPropsSchema.shape.componentType.value).toBe(
      QuerySummarySchema.shape.componentType.value
    );
    expect(
      QuerySummarySchema.shape.state.safeParse({
        query: 'Water Sports',
        firstIndex: 1,
        lastIndex: 12,
        totalEntries: 43,
      }).success
    ).toBe(true);
    // All four aggregate fields are required.
    expect(QuerySummarySchema.shape.state.safeParse({query: 'x'}).success).toBe(false);
  });

  it('registers the page-size component with its own pageSize state and setPageSize action', () => {
    expect(thermidorCatalogDefinitions).toHaveProperty('PageSize');
    expect(PageSizePropsSchema.shape.componentType.value).toBe(
      PageSizeSchema.shape.componentType.value
    );
    expect(PageSizeSchema.shape.state.safeParse({pageSize: 24}).success).toBe(true);
    expect(
      PageSizeSchema.shape.actions.shape.setPageSize.shape.payload.safeParse({pageSize: 48}).success
    ).toBe(true);
  });

  it('exports the correct catalog ID', () => {
    expect(THERMIDOR_CATALOG_ID).toBe('https://schema.thermidor.coveo.com/a2-ui/catalog.json');
  });

  it('props schema componentType literals match the component contract values', () => {
    expect(ProductCarouselPropsSchema.shape.componentType.value).toBe(
      ProductCarouselSchema.shape.componentType.value
    );
  });
});
