import {ResultTemplate} from './result-templates';
import {Result} from '../../api/search/search/result';
import {NumberValue, Schema} from '@coveo/bueno';

const prioritySchema = new Schema({
  priority: new NumberValue({required: false, default: 0, min: 0}),
});

/**
 * Manager in which result templates can be registered and selected based on a list of conditions and priority.
 */
export class ResultTemplatesManager<Content = unknown> {
  private templates: Required<ResultTemplate<Content>>[] = [];
  constructor() {}

  public registerTemplates(...templates: ResultTemplate<Content>[]) {
    this.validateTemplates(templates);
    this.templates.push(
      ...templates.map((template) => ({
        ...template,
        priority: template.priority || 0,
      }))
    );
    this.templates.sort((a, b) => b.priority - a.priority);
  }

  private validateTemplates(templates: ResultTemplate<Content>[]) {
    templates.forEach((template) => {
      prioritySchema.validate(template);
      const areConditionsValid = template.conditions.every(
        (condition) => condition instanceof Function
      );

      if (!areConditionsValid) {
        throw new Error('Result template conditions are invalid');
      }
    });
  }

  public selectTemplate(result: Result) {
    const template = this.templates.find((template) =>
      template.conditions.every((condition) => condition(result))
    );
    return template ? template.content : null;
  }
}
