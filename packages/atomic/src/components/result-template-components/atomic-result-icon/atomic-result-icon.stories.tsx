import defaultResultComponentStory from '../../../../.storybook/default-result-component-story';
import ResultIconDoc from './atomic-result-icon.mdx';

const {defaultModuleExport, exportedStory} = defaultResultComponentStory(
  'Atomic/ResultList/ResultIcon',
  'atomic-result-icon',
  {},
  ResultIconDoc
);

export default defaultModuleExport;
export const DefaultResultIcon = exportedStory;
