import {beforeEach, describe, expect, it} from 'vitest';
import {defineMockCommerceControllerWithProps} from '../../../test/mock-ssr-controller-definitions.js';
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
        expect(validate).toThrowError(
          /searchParams: value is required and is currently undefined/
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
          recommendationsDefinitionSchema.validate({});
        };
        expect(validate).toThrowError(
          /context: value is required and is currently undefined/
        );
      });
    });

    it('should throw for missing search parameters', () => {
      expect(() => {
        searchDefinitionSchema.validate(validCommonConfig);
      }).toThrowError(/searchParams: value is require/);

      expect(() => {
        searchDefinitionSchema.validate({
          ...validCommonConfig,
          searchParams: {},
        });
      }).toThrowError(/searchParams: value does not contain query/);
    });

    it('should not throw for missing query', () => {
      const searchConfig = {
        ...validCommonConfig,
        searchParams: {query: 'test query'},
      };
      expect(() => {
        searchDefinitionSchema.validate(searchConfig);
      }).not.toThrow();
    });

    // TODO: KIT-4619: test recommendation array
    it.todo('should throw for missing recommendations', () => {
      expect(() => {
        recommendationsDefinitionSchema.validate(validCommonConfig);
      }).toThrowError(/recommendations: value is required./);
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
          searchParams: {
            query: 'test',
          },
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
        context: {
          language: 'en',
          country: 'US',
          currency: 'USD' as const,
          view: {url: 'https://example.com'},
        },
        searchParams: {
          query: 'test query',
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
        context: {
          language: 'en',
          country: 'US',
          currency: 'USD' as const,
          view: {url: 'https://example.com'},
        },
        searchParams: {
          query: 'test query',
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
  });
});
