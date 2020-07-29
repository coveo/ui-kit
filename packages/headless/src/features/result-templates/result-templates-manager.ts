import {ResultTemplate} from './result-templates';
import {Result} from '../../api/search/search/result';
import {NumberValue, Schema} from '@coveo/bueno';
import {SearchPageState} from '../../state';
import {Engine} from '../../app/headless-engine';
import {registerFieldsToInclude} from '../fields/fields-actions';

const prioritySchema = new Schema({
  priority: new NumberValue({required: false, default: 0, min: 0}),
});

/**
 * Manager in which result templates can be registered and selected based on a list of conditions and priority.
 */
export class ResultTemplatesManager<
  Content = unknown,
  State = SearchPageState
> {
  private templates: Required<ResultTemplate<Content>>[] = [];
  constructor(private engine: Engine<State>) {}

  public registerTemplates(...templates: ResultTemplate<Content>[]) {
    const fields: string[] = [];
    this.validateTemplates(templates);
    templates.forEach((template) => {
      const templatesWithDefault = {
        ...template,
        priority: template.priority || 0,
        fields: template.fields || [],
      };
      this.templates.push(templatesWithDefault);
      fields.concat(templatesWithDefault.fields);
    });
    this.templates.sort((a, b) => b.priority - a.priority);

    this.engine.dispatch(registerFieldsToInclude(fields));
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
