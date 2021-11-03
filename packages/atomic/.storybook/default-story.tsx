import {h} from '@stencil/core';
import {Args} from '@storybook/api';
import {DocsPage} from '@storybook/addon-docs';
import {codeSample} from './code-sample/code-sample';
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
      advancedConfig
    );

  const defaultLoader = initializeInterfaceDebounced(() => {
    const argsToHTMLString = renderArgsToHTMLString(componentTag, getArgs());
    const additionalMarkupString = advancedConfig.additionalMarkup
      ? advancedConfig.additionalMarkup().strings.join('')
      : '';

    return argsToHTMLString + additionalMarkupString;
  }, advancedConfig.engineConfig);

  const defaultDecorator = (Story: () => JSX.Element, params: {args: Args}) => {
    updateCurrentArgs(params.args);

    const htmlString = renderArgsToHTMLString(componentTag, getArgs());
    const styleString = renderShadowPartsToStyleString(componentTag, getArgs());
    return (
      <div>
        <Story />
        <div className="inline-style" innerHTML={styleString}></div>
        {codeSample(styleString)}
        {codeSample(htmlString)}
      </div>
    );
  };

  exportedStory.loaders = [defaultLoader];
  exportedStory.decorators = [defaultDecorator];

  return {defaultModuleExport, exportedStory};
}
