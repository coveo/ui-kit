import {describe, expect, it} from 'vitest';
import {
  defineMockCommerceController,
  defineMockRecommendationDefinition,
} from '../../../../test/mock-ssr-controller-definitions.js';
import type {Recommendations} from '../../controllers/recommendations/headless-recommendations.ssr.js';
import {
  isRecommendationController,
  isRecommendationDefinition,
} from './guards.js';

describe('Recommendation Guards', () => {
  describe('isRecommendationDefinition', () => {
    it('should return true for valid recommendation definition', () => {
      const definition = defineMockRecommendationDefinition('slot_1');
      expect(isRecommendationDefinition(definition)).toBe(true);
    });

    it('should return false for non recommendation definition', () => {
      const definition = defineMockCommerceController();
      expect(isRecommendationDefinition(definition)).toBe(false);
    });
  });

  describe('isRecommendationController', () => {
    it('should return true for controller with refresh method', () => {
      const controller = {
        refresh: () => {},
      } as unknown as Recommendations;

      expect(isRecommendationController(controller)).toBe(true);
    });

    it('should return false for controller without refresh method', () => {
      const controller = {
        // no refresh method
      } as unknown as Recommendations;

      expect(isRecommendationController(controller)).toBe(false);
    });
  });
});
