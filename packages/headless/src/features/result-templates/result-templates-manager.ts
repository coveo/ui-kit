import {ResultTemplate} from './result-templates';
import {Result} from '../../api/search/search/result';

/**
 * Manager in which result templates can be registered and selected based on a list of conditions and priority.
 */
export class ResultTemplatesManager<Content = unknown> {
  private templates: Required<ResultTemplate<Content>>[] = [];
  constructor() {}

  registerTemplates(...templates: ResultTemplate<Content>[]) {
    this.templates.push(
      ...templates.map((template) => ({
        ...template,
        priority: template.priority || 0,
      }))
    );
    this.templates.sort((a, b) => b.priority - a.priority);
  }

  selectTemplate(result: Result) {
    const template = this.templates.find((template) =>
      template.matches.every((match) => match(result))
    );
    return template ? template.content : null;
  }
}
