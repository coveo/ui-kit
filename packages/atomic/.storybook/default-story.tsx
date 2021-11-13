import {h} from '@stencil/core';
import {Args} from '@storybook/api';
import {DocsPage} from '@storybook/addon-docs';
import {initializeInterfaceDebounced} from './default-init';
import sharedDefaultStory, {
  DefaultStoryAdvancedConfig,
  renderArgsToHTMLString,
  renderShadowPartsToStyleString,
} from './default-story-shared';

export default function defaultStory(
  title: string,
  componentTag: string,
  defaultArgs: Args,
  docPage: typeof DocsPage,
  advancedConfig: DefaultStoryAdvancedConfig = {}
) {
  const {defaultModuleExport, exportedStory, getArgs, updateCurrentArgs} =
    sharedDefaultStory(
      title,
      componentTag,
      defaultArgs,
      docPage,
      false,
      advancedConfig
    );

  const defaultLoader = initializeInterfaceDebounced(() => {
    const argsToHTMLString = renderArgsToHTMLString(
      componentTag,
      getArgs(),
      advancedConfig
    );
    const additionalMarkupString = advancedConfig.additionalMarkup
      ? advancedConfig.additionalMarkup().strings.join('')
      : '';

    return argsToHTMLString + additionalMarkupString;
  }, advancedConfig.engineConfig);

  const defaultDecorator = (Story: () => JSX.Element, params: {args: Args}) => {
    updateCurrentArgs(params.args);

    const styleString = renderShadowPartsToStyleString(componentTag, getArgs());
    return (
      <div>
        <Story />
        <div innerHTML={styleString}></div>
      </div>
    );
  };

  exportedStory.loaders = [defaultLoader];
  exportedStory.decorators = [defaultDecorator];

  return {defaultModuleExport, exportedStory};
}
