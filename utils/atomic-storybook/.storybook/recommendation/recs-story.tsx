import {RecommendationEngineConfiguration} from '@coveo/headless/recommendation';
import {Args} from '@storybook/api';
import defaultStory from '../default-story';
import {DefaultStoryAdvancedConfig} from '../default-story-shared';
import {initializeInterfaceDebounced} from './recs-init';

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
