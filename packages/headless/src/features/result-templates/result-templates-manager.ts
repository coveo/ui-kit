import {ResultTemplate} from './result-templates';
import {Result} from '../../api/search/search/result';
import {NumberValue, Schema} from '@coveo/bueno';
import {Engine} from '../../app/headless-engine';
import {registerFieldsToInclude} from '../fields/fields-actions';
import {SearchAppState} from '../../state/search-app-state';

const prioritySchema = new Schema({
  priority: new NumberValue({required: false, default: 0, min: 0}),
});

/**
 * A manager in which result templates can be registered and selected based on a list of conditions and priority.
 */
export class ResultTemplatesManager<Content = unknown, State = SearchAppState> {
  private templates: Required<ResultTemplate<Content>>[] = [];
  /**
   * Creates a new `ResultTemplatesManager` instance.
   * @param engine (HeadlessEngine) The `HeadlessEngine` instance of your application.
   * @returns (ResultTemplatesManager<Content, State>) A new result templates manager.
   */
  constructor(private engine: Engine<State>) {}

  /**
   * Registers any number of result templates in the manager.
   * @param templates (...ResultTemplate<Content>) A list of templates to register.
   */
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
      fields.push(...templatesWithDefault.fields);
    });

    this.templates.sort((a, b) => b.priority - a.priority);

    fields.length && this.engine.dispatch(registerFieldsToInclude(fields));
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

  /**
   * Selects the highest priority template for which the given result satisfies all conditions.
   * In the case where satisfied templates have equal priority, the template that was registered first is returned.
   * @param result (Result) The result for which to select a template.
   * @returns (Content) The selected template's content, or null if no template's conditions are satisfied.
   */
  public selectTemplate(result: Result) {
    const template = this.templates.find((template) =>
      template.conditions.every((condition) => condition(result))
    );
    return template ? template.content : null;
  }
}
