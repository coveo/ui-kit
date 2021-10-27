import {h} from '@stencil/core';
import {Args, useStorybookApi} from '@storybook/api';
import {DocsPage} from '@storybook/addon-docs';
import {codeSample} from './code-sample/code-sample';
import {initializeInterfaceDebounced} from './default-init';
import {mapPropsToArgTypes} from './map-props-to-args';
import {camelToKebab} from '../src/utils/utils';
import {doc} from '@stencil/core/internal/client';

const shadowPartsArgsDelimiter = 'shadow-parts';

function renderArgsToHTMLString(componentTag: string, args: Args) {
  const el = document.createElement(componentTag);
  Object.keys(args)
    .filter((arg) => arg.indexOf(shadowPartsArgsDelimiter) === -1)
    .forEach((arg) => {
      el.setAttribute(camelToKebab(arg), args[arg]);
    });
  return el.outerHTML;
}

function renderShadowPartsToStyleString(componentTag: string, args: Args) {
  const styleElement = document.createElement('style');
  const styleRules = Object.keys(args)
    .filter((arg) => arg.indexOf(shadowPartsArgsDelimiter) !== -1)
    .map((arg) => {
      const shadowPartName = arg.split(`${shadowPartsArgsDelimiter}:`)[1];
      const rulesForPartWithoutEmptyLines = (
        args[arg].split('\n') as string[]
      ).filter((rule) => rule != '');
      const rulesFormattedByLine = `\t${rulesForPartWithoutEmptyLines.join(
        '\n\t'
      )}`;

      return `\n${componentTag}::part(${shadowPartName}) {\n${rulesFormattedByLine}\n}`;
    })
    .join('\n');

  const rulesTextNode = document.createTextNode(`\n\t\t${styleRules}\n`);
  styleElement.appendChild(rulesTextNode);
  return styleElement.outerHTML;
}

export default function defaultStory(
  title: string,
  componentTag: string,
  defaultArgs: Args,
  docPage: typeof DocsPage
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
      shadowParts: componentTag,
    },
  };

  const exportedStory = (args: Args) => {
    updateCurrentArgs(args);
    return '';
  };

  const defaultDecorator = (
    Story: () => JSX.Element,
    params: {args: Args},
    foo
  ) => {
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

  const defaultLoader = initializeInterfaceDebounced(() =>
    renderArgsToHTMLString(componentTag, currentArgs)
  );

  exportedStory.loaders = [defaultLoader];
  exportedStory.decorators = [defaultDecorator];

  return {defaultModuleExport, exportedStory};
}
