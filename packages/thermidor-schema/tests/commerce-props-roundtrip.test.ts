import fc from 'fast-check';
import {describe, expect, it} from 'vitest';
import {
  PaginationPropsSchema,
  ProductListPropsSchema,
  SearchBoxPropsSchema,
  SortPropsSchema,
} from '../src/index.js';

/**
 * Property 4: Schema round-trip for decomposed component props
 *
 * For ANY valid props object conforming to a decomposed commerce component
 * schema, `parse -> serialize -> parse` produces an equivalent object.
 *
 * Validates: Requirements 8.5
 */
describe('Feature: commerce-surface-decomposition, Property 4: Schema round-trip for decomposed component props', () => {
  const NUM_RUNS = 100;

  const componentIdArb = fc.string({minLength: 1, maxLength: 100});

  it('ProductListPropsSchema round-trips through JSON serialization', () => {
    fc.assert(
      fc.property(componentIdArb, (componentId) => {
        const input = {componentId, componentType: 'product-list' as const};
        const parsed = ProductListPropsSchema.parse(input);
        const roundTripped = ProductListPropsSchema.parse(JSON.parse(JSON.stringify(parsed)));
        expect(roundTripped).toStrictEqual(parsed);
      }),
      {numRuns: NUM_RUNS}
    );
  });

  it('PaginationPropsSchema round-trips through JSON serialization', () => {
    fc.assert(
      fc.property(componentIdArb, (componentId) => {
        const input = {componentId, componentType: 'pagination' as const};
        const parsed = PaginationPropsSchema.parse(input);
        const roundTripped = PaginationPropsSchema.parse(JSON.parse(JSON.stringify(parsed)));
        expect(roundTripped).toStrictEqual(parsed);
      }),
      {numRuns: NUM_RUNS}
    );
  });

  it('SortPropsSchema round-trips through JSON serialization', () => {
    fc.assert(
      fc.property(componentIdArb, (componentId) => {
        const input = {componentId, componentType: 'sort' as const};
        const parsed = SortPropsSchema.parse(input);
        const roundTripped = SortPropsSchema.parse(JSON.parse(JSON.stringify(parsed)));
        expect(roundTripped).toStrictEqual(parsed);
      }),
      {numRuns: NUM_RUNS}
    );
  });

  it('SearchBoxPropsSchema round-trips through JSON serialization', () => {
    fc.assert(
      fc.property(componentIdArb, (componentId) => {
        const input = {componentId, componentType: 'search-box' as const};
        const parsed = SearchBoxPropsSchema.parse(input);
        const roundTripped = SearchBoxPropsSchema.parse(JSON.parse(JSON.stringify(parsed)));
        expect(roundTripped).toStrictEqual(parsed);
      }),
      {numRuns: NUM_RUNS}
    );
  });
});
