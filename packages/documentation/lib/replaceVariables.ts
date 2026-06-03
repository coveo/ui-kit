import type {PageEvent} from 'typedoc';

type VariableMap = Record<string, string>;

const VARIABLE_REGEX = /\{\{(\w+)\}\}/g;

export const buildReplaceVariables =
  (variables: VariableMap) => (page: PageEvent) => {
    if (!page.contents) return;

    page.contents = page.contents.replace(VARIABLE_REGEX, (match, key) => {
      return Object.prototype.hasOwnProperty.call(variables, key)
        ? variables[key]
        : match;
    });
  };
