import type {FoldedResult, Result} from '@coveo/headless';
import type {Product} from '@coveo/headless/commerce';
import type {Result as InsightResult} from '@coveo/headless/insight';
import {describe, expect, it} from 'vitest';
import {extractUnfoldedItem} from './unfolded-item';

describe('unfolded-item', () => {
  describe('#extractUnfoldedItem', () => {
    describe('when passed a FoldedResult', () => {
      it('should extract the inner result property', () => {
        const innerResult = {
          title: 'Test Result',
          uri: 'https://example.com',
          uniqueId: 'test-123',
        } as Result;

        const foldedResult: FoldedResult = {
          result: innerResult,
          children: [],
        };

        expect(extractUnfoldedItem(foldedResult)).toBe(innerResult);
      });

      it('should return the parent result when children exist', () => {
        const innerResult = {title: 'Parent Result'} as Result;
        const childResult = {title: 'Child Result'} as Result;

        const foldedResult: FoldedResult = {
          result: innerResult,
          children: [{result: childResult, children: []}],
        };

        expect(extractUnfoldedItem(foldedResult)).toBe(innerResult);
      });
    });

    describe('when passed an unfolded item', () => {
      it('should return a Result as-is', () => {
        const result = {
          title: 'Regular Result',
          uniqueId: 'regular-123',
        } as Result;

        expect(extractUnfoldedItem(result)).toBe(result);
      });

      it('should return an InsightResult as-is', () => {
        const insightResult = {
          title: 'Insight Result',
          uniqueId: 'insight-123',
        } as InsightResult;

        expect(extractUnfoldedItem(insightResult)).toBe(insightResult);
      });

      it('should return a Product as-is', () => {
        const product = {
          permanentid: 'product-123',
          ec_name: 'Test Product',
        } as Product;

        expect(extractUnfoldedItem(product)).toBe(product);
      });
    });
  });
});
