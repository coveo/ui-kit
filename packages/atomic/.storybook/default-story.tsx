import {h} from '@stencil/core';
import {Args} from '@storybook/api';
import {DocsPage} from '@storybook/addon-docs';
import {codeSample} from './code-sample/code-sample';
import {initializeInterfaceDebounced} from './default-init';
import {mapPropsToArgTypes} from './map-props-to-args';
import {SearchEngineConfiguration} from '@coveo/headless';
import {TemplateResult} from 'lit-html';

function camelToKebab(value: string) {
  return value.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
}

const ADDON_PARAMETER_KEY = 'shadowParts';

function renderArgsToHTMLString(componentTag: string, args: Args) {
  const el = document.createElement(componentTag);
  Object.keys(args)
    .filter((arg) => arg.indexOf(ADDON_PARAMETER_KEY) === -1)
    .forEach((arg) => {
      el.setAttribute(camelToKebab(arg), args[arg]);
    });
  return el.outerHTML;
}

function renderShadowPartsToStyleString(componentTag: string, args: Args) {
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
export interface DefaultStoryAdvancedConfig {
  engineConfig?: Partial<SearchEngineConfiguration>;
  additionalMarkup?: () => TemplateResult;
}

export default function defaultStory(
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

  const defaultDecorator = (Story: () => JSX.Element, params: {args: Args}) => {
    updateCurrentArgs(params.args);

    const htmlString = renderArgsToHTMLString(componentTag, currentArgs);
    const styleString = renderShadowPartsToStyleString(
      componentTag,
      currentArgs
    );
    return (
      <div>
        <Story />
        <div innerHTML={styleString}></div>
        {codeSample(styleString)}
        {codeSample(htmlString)}
      </div>
    );
  };

  const defaultLoader = initializeInterfaceDebounced(
    () => {
      const argsToHTMLString = renderArgsToHTMLString(
        componentTag,
        currentArgs
      );
      const additionalMarkupString = advancedConfig.additionalMarkup
        ? advancedConfig.additionalMarkup().strings.join('')
        : '';

      return argsToHTMLString + additionalMarkupString;
    },

    advancedConfig.engineConfig
  );

  exportedStory.loaders = [defaultLoader];
  exportedStory.decorators = [defaultDecorator];

  return {defaultModuleExport, exportedStory};
}
