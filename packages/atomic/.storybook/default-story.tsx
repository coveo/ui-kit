import {SearchEngineConfiguration} from '@coveo/headless';
import {h} from '@stencil/core';
import {DocsPage} from '@storybook/addon-docs';
import {DebouncedFunc} from 'lodash';
import {initializeInterfaceDebounced as defaultInitializeInterfaceDebounced} from './default-init';
import sharedDefaultStory, {
  DefaultStoryAdvancedConfig,
  renderAdditionalMarkup,
  renderArgsToHTMLString,
  renderShadowPartsToStyleString,
} from './default-story-shared';

export default function defaultStory<Config = SearchEngineConfiguration>(
  componentTag: string,
  defaultArgs: Record<string, unknown>,
  advancedConfig: DefaultStoryAdvancedConfig<Config> = {},
  initializeInterfaceDebounced: (
    renderComponentFunction: () => string,
    engineConfig?: Partial<SearchEngineConfiguration>
  ) => DebouncedFunc<() => Promise<void>> = defaultInitializeInterfaceDebounced
) {
  const {defaultModuleExport, exportedStory, getArgs, updateCurrentArgs} =
    sharedDefaultStory(componentTag, defaultArgs, false, advancedConfig);

  const defaultLoader = initializeInterfaceDebounced(() => {
    const argsToHTMLString = renderArgsToHTMLString(
      componentTag,
      getArgs(),
      advancedConfig
    );
    const additionalMarkupString = advancedConfig.additionalMarkup
      ? renderAdditionalMarkup(advancedConfig.additionalMarkup)
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
