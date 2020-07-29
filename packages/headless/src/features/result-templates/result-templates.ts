import {Result} from '../../api/search/search/result';

export type ResultTemplateCondition = (result: Result) => boolean;

export interface ResultTemplate<Content = unknown> {
  /**
   * Stored content of the template.
   */
  content: Content;
  /**
   * List of conditions to fulfill for a condition to be selected.
   */
  conditions: ResultTemplateCondition[];
  /**
   * 0 based value which the manager will fallback to when multiple conditions are fullfiled.
   * Higher numbers have priority and are evaluated first.
   */
  priority?: number;
  /**
   * List of index fields that are necessary to render the template.
   */
  fields?: string[];
}
