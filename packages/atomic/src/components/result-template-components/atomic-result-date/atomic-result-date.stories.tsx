import defaultResultComponentStory from '../../../../.storybook/default-result-component-story';
import ResultDateDoc from './atomic-result-date.mdx';

const {defaultModuleExport, exportedStory} = defaultResultComponentStory(
  'Atomic/ResultList/ResultDate',
  'atomic-result-date',
  {},
  ResultDateDoc
);
export default defaultModuleExport;
export const DefaultResultDate = exportedStory;
