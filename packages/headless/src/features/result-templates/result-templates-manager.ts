import {Result} from '../../api/search/search/result';
import {CoreEngine, CoreEngineNext} from '../../app/engine';
import {fieldsReducer as fields} from '../../features/fields/fields-slice';
import {FieldsSection} from '../../state/state-sections';
import {loadReducerError} from '../../utils/errors';
import {registerFieldsToInclude} from '../fields/fields-actions';
import {
  buildTemplatesManager,
  Template,
  TemplateCondition,
} from '../templates/templates-manager';

export type ResultTemplate<Content = unknown> = Template<Result, Content>;
export type ResultTemplateCondition = TemplateCondition<Result>;

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
  engine: CoreEngine | CoreEngineNext
): ResultTemplatesManager<Content> {
  if (!loadResultTemplatesManagerReducers(engine)) {
    throw loadReducerError;
  }

  const {registerTemplates: coreRegisterTemplates, selectTemplate} =
    buildTemplatesManager<Result, Content>();
  return {
    registerTemplates: (...newTemplates: Template<Result, Content>[]) => {
      coreRegisterTemplates(...newTemplates);
      const fields: string[] = [];
      newTemplates.forEach((template) => {
        template.fields && fields.push(...template.fields);
      });
      engine.dispatch(registerFieldsToInclude(fields));
    },
    selectTemplate,
  };
}

function loadResultTemplatesManagerReducers(
  engine: CoreEngine | CoreEngineNext
): engine is CoreEngine<FieldsSection> | CoreEngineNext<FieldsSection> {
  engine.addReducers({fields});
  return true;
}
