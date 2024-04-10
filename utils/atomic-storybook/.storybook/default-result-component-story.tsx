import {h} from '@stencil/core';
import {DocsPage} from '@storybook/addon-docs';
import {Args} from '@storybook/manager-api';
import {html, TemplateResult} from 'lit-html';
import {initializeInterfaceDebounced} from './default-init';
import sharedDefaultStory, {
  DefaultStoryAdvancedConfig,
  renderAdditionalMarkup,
  renderArgsToHTMLString,
  renderShadowPartsToStyleString,
} from './default-story-shared';
import {
  resultComponentArgTypes,
  resultSections,
  ResultSectionWithHighlights,
} from './map-result-list-props-to-args';

const renderInsideResultList = (
  content: string,
  getArgs: () => Args,
  includeHighlightStyling: boolean
) => {
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

  const containerOpeningTag = includeHighlightStyling
    ? '<div style="position: relative; margin-top: 20px;">'
    : '';

  const highlightContainerStyle = includeHighlightStyling
    ? ' style="border: 2px dashed black; padding:20px; position: relative;"'
    : '';

  const containerClosingTag = includeHighlightStyling
    ? '<div style="position: absolute; top: -20px; right: 0;">Template</div></div>'
    : '';

  return `${containerOpeningTag}<atomic-result-list${resultListAttributes}${highlightContainerStyle}>${content}</atomic-result-list>${containerClosingTag}`;
};

const renderInsideTemplate = (content: string) => {
  return `<atomic-result-template><template>${content}</template></atomic-result-template>`;
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
    return renderInsideResultList(
      renderInsideTemplate(content),
      getArgs,
      includeHighlightStyling
    );
  }

  return renderInsideResultList(
    renderInsideTemplate(
      renderInsideResultSection(content, getArgs, includeHighlightStyling)
    ),
    getArgs,
    includeHighlightStyling
  );
};

export default function defaultResultComponentStory(
  componentTag: string,
  defaultArgs: Args,
  advancedConfig: DefaultStoryAdvancedConfig = {}
) {
  const config = buildConfigWithDefaultValues(advancedConfig);

  const {defaultModuleExport, exportedStory, getArgs, updateCurrentArgs} =
    sharedDefaultStory(componentTag, defaultArgs, true, config);

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
      renderArgsToHTMLString(componentTag, getArgs(), config) +
        renderShadowPartsToStyleString(componentTag, getArgs()),
      getArgs,
      true
    )}${renderAdditionalMarkup(config.additionalMarkup)}`;
  }, config.engineConfig);

  exportedStory.loaders = [defaultLoader];
  exportedStory.decorators = [defaultDecorator];

  return {defaultModuleExport, exportedStory};
}

const buildConfigWithDefaultValues = (
  advancedConfig: DefaultStoryAdvancedConfig
) => {
  return {
    ...advancedConfig,
    additionalMarkup: buildConfigAdditionalMarkup(advancedConfig),
    engineConfig: {
      ...advancedConfig.engineConfig,
      preprocessRequest: buildConfigPreprocessRequest(advancedConfig),
    },
  };
};

const buildConfigAdditionalMarkup = (
  advancedConfig: DefaultStoryAdvancedConfig
) => {
  const templateForMaxWidth = html`
    <style>
      atomic-search-interface,
      atomic-result-list {
        max-width: 1024px;
        display: block;
        margin: auto;
      }
    </style>
  `;

  if (advancedConfig.additionalMarkup) {
    return () =>
      html`${templateForMaxWidth}${advancedConfig.additionalMarkup()}`;
  }
  return () => templateForMaxWidth;
};

const buildConfigPreprocessRequest = (
  advancedConfig: DefaultStoryAdvancedConfig
) => {
  const preprocessRequestForOneResult = (r) => {
    if (r.headers['Content-Type'] === 'application/json') {
      const bodyParsed = JSON.parse(r.body as string);
      bodyParsed.numberOfResults = 1;
      r.body = JSON.stringify(bodyParsed);
    }
    return r;
  };

  if (advancedConfig.engineConfig?.preprocessRequest) {
    return (request, origin) => {
      const modified = advancedConfig.engineConfig.preprocessRequest(
        request,
        origin
      );
      return preprocessRequestForOneResult(modified);
    };
  }

  return preprocessRequestForOneResult;
};
