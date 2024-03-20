import {
  ArrayValue,
  NumberValue,
  Schema,
  SchemaValidationError,
  Value,
} from '@coveo/bueno';
import {requiredNonEmptyString} from '../../utils/validate-payload';

export type TemplateCondition<ItemType> = (item: ItemType) => boolean;

export interface Template<ItemType, Content = unknown> {
  /**
   * The stored content of the template.
   */
  content: Content;
  /**
   * A list of conditions that must be fulfilled for this template to be selected.
   */
  conditions: TemplateCondition<ItemType>[];
  /**
   * A value which the manager will fallback to when multiple templates' conditions are fulfilled.
   * Templates with higher priority values will be selected over others. The minimum value is `0`.
   */
  priority?: number;
  /**
   * A list of index fields that are necessary to render the template.
   */
  fields?: string[];
}

export const templateSchema = new Schema({
  content: new Value({required: true}),
  conditions: new Value({required: true}),
  priority: new NumberValue({required: false, default: 0, min: 0}),
  fields: new ArrayValue({
    required: false,
    each: requiredNonEmptyString,
  }),
});

export interface TemplatesManager<ItemType, TemplateContent = unknown> {
  registerTemplates(
    ...newTemplates: Template<ItemType, TemplateContent>[]
  ): void;

  selectTemplate(item: ItemType): TemplateContent | null;
}

export function buildTemplatesManager<
  ItemType,
  TemplateContent = unknown,
>(): TemplatesManager<ItemType, TemplateContent> {
  const templates: Required<Template<ItemType, TemplateContent>>[] = [];
  const validateTemplates = (
    templates: Template<ItemType, TemplateContent>[]
  ) => {
    templates.forEach((template) => {
      templateSchema.validate(template);
      const areConditionsValid = template.conditions.every(
        (condition) => condition instanceof Function
      );

      if (!areConditionsValid) {
        throw new SchemaValidationError(
          'Each product template conditions should be a function that takes a result as an argument and returns a boolean'
        );
      }
    });
  };

  return {
    registerTemplates(...newTemplates: Template<ItemType, TemplateContent>[]) {
      validateTemplates(newTemplates);

      newTemplates.forEach((template) => {
        const templatesWithDefault = {
          ...template,
          priority: template.priority || 0,
          fields: template.fields || [],
        };
        templates.push(templatesWithDefault);
      });

      templates.sort((a, b) => b.priority - a.priority);
    },

    selectTemplate(item: ItemType) {
      const template = templates.find((template) =>
        template.conditions.every((condition) => condition(item))
      );
      return template ? template.content : null;
    },
  };
}
