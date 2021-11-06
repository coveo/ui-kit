import defaultResultComponentStory from '../../../../.storybook/default-result-component-story';
import ResultLinkDoc from './atomic-result-link.mdx';

const {defaultModuleExport, exportedStory} = defaultResultComponentStory(
  'Atomic/ResultList/ResultLink',
  'atomic-result-link',
  {},
  ResultLinkDoc
);

export default defaultModuleExport;
export const DefaultResultLink = exportedStory;
