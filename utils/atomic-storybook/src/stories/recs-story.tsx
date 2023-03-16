import {RecommendationEngineConfiguration} from '@coveo/headless/recommendation';
import {h} from '@stencil/core';
import {DocsPage} from '@storybook/addon-docs';
import {Args} from '@storybook/api';
import {initializeInterfaceDebounced} from '../initialization/recs-init';
import defaultStory from './default-story';
import {DefaultStoryAdvancedConfig} from './default-story-shared';

export default function recsStory(
  title: string,
  componentTag: string,
  defaultArgs: Args,
  advancedConfig: DefaultStoryAdvancedConfig<RecommendationEngineConfiguration> = {}
) {
  return defaultStory(
    title,
    componentTag,
    defaultArgs,
    advancedConfig,
    initializeInterfaceDebounced
  );
}
