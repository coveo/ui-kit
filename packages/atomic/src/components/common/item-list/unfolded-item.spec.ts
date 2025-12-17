import type {FoldedResult, Result} from '@coveo/headless';
import type {Product} from '@coveo/headless/commerce';
import type {Result as InsightResult} from '@coveo/headless/insight';
import {describe, expect, it} from 'vitest';
import {extractUnfoldedItem} from './unfolded-item';

describe('unfolded-item', () => {
  describe('#extractUnfoldedItem', () => {
    describe('when passed a FoldedResult', () => {
      it('should extract and return the inner result property', () => {
        const innerResult = {
          title: 'Test Result',
          uri: 'https://example.com',
          uniqueId: 'test-123',
        } as Result;

        const foldedResult: FoldedResult = {
          result: innerResult,
          children: [],
        };

        const extracted = extractUnfoldedItem(foldedResult);

        expect(extracted).toBe(innerResult);
        expect(extracted).toEqual({
          title: 'Test Result',
          uri: 'https://example.com',
          uniqueId: 'test-123',
        });
      });

      it('should extract result even when FoldedResult has children', () => {
        const innerResult = {
          title: 'Parent Result',
          uri: 'https://example.com/parent',
          uniqueId: 'parent-123',
        } as Result;

        const childResult = {
          title: 'Child Result',
          uri: 'https://example.com/child',
          uniqueId: 'child-456',
        } as Result;

        const foldedResult: FoldedResult = {
          result: innerResult,
          children: [
            {
              result: childResult,
              children: [],
            },
          ],
        };

        const extracted = extractUnfoldedItem(foldedResult);

        expect(extracted).toBe(innerResult);
        expect(extracted).not.toBe(childResult);
      });
    });

    describe('when passed a regular Result', () => {
      it('should return the Result as-is', () => {
        const result: Result = {
          title: 'Regular Result',
          uri: 'https://example.com',
          uniqueId: 'regular-123',
          raw: {},
        } as Result;

        const extracted = extractUnfoldedItem(result);

        expect(extracted).toBe(result);
        expect(extracted).toEqual(result);
      });
    });

    describe('when passed an InsightResult', () => {
      it('should return the InsightResult as-is', () => {
        const insightResult: InsightResult = {
          title: 'Insight Result',
          uri: 'https://example.com',
          uniqueId: 'insight-123',
          raw: {},
        } as InsightResult;

        const extracted = extractUnfoldedItem(insightResult);

        expect(extracted).toBe(insightResult);
        expect(extracted).toEqual(insightResult);
      });
    });

    describe('when passed a Product', () => {
      it('should return the Product as-is', () => {
        const product: Product = {
          permanentid: 'product-123',
          ec_name: 'Test Product',
        } as Product;

        const extracted = extractUnfoldedItem(product);

        expect(extracted).toBe(product);
        expect(extracted).toEqual(product);
      });
    });

    describe('edge cases', () => {
      it('should handle FoldedResult with empty children array', () => {
        const innerResult = {
          title: 'Test',
          uri: 'https://example.com',
          uniqueId: 'test-123',
        } as Result;

        const foldedResult: FoldedResult = {
          result: innerResult,
          children: [],
        };

        const extracted = extractUnfoldedItem(foldedResult);

        expect(extracted).toBe(innerResult);
      });

      it('should handle objects that look like FoldedResult but are actually Results', () => {
        // A Result might have a 'result' property in its raw data
        const result = {
          title: 'Tricky Result',
          uri: 'https://example.com',
          uniqueId: 'tricky-123',
          raw: {
            result: 'some-value',
          },
        } as Result;

        const extracted = extractUnfoldedItem(result);

        // Since Result doesn't have a 'result' property at the top level,
        // it should return the original result
        expect(extracted).toBe(result);
      });

      it('should preserve all properties when extracting from FoldedResult', () => {
        const innerResult = {
          title: 'Complete Result',
          uri: 'https://example.com',
          uniqueId: 'complete-123',
          excerpt: 'This is an excerpt',
          raw: {field1: 'value1', field2: 'value2'},
        } as Result;

        const foldedResult: FoldedResult = {
          result: innerResult,
          children: [],
        };

        const extracted = extractUnfoldedItem(foldedResult);

        expect(extracted).toEqual(innerResult);
        expect((extracted as Result).excerpt).toBe('This is an excerpt');
        expect((extracted as Result).raw).toEqual({
          field1: 'value1',
          field2: 'value2',
        });
      });
    });
  });
});
