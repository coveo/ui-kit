import {defaultResultComponentStory} from '@coveo/atomic-storybook';

const {defaultModuleExport, exportedStory} = defaultResultComponentStory(
  'Atomic/ResultList/ResultDate',
  'atomic-result-date',
  {}
);
export default defaultModuleExport;
export const DefaultResultDate = exportedStory;
