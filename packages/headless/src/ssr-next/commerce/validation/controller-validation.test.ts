import {defineMockRecommendationDefinition} from '../../../test/mock-ssr-controller-definitions.js';
import {MultipleRecommendationError} from '../../common/errors.js';
import {recommendationInternalOptionKey} from '../types/controller-constants.js';
import {
  validateControllerNames,
  validateUniqueRecommendationSlotIds,
} from './controller-validation.js';

describe('controller-validation', () => {
  describe('#validateUniqueRecommendationSlotIds', () => {
    it('should not throw an error when all recommendation controllers have unique slotIds', () => {
      const recommendationDefinitions = {
        rec1: defineMockRecommendationDefinition('slot-1'),
        rec2: defineMockRecommendationDefinition('slot-2'),
        rec3: defineMockRecommendationDefinition('slot-3'),
      };

      expect(() =>
        validateUniqueRecommendationSlotIds(recommendationDefinitions)
      ).not.toThrow();
    });

    it('should throw MultipleRecommendationError when duplicate slotIds are found', () => {
      const recommendationDefinitions = {
        rec1: defineMockRecommendationDefinition('duplicate-slot'),
        rec2: defineMockRecommendationDefinition('unique-slot'),
        rec3: defineMockRecommendationDefinition('duplicate-slot'),
      };

      expect(() =>
        validateUniqueRecommendationSlotIds(recommendationDefinitions)
      ).toThrow(new MultipleRecommendationError('duplicate-slot'));
    });

    it('should handle empty recommendation definitions object', () => {
      const emptyRecommendationDefinitions = {};

      expect(() =>
        validateUniqueRecommendationSlotIds(emptyRecommendationDefinitions)
      ).not.toThrow();
    });

    it('should handle single recommendation controller', () => {
      const singleRecommendationDefinition = {
        singleRec: defineMockRecommendationDefinition('single-slot'),
      };

      expect(() =>
        validateUniqueRecommendationSlotIds(singleRecommendationDefinition)
      ).not.toThrow();
    });

    it('should detect duplicate on the second occurrence', () => {
      const recommendationDefinitions = {
        firstRec: defineMockRecommendationDefinition('same-slot'),
        secondRec: defineMockRecommendationDefinition('same-slot'),
      };

      expect(() =>
        validateUniqueRecommendationSlotIds(recommendationDefinitions)
      ).toThrow(new MultipleRecommendationError('same-slot'));
    });

    it('should work with recommendation definitions that have additional properties', () => {
      const recommendationDefinitions = {
        rec1: {
          recommendation: true,
          [recommendationInternalOptionKey]: {
            slotId: 'slot-1',
            numberOfRecommendations: 5,
            productId: 'product-123',
          },
          buildWithProps: vi.fn(),
          otherProperty: 'value',
        },
        rec2: {
          recommendation: true,
          [recommendationInternalOptionKey]: {
            slotId: 'slot-2',
            numberOfRecommendations: 10,
          },
          buildWithProps: vi.fn(),
          anotherProperty: {nested: true},
        },
      };

      expect(() =>
        validateUniqueRecommendationSlotIds(recommendationDefinitions)
      ).not.toThrow();
    });
  });

  describe('#validateControllerNames', () => {
    it('should not throw an error for valid controller names', () => {
      const validControllers = {
        searchBox: {},
        productList: {},
        recommendations: {},
        facetManager: {},
      };

      expect(() => validateControllerNames(validControllers)).not.toThrow();
    });

    it('should throw an error when using reserved name "context"', () => {
      const controllersWithContext = {
        context: {},
        searchBox: {},
      };

      expect(() => validateControllerNames(controllersWithContext)).toThrow(
        'Reserved controller names found: context. Please use different controller names than context, cart, parameterManager.'
      );
    });

    it('should throw an error when using reserved name "cart"', () => {
      const controllersWithCart = {
        cart: {},
        productList: {},
      };

      expect(() => validateControllerNames(controllersWithCart)).toThrow(
        'Reserved controller names found: cart. Please use different controller names than context, cart, parameterManager.'
      );
    });

    it('should throw an error when using reserved name "parameterManager"', () => {
      const controllersWithParameterManager = {
        parameterManager: {},
        searchBox: {},
      };

      expect(() =>
        validateControllerNames(controllersWithParameterManager)
      ).toThrow(
        'Reserved controller names found: parameterManager. Please use different controller names than context, cart, parameterManager.'
      );
    });

    it('should handle empty controllers object', () => {
      const emptyControllers = {};

      expect(() => validateControllerNames(emptyControllers)).not.toThrow();
    });

    it('should work with controllers that have various value types', () => {
      const controllersWithDifferentValues = {
        searchBox: {config: 'value'},
        productList: null,
        recommendations: undefined,
        facetManager: {nested: {object: true}},
      };

      expect(() =>
        validateControllerNames(controllersWithDifferentValues)
      ).not.toThrow();
    });
  });
});
