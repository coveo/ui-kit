import {h} from '@stencil/core';
import {Args} from '@storybook/api';
import {DocsPage} from '@storybook/addon-docs';

import sharedDefaultStory, {
  DefaultStoryAdvancedConfig,
  renderArgsToHTMLString,
} from './default-story-shared';
import {initializeInterfaceDebounced} from './default-init';
import {html} from 'lit-html';
import {
  resultComponentArgTypes,
  resultSections,
  ResultSectionWithHighlights,
} from './map-result-list-props-to-args';

const renderInsideResultList = (content: string, getArgs: () => Args) => {
  const layoutMode = getArgs()['resultListLayout'];
  const densityMode = getArgs()['resultListDensity'];
  const imageSizeMode = getArgs()['resultListImageSize'];

  let resultListAttributes = '';
  if (layoutMode) {
    resultListAttributes += ` display=${layoutMode}`;
  }
  if (densityMode) {
    resultListAttributes += ` density=${densityMode}`;
  }
  if (imageSizeMode) {
    resultListAttributes += ` image-size=${imageSizeMode}`;
  }

  return `<atomic-result-list${resultListAttributes}>\n\t${content}\n</atomic-result-list>`;
};

const renderInsideTemplate = (content: string) => {
  return `<atomic-result-template>\n\t\t<template>\n\t\t\t${content}\n\t\t</template>\n\t</atomic-result-template>`;
};

const renderSectionHighlight = (section: ResultSectionWithHighlights) => {
  return `style="border:2px dashed ${section.highlightColor}; box-shadow: 0px 5px 10px #e5e8e8; color: ${section.highlightColor};"`;
};

const renderInsideResultSection = (
  content: string,
  getArgs: () => Args,
  includeHighlightStyling: boolean
) => {
  const currentTemplateSection = getArgs()['resultSection'];

  return resultSections
    .map((section) => {
      const isCurrentSection = section.name === currentTemplateSection;
      return `<${section.name} ${
        includeHighlightStyling && !isCurrentSection
          ? renderSectionHighlight(section)
          : ''
      }>${
        section.name === currentTemplateSection
          ? `\n\t\t\t\t${content}\n\t\t\t`
          : `${section.name}`
      }</${section.name}>`;
    })
    .join('\n\t\t\t');
};

export const renderArgsToResultTemplate = (
  content: string,
  getArgs: () => Args,
  includeHighlightStyling: boolean
) => {
  const currentTemplateSection = getArgs()['resultSection'];
  const isInATemplateSection =
    currentTemplateSection && currentTemplateSection !== 'none';

  if (!isInATemplateSection) {
    return renderInsideResultList(renderInsideTemplate(content), getArgs);
  }

  return renderInsideResultList(
    renderInsideTemplate(
      renderInsideResultSection(content, getArgs, includeHighlightStyling)
    ),
    getArgs
  );
};

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
      true,
      advancedConfig
    );

  defaultModuleExport.argTypes = {
    ...resultComponentArgTypes,
    ...defaultModuleExport.argTypes,
  };

  const defaultDecorator = (Story: () => JSX.Element, params: {args: Args}) => {
    updateCurrentArgs(params.args);

    return (
      <div>
        <Story />
      </div>
    );
  };

  const defaultLoader = initializeInterfaceDebounced(() => {
    return `${renderArgsToResultTemplate(
      renderArgsToHTMLString(componentTag, getArgs()),
      getArgs,
      true
    )}${
      advancedConfig.additionalMarkup
        ? advancedConfig.additionalMarkup().strings.join('')
        : ''
    }`;
  }, advancedConfig.engineConfig);

  exportedStory.loaders = [defaultLoader];
  exportedStory.decorators = [defaultDecorator];

  return {defaultModuleExport, exportedStory};
}
