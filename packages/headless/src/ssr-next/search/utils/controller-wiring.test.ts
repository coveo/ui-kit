import {beforeEach, describe, expect, it} from 'vitest';
import {buildMockNavigatorContext} from '../../../test/mock-navigator-context.js';
import {
  defineMockSearchControllerWithProps,
  defineMockSearchParameterManager,
} from '../../../test/mock-ssr-controller-definitions.js';
import type {SearchControllerDefinitionsMap} from '../types/engine.js';
import {
  searchDefinitionSchema,
  wireControllerParams,
} from './controller-wiring.js';

describe('controller-wiring', () => {
  let mockControllerDefinitions: SearchControllerDefinitionsMap;

  beforeEach(() => {
    mockControllerDefinitions = {
      parameterManager: defineMockSearchParameterManager(),
      customController: defineMockSearchControllerWithProps(),
    } as SearchControllerDefinitionsMap;
  });

  describe('schema validation', () => {
    describe('when validating a searchDefinitionSchema', () => {
      it('should not throw for empty config', () => {
        const validate = () => {
          searchDefinitionSchema.validate({});
        };
        expect(validate).not.toThrow();
      });

      it('should not throw for missing search params', () => {
        expect(() => {
          searchDefinitionSchema.validate({});
        }).not.toThrow();

        expect(() => {
          searchDefinitionSchema.validate({
            searchParams: {},
          });
        }).not.toThrow();
      });

      it('should not throw for valid search params with query', () => {
        const searchConfig = {
          searchParams: {q: 'test query'},
        };
        expect(() => {
          searchDefinitionSchema.validate(searchConfig);
        }).not.toThrow();
      });

      it('should validate search params with other parameters', () => {
        const searchConfig = {
          searchParams: {
            q: 'test query',
            page: 2,
            perPage: 20,
          },
        };
        expect(() => {
          searchDefinitionSchema.validate(searchConfig);
        }).not.toThrow();
      });
    });
  });

  describe('#wireControllerParams', () => {
    it('should wire parameter manager for search with query', () => {
      const params = {
        navigatorContext: buildMockNavigatorContext(),
        searchParams: {
          q: 'test query',
        },
      };

      const {parameterManager} = wireControllerParams(
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
        searchParams: {
          q: 'test query',
        },
        controllers: {
          customController: {
            initialState: {foo: 'bar'},
          },
        },
      };

      const props = wireControllerParams(mockControllerDefinitions, params);

      expect(props.customController).toEqual({
        initialState: {
          foo: 'bar',
        },
      });
    });

    it('should handle search params for parameter manager', () => {
      const params = {
        navigatorContext: buildMockNavigatorContext(),
        searchParams: {numberOfResults: 12, firstResult: 30},
      };

      const {parameterManager} = wireControllerParams(
        mockControllerDefinitions,
        params
      );

      expect(parameterManager).toEqual({
        initialState: {
          parameters: {
            numberOfResults: 12,
            firstResult: 30,
          },
        },
      });
    });

    it('should handle empty search params for parameter manager', () => {
      const params = {
        navigatorContext: buildMockNavigatorContext(),
        searchParams: {},
      };

      const {parameterManager} = wireControllerParams(
        mockControllerDefinitions,
        params
      );

      expect(parameterManager).toEqual({
        initialState: {
          parameters: {},
        },
      });
    });

    it('should handle missing search params for parameter manager', () => {
      const params = {
        navigatorContext: buildMockNavigatorContext(),
      };

      const {parameterManager} = wireControllerParams(
        mockControllerDefinitions,
        params
      );

      expect(parameterManager).toEqual({
        initialState: {
          parameters: {},
        },
      });
    });

    it('should not wire parameter manager when not in definition', () => {
      const definitionsWithoutParameterManager = {
        customController: defineMockSearchControllerWithProps(),
      } as SearchControllerDefinitionsMap;

      const params = {
        navigatorContext: buildMockNavigatorContext(),
        searchParams: {q: 'test'},
        controllers: {
          customController: {
            initialState: {foo: 'bar'},
          },
        },
      };

      const props = wireControllerParams(
        definitionsWithoutParameterManager,
        params
      );

      expect(props.parameterManager).toBeUndefined();
      expect(props.customController).toEqual({
        initialState: {foo: 'bar'},
      });
    });

    it('should wire multiple search parameters', () => {
      const params = {
        navigatorContext: buildMockNavigatorContext(),
        searchParams: {
          q: 'test query',
          firstResult: 0,
          numberOfResults: 10,
          sortCriteria: 'relevancy',
        },
      };

      const {parameterManager} = wireControllerParams(
        mockControllerDefinitions,
        params
      );

      expect(parameterManager).toEqual({
        initialState: {
          parameters: {
            q: 'test query',
            firstResult: 0,
            numberOfResults: 10,
            sortCriteria: 'relevancy',
          },
        },
      });
    });
  });
});
