import {Result} from '../../api/search/search/result';

export type ResultTemplateMatch = (result: Result) => boolean;

export interface ResultTemplate<Content = unknown> {
  content: Content;
  matches: ResultTemplateMatch[];
  priority?: number;
}
