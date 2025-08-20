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
      language: 'en',
      country: 'US',
      currency: 'USD' as const,
      url: 'https://example.com',
    };

    it.each([
      {schema: listingDefinitionSchema},
      {schema: searchDefinitionSchema},
      {schema: standaloneDefinitionSchema},
      {schema: recommendationsDefinitionSchema},
    ])('it should throw for missing required parameters', ({schema}) => {
      expect(() => {
        schema.validate();
      }).toThrowError(
        /language: value is required.|country: value is required.|currency: value is required.|url: value is required./
      );
    });

    it('should throw for missing query parameter', () => {
      const searchConfig = {
        ...validCommonConfig,
      };
      expect(() => {
        searchDefinitionSchema.validate(searchConfig);
      }).toThrowError(/query: value is required./);
    });

    it('should throw for missing query', () => {
      const searchConfig = {
        ...validCommonConfig,
        query: 'test query',
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
          query: 'test',
          language: 'en',
          country: 'US',
          currency: 'USD' as const,
          cart: {
            items: [mockCartItem],
          },
          url: 'https://example.com',
        };

        props = wireControllerParams(
          solutionType,
          mockControllerDefinitions,
          params
        );
      });

      it('should wire context for all solution types', () => {
        expect(props.context).toEqual({
          initialState: {
            view: {url: 'https://example.com'},
            language: 'en',
            country: 'US',
            currency: 'USD',
          },
        });
      });

      it('should wire cart for all solution types', () => {
        expect(props.cart).toEqual({
          initialState: {
            items: [mockCartItem],
          },
        });
      });
    });

    it('should wire parameter manager for search with query', () => {
      const params = {
        language: 'en',
        country: 'US',
        currency: 'USD' as const,
        url: 'https://example.com',
        query: 'test query',
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
        language: 'en',
        country: 'US',
        currency: 'USD' as const,
        url: 'https://example.com',
        query: 'test query',
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
        language: 'en',
        country: 'US',
        currency: 'USD' as const,
        url: 'https://example.com',
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
        language: 'en',
        country: 'US',
        currency: 'USD' as const,
        url: 'https://example.com',
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
