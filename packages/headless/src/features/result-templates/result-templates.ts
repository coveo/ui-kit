import {Result} from '../../api/search/search/result';

export type ResultTemplateCondition = (result: Result) => boolean;

export interface ResultTemplate<Content = unknown> {
  /**
   * The stored content of the template.
   */
  content: Content;
  /**
   * A list of conditions that must be fulfilled for this template to be selected.
   */
  conditions: ResultTemplateCondition[];
  /**
   * A value which the manager will fallback to when multiple templates' conditions are fulfilled.
   * Templates with higher priority values will be selected over others. The minimum value is `0`.
   */
  priority?: number;
  /**
   * A list of index fields that are necessary to render the template.
   */
  fields?: string[];
}
