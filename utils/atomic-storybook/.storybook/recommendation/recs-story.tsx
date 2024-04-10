import {RecommendationEngineConfiguration} from '@coveo/headless/recommendation';
import defaultStory from '../default-story';
import {DefaultStoryAdvancedConfig} from '../default-story-shared';
import {initializeInterfaceDebounced} from './recs-init';

export default function recsStory(
  componentTag: string,
  defaultArgs: Record<string, unknown>,
  advancedConfig: DefaultStoryAdvancedConfig<RecommendationEngineConfiguration> = {}
) {
  return defaultStory(
    componentTag,
    defaultArgs,
    advancedConfig,
    initializeInterfaceDebounced
  );
}
