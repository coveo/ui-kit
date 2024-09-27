import {
  ArrayValue,
  NumberValue,
  Schema,
  SchemaValidationError,
  Value,
} from '@coveo/bueno';
import {requiredNonEmptyString} from '../../utils/validate-payload.js';

export type TemplateCondition<ItemType> = (item: ItemType) => boolean;

export interface Template<ItemType, Content = unknown, LinkContent = unknown> {
  /**
   * The stored content of the template.
   */
  content: Content;
  /**
   * The link used when an item generated by this template is clicked in a card layout.
   */
  linkContent?: LinkContent;
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

export interface TemplatesManager<
  ItemType,
  TemplateContent = unknown,
  LinkTemplateContent = unknown,
> {
  registerTemplates(
    ...newTemplates: Template<ItemType, TemplateContent>[]
  ): void;

  selectTemplate(item: ItemType): TemplateContent | null;
  selectLinkTemplate(item: ItemType): LinkTemplateContent | null;
}

export function buildTemplatesManager<
  ItemType,
  TemplateContent = unknown,
  LinkTemplateContent = unknown,
>(): TemplatesManager<ItemType, TemplateContent, LinkTemplateContent> {
  const templates: Required<
    Template<ItemType, TemplateContent, LinkTemplateContent>
  >[] = [];
  const validateTemplate = (
    template: Template<ItemType, TemplateContent, LinkTemplateContent>
  ) => {
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
    registerTemplates(
      ...newTemplates: Template<
        ItemType,
        TemplateContent,
        LinkTemplateContent
      >[]
    ) {
      newTemplates.forEach((template) => {
        const templatesWithDefault = {
          ...(validateTemplate(template) as Required<
            Template<ItemType, TemplateContent, LinkTemplateContent>
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

    selectLinkTemplate(item: ItemType) {
      const template = templates.find((template) =>
        template.conditions.every((condition) => condition(item))
      );
      return template ? template.linkContent : null;
    },
  };
}
