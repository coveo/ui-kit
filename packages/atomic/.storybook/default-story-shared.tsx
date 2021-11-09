import {h} from '@stencil/core';
import {SearchEngineConfiguration} from '@coveo/headless';
import {Args} from '@storybook/api';
import {DocsPage} from '@storybook/addon-docs';
import {TemplateResult} from 'lit-html';
import {mapPropsToArgTypes} from './map-props-to-args';

export const ADDON_PARAMETER_KEY = 'shadowParts';

export interface DefaultStoryAdvancedConfig {
  engineConfig?: Partial<SearchEngineConfiguration>;
  additionalMarkup?: () => TemplateResult;
}

function camelToKebab(value: string) {
  return value.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
}

export function renderArgsToHTMLString(componentTag: string, args: Args) {
  const el = document.createElement(componentTag);
  Object.keys(args)
    .filter((arg) => arg.indexOf(ADDON_PARAMETER_KEY) === -1)
    .forEach((arg) => {
      el.setAttribute(camelToKebab(arg), args[arg]);
    });
  return el.outerHTML;
}

export function renderShadowPartsToStyleString(
  componentTag: string,
  args: Args
) {
  const styleElement = document.createElement('style');
  const styleRules = Object.keys(args)
    .filter((arg) => arg.indexOf(ADDON_PARAMETER_KEY) !== -1)
    .map((arg) => {
      const shadowPartName = arg.split(`${ADDON_PARAMETER_KEY}:`)[1];
      const rulesForPartWithoutEmptyLines = (
        args[arg].split('\n') as string[]
      ).filter((rule) => rule != '');

      const rulesFormattedByLine = `\t${rulesForPartWithoutEmptyLines.join(
        '\n\t'
      )}`;

      return `\n${componentTag}::part(${shadowPartName}) {\n${rulesFormattedByLine}\n}`;
    })
    .join('\n');

  const rulesTextNode = document.createTextNode(`\n\t\t${styleRules}\n\n`);
  styleElement.appendChild(rulesTextNode);
  return styleElement.outerHTML;
}

export default function sharedDefaultStory(
  title: string,
  componentTag: string,
  defaultArgs: Args,
  docPage: typeof DocsPage,
  advancedConfig: DefaultStoryAdvancedConfig = {}
) {
  let currentArgs = {};

  const updateCurrentArgs = (args: Args) => {
    currentArgs = {...defaultArgs, ...args};
  };

  const defaultModuleExport = {
    title,
    argTypes: mapPropsToArgTypes(componentTag),
    parameters: {
      docs: {
        page: docPage,
      },
      [ADDON_PARAMETER_KEY]: componentTag,
    },
  };

  const exportedStory = (args: Args) => {
    updateCurrentArgs(args);
    return '';
  };

  const defaultLoader = () => console.log('Not implemented');
  const defaultDecorator = (Story: () => JSX.Element, params: {args: Args}) => {
    updateCurrentArgs(params.args);
    return <Story />;
  };

  exportedStory.loaders = [defaultLoader];
  exportedStory.decorators = [defaultDecorator];

  return {
    defaultModuleExport,
    exportedStory,
    getArgs: () => currentArgs,
    updateCurrentArgs,
  };
}
