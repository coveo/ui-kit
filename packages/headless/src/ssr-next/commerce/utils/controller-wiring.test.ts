import {describe, expect, it} from 'vitest';
import {buildMockNavigatorContext} from '../../../test/mock-navigator-context.js';
import {
  defineMockCommerceController,
  defineMockRecommendationDefinition,
} from '../../../test/mock-ssr-controller-definitions.js';
import type {CommonBuildConfig} from '../types/build.js';
import {SolutionType} from '../types/controller-constants.js';
import type {CommerceControllerDefinitionsMap} from '../types/engine.js';
import {
  listingDefinitionSchema,
  searchDefinitionSchema,
  standaloneDefinitionSchema,
  validateBuildConfig,
} from './controller-wiring.js';

describe('controller-wiring', () => {
  const validCommonConfig = {
    context: {
      language: 'en',
      country: 'US',
      currency: 'USD' as const,
      view: {url: 'https://example.com'},
    },
  };

  describe('schema validation', () => {
    describe('when validating a listingDefinitionSchema', () => {
      it('should throw for missing required context only', () => {
        const validate = () => {
          listingDefinitionSchema([]).validate({});
        };
        expect(validate).toThrowError(/context: value is required and is currently undefined/);
      });
    });

    describe('when validating a searchDefinitionSchema', () => {
      it('should throw for missing required search params and context', () => {
        const validate = () => {
          searchDefinitionSchema([]).validate({});
        };
        expect(validate).toThrowError(/context: value is required and is currently undefined/);
      });
    });

    describe('when validating a standaloneDefinitionSchema', () => {
      it('should throw for missing required parameters and context', () => {
        const validate = () => {
          standaloneDefinitionSchema([]).validate({});
        };
        expect(validate).toThrowError(/context: value is required and is currently undefined/);
      });
    });

    it('should not throw for missing search parameters', () => {
      expect(() => {
        searchDefinitionSchema([]).validate(validCommonConfig);
      }).not.toThrowError(/searchParams: value is require/);

      expect(() => {
        searchDefinitionSchema([]).validate({
          ...validCommonConfig,
          searchParams: {},
        });
      }).not.toThrowError(/searchParams: value does not contain q/);
    });

    it('should not throw for missing query', () => {
      const searchConfig = {
        ...validCommonConfig,
        searchParams: {q: 'test query'},
      };
      expect(() => {
        searchDefinitionSchema([]).validate(searchConfig);
      }).not.toThrow();
    });

    describe.each([
      ['listing', listingDefinitionSchema],
      ['search', searchDefinitionSchema],
      ['standalone', standaloneDefinitionSchema],
    ])('recommendation slots of the %s schema', (_, schema) => {
      it('should not require recommendations', () => {
        expect(() => schema(['rec1']).validate(validCommonConfig)).not.toThrow();
      });

      it('should throw if the user refers to a recommendation controller that was not defined in the definition', () => {
        expect(() =>
          schema(['rec1', 'rec2']).validate({
            ...validCommonConfig,
            recommendations: ['invalid-rec'],
          })
        ).toThrowError(/value should be one of: rec1, rec2./);
      });

      it('should accept a product ID', () => {
        expect(() =>
          schema(['rec1']).validate({
            ...validCommonConfig,
            recommendations: ['rec1'],
            productId: 'product-123',
          })
        ).not.toThrow();
      });

      it('should reject an empty product ID', () => {
        expect(() =>
          schema(['rec1']).validate({
            ...validCommonConfig,
            recommendations: ['rec1'],
            productId: '',
          })
        ).toThrow();
      });
    });
  });

  describe('#validateBuildConfig', () => {
    const controllerDefinitions = {
      parameterManager: defineMockCommerceController(),
      context: defineMockCommerceController(),
      cart: defineMockCommerceController(),
      rec1: defineMockRecommendationDefinition('rec1-slot'),
    } as CommerceControllerDefinitionsMap;
    const pageFacts: CommonBuildConfig = {
      navigatorContext: buildMockNavigatorContext(),
      ...validCommonConfig,
      cart: {items: [{name: 'Product 1', price: 100, productId: '1', quantity: 1}]},
      searchParams: {page: 2},
      recommendations: ['rec1'],
      productId: 'product-123',
      accessToken: 'token',
    };

    it.each([SolutionType.listing, SolutionType.search, SolutionType.standalone])(
      'should accept the page facts of a %s request',
      (solutionType) => {
        expect(() =>
          validateBuildConfig(solutionType, controllerDefinitions, pageFacts)
        ).not.toThrow();
      }
    );

    it('should accept a search request with a query and no other search parameter', () => {
      expect(() =>
        validateBuildConfig(SolutionType.search, controllerDefinitions, {
          ...pageFacts,
          searchParams: {q: 'test'},
        })
      ).not.toThrow();
    });

    it('should accept a request without search parameters', () => {
      const {searchParams: _, ...withoutSearchParams} = pageFacts;

      expect(() =>
        validateBuildConfig(SolutionType.search, controllerDefinitions, withoutSearchParams)
      ).not.toThrow();
    });

    it.each([SolutionType.listing, SolutionType.search, SolutionType.standalone])(
      'should name the %s engine definition when the page facts are invalid',
      (solutionType) => {
        expect(() =>
          validateBuildConfig(solutionType, controllerDefinitions, {
            navigatorContext: buildMockNavigatorContext(),
          } as CommonBuildConfig)
        ).toThrow(new RegExp(`fetchStaticState\\(\\) of the ${solutionType} engine definition`));
      }
    );

    it('should accept only the recommendation controllers declared in the definition', () => {
      expect(() =>
        validateBuildConfig(SolutionType.standalone, controllerDefinitions, {
          ...pageFacts,
          recommendations: ['rec2'],
        })
      ).toThrow(/value should be one of: rec1./);
    });
  });
});
