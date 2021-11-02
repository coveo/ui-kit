import defaultStory, {DefaultStoryAdvancedConfig} from './default-story';
import {DocsPage} from '@storybook/addon-docs';
import {Args} from '@storybook/api';

export default function defaultResultComponentStory(
  title: string,
  componentTag: string,
  defaultArgs: Args,
  docPage: typeof DocsPage,
  advancedConfig: DefaultStoryAdvancedConfig = {}
) {
  const resultList = document.createElement('atomic-result-list');
  const atomicTemplate = document.createElement('atomic-result-template');
  const templateElement = document.createElement('template');
  atomicTemplate.appendChild(templateElement);
  resultList.appendChild(atomicTemplate);

  return defaultStory(title, componentTag, defaultArgs, docPage, {
    ...{wrapperElement: resultList},
    ...advancedConfig,
  });
}
