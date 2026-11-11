import {describe, expect, it} from 'vitest';
import {buildMockNavigatorContext} from '../../../test/mock-navigator-context.js';
import {searchDefinitionSchema, validateBuildConfig} from './controller-wiring.js';

type PageFacts = Parameters<typeof validateBuildConfig>[0];

describe('controller-wiring', () => {
  describe('#searchDefinitionSchema', () => {
    it('should not throw for an empty config', () => {
      expect(() => searchDefinitionSchema.validate({})).not.toThrow();
    });

    it('should not throw for empty search params', () => {
      expect(() => searchDefinitionSchema.validate({searchParams: {}})).not.toThrow();
    });

    it('should not throw for search params with a query and other parameters', () => {
      expect(() =>
        searchDefinitionSchema.validate({
          searchParams: {
            q: 'test query',
            firstResult: 0,
            numberOfResults: 10,
            sortCriteria: 'relevancy',
          },
        })
      ).not.toThrow();
    });

    it('should accept the custom context values', () => {
      expect(() =>
        searchDefinitionSchema.validate({context: {ageGroup: '30-45', interests: ['sports']}})
      ).not.toThrow();
    });

    it('should reject search params that are not a record', () => {
      expect(() =>
        searchDefinitionSchema.validate({searchParams: 'q=test'} as unknown as PageFacts)
      ).toThrow();
    });
  });

  describe('#validateBuildConfig', () => {
    it('should accept the page facts of a search request', () => {
      expect(() =>
        validateBuildConfig({
          navigatorContext: buildMockNavigatorContext(),
          searchParams: {q: 'test'},
          context: {ageGroup: '30-45'},
          accessToken: 'token',
        })
      ).not.toThrow();
    });

    it('should accept a request without search params or context', () => {
      expect(() =>
        validateBuildConfig({navigatorContext: buildMockNavigatorContext()})
      ).not.toThrow();
    });

    it('should name the search engine definition when the page facts are invalid', () => {
      expect(() =>
        validateBuildConfig({
          navigatorContext: buildMockNavigatorContext(),
          searchParams: 'q=test',
        } as unknown as PageFacts)
      ).toThrow(/fetchStaticState\(\) of the search engine definition/);
    });
  });
});
