import {h} from '@stencil/core';
import {SearchEngineConfiguration} from '@coveo/headless';
import {Args} from '@storybook/api';
import {DocsPage} from '@storybook/addon-docs';
import {TemplateResult} from 'lit-html';
import {mapPropsToArgTypes} from './map-props-to-args';
import {resultComponentArgTypes} from './map-result-list-props-to-args';

export const ADDON_PARAMETER_KEY = 'shadowParts';
export interface DefaultStoryAdvancedConfig {
  engineConfig?: Partial<SearchEngineConfiguration>;
  additionalMarkup?: () => TemplateResult;
  additionalChildMarkup?: () => TemplateResult;
  parentElement?: () => HTMLElement;
}

function camelToKebab(value: string) {
  return value.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
}

export function renderArgsToHTMLString(
  componentTag: string,
  args: Args,
  advancedConfig: DefaultStoryAdvancedConfig
) {
  const {additionalChildMarkup, parentElement} = advancedConfig;
  const el = document.createElement(componentTag);

  const argsFilteredOnProps = Object.keys(args)
    .filter(
      (key) =>
        Object.keys(resultComponentArgTypes).indexOf(key) === -1 &&
        key.indexOf(ADDON_PARAMETER_KEY) === -1
    )
    .reduce((res, key) => ((res[key] = args[key]), res), {});

  Object.keys(argsFilteredOnProps).forEach((arg) => {
    el.setAttribute(camelToKebab(arg), args[arg]);
  });

  // TODO: KIT-1203
  // This is a hack
  if (typeof additionalChildMarkup === 'function') {
    el.innerHTML = additionalChildMarkup().strings.join('');
  }
  if (typeof additionalChildMarkup === 'string') {
    el.innerHTML = additionalChildMarkup;
  }

  if (parentElement) {
    const parent = parentElement();
    parent.innerHTML = `\n\t${el.outerHTML}\n`;
    return parent.outerHTML;
  }

  return el.outerHTML;
}

export function renderShadowPartsToStyleString(
  componentTag: string,
  args: Args
) {
  const argsFilteredOnStyleRules = Object.keys(args).filter(
    (arg) => arg.indexOf(ADDON_PARAMETER_KEY) !== -1
  );

  if (!argsFilteredOnStyleRules.length) {
    return '';
  }

  const styleElement = document.createElement('style');
  const styleRules = argsFilteredOnStyleRules
    .filter((arg) => arg.indexOf(ADDON_PARAMETER_KEY) !== -1)
    .map((arg) => {
      const shadowPartName = arg.split(`${ADDON_PARAMETER_KEY}:`)[1];
      const rulesForPartWithoutEmptyLines = (
        args[arg].split('\n') as string[]
      ).filter((rule) => rule != '');

      const rulesFormattedByLine = `\t${rulesForPartWithoutEmptyLines.join(
        ''
      )}`;

      return `\n${componentTag}::part(${shadowPartName}) {${rulesFormattedByLine}}`;
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
  isResultComponent: boolean,
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
      [ADDON_PARAMETER_KEY]: {
        componentTag,
        isResultComponent,
        // TODO: KIT-1203
        // This is a hack
        advancedConfig: {
          ...advancedConfig,
          ...{
            additionalChildMarkup: advancedConfig.additionalChildMarkup
              ? advancedConfig.additionalChildMarkup().strings.join('')
              : '',
          },
        },
      },
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
