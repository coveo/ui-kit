import {
  buildMockSearchAppEngine,
  MockSearchEngine,
} from '../../test/mock-engine';
import {buildMockProductRecommendation} from '../../test/mock-product-recommendation';
import {fieldsReducer as fields} from '../fields/fields-slice';
import {ProductRecommendationTemplate} from './product-recommendations-templates';
import {
  ProductRecommendationTemplatesManager,
  buildProductRecommendationTemplatesManager,
} from './product-recommendations-templates-manager';

describe('product recommendation template manager', () => {
  let productRecommendationTemplateManager: ProductRecommendationTemplatesManager<string>;
  let engine: MockSearchEngine;

  beforeEach(() => {
    engine = buildMockSearchAppEngine();
    productRecommendationTemplateManager =
      buildProductRecommendationTemplatesManager(engine);
  });

  it('adds the correct reducers to the engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({fields});
  });

  describe('registration & selection', () => {
    it('returns a registered template that matches', () => {
      productRecommendationTemplateManager.registerTemplates({
        content: '{{title}}',
        conditions: [() => true, () => true],
      });

      expect(
        productRecommendationTemplateManager.selectTemplate(
          buildMockProductRecommendation()
        )
      ).toBe('{{title}}');
    });

    it("does not return a registered template that doesn't not match", () => {
      productRecommendationTemplateManager.registerTemplates({
        content: '{{title}}',
        conditions: [() => true, () => false],
      });

      expect(
        productRecommendationTemplateManager.selectTemplate(
          buildMockProductRecommendation()
        )
      ).toBeNull();
    });

    it(`when multiple templates match
        it returns the one with the highest priority`, () => {
      productRecommendationTemplateManager.registerTemplates(
        {
          content: '{{title1}}',
          conditions: [() => true],
          priority: 10,
        },
        {
          content: '{{title2}}',
          conditions: [() => true],
          priority: 20,
        }
      );

      expect(
        productRecommendationTemplateManager.selectTemplate(
          buildMockProductRecommendation()
        )
      ).toBe('{{title2}}');
    });

    it(`when multiple templates match & have the same priority
        it should keep the same registration order (return the first one registered)`, () => {
      productRecommendationTemplateManager.registerTemplates(
        {
          content: '{{title1}}',
          conditions: [() => true],
        },
        {
          content: '{{title2}}',
          conditions: [() => true],
        },
        {
          content: '{{title3}}',
          conditions: [() => true],
        }
      );

      expect(
        productRecommendationTemplateManager.selectTemplate(
          buildMockProductRecommendation()
        )
      ).toBe('{{title1}}');
    });

    it('validates the template', () => {
      expect(() =>
        productRecommendationTemplateManager.registerTemplates(
          undefined as unknown as ProductRecommendationTemplate<string>
        )
      ).toThrow();
      expect(() =>
        productRecommendationTemplateManager.registerTemplates({
          content: 'abc',
        } as unknown as ProductRecommendationTemplate<string>)
      ).toThrow();
      expect(() =>
        productRecommendationTemplateManager.registerTemplates({
          conditions: [() => true],
        } as unknown as ProductRecommendationTemplate<string>)
      ).toThrow();
    });
  });
});
