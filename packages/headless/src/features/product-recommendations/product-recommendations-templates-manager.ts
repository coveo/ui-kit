import {
  ArrayValue,
  NumberValue,
  Schema,
  SchemaValidationError,
  Value,
} from '@coveo/bueno';
import {CoreEngine} from '../../app/engine';
import {fieldsReducer as fields} from '../../features/fields/fields-slice';
import {ProductRecommendation} from '../../product-listing.index';
import {FieldsSection} from '../../state/state-sections';
import {loadReducerError} from '../../utils/errors';
import {requiredNonEmptyString} from '../../utils/validate-payload';
import {registerFieldsToInclude} from '../fields/fields-actions';
import {ProductRecommendationTemplate} from './product-recommendations-templates';

const productRecommendationTemplateSchema =
  new Schema<ProductRecommendationTemplate>({
    content: new Value({required: true}),
    conditions: new Value({required: true}),
    priority: new NumberValue({required: false, default: 0, min: 0}),
    fields: new ArrayValue({
      required: false,
      each: requiredNonEmptyString,
    }),
  });

export interface ProductRecommendationTemplatesManager<Content = unknown> {
  /**
   * Registers any number of product recommendation templates in the manager.
   * @param templates (...ProductRecommendationTemplate<Content>) A list of templates to register.
   */
  registerTemplates(
    ...newTemplates: ProductRecommendationTemplate<Content>[]
  ): void;
  /**
   * Selects the highest priority template for which the given product recommendation satisfies all conditions.
   * In the case where satisfied templates have equal priority, the template that was registered first is returned.
   * @param productRec (ProductRecommendation) The product recommendation for which to select a template.
   * @returns (Content) The selected template's content, or null if no template's conditions are satisfied.
   */
  selectTemplate(productRec: ProductRecommendation): Content | null;
}

/**
 * A manager in which product recommendation templates can be registered and selected based on a list of conditions and priority.
 * @param engine (HeadlessEngine) The `HeadlessEngine` instance of your application.
 * @returns (ProductRecommendationTemplatesManager<Content, State>) A new product recommendation templates manager.
 */
export function buildProductRecommendationTemplatesManager<Content = unknown>(
  engine: CoreEngine
): ProductRecommendationTemplatesManager<Content> {
  if (!loadProductRecommendationTemplatesManagerReducers(engine)) {
    throw loadReducerError;
  }

  const templates: Required<ProductRecommendationTemplate<Content>>[] = [];
  const validateTemplates = (
    templates: ProductRecommendationTemplate<Content>[]
  ) => {
    templates.forEach((template) => {
      productRecommendationTemplateSchema.validate(template);
      const areConditionsValid = template.conditions.every(
        (condition) => condition instanceof Function
      );

      if (!areConditionsValid) {
        throw new SchemaValidationError(
          'Each product recommendation template conditions should be a function that takes a product recommendation as an argument and returns a boolean'
        );
      }
    });
  };

  return {
    registerTemplates(
      ...newTemplates: ProductRecommendationTemplate<Content>[]
    ) {
      const fields: string[] = [];
      validateTemplates(newTemplates);

      newTemplates.forEach((template) => {
        const templatesWithDefault = {
          ...template,
          priority: template.priority || 0,
          fields: template.fields || [],
        };
        templates.push(templatesWithDefault);
        fields.push(...templatesWithDefault.fields);
      });

      templates.sort((a, b) => b.priority - a.priority);

      fields.length && engine.dispatch(registerFieldsToInclude(fields));
    },

    selectTemplate(productRec: ProductRecommendation) {
      const template = templates.find((template) =>
        template.conditions.every((condition) => condition(productRec))
      );
      return template ? template.content : null;
    },
  };
}

function loadProductRecommendationTemplatesManagerReducers(
  engine: CoreEngine
): engine is CoreEngine<FieldsSection> {
  engine.addReducers({fields});
  return true;
}
