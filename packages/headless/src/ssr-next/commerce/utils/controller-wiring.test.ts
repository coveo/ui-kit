import {beforeEach, describe, expect, it} from 'vitest';
import {buildMockNavigatorContext} from '../../../test/mock-navigator-context.js';
import {
  defineMockCommerceControllerWithProps,
  defineMockRecommendationDefinition,
} from '../../../test/mock-ssr-controller-definitions.js';
import {SolutionType} from '../types/controller-constants.js';
import type {InferControllerPropsMapFromDefinitions} from '../types/controller-inference.js';
import type {CommerceControllerDefinitionsMap} from '../types/engine.js';
import {
  listingDefinitionSchema,
  recommendationsDefinitionSchema,
  searchDefinitionSchema,
  standaloneDefinitionSchema,
  wireControllerParams,
} from './controller-wiring.js';

describe('controller-wiring', () => {
  let mockControllerDefinitions: CommerceControllerDefinitionsMap;

  beforeEach(() => {
    mockControllerDefinitions = {
      parameterManager: defineMockCommerceControllerWithProps(),
      context: defineMockCommerceControllerWithProps(),
      cart: defineMockCommerceControllerWithProps(),
    } as CommerceControllerDefinitionsMap;
  });

  describe('schema validation', () => {
    const validCommonConfig = {
      context: {
        language: 'en',
        country: 'US',
        currency: 'USD' as const,
        view: {url: 'https://example.com'},
      },
    };

    describe('when validating a listingDefinitionSchema', () => {
      it('should throw for missing required context only', () => {
        const validate = () => {
          listingDefinitionSchema.validate({});
        };
        expect(validate).toThrowError(
          /context: value is required and is currently undefined/
        );
      });
    });

    describe('when validating a searchDefinitionSchema', () => {
      it('should throw for missing required search params and context', () => {
        const validate = () => {
          searchDefinitionSchema.validate({});
        };
        expect(validate).toThrowError(
          /context: value is required and is currently undefined/
        );
      });
    });

    describe('when validating a standaloneDefinitionSchema', () => {
      it('should throw for missing required parameters and context', () => {
        const validate = () => {
          standaloneDefinitionSchema.validate({});
        };
        expect(validate).toThrowError(
          /context: value is required and is currently undefined/
        );
      });
    });

    describe('when validating a recommendationsDefinitionSchema', () => {
      it('should throw for missing required parameters and context', () => {
        const validate = () => {
          recommendationsDefinitionSchema([]).validate({});
        };
        expect(validate).toThrowError(
          /context: value is required and is currently undefined/
        );
      });
    });

    it('should not throw for missing search parameters', () => {
      expect(() => {
        searchDefinitionSchema.validate(validCommonConfig);
      }).not.toThrowError(/searchParams: value is require/);

      expect(() => {
        searchDefinitionSchema.validate({
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
        searchDefinitionSchema.validate(searchConfig);
      }).not.toThrow();
    });

    it('should throw for missing recommendations', () => {
      expect(() => {
        recommendationsDefinitionSchema([]).validate(validCommonConfig);
      }).toThrowError(/recommendations: value is required./);
    });

    it('should throw if the user refers to recommendation controller that was not defined in the definition', () => {
      const recommendationsConfig = {
        ...validCommonConfig,
        recommendations: ['invalid-rec'],
      };
      expect(() => {
        recommendationsDefinitionSchema(['rec1', 'rec2']).validate(
          recommendationsConfig
        );
      }).toThrowError(/value should be one of: rec1, rec2./);
    });

    it('should validate recommendations config with productId', () => {
      const recommendationsConfig = {
        ...validCommonConfig,
        recommendations: ['rec1'],
        productId: 'product-123',
      };
      expect(() => {
        recommendationsDefinitionSchema(['rec1']).validate(
          recommendationsConfig
        );
      }).not.toThrow();
    });

    it('should validate recommendations config without productId', () => {
      const recommendationsConfig = {
        ...validCommonConfig,
        recommendations: ['rec1'],
      };
      expect(() => {
        recommendationsDefinitionSchema(['rec1']).validate(
          recommendationsConfig
        );
      }).not.toThrow();
    });

    it('should not validate recommendations config with empty productId', () => {
      const recommendationsConfig = {
        ...validCommonConfig,
        recommendations: ['rec1'],
        productId: '',
      };
      expect(() => {
        recommendationsDefinitionSchema(['rec1']).validate(
          recommendationsConfig
        );
      }).toThrow();
    });
  });

  describe('#wireControllerParams', () => {
    describe.each([
      {solutionType: SolutionType.listing},
      {solutionType: SolutionType.search},
      {solutionType: SolutionType.standalone},
      {solutionType: SolutionType.recommendation},
    ])('%s', ({solutionType}) => {
      const mockCartItem = {
        name: 'Product 1',
        price: 100,
        productId: '1',
        quantity: 1,
      };
      let props: InferControllerPropsMapFromDefinitions<CommerceControllerDefinitionsMap>;

      beforeAll(() => {
        const params = {
          navigatorContext: buildMockNavigatorContext(),
          searchParams: {
            q: 'test',
          },
          recommendations: [],
          context: {
            language: 'en',
            country: 'US',
            currency: 'USD' as const,
            view: {url: 'https://example.com'},
          },
          cart: {
            items: [mockCartItem],
          },
        };

        props = wireControllerParams(
          solutionType,
          mockControllerDefinitions,
          params
        );
      });

      it(`should wire context for ${solutionType} solution type`, () => {
        expect(props.context).toEqual({
          initialState: {
            view: {url: 'https://example.com'},
            language: 'en',
            country: 'US',
            currency: 'USD',
          },
        });
      });

      it(`should wire cart for ${solutionType} solution type`, () => {
        expect(props.cart).toEqual({
          initialState: {
            items: [mockCartItem],
          },
        });
      });
    });

    it('should wire parameter manager for search with query', () => {
      const params = {
        navigatorContext: buildMockNavigatorContext(),
        context: {
          language: 'en',
          country: 'US',
          currency: 'USD' as const,
          view: {url: 'https://example.com'},
        },
        searchParams: {
          q: 'test query',
        },
      };

      const {parameterManager} = wireControllerParams(
        SolutionType.search,
        mockControllerDefinitions,
        params
      );

      expect(parameterManager).toEqual({
        initialState: {
          parameters: {
            q: 'test query',
          },
        },
      });
    });

    it('should contain props from custom controllers if provided', () => {
      const params = {
        navigatorContext: buildMockNavigatorContext(),
        context: {
          language: 'en',
          country: 'US',
          currency: 'USD' as const,
          view: {url: 'https://example.com'},
        },
        searchParams: {
          q: 'test query',
        },
        controllers: {
          customController: {
            initialState: {foo: 'bar'},
          },
        },
      };

      const props = wireControllerParams(
        SolutionType.search,
        mockControllerDefinitions,
        params
      );

      expect(props.customController).toEqual({
        initialState: {
          foo: 'bar',
        },
      });
    });

    it('should handle search params for parameter manager', () => {
      const params = {
        navigatorContext: buildMockNavigatorContext(),
        context: {
          language: 'en',
          country: 'US',
          currency: 'USD' as const,
          view: {url: 'https://example.com'},
        },
        searchParams: {perPage: 12, page: 3},
      };

      const {parameterManager} = wireControllerParams(
        SolutionType.listing,
        mockControllerDefinitions,
        params
      );

      expect(parameterManager).toEqual({
        initialState: {
          parameters: {
            perPage: 12,
            page: 3,
          },
        },
      });
    });

    it('should not wire controllers that are not in the definition', () => {
      const definitionsWithoutCart = {
        context: defineMockCommerceControllerWithProps(),
      } as CommerceControllerDefinitionsMap;

      const params = {
        navigatorContext: buildMockNavigatorContext(),
        context: {
          language: 'en',
          country: 'US',
          currency: 'USD' as const,
          view: {url: 'https://example.com'},
        },
        cart: {items: []},
      };

      const props = wireControllerParams(
        SolutionType.listing,
        definitionsWithoutCart,
        params
      );

      expect(props.cart).toBeUndefined();
      expect(props.parameterManager).toBeUndefined();
      expect(props.context).toBeDefined();
    });

    describe('recommendation wiring', () => {
      it('should wire each recommendation controller with the provided productId', () => {
        const definitionsWithRecommendation = {
          ...mockControllerDefinitions,
          rec1: defineMockRecommendationDefinition('rec1-slot'),
          rec2: defineMockRecommendationDefinition('rec2-slot'),
        } as CommerceControllerDefinitionsMap;

        const params = {
          navigatorContext: buildMockNavigatorContext(),
          context: {
            language: 'en',
            country: 'US',
            currency: 'USD' as const,
            view: {
              url: 'https://example.com',
            },
          },
          recommendations: ['rec1', 'rec2'],
          productId: 'product-123',
        };

        const props = wireControllerParams(
          SolutionType.recommendation,
          definitionsWithRecommendation,
          params
        );

        expect(props.rec1).toEqual({
          initialState: {
            productId: 'product-123',
          },
        });
        expect(props.rec2).toEqual({
          initialState: {
            productId: 'product-123',
          },
        });
      });

      it('should wire recommendation controllers without productId when not provided', () => {
        const definitionsWithRecommendation = {
          ...mockControllerDefinitions,
          rec1: defineMockRecommendationDefinition('rec1-slot'),
        } as CommerceControllerDefinitionsMap;

        const params = {
          navigatorContext: buildMockNavigatorContext(),
          context: {
            language: 'en',
            country: 'US',
            currency: 'USD' as const,
            view: {url: 'https://example.com'},
          },
          recommendations: ['rec1'],
        };

        const props = wireControllerParams(
          SolutionType.recommendation,
          definitionsWithRecommendation,
          params
        );

        expect(props.rec1).toEqual({
          initialState: {},
        });
      });

      it('should not wire non-recommendation controllers in recommendation solution type', () => {
        const definitionsWithMixed = {
          ...mockControllerDefinitions,
          rec1: defineMockRecommendationDefinition('rec1-slot'),
          nonRec: defineMockCommerceControllerWithProps(),
        } as CommerceControllerDefinitionsMap;

        const params = {
          navigatorContext: buildMockNavigatorContext(),
          context: {
            language: 'en',
            country: 'US',
            currency: 'USD' as const,
            view: {url: 'https://example.com'},
          },
          recommendations: ['rec1'],
          productId: 'product-123',
        };

        const props = wireControllerParams(
          SolutionType.recommendation,
          definitionsWithMixed,
          params
        );

        expect(props.rec1).toEqual({
          initialState: {
            productId: 'product-123',
          },
        });
        expect(props.nonRec).toBeUndefined();
      });
    });
  });
});
