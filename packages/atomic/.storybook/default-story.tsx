import {h} from '@stencil/core';
import {Args} from '@storybook/api';
import {DocsPage} from '@storybook/addon-docs';
import {codeSample} from './code-sample';
import {initializeInterfaceDebounced} from './default-init';
import {mapPropsToArgTypes} from './map-props-to-args';
import {camelToKebab} from '../src/utils/utils';
import {SearchEngineConfiguration} from '@coveo/headless';

function renderArgsToHTMLString(componentTag: string, args: Args) {
  const el = document.createElement(componentTag);
  Object.keys(args).forEach((arg) => {
    el.setAttribute(camelToKebab(arg), args[arg]);
  });
  return el.outerHTML;
}

export interface DefaultStoryAdvancedConfig {
  engineConfig?: Partial<SearchEngineConfiguration>;
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
    },
  };

  const exportedStory = (args: Args) => {
    updateCurrentArgs(args);
    return '';
  };

  const defaultDecorator = (Story: () => JSX.Element, params: {args: Args}) => {
    updateCurrentArgs(params.args);
    const htmlString = renderArgsToHTMLString(componentTag, currentArgs);
    return (
      <div>
        <Story />
        {codeSample(htmlString)}
      </div>
    );
  };

  const defaultLoader = initializeInterfaceDebounced(
    () => renderArgsToHTMLString(componentTag, currentArgs),
    advancedConfig.engineConfig
  );

  exportedStory.loaders = [defaultLoader];
  exportedStory.decorators = [defaultDecorator];

  return {defaultModuleExport, exportedStory};
}
