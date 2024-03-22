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
   * A value which the manager will use to determine which template to select when an item satisfies the conditions of more than one template.
   * Templates with higher priority values will be selected over others. The minimum and default value is `0`.
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
  const validateTemplate = (template: Template<ItemType, TemplateContent>) => {
    const validated = templateSchema.validate(template);
    const areConditionsValid = template.conditions.every(
      (condition) => condition instanceof Function
    );

    if (!areConditionsValid) {
      throw new SchemaValidationError(
        'Each template condition should be a function that takes a Result or Product as an argument and returns a boolean'
      );
    }
    return validated;
  };

  return {
    registerTemplates(...newTemplates: Template<ItemType, TemplateContent>[]) {
      newTemplates.forEach((template) => {
        const templatesWithDefault = {
          ...(validateTemplate(template) as Required<
            Template<ItemType, TemplateContent>
          >),
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
