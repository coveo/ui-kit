import {h} from '@stencil/core';
import {Args} from '@storybook/api';
import {DocsPage} from '@storybook/addon-docs';
import {initializeInterfaceDebounced} from './recs-init';
import {
  DefaultStoryAdvancedConfig,
} from '../default-story-shared';
import {RecommendationEngineConfiguration} from '@coveo/headless/recommendation';
import defaultStory from '../default-story';

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
