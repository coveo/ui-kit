import {ResultTemplate} from './result-templates';
import {Result} from '../../api/search/search/result';
import {
  ArrayValue,
  NumberValue,
  Schema,
  SchemaValidationError,
} from '@coveo/bueno';
import {registerFieldsToInclude} from '../fields/fields-actions';
import {fields} from '../../app/reducers';
import {loadReducerError} from '../../utils/errors';
import {FieldsSection} from '../../state/state-sections';
import {CoreEngine} from '../../app/engine';
import {requiredNonEmptyString} from '../../utils/validate-payload';

const prioritySchema = new Schema({
  priority: new NumberValue({required: false, default: 0, min: 0}),
  fields: new ArrayValue({
    required: false,
    each: requiredNonEmptyString,
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
export function buildResultTemplatesManager<Content = unknown>(
  engine: CoreEngine
): ResultTemplatesManager<Content> {
  if (!loadResultTemplatesManagerReducers(engine)) {
    throw loadReducerError;
  }

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

function loadResultTemplatesManagerReducers(
  engine: CoreEngine
): engine is CoreEngine<FieldsSection> {
  engine.addReducers({fields});
  return true;
}
