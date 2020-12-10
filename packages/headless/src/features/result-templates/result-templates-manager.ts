import {ResultTemplate} from './result-templates';
import {Result} from '../../api/search/search/result';
import {
  ArrayValue,
  NumberValue,
  Schema,
  SchemaValidationError,
  StringValue,
} from '@coveo/bueno';
import {Engine} from '../../app/headless-engine';
import {registerFieldsToInclude} from '../fields/fields-actions';
import {SearchAppState} from '../../state/search-app-state';

const prioritySchema = new Schema({
  priority: new NumberValue({required: false, default: 0, min: 0}),
  fields: new ArrayValue({
    required: false,
    each: new StringValue({
      required: true,
      emptyAllowed: false,
    }),
  }),
});

export interface ResultTemplatesManager<Content = unknown> {
  /**
   * Registers any number of result templates in the manager.
   * @param templates (...ResultTemplate<Content>) A list of templates to register.
   */
  registerTemplates(...newTemplates: ResultTemplate<Content>[]): void;
  /**
   * Selects the highest priority template for which the given result satisfies all conditions.
   * In the case where satisfied templates have equal priority, the template that was registered first is returned.
   * @param result (Result) The result for which to select a template.
   * @returns (Content) The selected template's content, or null if no template's conditions are satisfied.
   */
  selectTemplate(result: Result): Content | null;
}

/**
 * A manager in which result templates can be registered and selected based on a list of conditions and priority.
 * @param engine (HeadlessEngine) The `HeadlessEngine` instance of your application.
 * @returns (ResultTemplatesManager<Content, State>) A new result templates manager.
 */
export function buildResultTemplatesManager<
  Content = unknown,
  State = SearchAppState
>(engine: Engine<State>): ResultTemplatesManager<Content> {
  const templates: Required<ResultTemplate<Content>>[] = [];
  const validateTemplates = (templates: ResultTemplate<Content>[]) => {
    templates.forEach((template) => {
      prioritySchema.validate(
        template,
        'Check the arguments of registerTemplates'
      );
      const areConditionsValid = template.conditions.every(
        (condition) => condition instanceof Function
      );

      if (!areConditionsValid) {
        throw new SchemaValidationError(
          'Each result template conditions should be a function that takes a result as an argument and returns a boolean'
        );
      }
    });
  };

  return {
    registerTemplates(...newTemplates: ResultTemplate<Content>[]) {
      const fields: string[] = [];

      try {
        validateTemplates(newTemplates);
      } catch (error) {
        engine.logger.error(error, 'Result template manager error');
        return;
      }

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

    selectTemplate(result: Result) {
      const template = templates.find((template) =>
        template.conditions.every((condition) => condition(result))
      );
      return template ? template.content : null;
    },
  };
}
