import type {Result} from '../../api/search/search/result.js';
import type {CoreEngine, CoreEngineNext} from '../../app/engine.js';
import {fieldsReducer as fields} from '../../features/fields/fields-slice.js';
import type {FieldsSection} from '../../state/state-sections.js';
import {loadReducerError} from '../../utils/errors.js';
import {registerFieldsToInclude} from '../fields/fields-actions.js';
import {
  buildTemplatesManager,
  type Template,
  type TemplateCondition,
} from '../templates/templates-manager.js';

export type ResultTemplate<Content = unknown> = Template<Result, Content>;
export type ResultTemplateCondition = TemplateCondition<Result>;

export interface ResultTemplatesManager<
  Content = unknown,
  LinkContent = unknown,
> {
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
  /**
   * Selects the highest priority link template for which the given result satisfies all conditions.
   * In the case where satisfied templates have equal priority, the template that was registered first is returned.
   * @param result (Result) The result for which to select a template.
   * @returns (Content) The selected template's content, or null if no template's conditions are satisfied.
   */
  selectLinkTemplate(result: Result): LinkContent | null;
}

/**
 * A manager in which result templates can be registered and selected based on a list of conditions and priority.
 * @param engine (HeadlessEngine) The `HeadlessEngine` instance of your application.
 * @returns (ResultTemplatesManager<Content, State>) A new result templates manager.
 */
export function buildResultTemplatesManager<
  Content = unknown,
  LinkContent = unknown,
>(
  engine: CoreEngine | CoreEngineNext
): ResultTemplatesManager<Content, LinkContent> {
  if (!loadResultTemplatesManagerReducers(engine)) {
    throw loadReducerError;
  }

  const {
    registerTemplates: coreRegisterTemplates,
    selectTemplate,
    selectLinkTemplate,
  } = buildTemplatesManager<Result, Content, LinkContent>();
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
    selectLinkTemplate,
  };
}

function loadResultTemplatesManagerReducers(
  engine: CoreEngine | CoreEngineNext
): engine is CoreEngine<FieldsSection> | CoreEngineNext<FieldsSection> {
  engine.addReducers({fields});
  return true;
}
