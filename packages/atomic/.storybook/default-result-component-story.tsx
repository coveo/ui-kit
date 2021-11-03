import {h} from '@stencil/core';
import {Args} from '@storybook/api';
import {DocsPage} from '@storybook/addon-docs';

import sharedDefaultStory, {
  DefaultStoryAdvancedConfig,
  renderArgsToHTMLString,
} from './default-story-shared';
import {initializeInterfaceDebounced} from './default-init';
import {codeSample} from './code-sample/code-sample';
import {html} from 'lit-html';

export default function defaultResultComponentStory(
  title: string,
  componentTag: string,
  defaultArgs: Args,
  docPage: typeof DocsPage,
  advancedConfig: DefaultStoryAdvancedConfig = {
    additionalMarkup: () => html`
      <style>
        atomic-result-list {
          max-width: 1024px;
          display: block;
          margin: auto;
        }
      </style>
    `,
  }
) {
  const {defaultModuleExport, exportedStory, getArgs, updateCurrentArgs} =
    sharedDefaultStory(
      title,
      componentTag,
      defaultArgs,
      docPage,
      advancedConfig
    );

  const renderArgsToResultTemplate = (content: string) => {
    return `<atomic-result-list>\n\t<atomic-result-template>\n\t\t<template>\n\t\t\t${content}\n\t\t</template>\n\t</atomic-result-template>\n</atomic-result-list>`;
  };

  const defaultDecorator = (Story: () => JSX.Element, params: {args: Args}) => {
    updateCurrentArgs(params.args);

    const htmlString = renderArgsToHTMLString(componentTag, getArgs());
    return (
      <div>
        <Story />
        {codeSample(renderArgsToResultTemplate(`${htmlString}`))}
      </div>
    );
  };

  const defaultLoader = initializeInterfaceDebounced(
    () => {
      return `${renderArgsToResultTemplate(
        renderArgsToHTMLString(componentTag, getArgs())
      )}${
        advancedConfig.additionalMarkup
          ? advancedConfig.additionalMarkup().strings.join('')
          : ''
      }`;
    },
    advancedConfig.engineConfig,
    advancedConfig.wrapperElement
  );

  exportedStory.loaders = [defaultLoader];
  exportedStory.decorators = [defaultDecorator];

  return {defaultModuleExport, exportedStory};
}
